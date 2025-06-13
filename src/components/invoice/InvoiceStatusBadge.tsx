
import React from "react";
import { Badge } from "@/components/ui/badge";

interface InvoiceStatusBadgeProps {
  status: string | null;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  if (!status) return null;
  
  const statusConfig = {
    draft: { label: "Draft", variant: "secondary" as const },
    sent: { label: "Sent", variant: "default" as const },
    paid: { label: "Paid", variant: "default" as const }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
};
