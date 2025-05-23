
import React from "react";
import { Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-md shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" /> Add Item
          </DialogTitle>
        </DialogHeader>
        <div>
          <ItemPicker
            companyId={selectedCompanyId}
            onItemSelect={onItemSelect}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemPickerDialog;
