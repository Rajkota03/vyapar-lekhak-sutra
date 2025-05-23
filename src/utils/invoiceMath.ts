
import { LineItem } from "@/components/invoice/ItemsSection";

export type InvoiceLine = LineItem;

// Helper to ensure values are treated as numbers
const toNum = (n: unknown) => Number(n) || 0;

export const calcTotals = (lines: InvoiceLine[]) => {
  const subtotal = lines.reduce((t, l) => t + toNum(l.amount), 0);
  const cgst = lines.reduce(
    (t, l) => t + (toNum(l.cgst) * toNum(l.amount)) / 100,
    0
  );
  const sgst = lines.reduce(
    (t, l) => t + (toNum(l.sgst) * toNum(l.amount)) / 100,
    0
  );
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst };
};
