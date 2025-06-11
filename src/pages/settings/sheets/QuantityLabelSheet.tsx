
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { Label } from "@/components/ui/label";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const QuantityLabelSheet: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, isUpdating, quantityLabel } = useCompanySettings();
  const [customLabel, setCustomLabel] = useState(quantityLabel);

  useEffect(() => {
    setCustomLabel(quantityLabel);
  }, [quantityLabel]);

  const predefinedLabels = [
    { label: "QTY", value: "QTY" },
    { label: "PKG", value: "PKG" },
    { label: "Days", value: "Days" },
    { label: "Hours", value: "Hours" },
    { label: "Units", value: "Units" },
    { label: "Items", value: "Items" },
  ];

  const handleSave = () => {
    if (customLabel.trim() && customLabel !== quantityLabel) {
      // Note: Will need to add quantity_column_label to database schema later
      updateSettings({ quantity_column_label: customLabel.trim() });
    }
    navigate('/settings/customization');
  };

  const handlePredefinedSelect = (value: string) => {
    setCustomLabel(value);
  };

  return (
    <Sheet open onOpenChange={() => navigate('/settings/customization')}>
      <SheetContent className="w-full">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/settings/customization')}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <SheetTitle>Quantity Label</SheetTitle>
            </div>
            <Button 
              onClick={handleSave}
              disabled={isUpdating || !customLabel.trim() || customLabel === quantityLabel}
              size="sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quantityLabel">Custom Label</Label>
              <Input
                id="quantityLabel"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Enter quantity label"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                This label will appear in the quantity column of your invoices
              </p>
            </div>

            <div className="space-y-3">
              <Label>Quick Options</Label>
              <div className="grid grid-cols-2 gap-2">
                {predefinedLabels.map((option) => (
                  <Button
                    key={option.value}
                    variant={customLabel === option.value ? "default" : "outline"}
                    onClick={() => handlePredefinedSelect(option.value)}
                    className="justify-start h-10"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="text-sm text-muted-foreground">
                Column header will show: <span className="font-medium text-foreground">{customLabel || 'QTY'}</span>
              </div>
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default QuantityLabelSheet;
