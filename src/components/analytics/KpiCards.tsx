
import React from "react";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading3, BodyText } from "@/components/ui/primitives/Typography";
import { AnalyticsData } from "@/hooks/useAnalytics";
import { formatNumber } from "@/utils/formatNumber";
import { TrendingUp, DollarSign, FileText, Clock, Users, AlertTriangle } from "lucide-react";

interface KpiCardsProps {
  analytics: AnalyticsData;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ analytics }) => {
  const kpis = [
    {
      title: "Total Revenue",
      value: `₹${formatNumber(analytics.totalRevenue)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Outstanding",
      value: `₹${formatNumber(analytics.outstandingAmount)}`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Overdue",
      value: `₹${formatNumber(analytics.overdueAmount)}`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Total Invoices",
      value: analytics.totalInvoices.toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Paid Invoices",
      value: analytics.paidInvoices.toString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Avg Invoice Value",
      value: `₹${formatNumber(analytics.avgInvoiceValue)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <ModernCard key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <BodyText className="text-muted-foreground text-sm">{kpi.title}</BodyText>
              <Heading3 className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</Heading3>
            </div>
            <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
          </div>
        </ModernCard>
      ))}
    </div>
  );
};
