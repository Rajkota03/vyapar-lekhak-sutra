import { PAGE, FONTS, COLORS, getBandPositions } from './layout.ts';
import type { InvoiceData, LineItem, DrawTextOptions } from './types.ts';

/* money helper */
const fm = (n: number) => new Intl.NumberFormat('en-IN').format(n);

export function renderItemsAndTotals(
  page: any,
  drawText: (
    t: string, x: number, y: number,
    o?: DrawTextOptions, eo?: any
  ) => void,
  inv: InvoiceData,
  items: LineItem[],
) {
  const pos = getBandPositions();
  let y = pos.topOfItems;

  /* column grid (fractions of PAGE.inner) */
  const grid = [0.45, 0.15, 0.15, 0.25];   // equip / pkg / qty / amount
  const colX = grid.reduce<number[]>((arr, f, i) => {
    arr.push(PAGE.margin + PAGE.inner * grid.slice(0, i).reduce((a, b) => a + b, 0));
    return arr;
  }, []);

  /* header */
  ['equipment', 'pkg', 'qty', 'amount'].forEach((h, i) => {
    drawText(h, colX[i], y, { size: FONTS.base, bold: true },
      { textAlign: i === 3 ? 'right' : 'left' });
  });
  y -= 18;

  /* rows */
  items.forEach(r => {
    drawText(r.description, colX[0], y, { size: FONTS.base });
    drawText(String(r.pkg ?? 1), colX[1], y, { size: FONTS.base });
    drawText(String(r.qty ?? 1), colX[2], y, { size: FONTS.base });
    drawText(fm(r.amount), colX[3] + PAGE.inner * grid[3], y, { size: FONTS.base },
      { textAlign: 'right' });
    y -= 16;
  });

  y -= 10; // gap to totals

  /* totals */
  const pushRow = (label: string, val: number, bold = false) => {
    drawText(label, colX[2], y, { size: FONTS.base + (bold ? 1 : 0), bold });
    drawText(fm(val), colX[3] + PAGE.inner * grid[3], y,
      { size: FONTS.base + (bold ? 1 : 0), bold },
      { textAlign: 'right' });
    y -= 16;
  };

  pushRow('subtotal', inv.subtotal);
  if (inv.use_igst)  pushRow(`IGST (${inv.igst_pct} %)`, inv.igst);
  else {
    if (+inv.cgst) pushRow(`CGST (${inv.cgst_pct} %)`, inv.cgst);
    if (+inv.sgst) pushRow(`SGST (${inv.sgst_pct} %)`, inv.sgst);
  }

  /* grand total */
  y -= 4;
  page.drawLine({                   // thin separator rule
    start: { x: colX[2], y },
    end:   { x: colX[3] + PAGE.inner * grid[3], y },
    thickness: .5,
    color: COLORS.lines.medium,
  });
  y -= 12;
  pushRow('GRAND TOTAL', inv.total, true);
}
