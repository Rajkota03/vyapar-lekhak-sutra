
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SwipeableRow from "./SwipeableRow";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onDelete?: (invoiceId: string) => void;
  onConvert?: (invoiceId: string) => void;
  searchQuery?: string;
  documentType?: 'invoice' | 'proforma';
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

interface InvoiceRowProps {
  invoice: Invoice;
  onInvoiceClick: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  onConvert?: (invoiceId: string) => void;
  documentType?: 'invoice' | 'proforma';
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({ 
  invoice, 
  onInvoiceClick, 
  onDelete,
  onConvert,
  documentType = 'invoice'
}) => {
  const isMobile = useIsMobile();

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

  const handleDelete = onDelete ? () => onDelete(invoice.id) : undefined;
  const handleConvert = onConvert ? () => onConvert(invoice.id) : undefined;

  // Show convert action only for proformas on mobile when onConvert function is provided
  const showConvert = isMobile && documentType === 'proforma' && !!onConvert;
  // Show delete action on mobile when onDelete function is provided
  const showDelete = isMobile && !!onDelete;

  const tableRow = (
    <TableRow 
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
  );

  // Wrap with SwipeableRow only on mobile and when actions are available
  if (isMobile && (showDelete || showConvert)) {
    return (
      <SwipeableRow
        onDelete={handleDelete}
        onConvert={handleConvert}
        showConvert={showConvert}
      >
        {tableRow}
      </SwipeableRow>
    );
  }

  return tableRow;
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onInvoiceClick,
  onDelete,
  onConvert,
  searchQuery,
  documentType = 'invoice',
  sortField,
  sortDirection,
  onSort
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const handleHeaderClick = (field: SortField) => {
    if (onSort) {
      onSort(field);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-md border">
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead 
                className={`w-[150px] ${onSort ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => handleHeaderClick('number')}
              >
                Document # {getSortIcon('number')}
              </TableHead>
              <TableHead 
                className={onSort ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => handleHeaderClick('client')}
              >
                Client {getSortIcon('client')}
              </TableHead>
              <TableHead 
                className={`hidden sm:table-cell ${onSort ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => handleHeaderClick('date')}
              >
                Date {getSortIcon('date')}
              </TableHead>
              <TableHead 
                className={`text-right ${onSort ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => handleHeaderClick('amount')}
              >
                Amount {getSortIcon('amount')}
              </TableHead>
              <TableHead 
                className={`hidden sm:table-cell text-center ${onSort ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => handleHeaderClick('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onInvoiceClick={onInvoiceClick}
                onDelete={onDelete}
                onConvert={onConvert}
                documentType={documentType}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceTable;
