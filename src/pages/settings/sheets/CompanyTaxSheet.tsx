
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { toast } from "@/hooks/use-toast";

const CompanyTaxSheet: React.FC = () => {
  const navigate = useNavigate();
  const companyId = "your-company-id"; // Replace with actual company ID from context
  const { settings, updateSettings } = useCompanySettings(companyId);
  
  const [taxData, setTaxData] = useState({
    default_cgst_pct: 9,
    default_sgst_pct: 9,
    default_igst_pct: 18,
    use_igst: false
  });

  useEffect(() => {
    if (settings) {
      setTaxData({
        default_cgst_pct: settings.default_cgst_pct || 9,
        default_sgst_pct: settings.default_sgst_pct || 9,
        default_igst_pct: settings.default_igst_pct || 18,
        use_igst: false // This would be determined by client state vs company state
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: number | boolean) => {
    setTaxData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        default_cgst_pct: taxData.default_cgst_pct,
        default_sgst_pct: taxData.default_sgst_pct,
        default_igst_pct: taxData.default_igst_pct,
      });
      
      toast({
        title: "Success",
        description: "Tax settings saved successfully",
      });
      navigate('/settings');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save tax settings",
      });
    }
  };

  return (
    <SheetLayout title="Tax Settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Default Tax Rates</h3>
          <p className="text-sm text-gray-500 mb-4">
            Set default tax percentages for new invoices
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input
              id="cgst"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxData.default_cgst_pct}
              onChange={(e) => handleChange('default_cgst_pct', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input
              id="sgst"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxData.default_sgst_pct}
              onChange={(e) => handleChange('default_sgst_pct', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="igst">IGST (%)</Label>
            <Input
              id="igst"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxData.default_igst_pct}
              onChange={(e) => handleChange('default_igst_pct', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Use IGST for interstate transactions</Label>
              <p className="text-sm text-gray-500">
                Automatically use IGST when client state differs from company state
              </p>
            </div>
            <Switch
              checked={taxData.use_igst}
              onCheckedChange={(checked) => handleChange('use_igst', checked)}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">GST Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• CGST + SGST = Total GST for intrastate transactions</li>
            <li>• IGST is used for interstate transactions</li>
            <li>• Standard GST rate is 18% (9% CGST + 9% SGST or 18% IGST)</li>
          </ul>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Tax Settings
        </Button>
      </div>
    </SheetLayout>
  );
};

export default CompanyTaxSheet;
