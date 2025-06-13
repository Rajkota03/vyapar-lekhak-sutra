
import React from "react";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

interface DraggableInvoiceTableProps {
  invoices: Invoice[];
  onInvoiceClick: (invoiceId: string) => void;
  onReorder: (invoices: Invoice[]) => void;
  onDelete?: (invoiceId: string) => void;
  onConvert?: (invoiceId: string) => void;
  searchQuery: string;
  documentType?: 'invoice' | 'proforma';
}

interface SortableRowProps {
  invoice: Invoice;
  onInvoiceClick: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  onConvert?: (invoiceId: string) => void;
  isDraggingDisabled: boolean;
  documentType?: 'invoice' | 'proforma';
}

const SortableRow: React.FC<SortableRowProps> = ({ 
  invoice, 
  onInvoiceClick, 
  onDelete,
  onConvert,
  isDraggingDisabled,
  documentType = 'invoice'
}) => {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: invoice.id, disabled: isDraggingDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  // Show convert action only for proformas on mobile
  const showConvert = isMobile && documentType === 'proforma' && onConvert;
  const showDelete = isMobile && onDelete;

  const tableRow = (
    <TableRow 
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onInvoiceClick(invoice.id)}
    >
      <TableCell className="w-8">
        {!isDraggingDisabled && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
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
        isDisabled={isDraggingDisabled}
      >
        {tableRow}
      </SwipeableRow>
    );
  }

  return tableRow;
};

const DraggableInvoiceTable: React.FC<DraggableInvoiceTableProps> = ({
  invoices,
  onInvoiceClick,
  onReorder,
  onDelete,
  onConvert,
  searchQuery,
  documentType = 'invoice'
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = invoices.findIndex(item => item.id === active.id);
      const newIndex = invoices.findIndex(item => item.id === over?.id);

      const newOrder = arrayMove(invoices, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  // Disable dragging when searching
  const isDraggingDisabled = searchQuery.trim().length > 0;

  return (
    <div className="rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                {/* Drag handle column */}
              </TableHead>
              <TableHead className="w-[150px]">Document #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext 
              items={invoices.map(inv => inv.id)} 
              strategy={verticalListSortingStrategy}
              disabled={isDraggingDisabled}
            >
              {invoices.map((invoice) => (
                <SortableRow
                  key={invoice.id}
                  invoice={invoice}
                  onInvoiceClick={onInvoiceClick}
                  onDelete={onDelete}
                  onConvert={onConvert}
                  isDraggingDisabled={isDraggingDisabled}
                  documentType={documentType}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
      {searchQuery.trim().length > 0 && (
        <div className="p-2 text-xs text-muted-foreground text-center border-t">
          Drag and drop is disabled while searching
        </div>
      )}
    </div>
  );
};

export default DraggableInvoiceTable;
