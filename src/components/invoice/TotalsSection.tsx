
import React, { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import TaxDiscountSheet from "./TaxDiscountSheet";
import { TaxConfig } from "@/utils/invoiceMath";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

interface TotalsSectionProps {
  subtotal: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  grandTotal: number;
  taxConfig: TaxConfig;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const TotalsSection: React.FC<TotalsSectionProps> = ({
  subtotal,
  cgstAmount,
  sgstAmount,
  igstAmount,
  grandTotal,
  taxConfig,
  setValue,
  watch
}) => {
  const [showTaxSettings, setShowTaxSettings] = useState(false);

  // Format currency for Indian Rupees
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Total</h2>
        <Button variant="ghost" size="icon" onClick={() => setShowTaxSettings(true)}>
          <Settings size={18} className="text-gray-400 hover:text-gray-600" />
        </Button>
      </div>
      
      <div className="rounded-md bg-white shadow-sm border p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Subtotal</span>
          <span className="text-right font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {taxConfig.useIgst ? (
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">IGST ({taxConfig.igstPct}%)</span>
            <span className="text-right font-medium">{formatCurrency(igstAmount || 0)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">CGST ({taxConfig.cgstPct}%)</span>
              <span className="text-right font-medium">{formatCurrency(cgstAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">SGST ({taxConfig.sgstPct}%)</span>
              <span className="text-right font-medium">{formatCurrency(sgstAmount || 0)}</span>
            </div>
          </>
        )}
        
        <div className="h-px bg-gray-200 my-2"></div>
        <div className="flex justify-between font-medium">
          <span>Grand Total</span>
          <span className="text-right font-medium">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      
      <div className="rounded-md bg-white shadow-sm border p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Amount Due</span>
          <span className="text-right font-medium">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      
      <Sheet open={showTaxSettings} onOpenChange={setShowTaxSettings}>
        <SheetContent className="rounded-t-lg">
          <SheetHeader>
            <SheetTitle>Tax & Discount</SheetTitle>
          </SheetHeader>
          <TaxDiscountSheet 
            taxConfig={taxConfig}
            setValue={setValue}
            closeSheet={() => setShowTaxSettings(false)}
            watch={watch}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TotalsSection;
