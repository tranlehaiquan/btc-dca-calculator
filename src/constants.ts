export type Asset = 'BTC' | 'Gold' | 'Silver';
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface AssetConfig {
  id: string;
  symbol: string | null;
  label: string;
  unit: string;
  source: 'binance' | 'coingecko';
  color: string;
}

export const ASSET_CONFIG: Record<Asset, AssetConfig> = {
  BTC: {
    id: 'bitcoin',
    symbol: 'BTCUSDT',
    label: 'Bitcoin',
    unit: 'BTC',
    source: 'binance',
    color: '#F7931A',
  },
  Gold: {
    id: 'pax-gold',
    symbol: 'PAXGUSDT',
    label: 'Gold',
    unit: 'OZ',
    source: 'binance',
    color: '#D4AF37',
  },
  Silver: {
    id: 'kinesis-silver',
    symbol: null,
    label: 'Silver',
    unit: 'OZ',
    source: 'coingecko',
    color: '#C0C0C0',
  },
};
