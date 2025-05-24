
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings?.logo_url) {
      setLogoUrl(settings.logo_url);
    }
  }, [settings]);

  // Create bucket if it doesn't exist
  const ensureBucketExists = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'company-assets');
      
      if (!bucketExists) {
        console.log('Creating company-assets bucket...');
        const { error } = await supabase.storage.createBucket('company-assets', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 10, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
          throw error;
        }
        console.log('Bucket created successfully');
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Ensure bucket exists
      await ensureBucketExists();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${companyId}/logo.${fileExt}`;
      
      console.log('Uploading logo to:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      console.log('Logo uploaded, public URL:', data.publicUrl);
      
      setLogoUrl(data.publicUrl);
      
      await updateSettings({ logo_url: data.publicUrl });
      
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
      setLogoUrl("");
      await updateSettings({ logo_url: null });
      
      toast({
        title: "Success",
        description: "Logo removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove logo",
      });
    }
  };

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
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-gray-50">
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="max-w-full max-h-32 mx-auto object-contain"
                onLoad={() => console.log('Logo preview loaded')}
                onError={(e) => console.error('Logo preview failed:', e)}
                crossOrigin="anonymous"
              />
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
