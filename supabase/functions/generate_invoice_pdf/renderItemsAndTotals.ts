
import { PAGE, FONTS, COLORS, getBandPositions, TABLE } from './layout.ts';
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
  let cursor = pos.topOfItems - 30; // Added 30pt spacing

  /* A. Column geometry - 5-column spreadsheet grid */
  const fractions = [0.05, 0.50, 0.10, 0.15, 0.20]; // S.NO, Equipment, Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);
  const colX = colWidths.reduce((acc, w, i) => 
    i === 0 ? [PAGE.margin] : [...acc, acc[i-1] + w], [] as number[]);

  /* Header row using the improved approach */
  const headers = ['S.NO','EQUIPMENT','DAYS','RATE','AMOUNT'];
  const align   = ['center','left','center','right','right'];
  headers.forEach((h,i)=>{
    drawText(h, 
      align[i]==='left'   ? colX[i] + TABLE.padding
    : align[i]==='center' ? colX[i] + colWidths[i]/2
    :                       colX[i] + colWidths[i] - TABLE.padding,
    cursor - 6,
    { size:FONTS.base, bold:true },
    { textAlign: align[i] });
  });
  cursor -= TABLE.headerH;

  /* Item rows */
  items.forEach((r, idx) => {
    // S.NO (centered)
    drawText(String(idx + 1), colX[0] + colWidths[0] / 2, cursor, { size: FONTS.base },
      { textAlign: 'center' });
    
    // Equipment (left-aligned with padding)
    drawText(r.description, colX[1] + TABLE.padding, cursor, { size: FONTS.base });
    
    // Days (centered) - using qty as days
    drawText(String(r.qty ?? 1), colX[2] + colWidths[2] / 2, cursor, { size: FONTS.base },
      { textAlign: 'center' });
    
    // Rate (right-aligned with padding)
    drawText(fm(r.unit_price || 0), colX[3] + colWidths[3] - TABLE.padding, cursor, { size: FONTS.base },
      { textAlign: 'right' });
    
    // Amount (right-aligned with padding)
    drawText(fm(r.amount), colX[4] + colWidths[4] - TABLE.padding, cursor, { size: FONTS.base },
      { textAlign: 'right' });
    
    cursor -= 16;
  });

  cursor -= 20; // gap before totals

  /* Totals rows as additional grid rows */
  const totalsRows: [string, number][] = [
    ['Subtotal', inv.subtotal]
  ];

  // Add tax rows based on tax type
  if (inv.use_igst) {
    if (+inv.igst) totalsRows.push([`IGST (${inv.igst_pct} %)`, inv.igst]);
  } else {
    if (+inv.cgst) totalsRows.push([`CGST (${inv.cgst_pct} %)`, inv.cgst]);
    if (+inv.sgst) totalsRows.push([`SGST (${inv.sgst_pct} %)`, inv.sgst]);
  }

  // Render totals rows spanning columns 2-5
  totalsRows.forEach(([lbl, val]) => {
    // Label in Equipment column (left-aligned with padding)
    drawText(lbl, colX[1] + TABLE.padding, cursor, { size: FONTS.base });
    
    // Value in Amount column (right-aligned with padding)
    drawText(fm(val), colX[4] + colWidths[4] - TABLE.padding, cursor, { size: FONTS.base },
      { textAlign: 'right' });
    
    cursor -= 16;
  });

  /* Grand Total with separator line */
  cursor -= 8;
  
  // Separator line spanning from Equipment to Amount columns
  page.drawLine({
    start: { x: colX[1], y: cursor },
    end: { x: colX[4] + colWidths[4], y: cursor },
    thickness: 0.5,
    color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
  });
  
  cursor -= 12;
  
  // GRAND TOTAL label and value
  drawText('GRAND TOTAL', colX[1] + TABLE.padding, cursor, { size: FONTS.medium, bold: true });
  drawText(fm(inv.total), colX[4] + colWidths[4] - TABLE.padding, cursor,
    { size: FONTS.medium, bold: true }, { textAlign: 'right' });
}
