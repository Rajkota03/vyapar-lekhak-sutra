
import React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/utils/formatNumber";

interface CashFlowChartProps {
  data: Array<{
    month: string;
    paid: number;
    outstanding: number;
  }>;
}

const chartConfig = {
  paid: {
    label: "Paid",
    color: "#10b981",
  },
  outstanding: {
    label: "Outstanding",
    color: "#f59e0b",
  },
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ChartContainer config={chartConfig}>
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value) => [`₹${formatNumber(Number(value))}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="paid" 
            stackId="1" 
            stroke="var(--color-paid)" 
            fill="var(--color-paid)" 
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="outstanding" 
            stackId="1" 
            stroke="var(--color-outstanding)" 
            fill="var(--color-outstanding)" 
            fillOpacity={0.6}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
