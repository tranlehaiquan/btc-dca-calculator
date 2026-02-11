import {
  format,
  isSameDay,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  startOfDay,
  differenceInDays,
} from "date-fns";
import type { Asset, Frequency } from "./constants";
import { ASSET_CONFIG } from "./constants";
import { getFallbackHistory } from "./fallbackData";

export interface PricePoint {
  date: number;
  price: number;
}

export interface InvestmentResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  roi: number;
  averagePrice: number;
  bestPrice: number;
  worstPrice: number;
  purchaseCount: number;
  currentPrice: number;
  lumpSumValue: number;
  inflationAdjustedValue: number;
  history: {
    date: string;
    invested: number;
    value: number;
    price: number;
  }[];
  transactions: {
    date: string;
    amount: number;
    price: number;
    units: number;
  }[];
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchPriceHistory(asset: Asset): Promise<PricePoint[]> {
  const config = ASSET_CONFIG[asset];
  const CACHE_KEY = `history_cache_${asset}`;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    let prices: PricePoint[] = [];

    if (config.source === "binance" && config.symbol) {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=1d&limit=1000`,
      );
      if (!response.ok) throw new Error(response.statusText);
      const json = await response.json();
      prices = json.map((kline: any[]) => ({
        date: kline[0],
        price: parseFloat(kline[4]),
      }));
    } else {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${config.id}/market_chart?vs_currency=usd&days=1000&interval=daily`,
      );
      if (!response.ok) throw new Error(response.statusText);
      const json = await response.json();
      prices = json.prices.map((p: [number, number]) => ({
        date: p[0],
        price: p[1],
      }));
    }

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: prices }),
    );
    return prices;
  } catch (error) {
    console.error(`API Error for ${asset}:`, error);
    return getFallbackHistory(asset);
  }
}

export async function fetchVnStockHistory(
  symbol: string,
): Promise<PricePoint[]> {
  const CACHE_KEY = `vn_history_cache_${symbol}`;
  const now = Math.floor(Date.now() / 1000);
  const tenYearsAgo = now - 10 * 365 * 24 * 60 * 60;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Yahoo Finance often requires .VN or .HM for Vietnamese stocks
    // Most common symbols are on HOSE (.VN) or HNX (.HN)
    let yahooSymbol = symbol.toUpperCase();
    if (!yahooSymbol.includes(".")) {
      yahooSymbol = `${yahooSymbol}.VN`;
    }

    const fetchFromProxy = async (s: string) => {
      // For local development without the backend running, you might need the full URL
      // but relative path is best for Vercel and Docker-served frontend.
      const baseUrl =
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
          ? "http://localhost:3001/api/yahoo"
          : "/api/yahoo";

      const url = `${baseUrl}?symbol=${s}&period1=${tenYearsAgo}&period2=${now}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Proxy error: ${response.statusText}`);
      return await response.json();
    };

    let json = await fetchFromProxy(yahooSymbol);

    if (json.chart.error) {
      // Try with .HN if .VN fails
      if (yahooSymbol.endsWith(".VN")) {
        const hnSymbol = yahooSymbol.replace(".VN", ".HN");
        try {
          const hnJson = await fetchFromProxy(hnSymbol);
          if (!hnJson.chart.error) {
            return processYahooData(hnJson, CACHE_KEY);
          }
        } catch (e) {
          console.error(`Error fetching .HN fallback:`, e);
        }
      }
      throw new Error(json.chart.error.description || "Yahoo Finance error");
    }

    return processYahooData(json, CACHE_KEY);
  } catch (error) {
    console.error(`API Error for VN Stock ${symbol}:`, error);
    return [];
  }
}

function processYahooData(json: any, cacheKey: string): PricePoint[] {
  const result = json.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0].close;

  const prices: PricePoint[] = timestamps
    .map((timestamp: number, index: number) => ({
      date: timestamp * 1000,
      price: quotes[index],
    }))
    .filter((p: PricePoint) => p.price !== null);

  localStorage.setItem(
    cacheKey,
    JSON.stringify({ timestamp: Date.now(), data: prices }),
  );
  return prices;
}

export function calculateDCA(
  prices: PricePoint[],
  amount: number,
  frequency: Frequency,
  startDate: Date,
  endDate: Date = new Date(),
  inflationRate: number = 0,
): InvestmentResult {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const history: InvestmentResult["history"] = [];
  const transactions: InvestmentResult["transactions"] = [];

  const relevantPrices = prices
    .filter((p) => p.date >= start.getTime() && p.date <= end.getTime())
    .sort((a, b) => a.date - b.date);

  let nextInvestmentDate = start;
  let accumulatedUnits = 0;
  let accumulatedInvested = 0;

  for (const point of relevantPrices) {
    const pointDate = startOfDay(point.date);

    if (!isBefore(pointDate, nextInvestmentDate)) {
      if (
        isSameDay(pointDate, nextInvestmentDate) ||
        isBefore(nextInvestmentDate, pointDate)
      ) {
        const unitsBought = amount / point.price;
        accumulatedUnits += unitsBought;
        accumulatedInvested += amount;

        transactions.push({
          date: format(point.date, "yyyy-MM-dd"),
          amount: amount,
          price: point.price,
          units: unitsBought,
        });

        switch (frequency) {
          case "daily":
            nextInvestmentDate = addDays(nextInvestmentDate, 1);
            break;
          case "weekly":
            nextInvestmentDate = addWeeks(nextInvestmentDate, 1);
            break;
          case "monthly":
            nextInvestmentDate = addMonths(nextInvestmentDate, 1);
            break;
        }
      }
    }

    history.push({
      date: format(point.date, "yyyy-MM-dd"),
      invested: accumulatedInvested,
      value: accumulatedUnits * point.price,
      price: point.price,
    });
  }

  const currentPrice = prices[prices.length - 1]?.price || 0;
  const currentValue = accumulatedUnits * currentPrice;

  // Calculate Lump Sum Comparison
  // Assume the total amount invested via DCA was invested all at once on the first day
  const firstPrice = relevantPrices[0]?.price || 0;
  const lumpSumUnits = firstPrice > 0 ? accumulatedInvested / firstPrice : 0;
  const lumpSumValue = lumpSumUnits * currentPrice;

  // Calculate Inflation Adjusted Value (Purchasing Power)
  const daysElapsed = differenceInDays(end, start);
  const yearsElapsed = daysElapsed / 365.25;
  const inflationAdjustedValue =
    currentValue / Math.pow(1 + inflationRate / 100, yearsElapsed);

  const buyPrices = transactions.map((t) => t.price);

  return {
    totalInvested: accumulatedInvested,
    totalUnits: accumulatedUnits,
    currentValue: currentValue,
    roi:
      accumulatedInvested > 0
        ? ((currentValue - accumulatedInvested) / accumulatedInvested) * 100
        : 0,
    averagePrice:
      accumulatedUnits > 0 ? accumulatedInvested / accumulatedUnits : 0,
    bestPrice: buyPrices.length > 0 ? Math.min(...buyPrices) : 0,
    worstPrice: buyPrices.length > 0 ? Math.max(...buyPrices) : 0,
    purchaseCount: transactions.length,
    currentPrice: currentPrice,
    lumpSumValue: lumpSumValue,
    inflationAdjustedValue: inflationAdjustedValue,
    history,
    transactions,
  };
}
