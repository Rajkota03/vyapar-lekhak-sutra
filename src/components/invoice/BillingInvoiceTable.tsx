
import React from "react";
import { format } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SwipeableTableRow } from "./SwipeableTableRow";

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

type SortDirection = 'asc' | 'desc';

interface BillingInvoiceTableProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
  sortDirection: SortDirection;
  onSort: () => void;
  searchQuery: string;
  onEdit?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  onDuplicate?: (invoiceId: string) => void;
}

const BillingInvoiceTable: React.FC<BillingInvoiceTableProps> = ({
  invoices,
  onInvoiceClick,
  sortDirection,
  onSort,
  searchQuery,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const getStatusBadge = (status: string | null) => {
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

  const getSortIcon = () => {
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3" /> : 
      <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const getSwipeActions = (invoice: Invoice) => {
    const actions = [];
    
    if (onEdit) {
      actions.push({
        icon: <Edit className="h-4 w-4" />,
        label: "Edit",
        onClick: () => onEdit(invoice.id)
      });
    }
    
    if (onDuplicate) {
      actions.push({
        icon: <Copy className="h-4 w-4" />,
        label: "Copy",
        onClick: () => onDuplicate(invoice.id)
      });
    }
    
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Document #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="hidden sm:table-cell">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                onClick={onSort}
              >
                Date
                {getSortIcon()}
              </Button>
            </TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <SwipeableTableRow
              key={invoice.id}
              actions={getSwipeActions(invoice)}
              onRowClick={() => onInvoiceClick(invoice.id)}
            >
              <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors border-0">
                <TableCell className="font-medium">
                  {invoice.invoice_code || invoice.number || 'Draft'}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{invoice.clients?.name || 'No client'}</div>
                    <div className="sm:hidden text-xs text-muted-foreground">
                      {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
                    </div>
                    <div className="sm:hidden">
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">
                  {getStatusBadge(invoice.status)}
                </TableCell>
              </TableRow>
            </SwipeableTableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BillingInvoiceTable;
