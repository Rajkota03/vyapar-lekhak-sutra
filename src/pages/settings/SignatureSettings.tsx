
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SignatureSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, companyId } = useCompanySettings();
  const [signatureUrl, setSignatureUrl] = useState("");
  const [signatureScale, setSignatureScale] = useState(1.0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings?.signature_url) {
      console.log('Setting signature URL from settings:', settings.signature_url);
      setSignatureUrl(settings.signature_url);
    }
    if (settings?.signature_scale) {
      console.log('Setting signature scale from settings:', settings.signature_scale);
      setSignatureScale(Number(settings.signature_scale));
    }
  }, [settings]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !companyId) return;

    console.log('=== SIGNATURE UPLOAD DEBUG ===');
    console.log('File selected:', file.name, file.type, file.size);
    console.log('Company ID:', companyId);

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${companyId}/signature.${fileExt}`;
      
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
      
      setSignatureUrl(publicUrl);
      
      console.log('Updating company settings with signature URL:', publicUrl);
      updateSettings({ signature_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Signature uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload signature",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSignature = async () => {
    try {
      console.log('Removing signature, current URL:', signatureUrl);
      setSignatureUrl("");
      updateSettings({ signature_url: null });
      
      toast({
        title: "Success",
        description: "Signature removed successfully",
      });
    } catch (error) {
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
      updateSettings({ signature_scale: newScale });
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

  // Calculate preview dimensions - using a base of 120px for better preview
  const previewBaseSize = 120;
  const previewWidth = previewBaseSize * signatureScale;
  const previewHeight = (previewBaseSize * 0.4) * signatureScale; // Signatures are typically wider than tall

  console.log('=== SIGNATURE SETTINGS DEBUG ===');
  console.log('Current signatureUrl state:', signatureUrl);
  console.log('Current signatureScale state:', signatureScale);
  console.log('Settings from hook:', settings);
  console.log('Company ID:', companyId);

  return (
    <Sheet open onOpenChange={() => navigate('/settings')}>
      <SheetContent className="w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <SheetTitle>Signature</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
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
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-[200px]">
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
                    Dimensions: {Math.round(120 * signatureScale)}px × {Math.round(50 * signatureScale)}px (in PDF)
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace Signature
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemoveSignature}
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
                  <p>PDF Dimensions: {Math.round(120 * signatureScale)}px × {Math.round(50 * signatureScale)}px</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium mb-2">Upload your signature</h4>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG or SVG files are supported
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default SignatureSettings;
