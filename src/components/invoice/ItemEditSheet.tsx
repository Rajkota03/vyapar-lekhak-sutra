
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives/Input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LineItem } from "./types/InvoiceTypes";

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

  useEffect(() => {
    if (line) {
      setEditedLine({
        ...line,
        discount_amount: line.discount_amount || 0,
        note: line.note || '',
      });
    }
  }, [line]);

  if (!editedLine) return null;

  const handleSave = () => {
    if (!editedLine.description.trim() || editedLine.unit_price <= 0) {
      return; // Basic validation
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-t-lg">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Item</SheetTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="h-8 px-3 text-xs">
              Save
            </Button>
          </div>
        </SheetHeader>
        
        <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div>
            <label className="block text-xs font-medium mb-1">Name*</label>
            <Input
              value={editedLine.description}
              onChange={(e) => setEditedLine({ ...editedLine, description: e.target.value })}
              className="h-8 text-sm"
              placeholder="Item name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Product Code</label>
            <Input
              value={editedLine.item?.code || ''}
              className="h-8 text-sm"
              placeholder="Optional code"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Price</label>
              <Input
                type="number"
                value={editedLine.unit_price}
                onChange={(e) => setEditedLine({ ...editedLine, unit_price: Number(e.target.value) })}
                className="h-8 text-sm"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Quantity</label>
              <Input
                type="number"
                value={editedLine.qty}
                onChange={(e) => setEditedLine({ ...editedLine, qty: Number(e.target.value) })}
                className="h-8 text-sm"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Discount (₹)</label>
            <Input
              type="number"
              value={editedLine.discount_amount || 0}
              onChange={(e) => setEditedLine({ ...editedLine, discount_amount: Number(e.target.value) })}
              className="h-8 text-sm"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">CGST</span>
              <Switch
                checked={!!editedLine.cgst}
                onCheckedChange={(checked) => setEditedLine({ 
                  ...editedLine, 
                  cgst: checked ? (editedLine.cgst || 9) : 0 
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SGST</span>
              <Switch
                checked={!!editedLine.sgst}
                onCheckedChange={(checked) => setEditedLine({ 
                  ...editedLine, 
                  sgst: checked ? (editedLine.sgst || 9) : 0 
                })}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span>Amount</span>
              <span className="font-medium">₹{calculatedAmount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <Textarea
              value={editedLine.note || ''}
              onChange={(e) => setEditedLine({ ...editedLine, note: e.target.value })}
              placeholder="Additional notes..."
              className="text-sm"
              rows={3}
            />
          </div>

          <Button
            onClick={handleDelete}
            variant="ghost"
            className="w-full text-red-600 text-sm py-2"
          >
            Delete Item
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ItemEditSheet;
