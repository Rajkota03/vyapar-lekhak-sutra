
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  pdfUrl,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] p-0">
        {pdfUrl ? (
          <iframe 
            src={pdfUrl} 
            className="w-full h-full border-0 rounded-lg" 
            title="Invoice Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
