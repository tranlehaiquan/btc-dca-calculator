import { ASSET_CONFIG } from '../constants';
import type { Asset } from '../constants';
import type { InvestmentResult } from '../api';
import { TrendingUp, TrendingDown, Wallet, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsDashboardProps {
  result: InvestmentResult | null;
  asset: Asset;
}

export function ResultsDashboard({ result, asset }: ResultsDashboardProps) {
  if (!result) return null;

  const isProfit = result.roi >= 0;
  const formatting = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const config = ASSET_CONFIG[asset];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card/50 border-white/10 transition-transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet size={16} className="text-[var(--asset-primary)]" />
            Total Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatting.format(result.totalInvested)}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[var(--asset-primary)]/10 to-transparent border-[var(--asset-primary)]/20 transition-transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Coins size={16} className="text-[var(--asset-primary)]" />
            Value in {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{result.totalUnits.toFixed(asset === 'BTC' ? 8 : 4)} {config.unit}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Current Value: {formatting.format(result.currentValue)}
          </p>
        </CardContent>
      </Card>

      <Card className={`border-white/10 transition-transform hover:-translate-y-1 ${isProfit ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {isProfit ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
            Total Change
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
            {isProfit ? '+' : ''}{result.roi.toFixed(2)}%
          </div>
          <p className={`text-xs mt-1 ${isProfit ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
            {isProfit ? '+' : ''}{formatting.format(result.currentValue - result.totalInvested)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
