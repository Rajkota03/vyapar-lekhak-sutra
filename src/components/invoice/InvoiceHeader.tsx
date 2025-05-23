
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, Eye, Share } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { handleSharePdf } from "@/utils/sharePdf";

interface InvoiceHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  canSave: boolean;
  onSave: () => void;
  onPreview?: () => void;
  invoiceId?: string;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  isEditing,
  isSubmitting,
  canSave,
  onSave,
  onPreview,
  invoiceId,
}) => {
  const navigate = useNavigate();

  const handlePdfShare = async () => {
    if (invoiceId) {
      await handleSharePdf(invoiceId);
    }
  };

  const TaxSettingsSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
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

  return (
    <div className="sticky top-0 z-10 bg-white border-b p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/invoices')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEditing ? "Edit Invoice" : "Invoice"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <TaxSettingsSheet />
          {invoiceId && onPreview && (
            <Button
              onClick={onPreview}
              variant="ghost"
              className="font-medium text-blue-500 h-8 px-3 rounded text-xs font-medium"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
          {invoiceId && (
            <Button
              onClick={handlePdfShare}
              variant="outline"
              className="h-8 px-3 text-xs"
            >
              <Share className="h-4 w-4 mr-1" />
              Share PDF
            </Button>
          )}
          <Button
            onClick={onSave}
            disabled={!canSave || isSubmitting}
            variant="ghost"
            className="font-medium text-blue-500 h-8 px-3 rounded text-xs font-medium"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
