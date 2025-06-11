
import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
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
import { SheetBody } from "@/components/ui/SheetBody";
import { LineItem } from "./types/InvoiceTypes";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading3, BodyText, CaptionText } from "@/components/ui/primitives/Typography";

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
      <SheetContent className="rounded-t-2xl p-0 border-0 shadow-2xl" style={{ maxHeight: '85dvh' }}>
        <SheetHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-border/10">
          <SheetTitle className="text-xl font-semibold">Edit Item</SheetTitle>
          <PremiumButton 
            onClick={handleSave} 
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium shadow-lg"
          >
            Save
          </PremiumButton>
        </SheetHeader>
        
        <SheetBody className="px-6 pb-8">
          <div className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <label className="block">
                <CaptionText className="font-medium text-foreground/80 uppercase tracking-wide">
                  Name*
                </CaptionText>
              </label>
              <Input
                value={editedLine.description}
                onChange={(e) => setEditedLine({ ...editedLine, description: e.target.value })}
                className="h-12 text-base border-border/20 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                placeholder="Item name"
              />
            </div>

            {/* Product Code */}
            <div className="space-y-2">
              <label className="block">
                <CaptionText className="font-medium text-foreground/80 uppercase tracking-wide">
                  Product Code
                </CaptionText>
              </label>
              <Input
                value={editedLine.item?.code || ''}
                className="h-12 text-base border-border/20 rounded-xl bg-muted/30"
                placeholder="Optional code"
                disabled
              />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block">
                  <CaptionText className="font-medium text-foreground/80 uppercase tracking-wide">
                    Price
                  </CaptionText>
                </label>
                <Input
                  type="number"
                  value={editedLine.unit_price}
                  onChange={(e) => setEditedLine({ ...editedLine, unit_price: Number(e.target.value) })}
                  className="h-12 text-base border-border/20 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="block">
                  <CaptionText className="font-medium text-foreground/80 uppercase tracking-wide">
                    Quantity
                  </CaptionText>
                </label>
                <Input
                  type="number"
                  value={editedLine.qty}
                  onChange={(e) => setEditedLine({ ...editedLine, qty: Number(e.target.value) })}
                  className="h-12 text-base border-border/20 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                  min="1"
                />
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <label className="block">
                <CaptionText className="font-medium text-foreground/80 uppercase tracking-wide">
                  Discount (₹)
                </CaptionText>
              </label>
              <Input
                type="number"
                value={editedLine.discount_amount || 0}
                onChange={(e) => setEditedLine({ ...editedLine, discount_amount: Number(e.target.value) })}
                className="h-12 text-base border-border/20 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                min="0"
                step="0.01"
              />
            </div>

            {/* Tax Settings */}
            <ModernCard variant="outlined" padding="md" className="space-y-4">
              <Heading3 className="text-base">Tax Settings</Heading3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <BodyText className="font-medium">CGST</BodyText>
                  <Switch
                    checked={!!editedLine.cgst}
                    onCheckedChange={(checked) => setEditedLine({ 
                      ...editedLine, 
                      cgst: checked ? (editedLine.cgst || 9) : 0 
                    })}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <BodyText className="font-medium">SGST</BodyText>
                  <Switch
                    checked={!!editedLine.sgst}
                    onCheckedChange={(checked) => setEditedLine({ 
                      ...editedLine, 
                      sgst: checked ? (editedLine.sgst || 9) : 0 
                    })}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Amount Summary */}
            <ModernCard variant="elevated" padding="md" className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <div className="flex justify-between items-center">
                <Heading3 className="text-lg">Total Amount</Heading3>
                <Heading3 className="text-xl font-bold text-primary">₹{calculatedAmount.toFixed(2)}</Heading3>
              </div>
            </ModernCard>

            {/* Description */}
            <div className="space-y-2">
              <label className="block">
                <CaptionText className="font-medium text-foreground/80 uppercase tracking-wide">
                  Additional Notes
                </CaptionText>
              </label>
              <Textarea
                value={editedLine.note || ''}
                onChange={(e) => setEditedLine({ ...editedLine, note: e.target.value })}
                placeholder="Additional notes or description..."
                className="text-base border-border/20 rounded-xl focus:border-primary/50 focus:ring-primary/20 resize-none"
                rows={4}
              />
            </div>

            {/* Delete Button */}
            <PremiumButton
              onClick={handleDelete}
              variant="ghost"
              className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Item
            </PremiumButton>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default ItemEditSheet;
