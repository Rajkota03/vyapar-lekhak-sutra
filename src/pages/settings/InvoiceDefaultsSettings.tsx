
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const InvoiceDefaultsSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useCompanySettings();
  const [dueDays, setDueDays] = useState(settings?.due_days || 30);
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoice_prefix || "INV");
  const [showMySignature, setShowMySignature] = useState(settings?.show_my_signature || false);
  const [requireClientSignature, setRequireClientSignature] = useState(settings?.require_client_signature || false);

  const handleSave = () => {
    updateSettings({ 
      due_days: dueDays,
      invoice_prefix: invoicePrefix,
      show_my_signature: showMySignature,
      require_client_signature: requireClientSignature
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
            <SheetTitle>Invoice Defaults</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dueDays">Due in (days)</Label>
                <Input
                  id="dueDays"
                  type="number"
                  value={dueDays}
                  onChange={(e) => setDueDays(Number(e.target.value))}
                  placeholder="30"
                />
              </div>

              <div>
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="INV"
                />
              </div>
            </div>

            <div className="space-y-2">
              <ToggleRow
                label="Show My Signature by Default"
                checked={showMySignature}
                onToggle={setShowMySignature}
              />
              
              <ToggleRow
                label="Require Client Signature by Default"
                checked={requireClientSignature}
                onToggle={setRequireClientSignature}
              />
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

export default InvoiceDefaultsSettings;
