import { format, isSameDay, addDays, addWeeks, addMonths, isBefore, startOfDay } from 'date-fns';
import type { Asset, Frequency } from './constants';
import { ASSET_CONFIG } from './constants';
import { getFallbackHistory } from './fallbackData';

export interface PricePoint {
  date: number;
  price: number;
}

export interface InvestmentResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  roi: number;
  history: {
    date: string;
    invested: number;
    value: number;
    price: number;
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

    if (config.source === 'binance' && config.symbol) {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=1d&limit=1000`
      );
      if (!response.ok) throw new Error(response.statusText);
      const json = await response.json();
      prices = json.map((kline: any[]) => ({
        date: kline[0],
        price: parseFloat(kline[4])
      }));
    } else {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${config.id}/market_chart?vs_currency=usd&days=1000&interval=daily`
      );
      if (!response.ok) throw new Error(response.statusText);
      const json = await response.json();
      prices = json.prices.map((p: [number, number]) => ({
        date: p[0],
        price: p[1]
      }));
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: prices }));
    return prices;
  } catch (error) {
    console.error(`API Error for ${asset}:`, error);
    return getFallbackHistory(asset);
  }
}

export function calculateDCA(
  prices: PricePoint[],
  amount: number,
  frequency: Frequency,
  startDate: Date,
  endDate: Date = new Date()
): InvestmentResult {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const history: InvestmentResult['history'] = [];

  const relevantPrices = prices
    .filter(p => p.date >= start.getTime() && p.date <= end.getTime())
    .sort((a, b) => a.date - b.date);

  let nextInvestmentDate = start;
  let accumulatedUnits = 0;
  let accumulatedInvested = 0;

  for (const point of relevantPrices) {
    const pointDate = startOfDay(point.date);
    
    if (!isBefore(pointDate, nextInvestmentDate)) { 
      if (isSameDay(pointDate, nextInvestmentDate) || isBefore(nextInvestmentDate, pointDate)) {
        accumulatedUnits += amount / point.price;
        accumulatedInvested += amount;
        
        switch (frequency) {
          case 'daily': nextInvestmentDate = addDays(nextInvestmentDate, 1); break;
          case 'weekly': nextInvestmentDate = addWeeks(nextInvestmentDate, 1); break;
          case 'monthly': nextInvestmentDate = addMonths(nextInvestmentDate, 1); break;
        }
      }
    }

    history.push({
      date: format(point.date, 'yyyy-MM-dd'),
      invested: accumulatedInvested,
      value: accumulatedUnits * point.price,
      price: point.price
    });
  }

  const currentPrice = prices[prices.length - 1]?.price || 0;
  const currentValue = accumulatedUnits * currentPrice;

  return {
    totalInvested: accumulatedInvested,
    totalUnits: accumulatedUnits,
    currentValue: currentValue,
    roi: accumulatedInvested > 0 ? ((currentValue - accumulatedInvested) / accumulatedInvested) * 100 : 0,
    history
  };
}