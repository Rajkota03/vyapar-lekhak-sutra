
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Upload, Trash2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LogoSheet: React.FC = () => {
  const navigate = useNavigate();
  // TODO: Get actual company ID from user context/auth - for now using a placeholder
  const companyId = "0d32b9a9-54b4-4d99-bf37-5526ede25b2a"; // This should come from user's selected company
  const { settings, updateSettings } = useCompanySettings(companyId);
  
  const [logoUrl, setLogoUrl] = useState("");
  const [logoScale, setLogoScale] = useState(0.3);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings?.logo_url) {
      console.log('Setting logo URL from settings:', settings.logo_url);
      setLogoUrl(settings.logo_url);
    }
    if (settings?.logo_scale) {
      console.log('Setting logo scale from settings:', settings.logo_scale);
      setLogoScale(Number(settings.logo_scale));
    }
  }, [settings]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('=== LOGO UPLOAD DEBUG ===');
    console.log('File selected:', file.name, file.type, file.size);
    console.log('Company ID:', companyId);

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${companyId}/logo.${fileExt}`;
      
      console.log('Uploading to path:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;
      console.log('Generated public URL:', publicUrl);
      
      setLogoUrl(publicUrl);
      
      console.log('Updating company settings with logo URL:', publicUrl);
      await updateSettings({ logo_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload logo",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      console.log('Deleting logo, current URL:', logoUrl);
      setLogoUrl("");
      await updateSettings({ logo_url: null });
      
      toast({
        title: "Success",
        description: "Logo removed successfully",
      });
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove logo",
      });
    }
  };

  const handleScaleChange = async (value: number[]) => {
    const newScale = value[0];
    setLogoScale(newScale);
    
    try {
      await updateSettings({ logo_scale: newScale });
      console.log('Logo scale updated to:', newScale);
    } catch (error) {
      console.error('Error updating logo scale:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update logo scale",
      });
    }
  };

  console.log('=== LOGO SHEET DEBUG ===');
  console.log('Current logoUrl state:', logoUrl);
  console.log('Current logoScale state:', logoScale);
  console.log('Settings from hook:', settings);
  console.log('Company ID:', companyId);

  return (
    <SheetLayout title="Logo">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Company Logo</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload your company logo to appear on invoices and documents
          </p>
        </div>

        {/* Debug info */}
        <div className="bg-gray-100 p-3 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Company ID: {companyId}</p>
          <p>Settings loaded: {settings ? 'Yes' : 'No'}</p>
          <p>Logo URL from settings: {settings?.logo_url || 'None'}</p>
          <p>Logo scale from settings: {settings?.logo_scale || 'None'}</p>
          <p>Current logo state: {logoUrl || 'None'}</p>
          <p>Current scale state: {logoScale}</p>
        </div>

        {logoUrl ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-gray-50">
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="max-w-full mx-auto object-contain border border-gray-200"
                style={{ 
                  height: `${64 * logoScale}px`,
                  width: `${64 * logoScale}px`
                }}
                onLoad={() => console.log('Logo preview loaded successfully')}
                onError={(e) => {
                  console.error('Logo preview failed to load:', e);
                  console.error('Failed URL:', logoUrl);
                }}
                crossOrigin="anonymous"
              />
              <p className="text-xs text-gray-500 mt-2 text-center break-all">
                URL: {logoUrl}
              </p>
            </div>

            {/* Logo Scale Slider */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Logo Size
              </label>
              <div className="px-2">
                <Slider
                  value={[logoScale]}
                  onValueChange={handleScaleChange}
                  max={1.0}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Small (0.1x)</span>
                <span>Current: {logoScale.toFixed(1)}x</span>
                <span>Large (1.0x)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploading}
                className="flex-1"
              >
                Replace Logo
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteLogo}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium mb-2">Upload your logo</h4>
            <p className="text-sm text-gray-500 mb-4">
              PNG, JPG or SVG files are supported
            </p>
            <Button
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        )}

        <Input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={uploading}
          className="hidden"
          id="logo-upload"
        />

        <Button 
          onClick={() => navigate('/settings')} 
          variant="outline" 
          className="w-full"
        >
          Done
        </Button>
      </div>
    </SheetLayout>
  );
};

export default LogoSheet;
