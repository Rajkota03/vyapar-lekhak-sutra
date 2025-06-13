
import React from "react";
import { format } from "date-fns";
import { Edit, Trash2, Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SwipeableTableRow } from "./SwipeableTableRow";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

type Invoice = {
  id: string;
  invoice_code: string | null;
  number: string;
  issue_date: string;
  total: number;
  status: string | null;
  clients: {
    name: string;
  } | null;
};

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'destructive' | 'default';
}

interface MobileBillingTableProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
  onEdit?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  onCopy: (invoice: Invoice) => void;
}

export const MobileBillingTable: React.FC<MobileBillingTableProps> = ({
  invoices,
  onInvoiceClick,
  onEdit,
  onDelete,
  onCopy
}) => {
  const getSwipeActions = (invoice: Invoice): SwipeAction[] => {
    const actions = [];
    
    if (onEdit) {
      actions.push({
        icon: <Edit className="h-4 w-4" />,
        label: "Edit",
        onClick: () => onEdit(invoice.id)
      });
    }
    
    actions.push({
      icon: <Copy className="h-4 w-4" />,
      label: "Copy",
      onClick: () => onCopy(invoice)
    });
    
    if (onDelete) {
      actions.push({
        icon: <Trash2 className="h-4 w-4" />,
        label: "Delete",
        onClick: () => onDelete(invoice.id),
        variant: 'destructive' as const
      });
    }
    
    return actions;
  };

  return (
    <div className="sm:hidden">
      {invoices.map((invoice, index) => (
        <div key={invoice.id}>
          <SwipeableTableRow
            actions={getSwipeActions(invoice)}
            onRowClick={() => onInvoiceClick(invoice.id)}
          >
            <div className="p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm">
                  {invoice.invoice_code || invoice.number || 'Draft'}
                </div>
                <div className="font-medium text-sm">
                  ₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {invoice.clients?.name || 'No client'}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
                </div>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </SwipeableTableRow>
          {index < invoices.length - 1 && (
            <Separator className="bg-gray-100" />
          )}
        </div>
      ))}
    </div>
  );
};
