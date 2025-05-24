
import React from "react";
import { Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { SheetBody } from "@/components/ui/SheetBody";
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
        <DrawerContent style={{ maxHeight: '80dvh' }} className="h-[80dvh]">
          <DrawerHeader className="px-4 py-2 border-b flex-shrink-0">
            <DrawerTitle className="flex items-center text-base">
              <Package className="h-4 w-4 mr-2 text-blue-500" /> Add Item
            </DrawerTitle>
          </DrawerHeader>
          <SheetBody>
            <ItemPicker
              companyId={selectedCompanyId}
              onItemSelect={onItemSelect}
              onClose={() => onOpenChange(false)}
            />
          </SheetBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" style={{ maxHeight: '80dvh' }} className="h-[80dvh] p-0">
        <SheetHeader className="mb-4 px-4 pt-4">
          <SheetTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" /> Add Item
          </SheetTitle>
        </SheetHeader>
        <SheetBody>
          <ItemPicker
            companyId={selectedCompanyId}
            onItemSelect={onItemSelect}
            onClose={() => onOpenChange(false)}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default ItemPickerDialog;
