
import React from "react";
import { format } from "date-fns";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type SortDirection = 'asc' | 'desc';

interface DesktopBillingTableProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
  sortDirection: SortDirection;
  onSort: () => void;
}

export const DesktopBillingTable: React.FC<DesktopBillingTableProps> = ({
  invoices,
  onInvoiceClick,
  sortDirection,
  onSort
}) => {
  const getSortIcon = () => {
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3" /> : 
      <ArrowDown className="ml-1 h-3 w-3" />;
  };

  return (
    <Table className="hidden sm:table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Document #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>
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
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow 
            key={invoice.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onInvoiceClick(invoice.id)}
          >
            <TableCell className="font-medium">
              {invoice.invoice_code || invoice.number || 'Draft'}
            </TableCell>
            <TableCell>
              {invoice.clients?.name || 'No client'}
            </TableCell>
            <TableCell>
              {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
            </TableCell>
            <TableCell className="text-right font-medium">
              ₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell className="text-center">
              <InvoiceStatusBadge status={invoice.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
