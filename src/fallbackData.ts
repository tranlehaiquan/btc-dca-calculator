import { startOfDay, addDays } from 'date-fns';
import type { PricePoint } from './api';
import type { Asset } from './constants';

export function getFallbackHistory(asset: Asset): PricePoint[] {
  const prices: PricePoint[] = [];
  let currentDate = startOfDay(new Date('2023-01-01'));
  const endDate = startOfDay(new Date()); 
  
  let price = 0;
  let drift = 1.0015;

  switch (asset) {
    case 'BTC':
      price = 16500;
      drift = 1.002;
      break;
    case 'Gold':
      price = 1800;
      drift = 1.0005;
      break;
    case 'Silver':
      price = 24;
      drift = 1.0003;
      break;
  }

  while (currentDate <= endDate) {
    prices.push({
      date: currentDate.getTime(),
      price: price
    });

    const volatility = asset === 'BTC' ? 0.03 : 0.01;
    const change = 1 + (Math.random() * volatility * 2 - volatility);
    price = price * change * drift;
    currentDate = addDays(currentDate, 1);
  }

  return prices;
}
