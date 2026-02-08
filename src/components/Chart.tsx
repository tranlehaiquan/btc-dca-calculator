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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
    <Card className="bg-card/50 border-white/10 shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Portfolio Performance</CardTitle>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="showPrice" 
            checked={showPrice} 
            onCheckedChange={(checked) => setShowPrice(!!checked)}
          />
          <Label 
            htmlFor="showPrice" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
          >
            Show {config.label} Price
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                stroke="#64748b" 
                fontSize={12} 
                tickMargin={10}
                tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
                }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  backdropFilter: 'blur(8px)'
                }}
                formatter={(value: any, name?: string) => {
                  return [`$${value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name || ''];
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
      </CardContent>
    </Card>
  );
}
