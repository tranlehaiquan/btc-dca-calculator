import { startOfDay, addDays } from 'date-fns';
import type { PricePoint } from './api';

export function getFallbackBitcoinHistory(): PricePoint[] {
  const prices: PricePoint[] = [];
  let currentDate = startOfDay(new Date('2023-01-01'));
  const endDate = startOfDay(new Date()); // Today
  
  // Starting price Jan 2023 approx
  let price = 16500; 

  while (currentDate <= endDate) {
    prices.push({
      date: currentDate.getTime(),
      price: price
    });

    // Simulate market movement
    // General trend + random noise
    const volatility = 0.02; // 2% daily volatility
    const change = 1 + (Math.random() * volatility * 2 - volatility);
    
    // Add a slight upward drift roughly matching the bull run
    const drift = 1.0015; 
    
    price = price * change * drift;

    currentDate = addDays(currentDate, 1);
  }

  return prices;
}
