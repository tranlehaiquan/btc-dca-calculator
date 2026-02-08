import type { Frequency, Asset } from '../constants';
import { Calendar as CalendarIcon, DollarSign, RefreshCw, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface InputFormProps {
  asset: Asset;
  setAsset: (val: Asset) => void;
  amount: number;
  setAmount: (val: number) => void;
  frequency: Frequency;
  setFrequency: (val: Frequency) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export function InputForm({
  asset,
  setAsset,
  amount,
  setAmount,
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onCalculate,
  isLoading
}: InputFormProps) {
  const startD = startDate ? parseISO(startDate) : undefined;
  const endD = endDate ? parseISO(endDate) : undefined;

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Investment Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-secondary-foreground/70">
            <Coins size={14} /> Select Asset
          </Label>
          <Select value={asset} onValueChange={(val) => setAsset(val as Asset)}>
            <SelectTrigger className="w-full bg-black/20 border-white/10">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
              <SelectItem value="Gold">Gold (PAXG)</SelectItem>
              <SelectItem value="Silver">Silver (KAG)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-secondary-foreground/70">
            <DollarSign size={14} /> Investment Amount
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              className="pl-7 bg-black/20 border-white/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-secondary-foreground/70">
            <RefreshCw size={14} /> Frequency
          </Label>
          <Select value={frequency} onValueChange={(val) => setFrequency(val as Frequency)}>
            <SelectTrigger className="w-full bg-black/20 border-white/10">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-secondary-foreground/70">
              <CalendarIcon size={14} /> Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-black/20 border-white/10 hover:bg-black/30",
                    !startD && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startD ? format(startD, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/10" align="start">
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

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-secondary-foreground/70">
              <CalendarIcon size={14} /> End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-black/20 border-white/10 hover:bg-black/30",
                    !endD && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endD ? format(endD, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/10" align="start">
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

        <Button 
          className="w-full bg-asset-gradient text-black font-bold hover:opacity-90 transition-all transform hover:-translate-y-0.5"
          onClick={onCalculate}
          disabled={isLoading}
        >
          {isLoading ? 'Loading data...' : 'Calculate Returns'}
        </Button>
      </CardContent>
    </Card>
  );
}
