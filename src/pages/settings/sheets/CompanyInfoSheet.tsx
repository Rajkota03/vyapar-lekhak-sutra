import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCompany } from "@/context/CompanyContext";

const CompanyInfoSheet: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentCompany, refetchCompanies } = useCompany();
  const companyId = currentCompany?.id;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading company data for ID:', companyId);
        
        const { data: company, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        if (error) {
          console.error('Error loading company:', error);
          throw error;
        }
        
        console.log('Loaded company data:', company);
        
        if (company) {
          // Split existing address into two lines if it exists
          const addressLines = company.address ? company.address.split('\n') : ['', ''];
          
          setFormData({
            name: company.name || "",
            email: "", // Not stored in companies table
            phone: "", // Not stored in companies table
            gstin: company.gstin || "",
            addressLine1: addressLines[0] || "",
            addressLine2: addressLines[1] || "",
            city: "", // Not stored in companies table
            state: "", // Not stored in companies table
            zipCode: "", // Not stored in companies table
            country: "India"
          });
        }
      } catch (error) {
        console.error('Error loading company data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company information",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyId]);

  const handleChange = (field: string, value: string) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log('=== SAVING COMPANY INFO ===');
    console.log('Form data to save:', formData);
    console.log('Company ID:', companyId);
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Company name is required",
      });
      return;
    }

    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No company selected",
      });
      return;
    }

    setSaving(true);
    try {
      // Combine address lines into a single address field for storage
      const combinedAddress = [formData.addressLine1.trim(), formData.addressLine2.trim()]
        .filter(line => line.length > 0)
        .join('\n');

      // Update companies table with only the fields that exist in the schema
      const companyUpdateData = {
        name: formData.name.trim(),
        gstin: formData.gstin.trim() || null,
        address: combinedAddress || null,
      };
      
      console.log('Updating companies table with:', companyUpdateData);
      
      const { error: companyError } = await supabase
        .from('companies')
        .update(companyUpdateData)
        .eq('id', companyId);

      if (companyError) {
        console.error('Company update error:', companyError);
        throw companyError;
      }

      console.log('Company updated successfully');

      // Create or update company_settings to store additional fields
      const settingsUpdateData = {
        company_id: companyId,
        // We can store additional company info in company_settings if needed
        // For now, we'll focus on the main company fields
      };

      console.log('Updating company_settings with:', settingsUpdateData);

      const { error: settingsError } = await supabase
        .from('company_settings')
        .upsert(settingsUpdateData);

      if (settingsError) {
        console.error('Settings update error:', settingsError);
        // Don't throw here as this is not critical
        console.log('Settings update failed, but continuing...');
      }

      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-data'] });
      
      // Refetch companies to update the context
      await refetchCompanies();

      toast({
        title: "Success",
        description: "Company information saved successfully",
      });
      
      console.log('Save completed successfully');
      navigate('/settings');
    } catch (error) {
      console.error('Error saving company info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save company information",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!companyId) {
    return (
      <SheetLayout title="Company Information">
        <div className="text-center text-muted-foreground">
          Please create a company to manage company information
        </div>
      </SheetLayout>
    );
  }

  if (loading) {
    return (
      <SheetLayout title="Company Information">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SheetLayout>
    );
  }

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
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input
            id="addressLine1"
            value={formData.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="Street address, building number"
          />
        </div>

        <div>
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            value={formData.addressLine2}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            placeholder="Area, landmark (optional)"
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

        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Company Information"}
        </Button>
      </div>
    </SheetLayout>
  );
};

export default CompanyInfoSheet;
