
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
  const [useIgst, setUseIgst] = useState(false);
  const [cgstPct, setCgstPct] = useState(settings?.default_cgst_pct || 9);
  const [sgstPct, setSgstPct] = useState(settings?.default_sgst_pct || 9);
  const [igstPct, setIgstPct] = useState(settings?.default_igst_pct || 18);

  const handleSave = () => {
    updateSettings({ 
      default_cgst_pct: cgstPct,
      default_sgst_pct: sgstPct,
      default_igst_pct: igstPct
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
              label="Use IGST (Inter-state)"
              checked={useIgst}
              onToggle={setUseIgst}
            />

            <div className="space-y-4">
              {!useIgst ? (
                <>
                  <div>
                    <Label htmlFor="cgst">CGST (%)</Label>
                    <Input
                      id="cgst"
                      type="number"
                      value={cgstPct}
                      onChange={(e) => setCgstPct(Number(e.target.value))}
                      placeholder="9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sgst">SGST (%)</Label>
                    <Input
                      id="sgst"
                      type="number"
                      value={sgstPct}
                      onChange={(e) => setSgstPct(Number(e.target.value))}
                      placeholder="9"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="igst">IGST (%)</Label>
                  <Input
                    id="igst"
                    type="number"
                    value={igstPct}
                    onChange={(e) => setIgstPct(Number(e.target.value))}
                    placeholder="18"
                  />
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default TaxSettings;
