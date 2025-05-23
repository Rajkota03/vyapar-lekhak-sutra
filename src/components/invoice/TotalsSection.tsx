
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
        <h2 className="font-medium text-lg">Total</h2>
        <Button variant="ghost" size="icon" onClick={() => setShowTaxSettings(true)}>
          <Settings className="h-5 w-5 text-blue-500" />
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {taxConfig.useIgst ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">IGST ({taxConfig.igstPct}%)</span>
            <span>{formatCurrency(igstAmount || 0)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGST ({taxConfig.cgstPct}%)</span>
              <span>{formatCurrency(cgstAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SGST ({taxConfig.sgstPct}%)</span>
              <span>{formatCurrency(sgstAmount || 0)}</span>
            </div>
          </>
        )}
        
        <div className="h-px bg-gray-200 my-2"></div>
        <div className="flex justify-between font-medium">
          <span>Grand Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Amount Due</span>
          <span className="font-medium">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
      
      <Sheet open={showTaxSettings} onOpenChange={setShowTaxSettings}>
        <SheetContent>
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
