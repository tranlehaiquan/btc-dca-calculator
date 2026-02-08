import { useState, useEffect, useCallback } from "react";
import { fetchPriceHistory, calculateDCA } from "../api";
import type { PricePoint, InvestmentResult } from "../api";
import type { Asset, Frequency } from "../constants";
import { ASSET_CONFIG } from "../constants";

export function useDcaCalculator() {
  const [asset, setAsset] = useState<Asset>("BTC");
  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const performCalculation = useCallback(() => {
    if (prices.length === 0) return;

    const res = calculateDCA(
      prices,
      amount,
      frequency,
      new Date(startDate),
      new Date(endDate),
    );
    setResult(res);
  }, [prices, amount, frequency, startDate, endDate]);

  // Fetch prices when asset changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPriceHistory(asset)
      .then((data) => {
        if (isMounted) {
          setPrices(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError(
            `Failed to load ${ASSET_CONFIG[asset].label} price history.`,
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [asset]);

  // Re-calculate when prices or inputs change
  useEffect(() => {
    performCalculation();
  }, [performCalculation]);

  return {
    // State
    asset,
    amount,
    frequency,
    startDate,
    endDate,
    prices,
    result,
    loading,
    error,
    // Setters
    setAsset,
    setAmount,
    setFrequency,
    setStartDate,
    setEndDate,
    // Actions
    calculate: performCalculation,
  };
}
