
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const NumberingSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useCompanySettings();
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoice_prefix || "INV");
  const [startingNumber, setStartingNumber] = useState(1);
  const [quantityLabel, setQuantityLabel] = useState(settings?.quantity_column_label || "QTY");

  const handleSave = () => {
    updateSettings({ 
      invoice_prefix: invoicePrefix,
      quantity_column_label: quantityLabel
    });
    navigate('/settings');
  };

  return (
    <Sheet open onOpenChange={() => navigate('/settings')}>
      <SheetContent className="w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <SheetTitle>Document Numbering</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="INV"
                />
              </div>

              <div>
                <Label htmlFor="startingNumber">Starting Number</Label>
                <Input
                  id="startingNumber"
                  type="number"
                  value={startingNumber}
                  onChange={(e) => setStartingNumber(Number(e.target.value))}
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="quantityLabel">Quantity Column Label</Label>
                <Input
                  id="quantityLabel"
                  value={quantityLabel}
                  onChange={(e) => setQuantityLabel(e.target.value)}
                  placeholder="QTY"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Preview: {invoicePrefix}-{String(startingNumber).padStart(3, '0')}</p>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default NumberingSettings;
