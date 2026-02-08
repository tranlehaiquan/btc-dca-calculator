import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useState } from 'react';
import { format } from 'date-fns';
import { ASSET_CONFIG } from '../constants';
import type { Asset } from '../constants';
import type { InvestmentResult } from '../api';

interface ChartProps {
  data: InvestmentResult['history'];
  asset: Asset;
}

export function Chart({ data, asset }: ChartProps) {
  const [showPrice, setShowPrice] = useState(false);

  if (!data || data.length === 0) return null;

  const config = ASSET_CONFIG[asset];
  const mainColor = config.color;

  return (
    <div className="chart-container">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Portfolio Performance</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#94a3b8' }}>
          <input 
            type="checkbox" 
            checked={showPrice} 
            onChange={(e) => setShowPrice(e.target.checked)}
            style={{ accentColor: mainColor }}
          />
          Show {config.label} Price
        </label>
      </div>
      
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10}
              tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
              }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showPrice && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10b981" 
                fontSize={12}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
            )}
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30, 32, 47, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value, name) => {
                return [`$${value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name];
              }}
              labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="invested" 
              stroke="#94a3b8" 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              name="Total Invested"
              strokeWidth={2}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="value" 
              stroke={mainColor} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              name="Portfolio Value"
              strokeWidth={2}
            />
            {showPrice && (
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                name={`${config.label} Price`}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}