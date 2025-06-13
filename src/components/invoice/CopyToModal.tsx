
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Quote, Receipt } from "lucide-react";
import { useCustomDocumentTypes } from "@/hooks/useCustomDocumentTypes";

interface CopyToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyTo: (targetType: string, customTypeId?: string) => void;
  sourceDocumentNumber: string;
}

interface CopyOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  customTypeId?: string;
}

export const CopyToModal: React.FC<CopyToModalProps> = ({
  isOpen,
  onClose,
  onCopyTo,
  sourceDocumentNumber,
}) => {
  const { customDocumentTypes } = useCustomDocumentTypes();

  const baseCopyOptions: CopyOption[] = [
    {
      id: "invoice",
      name: "Invoice",
      icon: <Receipt className="h-5 w-5" />,
      description: "Create a new invoice",
    },
    {
      id: "proforma",
      name: "Pro Forma",
      icon: <FileText className="h-5 w-5" />,
      description: "Create a new pro forma invoice",
    },
    {
      id: "quote",
      name: "Quotation",
      icon: <Quote className="h-5 w-5" />,
      description: "Create a new quotation",
    },
  ];

  const customOptions: CopyOption[] = customDocumentTypes.map(docType => ({
    id: `custom-${docType.id}`,
    name: docType.name,
    icon: <Copy className="h-5 w-5" />,
    description: `Create a new ${docType.name.toLowerCase()}`,
    customTypeId: docType.id,
  }));

  const allOptions = [...baseCopyOptions, ...customOptions];

  const handleCopyTo = (option: CopyOption) => {
    if (option.customTypeId) {
      onCopyTo('custom', option.customTypeId);
    } else {
      onCopyTo(option.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Copy {sourceDocumentNumber} to
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          {allOptions.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-gray-50"
              onClick={() => handleCopyTo(option)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-600">
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {option.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {option.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
