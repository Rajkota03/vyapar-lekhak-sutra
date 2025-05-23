
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    <div className="overflow-y-auto max-h-[calc(100vh-120px)] px-4 pb-36">
      <div className="py-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
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
                  className="w-20 text-right"
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
                  className="mb-2" 
                />
              </div>
              
              <div>
                <Label htmlFor="cgst-percentage" className="text-sm text-gray-500 mb-1">CGST %</Label>
                <Input 
                  id="cgst-percentage"
                  type="number"
                  className="w-20 text-right"
                  value={watch('taxConfig.cgstPct')}
                  onChange={(e) => setValue('taxConfig.cgstPct', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="sgst-label" className="text-sm text-gray-500 mb-1">SGST Label</Label>
                <Input 
                  id="sgst-label" 
                  defaultValue="SGST" 
                  className="mb-2" 
                />
              </div>
              
              <div>
                <Label htmlFor="sgst-percentage" className="text-sm text-gray-500 mb-1">SGST %</Label>
                <Input 
                  id="sgst-percentage"
                  type="number" 
                  className="w-20 text-right"
                  value={watch('taxConfig.sgstPct')}
                  onChange={(e) => setValue('taxConfig.sgstPct', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Discount</h3>
            <div className="flex items-center">
              <span className="mr-2">₹</span>
              <Button variant="ghost" size="sm">▼</Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="discount" className="text-sm text-gray-500 mb-1">Discount ₹</Label>
            <Input id="discount" defaultValue="0" type="number" className="w-20 text-right" />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="after-tax" className="text-sm text-gray-500 mb-1">After-tax</Label>
            <Switch id="after-tax" />
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 inset-x-0 bg-white p-4 border-t">
        <Button className="w-full" onClick={closeSheet}>Save</Button>
      </div>
    </div>
  );
};

export default TaxDiscountSheet;
