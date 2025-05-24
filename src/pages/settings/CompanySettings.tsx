
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { SettingsRow } from "@/components/ui/SettingsRow";

const CompanySettings: React.FC = () => {
  const navigate = useNavigate();

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
            <SheetTitle>Company</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-1">
            <SettingsRow 
              label="Logo" 
              onClick={() => navigate('/settings/company/logo')}
            />
            <SettingsRow 
              label="Company Information" 
              onClick={() => navigate('/settings/company/info')}
            />
            <SettingsRow 
              label="Signature" 
              onClick={() => navigate('/settings/company/signature')}
            />
            <SettingsRow 
              label="Payment Instruction" 
              onClick={() => navigate('/settings/company/payment')}
            />
            <SettingsRow 
              label="Customer Payment Option" 
              onClick={() => {}}
              right={<span className="text-xs text-gray-400">Coming Soon</span>}
            />
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default CompanySettings;
