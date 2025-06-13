
import React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/utils/formatNumber";

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    invoiceCount: number;
  }>;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6",
  },
  invoiceCount: {
    label: "Invoice Count",
    color: "#10b981",
  },
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartContainer config={chartConfig}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              name === 'revenue' ? `₹${formatNumber(Number(value))}` : value,
              name === 'revenue' ? 'Revenue' : 'Invoice Count'
            ]}
          />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
