
import React, { useState } from "react";
import { CopyToModal } from "./CopyToModal";
import { MobileBillingTable } from "./MobileBillingTable";
import { DesktopBillingTable } from "./DesktopBillingTable";
import { useCopyInvoice } from "@/hooks/useCopyInvoice";

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
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedInvoiceForCopy, setSelectedInvoiceForCopy] = useState<Invoice | null>(null);
  const { copyInvoice, isLoading: isCopying } = useCopyInvoice();

  const handleCopyClick = (invoice: Invoice) => {
    setSelectedInvoiceForCopy(invoice);
    setCopyModalOpen(true);
  };

  const handleCopyTo = (targetType: string, customTypeId?: string) => {
    if (selectedInvoiceForCopy) {
      copyInvoice({
        sourceInvoiceId: selectedInvoiceForCopy.id,
        targetType,
        customTypeId,
      });
    }
    setCopyModalOpen(false);
    setSelectedInvoiceForCopy(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <MobileBillingTable
          invoices={invoices}
          onInvoiceClick={onInvoiceClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={handleCopyClick}
        />

        <DesktopBillingTable
          invoices={invoices}
          onInvoiceClick={onInvoiceClick}
          sortDirection={sortDirection}
          onSort={onSort}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={handleCopyClick}
        />
      </div>

      <CopyToModal
        isOpen={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false);
          setSelectedInvoiceForCopy(null);
        }}
        onCopyTo={handleCopyTo}
        sourceDocumentNumber={selectedInvoiceForCopy?.invoice_code || selectedInvoiceForCopy?.number || 'Draft'}
      />
    </>
  );
};

export default BillingInvoiceTable;
