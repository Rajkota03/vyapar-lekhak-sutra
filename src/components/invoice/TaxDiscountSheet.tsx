
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SheetBody } from "@/components/ui/SheetBody";
import { TaxConfig } from "@/utils/invoiceMath";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

interface TaxDiscountSheetProps {
  taxConfig: TaxConfig;
  setValue: UseFormSetValue<any>;
  closeSheet: () => void;
  watch: UseFormWatch<any>;
}

const TaxDiscountSheet: React.FC<TaxDiscountSheetProps> = ({
  taxConfig,
  setValue,
  closeSheet,
  watch
}) => {
  const useIgst = watch('taxConfig.useIgst');
  
  return (
    <div className="fixed inset-x-0 bottom-0 rounded-t-lg bg-white shadow-lg" style={{ maxHeight: '80dvh' }}>
      <SheetBody>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">IGST (Interstate)</h3>
              <Switch 
                checked={useIgst} 
                onCheckedChange={(v) => setValue('taxConfig.useIgst', v)} 
              />
            </div>
            
            {useIgst ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="igst-percentage" className="text-sm text-gray-500 mb-1">IGST %</Label>
                  <Input 
                    id="igst-percentage"
                    type="number"
                    className="w-20 text-right h-9 rounded-md text-sm"
                    value={watch('taxConfig.igstPct')}
                    onChange={(e) => setValue('taxConfig.igstPct', Number(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cgst-label" className="text-sm text-gray-500 mb-1">CGST Label</Label>
                  <Input 
                    id="cgst-label" 
                    defaultValue="CGST" 
                    className="mb-2 h-9 rounded-md text-sm" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="cgst-percentage" className="text-sm text-gray-500 mb-1">CGST %</Label>
                  <Input 
                    id="cgst-percentage"
                    type="number"
                    className="w-20 text-right h-9 rounded-md text-sm"
                    value={watch('taxConfig.cgstPct')}
                    onChange={(e) => setValue('taxConfig.cgstPct', Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sgst-label" className="text-sm text-gray-500 mb-1">SGST Label</Label>
                  <Input 
                    id="sgst-label" 
                    defaultValue="SGST" 
                    className="mb-2 h-9 rounded-md text-sm" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="sgst-percentage" className="text-sm text-gray-500 mb-1">SGST %</Label>
                  <Input 
                    id="sgst-percentage"
                    type="number" 
                    className="w-20 text-right h-9 rounded-md text-sm"
                    value={watch('taxConfig.sgstPct')}
                    onChange={(e) => setValue('taxConfig.sgstPct', Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Discount</h3>
              <div className="flex items-center">
                <span className="mr-2">₹</span>
                <Button variant="ghost" size="sm">▼</Button>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="discount" className="text-sm text-gray-500 mb-1">Discount ₹</Label>
              <Input id="discount" defaultValue="0" type="number" className="w-20 text-right h-9 rounded-md text-sm" />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Label htmlFor="after-tax" className="text-sm text-gray-500 mb-1">After-tax</Label>
              <Switch id="after-tax" />
            </div>
          </div>
        </div>
      </SheetBody>
      
      <div className="fixed bottom-0 inset-x-0 bg-white p-4 border-t">
        <Button className="w-full h-10 rounded-md text-sm font-medium" onClick={closeSheet}>Save</Button>
      </div>
    </div>
  );
};

export default TaxDiscountSheet;
