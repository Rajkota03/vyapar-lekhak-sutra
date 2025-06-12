
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const NumberingSheet: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, isLoading, companyId } = useCompanySettings();
  
  const [numberingData, setNumberingData] = useState({
    invoice_title: "Invoice",
    invoice_prefix: "",
    next_invoice_seq: 1,
    quote_title: "Quotation",
    next_quote_seq: 1,
    proforma_title: "Pro Forma Invoice",
    next_proforma_seq: 1,
    credit_note_title: "Credit Note",
    next_credit_seq: 1,
    hsn_code: "998387"
  });

  useEffect(() => {
    if (settings) {
      setNumberingData({
        invoice_title: settings.invoice_title || "Invoice",
        invoice_prefix: settings.invoice_prefix || "",
        next_invoice_seq: settings.next_invoice_seq || 1,
        quote_title: settings.quote_title || "Quotation",
        next_quote_seq: settings.next_quote_seq || 1,
        proforma_title: settings.proforma_title || "Pro Forma Invoice",
        next_proforma_seq: settings.next_proforma_seq || 1,
        credit_note_title: settings.credit_note_title || "Credit Note",
        next_credit_seq: settings.next_credit_seq || 1,
        hsn_code: settings.hsn_code || "998387"
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string | number) => {
    setNumberingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(numberingData);
      navigate('/settings');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (!companyId) {
    return (
      <SheetLayout title="Document Numbering">
        <div className="text-center text-muted-foreground">
          Please create a company to manage document numbering
        </div>
      </SheetLayout>
    );
  }

  if (isLoading) {
    return (
      <SheetLayout title="Document Numbering">
        <div className="text-center text-muted-foreground">
          Loading numbering settings...
        </div>
      </SheetLayout>
    );
  }

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
          <h3 className="text-lg font-medium mb-2">Pro Forma Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="proformaTitle">Pro Forma Title</Label>
              <Input
                id="proformaTitle"
                value={numberingData.proforma_title}
                onChange={(e) => handleChange('proforma_title', e.target.value)}
                placeholder="Pro Forma Invoice"
              />
            </div>
            <div>
              <Label htmlFor="proformaNext">Next Number</Label>
              <Input
                id="proformaNext"
                type="number"
                min="1"
                value={numberingData.next_proforma_seq}
                onChange={(e) => handleChange('next_proforma_seq', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Next pro forma: <strong>{numberingData.invoice_prefix}{numberingData.next_proforma_seq}</strong>
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

        <div>
          <h3 className="text-lg font-medium mb-2">HSN Code</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hsnCode">Default HSN Code</Label>
              <Input
                id="hsnCode"
                value={numberingData.hsn_code}
                onChange={(e) => handleChange('hsn_code', e.target.value)}
                placeholder="998387"
              />
              <div className="text-sm text-gray-500 mt-1">
                This HSN code will be used in invoices for tax classification
              </div>
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
