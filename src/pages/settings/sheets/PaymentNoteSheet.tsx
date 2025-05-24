
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentNoteSheet: React.FC = () => {
  const navigate = useNavigate();
  const companyId = "your-company-id"; // Replace with actual company ID from context
  const { settings, updateSettings } = useCompanySettings(companyId);
  
  const [paymentNote, setPaymentNote] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setPaymentNote(settings.payment_note || "");
      setQrCodeUrl(settings.payment_qr_url || "");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        payment_note: paymentNote,
        payment_qr_url: qrCodeUrl,
      });
      toast({
        title: "Success",
        description: "Payment instructions saved successfully",
      });
      navigate('/settings');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save payment instructions",
      });
    }
  };

  const handleQrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company_${companyId}/payment_qr.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      setQrCodeUrl(data.publicUrl);
      
      toast({
        title: "Success",
        description: "QR code uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading QR code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload QR code",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQr = async () => {
    try {
      setQrCodeUrl("");
      toast({
        title: "Success",
        description: "QR code removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove QR code",
      });
    }
  };

  return (
    <SheetLayout title="Payment Instructions">
      <div className="space-y-6">
        <div>
          <Label htmlFor="paymentNote">Payment Instructions</Label>
          <Textarea
            id="paymentNote"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Enter payment instructions that will appear on invoices..."
            rows={6}
            maxLength={500}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            {paymentNote.length}/500 characters
          </p>
        </div>

        <div>
          <Label>Payment QR Code</Label>
          <div className="mt-2 space-y-3">
            {qrCodeUrl ? (
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-12 h-12 object-cover rounded" />
                  <span className="text-sm">QR Code uploaded</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteQr}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload QR code for payments</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  disabled={uploading}
                  className="hidden"
                  id="qr-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('qr-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Payment Instructions
        </Button>
      </div>
    </SheetLayout>
  );
};

export default PaymentNoteSheet;
