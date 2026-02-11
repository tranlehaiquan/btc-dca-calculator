import { useComparisonCalculator } from "@/hooks/useComparisonCalculator";
import { ComparisonChart } from "./ComparisonChart";
import { ASSET_CONFIG } from "@/constants";
import type { Asset } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { InputForm } from "./InputForm";
import { TrendingUp, TrendingDown, Search, Loader2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchVnStock, type StockSuggestion } from "@/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VN_STOCK_COLORS = ["#22c55e", "#06b6d4", "#8b5cf6", "#ec4899", "#f97316"];

export function ComparisonView() {
  const { t } = useTranslation();
  const comparison = useComparisonCalculator();
  const { compareAssets, addVnStock, removeAsset } = comparison;

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.length >= 2) {
      setIsSearching(true);
      setShowSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchVnStock(val);
        setSuggestions(results);
        setIsSearching(false);
      }, 500);
    } else {
      setSuggestions([]);
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s: StockSuggestion) => {
    addVnStock(s.symbol);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatting = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  // Mock a DcaCalculatorHook for InputForm to work
  const mockDca: any = {
    ...comparison,
    asset: "BTC",
    setAsset: () => {},
    loading: comparison.loading,
    error: comparison.error,
    isComparison: true,
  };

  const getAssetColor = (id: string, index: number) => {
    if (id === "BTC") return ASSET_CONFIG.BTC.color;
    if (id === "Gold") return ASSET_CONFIG.Gold.color;
    if (id === "Silver") return ASSET_CONFIG.Silver.color;
    return VN_STOCK_COLORS[index % VN_STOCK_COLORS.length];
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-4 space-y-6">
        <InputForm dca={mockDca} />

        <Card className="bg-card/50 border-white/10 shadow-xl overflow-visible">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Search size={18} />
              {t("vn_stocks.add_to_compare", { defaultValue: "Add to Comparison" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative" ref={containerRef}>
              <Label className="sr-only">Search Stocks</Label>
              <Input
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                placeholder={t("vn_stocks.symbol_placeholder")}
                className="border-white/10 bg-black/20"
              />
              {isSearching && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Loader2 size={14} className="text-muted-foreground animate-spin" />
                </div>
              )}

              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl">
                  <div className="scrollbar-thin scrollbar-thumb-white/10 max-h-60 overflow-y-auto p-1">
                    {isSearching ? (
                      <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
                        <Loader2 size={12} className="animate-spin" /> {t("input.loading")}
                      </div>
                    ) : (
                      suggestions.map((s) => (
                        <button
                          key={s.symbol}
                          type="button"
                          className="group w-full rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                          onClick={() => selectSuggestion(s)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="group-hover:text-primary font-bold text-white transition-colors">
                              {s.symbol}
                            </span>
                            <span className="rounded bg-white/5 px-1 text-[10px] uppercase opacity-50">
                              {s.exchange}
                            </span>
                          </div>
                          <div className="text-muted-foreground truncate text-xs group-hover:text-white/80">
                            {s.longname}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {compareAssets.map((asset, index) => (
                <div 
                  key={asset.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium"
                >
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: getAssetColor(asset.id, index) }}
                  />
                  <span>{asset.type === "standard" ? t(`assets.${asset.id}`) : asset.id}</span>
                  <button 
                    onClick={() => removeAsset(asset.id)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      <section className="lg:col-span-8 space-y-8">
        {comparison.loading ? (
          <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-slate-400">{t("input.loading")}</p>
            </div>
          </div>
        ) : (
          <>
            <ComparisonChart 
              results={comparison.results} 
              assetColors={compareAssets.reduce((acc, asset, idx) => {
                acc[asset.id] = getAssetColor(asset.id, idx);
                return acc;
              }, {} as Record<string, string>)}
            />

            <Card className="bg-card/50 border-white/10 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{t("comparison.title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/5 bg-white/5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-4">{t("comparison.table.asset")}</th>
                        <th className="px-6 py-4">{t("comparison.table.invested")}</th>
                        <th className="px-6 py-4">{t("comparison.table.value")}</th>
                        <th className="px-6 py-4">{t("comparison.table.roi")}</th>
                        <th className="px-6 py-4">{t("comparison.table.units")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {compareAssets.map((asset, index) => {
                        const result = comparison.results[asset.id];
                        if (!result) return null;
                        const isProfit = result.roi >= 0;
                        const color = getAssetColor(asset.id, index);

                        return (
                          <tr key={asset.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-bold">
                                  {asset.type === "standard" ? t(`assets.${asset.id}`) : asset.id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {formatting.format(result.totalInvested)}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {formatting.format(result.currentValue)}
                            </td>
                            <td className={`px-6 py-4 font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                              <div className="flex items-center gap-1">
                                {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {result.roi.toFixed(2)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {result.totalUnits.toFixed(asset.id === "BTC" ? 6 : 4)} {asset.type === "standard" ? ASSET_CONFIG[asset.id as Asset].unit : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </div>
  );
}