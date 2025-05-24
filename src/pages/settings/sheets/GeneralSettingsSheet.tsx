
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { useUserSettings } from "@/hooks/useUserSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const GeneralSettingsSheet: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { settings, updateSettings } = useUserSettings(userId || undefined);

  const [formData, setFormData] = useState({
    currency_code: "INR",
    date_format: "dd MMM yyyy",
    language_code: "en",
    passcode_enabled: false
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        currency_code: settings.currency_code || "INR",
        date_format: settings.date_format || "dd MMM yyyy",
        language_code: settings.language_code || "en",
        passcode_enabled: settings.passcode_enabled || false
      });
    }
  }, [settings]);

  const currencies = [
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "AUD", label: "Australian Dollar (A$)" },
    { value: "CAD", label: "Canadian Dollar (C$)" }
  ];

  const dateFormats = [
    { value: "dd MMM yyyy", label: "31 Dec 2024" },
    { value: "dd/MM/yyyy", label: "31/12/2024" },
    { value: "MM/dd/yyyy", label: "12/31/2024" },
    { value: "yyyy-MM-dd", label: "2024-12-31" }
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" }
  ];

  const handleTogglePasscode = async (checked: boolean) => {
    setFormData(prev => ({ ...prev, passcode_enabled: checked }));
    await updateSettings({ passcode_enabled: checked });
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      
      toast({
        title: "Success",
        description: "General settings saved successfully",
      });
      navigate('/settings');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save general settings",
      });
    }
  };

  return (
    <SheetLayout title="General Settings">
      <div className="space-y-6">
        <ToggleRow
          label="Passcode"
          checked={formData.passcode_enabled}
          onToggle={handleTogglePasscode}
        />

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formData.currency_code} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, currency_code: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dateFormat">Date Format</Label>
          <Select 
            value={formData.date_format} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, date_format: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <Select 
            value={formData.language_code} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, language_code: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4 space-y-1">
          <SettingsRow 
            label="Terms & Conditions" 
            onClick={() => {}}
          />
          <SettingsRow 
            label="Privacy Policy" 
            onClick={() => {}}
          />
          <SettingsRow 
            label="Version" 
            right={<span className="text-sm text-gray-500">1.0.0</span>}
            onClick={() => {}}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save General Settings
        </Button>
      </div>
    </SheetLayout>
  );
};

export default GeneralSettingsSheet;
