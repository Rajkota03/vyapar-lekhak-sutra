
import { PAGE, FONTS, COLORS, getBandPositions } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
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
  // Add spacing between Bill To and Items sections, align with Bill To content
  let y = pos.topOfItems - 30; // Added 30pt spacing

  /* A. Column geometry - unified grid for items and totals, starting with Bill To content inset */
  const billToContentInset = 20; // Match the 20pt inset from Bill To section
  const availableWidth = PAGE.inner - billToContentInset; // Reduce available width by inset
  const grid = [0.45, 0.15, 0.15, 0.25];   // equipment / pkg / qty / amount
  const colX = grid.reduce<number[]>((arr, f, i) => {
    arr.push(PAGE.margin + billToContentInset + availableWidth * grid.slice(0, i).reduce((a, b) => a + b, 0));
    return arr;
  }, []);
  const colW = grid.map(f => f * availableWidth);

  /* header - with capitalized column names */
  ['EQUIPMENT', 'PKG', 'QTY', 'AMOUNT'].forEach((h, i) => {
    drawText(h, colX[i], y, { size: FONTS.base, bold: true },
      { textAlign: i === 3 ? 'right' : 'left' });
  });
  y -= 18;

  /* item rows - limit to match Bill To section height */
  const maxRows = 3; // Limit items to match Bill To section height
  const displayItems = items.slice(0, maxRows);
  
  displayItems.forEach(r => {
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
    color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
  });
  yTot -= 12;
  
  // GRAND TOTAL label and value
  drawText('GRAND TOTAL', colX[2], yTot, 
    { size: FONTS.medium, bold: true });
  drawText(fm(inv.total), colX[3] + colW[3], yTot,
    { size: FONTS.medium, bold: true },
    { textAlign: 'right' });
}
