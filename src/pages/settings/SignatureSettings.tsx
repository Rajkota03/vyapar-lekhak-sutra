
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const SignatureSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useCompanySettings();
  const [signatureUrl, setSignatureUrl] = useState("");

  const handleToggleSignature = (checked: boolean) => {
    updateSettings({ show_signature: checked });
  };

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
            <ToggleRow
              label="Show Signature on Invoices"
              checked={settings?.show_signature || false}
              onToggle={handleToggleSignature}
            />

            {signatureUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={signatureUrl} 
                    alt="Signature" 
                    className="max-w-64 max-h-24 object-contain border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Replace Signature
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSignatureUrl("")}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your signature image
                </p>
                <Button>Choose File</Button>
              </div>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default SignatureSettings;
