import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ASSET_CONFIG } from "../constants";
import type { Asset } from "../constants";
import type { InvestmentResult } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface ComparisonChartProps {
  results: Record<string, InvestmentResult | null>;
  assetColors?: Record<string, string>;
}

export function ComparisonChart({ results, assetColors }: ComparisonChartProps) {
  const { t } = useTranslation();

  const assetIds = Object.keys(results).filter(id => results[id] !== null);
  if (assetIds.length === 0) return null;

  // Use the longest history as base if possible, or just the first one
  const firstAssetId = assetIds[0];
  const baseHistory = results[firstAssetId]?.history || [];
  
  // Merge data for chart
  const chartData = baseHistory.map((item, index) => {
    const dataPoint: any = {
      date: item.date,
      invested: item.invested,
    };
    
    assetIds.forEach(id => {
      // Try to find matching date in other assets if histories aren't perfectly aligned
      // For simplicity, we assume they are mostly aligned by index if they come from same logic
      dataPoint[id] = results[id]?.history[index]?.value || 0;
    });
    
    return dataPoint;
  });

  return (
    <Card className="bg-card/50 overflow-hidden border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t("comparison.chart_title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
                formatter={(value: any, name: string | undefined) => {
                  const assetName = name === "invested" ? t("chart.tooltip.total_invested") : (name || "");
                  return [
                    `$${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    assetName,
                  ];
                }}
                labelFormatter={(label) =>
                  format(new Date(label), "MMM d, yyyy")
                }
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="invested"
                stroke="#94a3b8"
                name={t("chart.tooltip.total_invested")}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              {assetIds.map(id => {
                const isStandard = id === "BTC" || id === "Gold" || id === "Silver";
                const color = assetColors?.[id] || (isStandard ? ASSET_CONFIG[id as Asset].color : "#8884d8");
                const name = isStandard ? t(`assets.${id}`) : id;
                
                return (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={color}
                    name={name}
                    strokeWidth={id === "BTC" ? 3 : 2}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}