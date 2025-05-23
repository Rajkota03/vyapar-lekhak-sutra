
import React from "react";

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
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">CGST (9%)</span>
        <span>₹{cgstAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">SGST (9%)</span>
        <span>₹{sgstAmount.toFixed(2)}</span>
      </div>
      <div className="h-px bg-gray-200 my-2"></div>
      <div className="flex justify-between font-medium">
        <span>Grand Total</span>
        <span>₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default TotalsSection;
