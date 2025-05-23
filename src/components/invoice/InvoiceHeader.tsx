
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface InvoiceHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  canSave: boolean;
  onSave: () => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  isEditing,
  isSubmitting,
  canSave,
  onSave,
}) => {
  const navigate = useNavigate();

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
    <div className="sticky top-0 z-10 bg-white border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/invoice-list')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEditing ? "Edit Invoice" : "Invoice"}
          </h1>
        </div>
        <div className="flex items-center">
          <TaxSettingsSheet />
          <Button
            onClick={onSave}
            disabled={!canSave || isSubmitting}
            variant="ghost"
            className="font-medium text-blue-500 h-10 px-4 rounded-md text-sm font-medium"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
