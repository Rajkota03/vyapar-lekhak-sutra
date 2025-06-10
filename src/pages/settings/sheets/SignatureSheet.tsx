
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const SignatureSheet: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useAuth();
  const companyId = selectedCompany?.id;
  const { settings, updateSettings } = useCompanySettings(companyId);
  
  const [signatureUrl, setSignatureUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings?.signature_url) {
      setSignatureUrl(settings.signature_url);
    }
  }, [settings]);

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

    setUploading(true);
    try {
      console.log('Uploading signature for company:', companyId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${companyId}/signature.${fileExt}`;
      
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

      console.log('Signature uploaded successfully. URL:', data.publicUrl);
      setSignatureUrl(data.publicUrl);
      
      await updateSettings({ signature_url: data.publicUrl });
      
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
      setSignatureUrl("");
      await updateSettings({ signature_url: null });
      
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

  if (!companyId) {
    return (
      <SheetLayout title="Signature">
        <div className="text-center text-muted-foreground">
          Please select a company first
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
              PNG, JPG or SVG files are supported
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
