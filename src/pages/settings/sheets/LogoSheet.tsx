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
  const { settings, updateSettings, isLoading, companyId } = useCompanySettings();
  
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
    if (!file || !companyId) return;

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

  // Calculate preview dimensions - using a base of 120px for better preview
  const previewBaseSize = 120;
  const previewWidth = previewBaseSize * logoScale;
  const previewHeight = previewBaseSize * logoScale;

  console.log('=== LOGO SHEET DEBUG ===');
  console.log('Current logoUrl state:', logoUrl);
  console.log('Current logoScale state:', logoScale);
  console.log('Settings from hook:', settings);
  console.log('Company ID:', companyId);

  if (!companyId) {
    return (
      <SheetLayout title="Logo">
        <div className="text-center text-muted-foreground">
          Please create a company to manage your logo
        </div>
      </SheetLayout>
    );
  }

  if (isLoading) {
    return (
      <SheetLayout title="Logo">
        <div className="text-center text-muted-foreground">
          Loading logo settings...
        </div>
      </SheetLayout>
    );
  }

  return (
    <SheetLayout title="Logo">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Company Logo</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload your company logo to appear on invoices and documents
          </p>
        </div>

        {logoUrl ? (
          <div className="space-y-6">
            {/* Logo Preview Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Preview</h4>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[200px]">
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="object-contain border border-gray-200 shadow-sm"
                  style={{ 
                    height: `${previewHeight}px`,
                    width: `${previewWidth}px`,
                    maxHeight: '160px',
                    maxWidth: '100%'
                  }}
                  onLoad={() => console.log('Logo preview loaded successfully')}
                  onError={(e) => {
                    console.error('Logo preview failed to load:', e);
                    console.error('Failed URL:', logoUrl);
                  }}
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                This is how your logo will appear on invoices
              </p>
            </div>

            {/* Logo Size Control */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Logo Size
              </label>
              <div className="px-2">
                <Slider
                  value={[logoScale]}
                  onValueChange={handleScaleChange}
                  max={2.0}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tiny (0.1x)</span>
                <span className="font-medium">Current: {logoScale.toFixed(1)}x</span>
                <span>Large (2.0x)</span>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Dimensions: {Math.round(80 * logoScale)}px × {Math.round(80 * logoScale)}px (in PDF)
              </div>
            </div>

            {/* Action Buttons */}
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

            {/* Technical Details */}
            <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
              <p><strong>Technical Details:</strong></p>
              <p>Original URL: {logoUrl.substring(0, 50)}...</p>
              <p>Scale Factor: {logoScale}x</p>
              <p>PDF Dimensions: {Math.round(80 * logoScale)}px × {Math.round(80 * logoScale)}px</p>
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
