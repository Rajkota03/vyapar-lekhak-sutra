import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SignatureSheet: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, isLoading, companyId } = useCompanySettings();
  
  const [signatureUrl, setSignatureUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log('=== SIGNATURE SHEET EFFECT ===');
    console.log('Company ID:', companyId);
    console.log('Settings loading:', isLoading);
    console.log('Settings data:', settings);
    console.log('Settings signature_url:', settings?.signature_url);
    
    if (settings?.signature_url) {
      console.log('Setting signature URL from settings:', settings.signature_url);
      setSignatureUrl(settings.signature_url);
    } else {
      console.log('No signature URL in settings, clearing local state');
      setSignatureUrl("");
    }
  }, [settings, companyId, isLoading]);

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !companyId) {
      if (!companyId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No company selected",
        });
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 5MB",
      });
      return;
    }

    setUploading(true);
    try {
      console.log('=== SIGNATURE UPLOAD START ===');
      console.log('Uploading signature for company:', companyId);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${companyId}/signature.${fileExt}`;
      
      console.log('Upload path:', fileName);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      console.log('=== SIGNATURE UPLOAD SUCCESS ===');
      console.log('Public URL:', data.publicUrl);
      
      const newSignatureUrl = data.publicUrl;
      
      // Update company settings with the new signature URL
      await updateSettings({ signature_url: newSignatureUrl });
      
      console.log('Company settings updated with signature URL');
      
      // Update local state immediately
      setSignatureUrl(newSignatureUrl);
      
      toast({
        title: "Success",
        description: "Signature uploaded successfully",
      });
    } catch (error) {
      console.error('=== SIGNATURE UPLOAD ERROR ===');
      console.error('Error uploading signature:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload signature. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSignature = async () => {
    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No company selected",
      });
      return;
    }

    try {
      console.log('=== SIGNATURE DELETE START ===');
      console.log('Deleting signature for company:', companyId);
      
      // Extract filename from URL to delete from storage
      if (signatureUrl) {
        const urlParts = signatureUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const fullPath = `company_${companyId}/${fileName}`;
        
        console.log('Deleting file from storage:', fullPath);
        
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('company-assets')
          .remove([fullPath]);

        if (deleteError) {
          console.error('Storage delete error:', deleteError);
          // Continue anyway to remove from settings
        }
      }
      
      // Update company settings to remove signature URL
      await updateSettings({ signature_url: null });
      
      console.log('=== SIGNATURE DELETE SUCCESS ===');
      
      // Update local state immediately
      setSignatureUrl("");
      
      toast({
        title: "Success",
        description: "Signature removed successfully",
      });
    } catch (error) {
      console.error('=== SIGNATURE DELETE ERROR ===');
      console.error('Error removing signature:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove signature",
      });
    }
  };

  if (!companyId) {
    return (
      <SheetLayout title="Signature">
        <div className="text-center text-muted-foreground">
          Please create a company to manage your signature
        </div>
      </SheetLayout>
    );
  }

  if (isLoading) {
    return (
      <SheetLayout title="Signature">
        <div className="text-center text-muted-foreground">
          Loading signature settings...
        </div>
      </SheetLayout>
    );
  }

  return (
    <SheetLayout title="Signature">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Digital Signature</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload your signature to appear on invoices and documents
          </p>
        </div>

        {signatureUrl ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-gray-50">
              <img 
                src={signatureUrl} 
                alt="Digital Signature" 
                className="max-w-full max-h-24 mx-auto object-contain"
                onError={() => {
                  console.error('Failed to load signature image:', signatureUrl);
                  setSignatureUrl("");
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById('signature-upload')?.click()}
                disabled={uploading}
                className="flex-1"
              >
                Replace Signature
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteSignature}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium mb-2">Upload your signature</h4>
            <p className="text-sm text-gray-500 mb-4">
              PNG, JPG or SVG files are supported (max 5MB)
            </p>
            <Button
              onClick={() => document.getElementById('signature-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        )}

        <Input
          type="file"
          accept="image/*"
          onChange={handleSignatureUpload}
          disabled={uploading}
          className="hidden"
          id="signature-upload"
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

export default SignatureSheet;
