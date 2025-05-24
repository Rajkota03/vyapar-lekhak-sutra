
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { SettingsRow } from "@/components/ui/SettingsRow";

const CustomizationSettings: React.FC = () => {
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
            <SheetTitle>Customization</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-1">
            <SettingsRow 
              label="Rename title & number" 
              onClick={() => navigate('/settings/customization/numbering')}
            />
            <SettingsRow 
              label="Rename other fields" 
              onClick={() => navigate('/settings/customization/fields')}
            />
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default CustomizationSettings;
