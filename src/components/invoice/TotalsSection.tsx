
import React, { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TotalsSectionProps {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
}

const TotalsSection: React.FC<TotalsSectionProps> = ({
  subtotal,
  cgstAmount,
  sgstAmount,
  grandTotal,
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

  const TaxSettingsSheet = () => (
    <Sheet open={showTaxSettings} onOpenChange={setShowTaxSettings}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tax & Discount</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Tax</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tax-label">Tax label</Label>
                <Input id="tax-label" defaultValue="CGST" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="tax-percentage">Tax %</Label>
                <Input id="tax-percentage" defaultValue="9" type="number" className="mt-1" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="inclusive">Inclusive</Label>
                <Switch id="inclusive" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="deductible">Deductible</Label>
                <Switch id="deductible" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Second Tax</h3>
              <Switch defaultChecked id="second-tax" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="second-tax-label">Tax label</Label>
                <Input id="second-tax-label" defaultValue="SGST" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="second-tax-percentage">Tax %</Label>
                <Input id="second-tax-percentage" defaultValue="9" type="number" className="mt-1" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="second-deductible">Deductible</Label>
                <Switch id="second-deductible" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Discount</h3>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <Button variant="ghost" size="sm">▼</Button>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="discount">Discount $</Label>
              <Input id="discount" defaultValue="0" type="number" className="mt-1" />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Label htmlFor="after-tax">After-tax</Label>
              <Switch id="after-tax" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

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
        <div className="flex justify-between">
          <span className="text-muted-foreground">CGST (9%)</span>
          <span>{formatCurrency(cgstAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">SGST (9%)</span>
          <span>{formatCurrency(sgstAmount)}</span>
        </div>
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
      
      <TaxSettingsSheet />
    </div>
  );
};

export default TotalsSection;
