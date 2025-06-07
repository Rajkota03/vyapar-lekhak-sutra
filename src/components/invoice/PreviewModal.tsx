
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  invoiceId,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[98vw] w-full p-2 sm:p-4 overflow-hidden"
        style={{ maxHeight: '95dvh', height: '95dvh' }}
      >
        <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden bg-white rounded-lg">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Preview functionality will be rebuilt
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
