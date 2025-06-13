
import React from "react";
import { BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { formatNumber } from "@/utils/formatNumber";

interface TopClientsTableProps {
  clients: Array<{
    name: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
}

export const TopClientsTable: React.FC<TopClientsTableProps> = ({ clients }) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-8">
        <CaptionText>No client data available</CaptionText>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clients.map((client, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <BodyText className="font-medium">{client.name}</BodyText>
            <CaptionText>{client.invoiceCount} invoices</CaptionText>
          </div>
          <div className="text-right">
            <BodyText className="font-semibold">₹{formatNumber(client.totalAmount)}</BodyText>
          </div>
        </div>
      ))}
    </div>
  );
};
