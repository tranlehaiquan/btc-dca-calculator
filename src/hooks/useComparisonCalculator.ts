import { useState, useEffect, useCallback } from "react";
import { fetchPriceHistory, fetchVnStockHistory, calculateDCA } from "../api";
import type { InvestmentResult } from "../api";
import { useDcaParams } from "./useDcaParams";
import type { Asset } from "@/constants";

export interface CompareAsset {
  type: "standard" | "vn_stock";
  id: string; // "BTC", "Gold", "Silver" or Stock Symbol
  label: string;
  color?: string;
}

export function useComparisonCalculator() {
  const {
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useDcaParams(false);

  const [compareAssets, setCompareAssets] = useState<CompareAsset[]>([
    { type: "standard", id: "BTC", label: "Bitcoin" },
    { type: "standard", id: "Gold", label: "Gold" },
    { type: "standard", id: "Silver", label: "Silver" },
  ]);

  const [results, setResults] = useState<Record<string, InvestmentResult | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addVnStock = (symbol: string) => {
    if (compareAssets.find(a => a.id === symbol)) return;
    setCompareAssets(prev => [
      ...prev,
      { type: "vn_stock", id: symbol, label: symbol }
    ]);
  };

  const removeAsset = (id: string) => {
    // Prevent removing everything? Or just let them remove what they want.
    setCompareAssets(prev => prev.filter(a => a.id !== id));
    setResults(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const fetchAllPricesAndCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pricePromises = compareAssets.map(asset => {
        if (asset.type === "standard") {
          return fetchPriceHistory(asset.id as Asset);
        } else {
          return fetchVnStockHistory(asset.id);
        }
      });
      
      const pricesArray = await Promise.all(pricePromises);

      const newResults: Record<string, InvestmentResult | null> = {};
      compareAssets.forEach((asset, index) => {
        const prices = pricesArray[index];
        if (prices && prices.length > 0) {
          newResults[asset.id] = calculateDCA(
            prices,
            amount,
            frequency,
            new Date(startDate),
            new Date(endDate)
          );
        } else {
          newResults[asset.id] = null;
        }
      });

      setResults(newResults);
    } catch (err) {
      console.error(err);
      setError("Failed to load price history for comparison.");
    } finally {
      setLoading(false);
    }
  }, [amount, frequency, startDate, endDate, compareAssets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllPricesAndCalculate();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAllPricesAndCalculate]);

  return {
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    compareAssets,
    addVnStock,
    removeAsset,
    results,
    loading,
    error,
    calculate: fetchAllPricesAndCalculate,
  };
}