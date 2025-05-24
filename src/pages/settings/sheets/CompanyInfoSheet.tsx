
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CompanyInfoSheet: React.FC = () => {
  const navigate = useNavigate();
  const companyId = "your-company-id"; // Replace with actual company ID from context
  const { settings } = useCompanySettings(companyId);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });

  useEffect(() => {
    // Load company data when available
    const loadCompanyData = async () => {
      try {
        const { data: company, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        if (error) throw error;
        
        if (company) {
          setFormData({
            name: company.name || "",
            email: "",
            phone: "",
            gstin: company.gstin || "",
            address: company.address || "",
            city: "",
            state: "",
            zipCode: "",
            country: "India"
          });
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    };

    loadCompanyData();
  }, [companyId]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Update companies table
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          gstin: formData.gstin,
          address: formData.address,
        })
        .eq('id', companyId);

      if (companyError) throw companyError;

      toast({
        title: "Success",
        description: "Company information saved successfully",
      });
      navigate('/settings');
    } catch (error) {
      console.error('Error saving company info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save company information",
      });
    }
  };

  return (
    <SheetLayout title="Company Information">
      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="company@example.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <Label htmlFor="gstin">GSTIN</Label>
          <Input
            id="gstin"
            value={formData.gstin}
            onChange={(e) => handleChange('gstin', e.target.value)}
            placeholder="22AAAAA0000A1Z5"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter complete address"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="State"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="400001"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Company Information
        </Button>
      </div>
    </SheetLayout>
  );
};

export default CompanyInfoSheet;
