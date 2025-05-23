
import { LineItem } from "@/components/invoice/ItemsSection";

export type InvoiceLine = LineItem;

export type TaxConfig = {
  useIgst: boolean;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
}

// Helper to ensure values are treated as numbers
const toNum = (n: unknown) => Number(n) || 0;

export const calcTotals = (lines: InvoiceLine[], taxCfg: TaxConfig) => {
  const subtotal = lines.reduce((t, l) => t + toNum(l.amount), 0);
  
  if (taxCfg.useIgst) {
    const igst = subtotal * toNum(taxCfg.igstPct) / 100;
    return { subtotal, igst, total: subtotal + igst };
  }
  
  const cgst = subtotal * toNum(taxCfg.cgstPct) / 100;
  const sgst = subtotal * toNum(taxCfg.sgstPct) / 100;
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst };
};
