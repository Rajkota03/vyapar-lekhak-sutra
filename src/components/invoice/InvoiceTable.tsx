
import React from "react";
import { format } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

type SortField = 'number' | 'client' | 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface InvoiceTableProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onInvoiceClick,
  sortField,
  sortDirection,
  onSort
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3" /> : 
      <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const handleSort = (field: SortField) => {
    if (onSort) {
      onSort(field);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('number')}
              >
                Invoice #
                {getSortIcon('number')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('client')}
              >
                Client
                {getSortIcon('client')}
              </Button>
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('date')}
              >
                Date
                {getSortIcon('date')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('amount')}
              >
                Amount
                {getSortIcon('amount')}
              </Button>
            </TableHead>
            <TableHead className="hidden sm:table-cell text-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort('status')}
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;
