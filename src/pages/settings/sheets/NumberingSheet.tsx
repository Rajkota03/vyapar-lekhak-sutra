
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { toast } from "@/hooks/use-toast";

const NumberingSheet: React.FC = () => {
  const navigate = useNavigate();
  const companyId = "your-company-id"; // Replace with actual company ID from context
  const { settings, updateSettings } = useCompanySettings(companyId);
  
  const [numberingData, setNumberingData] = useState({
    invoice_title: "Invoice",
    invoice_prefix: "",
    next_invoice_seq: 1,
    quote_title: "Quotation",
    next_quote_seq: 1,
    credit_note_title: "Credit Note",
    next_credit_seq: 1
  });

  useEffect(() => {
    if (settings) {
      setNumberingData({
        invoice_title: settings.invoice_title || "Invoice",
        invoice_prefix: settings.invoice_prefix || "",
        next_invoice_seq: settings.next_invoice_seq || 1,
        quote_title: settings.quote_title || "Quotation",
        next_quote_seq: settings.next_quote_seq || 1,
        credit_note_title: settings.credit_note_title || "Credit Note",
        next_credit_seq: settings.next_credit_seq || 1
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string | number) => {
    setNumberingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(numberingData);
      
      toast({
        title: "Success",
        description: "Document numbering settings saved successfully",
      });
      navigate('/settings');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save numbering settings",
      });
    }
  };

  return (
    <SheetLayout title="Document Numbering">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Invoice Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoiceTitle">Invoice Title</Label>
              <Input
                id="invoiceTitle"
                value={numberingData.invoice_title}
                onChange={(e) => handleChange('invoice_title', e.target.value)}
                placeholder="Invoice"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoicePrefix">Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={numberingData.invoice_prefix}
                  onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                  placeholder="INV-"
                />
              </div>
              <div>
                <Label htmlFor="invoiceNext">Next Number</Label>
                <Input
                  id="invoiceNext"
                  type="number"
                  min="1"
                  value={numberingData.next_invoice_seq}
                  onChange={(e) => handleChange('next_invoice_seq', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Next invoice: <strong>{numberingData.invoice_prefix}{numberingData.next_invoice_seq}</strong>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Quotation Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quoteTitle">Quotation Title</Label>
              <Input
                id="quoteTitle"
                value={numberingData.quote_title}
                onChange={(e) => handleChange('quote_title', e.target.value)}
                placeholder="Quotation"
              />
            </div>
            <div>
              <Label htmlFor="quoteNext">Next Number</Label>
              <Input
                id="quoteNext"
                type="number"
                min="1"
                value={numberingData.next_quote_seq}
                onChange={(e) => handleChange('next_quote_seq', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Next quotation: <strong>{numberingData.invoice_prefix}{numberingData.next_quote_seq}</strong>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Credit Note Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="creditTitle">Credit Note Title</Label>
              <Input
                id="creditTitle"
                value={numberingData.credit_note_title}
                onChange={(e) => handleChange('credit_note_title', e.target.value)}
                placeholder="Credit Note"
              />
            </div>
            <div>
              <Label htmlFor="creditNext">Next Number</Label>
              <Input
                id="creditNext"
                type="number"
                min="1"
                value={numberingData.next_credit_seq}
                onChange={(e) => handleChange('next_credit_seq', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Next credit note: <strong>{numberingData.invoice_prefix}{numberingData.next_credit_seq}</strong>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Numbering Settings
        </Button>
      </div>
    </SheetLayout>
  );
};

export default NumberingSheet;
