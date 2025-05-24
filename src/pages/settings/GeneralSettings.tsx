
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useUserSettings } from "@/hooks/useUserSettings";
import { supabase } from "@/integrations/supabase/client";

const GeneralSettings: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState<string | null>(null);
  const { settings, updateSettings } = useUserSettings(userId || undefined);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleTogglePasscode = async (checked: boolean) => {
    updateSettings({ passcode_enabled: checked });
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
            <SheetTitle>General</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-1">
              <ToggleRow
                label="Passcode"
                checked={settings?.passcode_enabled || false}
                onToggle={handleTogglePasscode}
              />
              
              <SettingsRow 
                label="Currency" 
                right={<span className="text-sm text-gray-500">{settings?.currency_code || 'INR'}</span>}
                onClick={() => navigate('/settings/general/currency')}
              />
              
              <SettingsRow 
                label="Date Format" 
                right={<span className="text-sm text-gray-500">{settings?.date_format || 'dd MMM yyyy'}</span>}
                onClick={() => navigate('/settings/general/date-format')}
              />
              
              <SettingsRow 
                label="Language" 
                right={<span className="text-sm text-gray-500">{settings?.language_code || 'English'}</span>}
                onClick={() => navigate('/settings/general/language')}
              />
            </div>

            <div className="space-y-1 pt-4 border-t">
              <SettingsRow 
                label="Terms & Conditions" 
                onClick={() => {}}
              />
              <SettingsRow 
                label="Privacy Policy" 
                onClick={() => {}}
              />
              <SettingsRow 
                label="Version" 
                right={<span className="text-sm text-gray-500">1.0.0</span>}
                onClick={() => {}}
              />
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default GeneralSettings;
