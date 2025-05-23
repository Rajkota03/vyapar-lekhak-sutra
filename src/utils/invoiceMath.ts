
import { LineItem } from "@/components/invoice/ItemsSection";

export type InvoiceLine = LineItem;

export const calcTotals = (lines: InvoiceLine[]) => {
  const subtotal = lines.reduce((t, l) => t + l.amount, 0);
  const cgst = lines.reduce(
    (t, l) => t + (l.cgst ? (l.amount * l.cgst) / 100 : 0),
    0
  );
  const sgst = lines.reduce(
    (t, l) => t + (l.sgst ? (l.amount * l.sgst) / 100 : 0),
    0
  );
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst };
};
