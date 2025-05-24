
import React from "react";
import { Package } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ItemPicker from "./ItemPicker";
import { Item } from "./types/InvoiceTypes";

interface ItemPickerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect: (item: Item) => void;
  selectedCompanyId: string | null;
}

const ItemPickerDialog: React.FC<ItemPickerDialogProps> = ({
  isOpen,
  onOpenChange,
  onItemSelect,
  selectedCompanyId,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-4">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" /> Add Item
          </SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-auto">
          <ItemPicker
            companyId={selectedCompanyId}
            onItemSelect={onItemSelect}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ItemPickerDialog;
