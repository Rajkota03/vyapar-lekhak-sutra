
import React from "react";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onEdit?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  onCopy: (invoice: Invoice) => void;
}

export const DesktopBillingTable: React.FC<DesktopBillingTableProps> = ({
  invoices,
  onInvoiceClick,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onCopy
}) => {
  const getSortIcon = () => {
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3" /> : 
      <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const handleRowClick = (e: React.MouseEvent, invoiceId: string) => {
    // Don't trigger row click if clicking on the dropdown menu
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      e.stopPropagation();
      return;
    }
    onInvoiceClick(invoiceId);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow 
            key={invoice.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={(e) => handleRowClick(e, invoice.id)}
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
            <TableCell onClick={handleActionClick}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-dropdown-trigger>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(invoice.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onCopy(invoice)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to...
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(invoice.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
