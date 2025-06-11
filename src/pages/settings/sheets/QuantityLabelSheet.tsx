
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SheetLayout from "@/components/ui/SheetLayout";

const QuantityLabelSheet = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { quantityLabel, updateSettings, isUpdating } = useCompanySettings(currentCompany?.id);
  const [customLabel, setCustomLabel] = useState(quantityLabel);

  useEffect(() => {
    setCustomLabel(quantityLabel);
  }, [quantityLabel]);

  const handleBack = () => {
    navigate('/settings/customization');
  };

  const handleSave = () => {
    if (customLabel.trim() && customLabel !== quantityLabel) {
      updateSettings({ quantity_column_label: customLabel.trim() });
    }
    navigate('/settings/customization');
  };

  const presetLabels = [
    { label: "QTY", description: "Quantity" },
    { label: "PKG", description: "Package" },
    { label: "PCS", description: "Pieces" },
    { label: "BOX", description: "Boxes" },
    { label: "DAYS", description: "Days" },
    { label: "HRS", description: "Hours" },
    { label: "UNITS", description: "Units" },
  ];

  return (
    <SheetLayout>
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Quantity Label</h1>
          <p className="text-sm text-muted-foreground">Customize the quantity column label</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || !customLabel.trim() || customLabel === quantityLabel}
          size="sm"
        >
          {isUpdating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="custom-label">Custom Label</Label>
          <Input
            id="custom-label"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value.toUpperCase())}
            placeholder="Enter custom label..."
            maxLength={10}
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground">
            This will appear as the column header in your invoices (max 10 characters)
          </p>
        </div>

        <div className="space-y-3">
          <Label>Quick Select</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetLabels.map((preset) => (
              <Button
                key={preset.label}
                variant={customLabel === preset.label ? "default" : "outline"}
                size="sm"
                onClick={() => setCustomLabel(preset.label)}
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs opacity-70">{preset.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </SheetLayout>
  );
};

export default QuantityLabelSheet;
