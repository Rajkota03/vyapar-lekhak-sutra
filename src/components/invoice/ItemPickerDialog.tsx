
import React from "react";
import { Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <DrawerHeader className="px-4 py-2 border-b flex-shrink-0">
            <DrawerTitle className="flex items-center text-base">
              <Package className="h-4 w-4 mr-2 text-blue-500" /> Add Item
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden px-4 pb-4 min-h-0">
            <ItemPicker
              companyId={selectedCompanyId}
              onItemSelect={onItemSelect}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75vh] p-4">
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
