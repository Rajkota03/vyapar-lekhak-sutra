
import React, { useState, useEffect } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LineItem } from "./types/InvoiceTypes";
import { formatNumber } from "@/utils/formatNumber";
import { BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { useIsMobile } from "@/hooks/use-mobile";

interface ItemEditSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  line: LineItem | null;
  onSave: (updatedLine: LineItem) => void;
  onDelete: () => void;
}

const ItemEditSheet: React.FC<ItemEditSheetProps> = ({
  isOpen,
  onOpenChange,
  line,
  onSave,
  onDelete,
}) => {
  const [editedLine, setEditedLine] = useState<LineItem | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (line) {
      setEditedLine({
        ...line,
        discount_amount: line.discount_amount || 0,
        note: line.note || '',
        cgst: line.cgst || 0,
        sgst: line.sgst || 0,
      });
    }
  }, [line]);

  if (!editedLine) return null;

  const handleSave = () => {
    if (!editedLine.description.trim() || editedLine.unit_price <= 0) {
      return;
    }

    const amount = (editedLine.qty * editedLine.unit_price) - (editedLine.discount_amount || 0);
    
    onSave({
      ...editedLine,
      amount,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  const calculatedAmount = (editedLine.qty * editedLine.unit_price) - (editedLine.discount_amount || 0);

  const FormContent = () => (
    <div className="space-y-6 w-full mobile-safe">
      {/* Item Name */}
      <div className="space-y-3 w-full">
        <label>
          <CaptionText className="text-muted-foreground font-medium">
            Name <span className="text-red-500">*</span>
          </CaptionText>
        </label>
        <Input
          value={editedLine.description}
          onChange={(e) => setEditedLine({ ...editedLine, description: e.target.value })}
          className="h-12 text-base bg-background border-border focus:border-primary w-full max-w-full"
          placeholder="Item name"
        />
      </div>

      {/* Product Code */}
      <div className="space-y-3 w-full">
        <label>
          <CaptionText className="text-muted-foreground font-medium">
            Product Code
          </CaptionText>
        </label>
        <Input
          value={editedLine.item?.code || ''}
          className="h-12 text-base bg-muted/50 border-border w-full max-w-full"
          placeholder="Optional code"
          disabled
        />
      </div>

      {/* Price */}
      <div className="space-y-3 w-full">
        <label>
          <CaptionText className="text-muted-foreground font-medium">
            Price
          </CaptionText>
        </label>
        <Input
          type="number"
          value={editedLine.unit_price}
          onChange={(e) => setEditedLine({ ...editedLine, unit_price: Number(e.target.value) })}
          className="h-12 text-base bg-background border-border focus:border-primary w-full max-w-full"
          min="0"
          step="0.01"
        />
      </div>

      {/* Quantity */}
      <div className="space-y-3 w-full">
        <label>
          <CaptionText className="text-muted-foreground font-medium">
            Quantity
          </CaptionText>
        </label>
        <Input
          type="number"
          value={editedLine.qty}
          onChange={(e) => setEditedLine({ ...editedLine, qty: Number(e.target.value) })}
          className="h-12 text-base bg-background border-border focus:border-primary w-full max-w-full"
          min="1"
        />
      </div>

      {/* Discount */}
      <div className="space-y-3 w-full">
        <label>
          <CaptionText className="text-muted-foreground font-medium">
            Discount (INR)
          </CaptionText>
        </label>
        <Input
          type="number"
          value={editedLine.discount_amount || 0}
          onChange={(e) => setEditedLine({ ...editedLine, discount_amount: Number(e.target.value) })}
          className="h-12 text-base bg-background border-border focus:border-primary w-full max-w-full"
          min="0"
          step="0.01"
        />
      </div>

      {/* Add Photo Button */}
      <Button variant="outline" className="w-full h-12 border-dashed max-w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Photo
      </Button>

      {/* Tax Settings */}
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between py-2 w-full">
          <div>
            <BodyText className="font-medium">CGST (9%)</BodyText>
          </div>
          <Switch
            checked={!!editedLine.cgst}
            onCheckedChange={(checked) => setEditedLine({ 
              ...editedLine, 
              cgst: checked ? 9 : 0 
            })}
          />
        </div>
        <div className="flex items-center justify-between py-2 w-full">
          <div>
            <BodyText className="font-medium">SGST (9%)</BodyText>
          </div>
          <Switch
            checked={!!editedLine.sgst}
            onCheckedChange={(checked) => setEditedLine({ 
              ...editedLine, 
              sgst: checked ? 9 : 0 
            })}
          />
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-muted/30 rounded-xl p-4 w-full">
        <div className="flex justify-between items-center w-full">
          <BodyText className="font-medium text-muted-foreground">Amount</BodyText>
          <BodyText className="text-xl font-semibold">₹{formatNumber(calculatedAmount)}</BodyText>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 w-full">
        <label>
          <CaptionText className="text-muted-foreground font-medium">
            Description
          </CaptionText>
        </label>
        <Textarea
          value={editedLine.note || ''}
          onChange={(e) => setEditedLine({ ...editedLine, note: e.target.value })}
          placeholder="Additional notes or description..."
          className="min-h-[80px] bg-background border-border focus:border-primary resize-none w-full max-w-full"
          rows={3}
        />
        <div className="text-right w-full">
          <CaptionText className="text-muted-foreground">
            {(editedLine.note || '').length}/5000
          </CaptionText>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        onClick={handleDelete}
        variant="ghost"
        className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50 max-w-full"
      >
        Delete
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="mobile-drawer-safe max-h-[85dvh] h-[85dvh] w-full max-w-full">
          <DrawerHeader className="flex flex-row items-center justify-between p-4 border-b w-full mobile-safe">
            <DrawerTitle className="text-lg font-semibold">Item</DrawerTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} className="text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold" variant="ghost">
                Save
              </Button>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 pb-8 w-full mobile-safe flex-1">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Edit Item</DialogTitle>
          <Button onClick={handleSave} className="ml-auto">
            Save
          </Button>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export default ItemEditSheet;
