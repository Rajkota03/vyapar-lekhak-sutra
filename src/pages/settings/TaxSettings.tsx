
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const TaxSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useCompanySettings();
  const [cgstRate, setCgstRate] = useState(settings?.default_cgst_pct || 9);
  const [sgstRate, setSgstRate] = useState(settings?.default_sgst_pct || 9);
  const [igstRate, setIgstRate] = useState(settings?.default_igst_pct || 18);
  const [useIgst, setUseIgst] = useState(false);

  const handleToggleIgst = async (checked: boolean) => {
    setUseIgst(checked);
  };

  const handleSave = () => {
    updateSettings({
      default_cgst_pct: cgstRate,
      default_sgst_pct: sgstRate,
      default_igst_pct: igstRate,
    });
    navigate('/settings');
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
            <SheetTitle>Tax Settings</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <ToggleRow
              label="Use IGST (for inter-state transactions)"
              checked={useIgst}
              onToggle={handleToggleIgst}
            />

            <div className="space-y-4">
              <div>
                <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                <Input
                  id="cgstRate"
                  type="number"
                  value={cgstRate}
                  onChange={(e) => setCgstRate(Number(e.target.value))}
                  placeholder="9"
                />
              </div>

              <div>
                <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                <Input
                  id="sgstRate"
                  type="number"
                  value={sgstRate}
                  onChange={(e) => setSgstRate(Number(e.target.value))}
                  placeholder="9"
                />
              </div>

              <div>
                <Label htmlFor="igstRate">IGST Rate (%)</Label>
                <Input
                  id="igstRate"
                  type="number"
                  value={igstRate}
                  onChange={(e) => setIgstRate(Number(e.target.value))}
                  placeholder="18"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Tax Settings
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default TaxSettings;
