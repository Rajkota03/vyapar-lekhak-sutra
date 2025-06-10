
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const InvoiceSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useCompanySettings();

  const handleToggleReminder = async (checked: boolean) => {
    updateSettings({ overdue_reminder: checked });
  };

  const handleNoteChange = (note: string) => {
    updateSettings({ default_note: note });
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
            <SheetTitle>Invoice</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-1">
              <ToggleRow
                label="Overdue Reminder"
                checked={settings?.overdue_reminder || false}
                onToggle={handleToggleReminder}
              />
              
              <SettingsRow 
                label="Due in (days)" 
                right={<span className="text-sm text-gray-500">{settings?.due_days || 0} days</span>}
                onClick={() => navigate('/settings/invoice/due-days')}
              />
              
              <SettingsRow 
                label="Tax" 
                onClick={() => navigate('/settings/invoice/tax')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultNote">Default Note</Label>
              <Textarea
                id="defaultNote"
                value={settings?.default_note || ""}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Enter default note for invoices"
                rows={4}
              />
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceSettings;
