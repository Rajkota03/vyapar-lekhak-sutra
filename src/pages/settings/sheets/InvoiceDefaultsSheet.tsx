
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { toast } from "@/hooks/use-toast";

const InvoiceDefaultsSheet: React.FC = () => {
  const navigate = useNavigate();
  const companyId = "your-company-id"; // Replace with actual company ID from context
  const { settings, updateSettings } = useCompanySettings(companyId);
  
  const [formData, setFormData] = useState({
    due_days: 0,
    overdue_reminder: false,
    default_note: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        due_days: settings.due_days || 0,
        overdue_reminder: settings.overdue_reminder || false,
        default_note: settings.default_note || ""
      });
    }
  }, [settings]);

  const dueDaysOptions = [
    { value: 0, label: "None (Payment on receipt)" },
    { value: 7, label: "7 days" },
    { value: 15, label: "15 days" },
    { value: 30, label: "30 days" },
    { value: 45, label: "45 days" },
    { value: 60, label: "60 days" },
    { value: 90, label: "90 days" }
  ];

  const handleToggleReminder = async (checked: boolean) => {
    setFormData(prev => ({ ...prev, overdue_reminder: checked }));
    await updateSettings({ overdue_reminder: checked });
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      
      toast({
        title: "Success",
        description: "Invoice defaults saved successfully",
      });
      navigate('/settings');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save invoice defaults",
      });
    }
  };

  return (
    <SheetLayout title="Invoice Defaults">
      <div className="space-y-6">
        <ToggleRow
          label="Overdue Reminder"
          checked={formData.overdue_reminder}
          onToggle={handleToggleReminder}
        />

        <div>
          <Label htmlFor="dueDays">Due in (days)</Label>
          <Select 
            value={formData.due_days.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, due_days: parseInt(value) }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select due days" />
            </SelectTrigger>
            <SelectContent>
              {dueDaysOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="defaultNote">Default Note</Label>
          <Textarea
            id="defaultNote"
            value={formData.default_note}
            onChange={(e) => setFormData(prev => ({ ...prev, default_note: e.target.value }))}
            placeholder="Enter default note that will appear on all new invoices..."
            rows={4}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            This note will be automatically added to new invoices
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Invoice Settings Summary</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Due days: {formData.due_days === 0 ? "Payment on receipt" : `${formData.due_days} days`}</li>
            <li>• Overdue reminders: {formData.overdue_reminder ? "Enabled" : "Disabled"}</li>
            <li>• Default note: {formData.default_note ? "Set" : "None"}</li>
          </ul>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Invoice Defaults
        </Button>
      </div>
    </SheetLayout>
  );
};

export default InvoiceDefaultsSheet;
