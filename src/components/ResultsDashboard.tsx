import { ASSET_CONFIG } from '../constants';
import type { Asset } from '../constants';
import type { InvestmentResult } from '../api';
import { TrendingUp, TrendingDown, Wallet, Coins } from 'lucide-react';

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
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-header">
          <Wallet className="icon-subtle" />
          <span>Total Invested</span>
        </div>
        <div className="stat-value">{formatting.format(result.totalInvested)}</div>
      </div>

      <div className="stat-card featured">
        <div className="stat-header">
          <Coins className="icon-subtle" />
          <span>Value in {config.label}</span>
        </div>
        <div className="stat-value">{result.totalUnits.toFixed(asset === 'BTC' ? 8 : 4)} {config.unit}</div>
        <div className="sub-value">Current Value: {formatting.format(result.currentValue)}</div>
      </div>

      <div className={`stat-card ${isProfit ? 'profit' : 'loss'}`}>
        <div className="stat-header">
          {isProfit ? <TrendingUp className="icon-subtle" /> : <TrendingDown className="icon-subtle" />}
          <span>Total Change</span>
        </div>
        <div className="stat-value">
          {isProfit ? '+' : ''}{result.roi.toFixed(2)}%
        </div>
        <div className="sub-value">
          {isProfit ? '+' : ''}{formatting.format(result.currentValue - result.totalInvested)}
        </div>
      </div>
    </div>
  );
}