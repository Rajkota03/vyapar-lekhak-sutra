
import React, { useState } from "react";
import { Settings2 } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Heading3, BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { Stack, Group } from "@/components/ui/primitives/Spacing";
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
    <Stack>
      <div className="flex justify-between items-center">
        <Heading3>Totals</Heading3>
        <PremiumButton 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowTaxSettings(true)}
          className="h-8 w-8 p-0"
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </PremiumButton>
      </div>
      
      <ModernCard variant="outlined" padding="md">
        <Group>
          <div className="flex justify-between items-center">
            <CaptionText>Subtotal</CaptionText>
            <BodyText className="font-medium">{formatCurrency(subtotal)}</BodyText>
          </div>
          
          {taxConfig.useIgst ? (
            <div className="flex justify-between items-center">
              <CaptionText>IGST ({taxConfig.igstPct}%)</CaptionText>
              <BodyText className="font-medium">{formatCurrency(igstAmount || 0)}</BodyText>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <CaptionText>CGST ({taxConfig.cgstPct}%)</CaptionText>
                <BodyText className="font-medium">{formatCurrency(cgstAmount || 0)}</BodyText>
              </div>
              <div className="flex justify-between items-center">
                <CaptionText>SGST ({taxConfig.sgstPct}%)</CaptionText>
                <BodyText className="font-medium">{formatCurrency(sgstAmount || 0)}</BodyText>
              </div>
            </>
          )}
          
          <div className="h-px bg-border my-3"></div>
          
          <div className="flex justify-between items-center">
            <BodyText className="font-semibold">Grand Total</BodyText>
            <BodyText className="font-bold text-lg">{formatCurrency(grandTotal)}</BodyText>
          </div>
        </Group>
      </ModernCard>
      
      <ModernCard variant="elevated" padding="md" className="bg-primary/5 border-primary/20">
        <div className="flex justify-between items-center">
          <BodyText className="font-semibold text-primary">Amount Due</BodyText>
          <BodyText className="font-bold text-xl text-primary">{formatCurrency(grandTotal)}</BodyText>
        </div>
      </ModernCard>
      
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
    </Stack>
  );
};

export default TotalsSection;
