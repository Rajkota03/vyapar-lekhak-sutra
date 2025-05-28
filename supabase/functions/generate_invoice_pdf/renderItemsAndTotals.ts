
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

  /* A. Column geometry - unified grid for items and totals */
  const grid = [0.45, 0.15, 0.15, 0.25];   // equipment / pkg / qty / amount
  const colX = grid.reduce<number[]>((arr, f, i) => {
    arr.push(PAGE.margin + PAGE.inner * grid.slice(0, i).reduce((a, b) => a + b, 0));
    return arr;
  }, []);
  const colW = grid.map(f => f * PAGE.inner);

  /* header */
  ['equipment', 'pkg', 'qty', 'amount'].forEach((h, i) => {
    drawText(h, colX[i], y, { size: FONTS.base, bold: true },
      { textAlign: i === 3 ? 'right' : 'left' });
  });
  y -= 18;

  /* item rows */
  items.forEach(r => {
    drawText(r.description, colX[0], y, { size: FONTS.base });
    drawText(String(r.pkg ?? 1), colX[1], y, { size: FONTS.base });
    drawText(String(r.qty ?? 1), colX[2], y, { size: FONTS.base });
    // B. Amount values right-aligned to right edge of Amount column
    drawText(fm(r.amount), colX[3] + colW[3], y, { size: FONTS.base },
      { textAlign: 'right' });
    y -= 16;
  });

  y -= 20; // gap before totals

  /* C. Totals rows as part of the same grid */
  const totalsRows: [string, number][] = [
    ['subtotal', inv.subtotal]
  ];

  // Add tax rows based on tax type
  if (inv.use_igst) {
    if (+inv.igst) totalsRows.push([`IGST (${inv.igst_pct} %)`, inv.igst]);
  } else {
    if (+inv.cgst) totalsRows.push([`CGST (${inv.cgst_pct} %)`, inv.cgst]);
    if (+inv.sgst) totalsRows.push([`SGST (${inv.sgst_pct} %)`, inv.sgst]);
  }

  let yTot = y;
  totalsRows.forEach(([lbl, val]) => {
    // Label in Qty column (colX[2])
    drawText(lbl, colX[2], yTot, { size: FONTS.base });
    // Value right-aligned in Amount column
    drawText(fm(val), colX[3] + colW[3], yTot,
      { size: FONTS.base }, { textAlign: 'right' });
    yTot -= 16;
  });

  /* D. GRAND TOTAL with separator line */
  yTot -= 8;
  // Thin separator rule from Qty column to right edge of Amount column
  page.drawLine({
    start: { x: colX[2], y: yTot },
    end:   { x: colX[3] + colW[3], y: yTot },
    thickness: .5,
    color: COLORS.lines.medium,
  });
  yTot -= 12;
  
  // GRAND TOTAL label and value
  drawText('GRAND TOTAL', colX[2], yTot, 
    { size: FONTS.medium, bold: true });
  drawText(fm(inv.total), colX[3] + colW[3], yTot,
    { size: FONTS.medium, bold: true },
    { textAlign: 'right' });
}
