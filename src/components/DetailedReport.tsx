import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { InvestmentResult } from "../api";
import type { Asset } from "../constants";
import { BarChart3, Calculator, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface DetailedReportProps {
  result: InvestmentResult;
  asset: Asset;
}

export function DetailedReport({ result }: DetailedReportProps) {
  const { t } = useTranslation();
  
  const formatting = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const metrics = [
    {
      label: t("report.purchase_count"),
      value: result.purchaseCount,
      icon: <Calculator size={16} className="text-blue-400" />,
    },
    {
      label: t("report.average_price"),
      value: formatting.format(result.averagePrice),
      icon: <BarChart3 size={16} className="text-purple-400" />,
    },
    {
      label: t("report.best_price"),
      value: formatting.format(result.bestPrice),
      icon: <ArrowDownCircle size={16} className="text-emerald-400" />,
    },
    {
      label: t("report.worst_price"),
      value: formatting.format(result.worstPrice),
      icon: <ArrowUpCircle size={16} className="text-red-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="bg-card/30 border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              {metric.icon}
              {metric.label}
            </div>
            <div className="text-xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
