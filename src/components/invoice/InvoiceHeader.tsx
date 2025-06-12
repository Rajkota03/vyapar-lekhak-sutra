
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Download, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppHeader } from "@/components/layout/AppHeader";
import { FloatingActionBar } from "@/components/layout/FloatingActionBar";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { handleDownloadPdf } from "@/utils/downloadPdf";

interface InvoiceHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  canSave: boolean;
  onSave: () => void;
  onPreview?: () => void;
  invoiceId?: string;
  invoiceCode?: string;
  isGeneratingPreview?: boolean;
  documentType?: 'invoice' | 'proforma' | 'quote';
  customDocumentTypeName?: string;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  isEditing,
  isSubmitting,
  canSave,
  onSave,
  onPreview,
  invoiceId,
  invoiceCode,
  isGeneratingPreview = false,
  documentType = 'invoice',
  customDocumentTypeName,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePdfDownload = async () => {
    if (invoiceId) {
      await handleDownloadPdf(invoiceId, invoiceCode, setIsDownloadingPdf);
    }
  };

  // Get the document title - prioritize custom type name
  const getDocumentTitle = () => {
    if (customDocumentTypeName) {
      return customDocumentTypeName;
    }
    
    switch (documentType) {
      case 'proforma':
        return 'Pro Forma';
      case 'quote':
        return 'Quotation';
      case 'invoice':
      default:
        return 'Invoice';
    }
  };

  // Get the back path based on document type
  const getBackPath = () => {
    // For custom document types, extract from current URL
    if (customDocumentTypeName) {
      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'custom' && pathParts[2]) {
        return `/custom/${pathParts[2]}`;
      }
    }
    
    switch (documentType) {
      case 'proforma':
        return '/proforma';
      case 'quote':
        return '/quotations';
      case 'invoice':
      default:
        return '/invoices';
    }
  };

  const documentTitle = getDocumentTitle();
  const backPath = getBackPath();

  const TaxSettingsSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <PremiumButton variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </PremiumButton>
      </SheetTrigger>
      <SheetContent className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Tax & Settings</SheetTitle>
        </SheetHeader>
        <div className="py-4 overflow-y-auto max-h-[calc(100vh-120px)] px-4 pb-24">
          <p className="text-muted-foreground mb-4">Tax settings will be implemented in a future update.</p>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Show floating buttons if we have an invoiceId (which indicates an existing invoice)
  const showFloatingButtons = !!invoiceId;

  const floatingActions = [];
  
  if (onPreview) {
    floatingActions.push({
      label: isGeneratingPreview ? "Generating..." : "Preview",
      onClick: onPreview,
      variant: "outline" as const,
      loading: isGeneratingPreview,
      icon: isGeneratingPreview ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />
    });
  }

  if (invoiceId) {
    floatingActions.push({
      label: isDownloadingPdf ? "Preparing..." : "Download PDF",
      onClick: handlePdfDownload,
      variant: "primary" as const,
      loading: isDownloadingPdf,
      icon: isDownloadingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />
    });
  }

  return (
    <>
      <AppHeader
        title={documentTitle}
        showBack={true}
        backPath={backPath}
        rightAction={canSave && !invoiceId ? {
          label: isSubmitting ? "Saving..." : "Save",
          onClick: onSave,
          loading: isSubmitting,
          disabled: !canSave
        } : undefined}
      />

      <FloatingActionBar
        actions={floatingActions}
        show={showFloatingButtons}
      />
    </>
  );
};

export default InvoiceHeader;
