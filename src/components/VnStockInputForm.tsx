import { Calendar as CalendarIcon, RefreshCw, Share2, Percent, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid, parse } from "date-fns";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import type { Frequency } from "@/constants";
import type { VnStockCalculatorHook } from "@/hooks/useVnStockCalculator";
import { searchVnStock, type StockSuggestion } from "@/api";

interface VnStockInputFormProps {
  dca: VnStockCalculatorHook;
}

export function VnStockInputForm({ dca }: VnStockInputFormProps) {
  const {
    symbol,
    setSymbol,
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    inflationRate,
    setInflationRate,
    calculate: onCalculate,
    loading: isLoading,
  } = dca;

  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState(false);
  const [tempSymbol, setTempSymbol] = useState(symbol);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateInput = (val: string, setter: (v: string) => void) => {
    setter(val);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const getValidDate = (dateStr: string) => {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  };

  const startD = getValidDate(startDate);
  const endD = getValidDate(endDate);

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSymbol(tempSymbol.toUpperCase());
    setShowSuggestions(false);
  };

  const handleSymbolChange = (val: string) => {
    setTempSymbol(val);
    
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
    setTempSymbol(s.symbol);
    setSymbol(s.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Card className="bg-card/50 border-white/10 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          {t("input.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSymbolSubmit} className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <Search size={14} /> {t("vn_stocks.select_symbol")}
          </Label>
          <div className="relative flex gap-2" ref={containerRef}>
            <div className="relative flex-1">
              <Input
                value={tempSymbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                onFocus={() => tempSymbol.length >= 2 && setShowSuggestions(true)}
                placeholder={t("vn_stocks.symbol_placeholder")}
                className="border-white/10 bg-black/20"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                </div>
              )}
              
              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                    {isSearching ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" /> {t("input.loading")}
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {t("vn_stocks.no_results", { defaultValue: "No stocks found" })}
                      </div>
                    ) : (
                      suggestions.map((s) => (
                        <button
                          key={s.symbol}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-white/10 transition-colors group"
                          onClick={() => selectSuggestion(s)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white group-hover:text-primary transition-colors">{s.symbol}</span>
                            <span className="text-[10px] bg-white/5 px-1 rounded uppercase opacity-50">{s.exchange}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate group-hover:text-white/80">{s.longname}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" size="sm" variant="secondary">
              OK
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <span className="font-bold text-xs">₫</span> {t("input.investment_amount")}
          </Label>
          <div className="relative">
            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
              ₫
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1000"
              step="1000"
              className="border-white/10 bg-black/20 pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <Percent size={14} /> {t("input.inflation_rate")}
          </Label>
          <Input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            min="0"
            step="0.1"
            className="border-white/10 bg-black/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-secondary-foreground/70 flex items-center gap-2">
            <RefreshCw size={14} /> {t("input.frequency")}
          </Label>
          <Select
            value={frequency}
            onValueChange={(val) => setFrequency(val as Frequency)}
          >
            <SelectTrigger className="w-full border-white/10 bg-black/20">
              <SelectValue placeholder={t("input.frequency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">
                {t("input.frequencies.daily")}
              </SelectItem>
              <SelectItem value="weekly">
                {t("input.frequencies.weekly")}
              </SelectItem>
              <SelectItem value="monthly">
                {t("input.frequencies.monthly")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-secondary-foreground/70 flex items-center gap-2">
              <CalendarIcon size={14} /> {t("input.start_date")}
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={startDate}
                onChange={(e) => handleDateInput(e.target.value, setStartDate)}
                placeholder="YYYY-MM-DD"
                className="border-white/10 bg-black/20 pr-10"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-white"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/10 p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startD}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-secondary-foreground/70 flex items-center gap-2">
              <CalendarIcon size={14} /> {t("input.end_date")}
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={endDate}
                onChange={(e) => handleDateInput(e.target.value, setEndDate)}
                placeholder="YYYY-MM-DD"
                className="border-white/10 bg-black/20 pr-10"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-white"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/10 p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endD}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || (startD ? date < startD : false)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Button
          className="bg-asset-gradient w-full transform font-bold text-black transition-all hover:-translate-y-0.5 hover:opacity-90"
          onClick={onCalculate}
          disabled={isLoading}
        >
          {isLoading ? t("input.loading") : t("input.calculate_btn")}
        </Button>

        <Button
          variant="outline"
          className="w-full border-white/10 bg-black/20 hover:bg-black/40 text-sm flex items-center gap-2"
          onClick={handleShare}
        >
          <Share2 size={14} />
          {showCopied ? t("input.share_success") : t("input.share_btn")}
        </Button>
      </CardContent>
    </Card>
  );
}
