
// Ensure we're importing LineItem from the correct file
import { LineItem } from "@/components/invoice/types/InvoiceTypes";

export type TaxConfig = {
  useIgst: boolean;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
};

export function calcTotals(lineItems: LineItem[], taxConfig: TaxConfig) {
  // Calculate subtotal (sum of all lineItems)
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate tax amounts based on tax configuration
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (taxConfig.useIgst) {
    // IGST calculation (for inter-state transactions)
    igst = subtotal * (taxConfig.igstPct / 100);
  } else {
    // CGST + SGST calculation (for intra-state transactions)
    cgst = subtotal * (taxConfig.cgstPct / 100);
    sgst = subtotal * (taxConfig.sgstPct / 100);
  }
  
  // Calculate total including taxes
  const total = subtotal + cgst + sgst + igst;
  
  return {
    subtotal,
    cgst,
    sgst,
    igst,
    total
  };
}
