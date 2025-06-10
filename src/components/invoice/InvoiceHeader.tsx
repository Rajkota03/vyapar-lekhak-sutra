
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, Eye, Download, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
}) => {
  const navigate = useNavigate();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePdfDownload = async () => {
    if (invoiceId) {
      await handleDownloadPdf(invoiceId, invoiceCode, setIsDownloadingPdf);
    }
  };

  const TaxSettingsSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
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

  console.log('=== INVOICE HEADER DEBUG ===');
  console.log('Invoice ID:', invoiceId);
  console.log('Show floating buttons:', showFloatingButtons);
  console.log('onPreview function exists:', !!onPreview);
  console.log('isEditing:', isEditing);

  return (
    <>
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/invoices')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isEditing ? "Edit Invoice" : "Invoice"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <TaxSettingsSheet />
            <Button
              onClick={onSave}
              disabled={!canSave || isSubmitting}
              variant="ghost"
              className="font-medium text-blue-500 h-8 px-3 rounded text-xs"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar - Show when we have an invoiceId */}
      {showFloatingButtons && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4 safe-area-pb">
          <div className="max-w-screen-sm mx-auto flex gap-3">
            {onPreview && (
              <Button
                onClick={onPreview}
                variant="outline"
                className="flex-1 h-12 text-base font-medium"
                disabled={isGeneratingPreview}
              >
                {isGeneratingPreview ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-5 w-5 mr-2" />
                )}
                {isGeneratingPreview ? "Generating..." : "Preview"}
              </Button>
            )}
            <Button
              onClick={handlePdfDownload}
              className="flex-1 h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {isDownloadingPdf ? "Preparing..." : "Download PDF"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceHeader;
