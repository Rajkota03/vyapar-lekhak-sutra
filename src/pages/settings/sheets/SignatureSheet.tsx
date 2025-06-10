
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

const SignatureSheet: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, isLoading, companyId } = useCompanySettings();
  
  const [signatureUrl, setSignatureUrl] = useState("");
  const [signatureScale, setSignatureScale] = useState(1.0);
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

    if (settings?.signature_scale !== undefined && settings?.signature_scale !== null) {
      console.log('Setting signature scale from settings:', settings.signature_scale);
      setSignatureScale(Number(settings.signature_scale));
    } else {
      console.log('No signature scale in settings, using default 1.0');
      setSignatureScale(1.0);
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
      
      // Update company settings to remove signature URL and scale
      await updateSettings({ 
        signature_url: null,
        signature_scale: null 
      });
      
      console.log('=== SIGNATURE DELETE SUCCESS ===');
      
      // Update local state immediately
      setSignatureUrl("");
      setSignatureScale(1.0);
      
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

  const handleScaleChange = async (value: number[]) => {
    const newScale = value[0];
    setSignatureScale(newScale);
    
    try {
      await updateSettings({ signature_scale: newScale });
      console.log('Signature scale updated to:', newScale);
    } catch (error) {
      console.error('Error updating signature scale:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update signature scale",
      });
    }
  };

  // Calculate preview dimensions - using a base of 150px width for signature preview
  const previewBaseWidth = 150;
  const previewBaseHeight = 60;
  const previewWidth = previewBaseWidth * signatureScale;
  const previewHeight = previewBaseHeight * signatureScale;

  console.log('=== SIGNATURE SHEET DEBUG ===');
  console.log('Current signatureUrl state:', signatureUrl);
  console.log('Current signatureScale state:', signatureScale);
  console.log('Settings from hook:', settings);
  console.log('Company ID:', companyId);

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
          <div className="space-y-6">
            {/* Signature Preview Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Preview</h4>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[150px]">
                <img 
                  src={signatureUrl} 
                  alt="Digital Signature" 
                  className="object-contain border border-gray-200 shadow-sm"
                  style={{ 
                    height: `${previewHeight}px`,
                    width: `${previewWidth}px`,
                    maxHeight: '120px',
                    maxWidth: '100%'
                  }}
                  onLoad={() => console.log('Signature preview loaded successfully')}
                  onError={(e) => {
                    console.error('Signature preview failed to load:', e);
                    console.error('Failed URL:', signatureUrl);
                    setSignatureUrl("");
                  }}
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                This is how your signature will appear on invoices
              </p>
            </div>

            {/* Signature Size Control */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Signature Size
              </label>
              <div className="px-2">
                <Slider
                  value={[signatureScale]}
                  onValueChange={handleScaleChange}
                  max={3.0}
                  min={0.3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Small (0.3x)</span>
                <span className="font-medium">Current: {signatureScale.toFixed(1)}x</span>
                <span>Large (3.0x)</span>
              </div>
              <div className="text-xs text-gray-400 text-center">
                PDF Dimensions: {Math.round(150 * signatureScale)}px × {Math.round(60 * signatureScale)}px
              </div>
            </div>

            {/* Action Buttons */}
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

            {/* Technical Details */}
            <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
              <p><strong>Technical Details:</strong></p>
              <p>Original URL: {signatureUrl.substring(0, 50)}...</p>
              <p>Scale Factor: {signatureScale}x</p>
              <p>PDF Dimensions: {Math.round(150 * signatureScale)}px × {Math.round(60 * signatureScale)}px</p>
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
