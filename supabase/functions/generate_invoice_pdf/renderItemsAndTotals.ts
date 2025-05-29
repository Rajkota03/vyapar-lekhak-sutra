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

  /* A. Column geometry - 5-column spreadsheet grid with wider Equipment column */
  const fractions = [0.05, 0.55, 0.10, 0.15, 0.15]; // S.NO, Equipment (wider), Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);
  const colX = colWidths.reduce((acc, w, i) => 
    i === 0 ? [PAGE.margin] : [...acc, acc[i-1] + colWidths[i-1]], [] as number[]); // Corrected colX accumulation

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

  /* Item rows with proper amount calculation */
  items.forEach((r, idx) => {
    // Calculate amount properly: Days/Qty * Rate
    const calculatedAmount = (r.qty || 1) * (r.unit_price || 0);
    
    // S.NO (centered)
    drawText(String(idx + 1), colX[0] + colWidths[0] / 2, cursor, { size: FONTS.base },
      { textAlign: 'center' });
    
    // Equipment (left-aligned with padding)
    drawText(r.description, colX[1] + TABLE.padding, cursor, { size: FONTS.base });
    
    // Days (centered) - using qty as days, ensure it's never empty
    drawText(String(r.qty || 1), colX[2] + colWidths[2] / 2, cursor, { size: FONTS.base },
      { textAlign: 'center' });
    
    // Rate (right-aligned with padding)
    drawText(fm(r.unit_price || 0), colX[3] + colWidths[3] - TABLE.padding, cursor, { size: FONTS.base },
      { textAlign: 'right' });
    
    // Amount (right-aligned with padding) - Use calculated amount
    drawText(fm(calculatedAmount), colX[4] + colWidths[4] - TABLE.padding, cursor, { size: FONTS.base },
      { textAlign: 'right' });
    
    cursor -= 16;
  });

  cursor -= 20; // gap before totals

  // Calculate subtotal from calculated line item amounts (not stored amounts)
  const subtotal = items.reduce((sum, item) => sum + ((item.qty || 1) * (item.unit_price || 0)), 0);

  // Calculate tax amounts based on tax configuration
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  if (inv.use_igst) {
    igstAmount = subtotal * ((Number(inv.igst_pct) || 18) / 100);
  } else {
    cgstAmount = subtotal * ((Number(inv.cgst_pct) || 9) / 100);
    sgstAmount = subtotal * ((Number(inv.sgst_pct) || 9) / 100);
  }
  
  const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

  // Draw separator line before totals
  page.drawLine({ 
    start: { x: PAGE.margin, y: cursor }, 
    end: { x: PAGE.margin + PAGE.inner, y: cursor }, 
    thickness: 0.5, 
    color: rgb(...COLORS.lines.light)
  });
  cursor -= 12;

  /* Totals rows as additional grid rows */
  // Define X positions for right-aligned totals block
  const totalsLabelX = colX[3] + colWidths[3] * 0.1; // X for labels like "Subtotal:" (adjust as needed)
  const totalsValueX = colX[4] + colWidths[4] - TABLE.padding; // X for the actual numbers (right end of Amount column)

  const totalsRows: [string, number][] = [
    ['Subtotal', subtotal]
  ];

  // Add tax rows based on tax type
  if (inv.use_igst) {
    if (igstAmount > 0 || inv.igst_pct) totalsRows.push([`IGST (${inv.igst_pct || 18}%)`, igstAmount]);
  } else {
    if (cgstAmount > 0 || inv.cgst_pct) totalsRows.push([`CGST (${inv.cgst_pct || 9}%)`, cgstAmount]);
    if (sgstAmount > 0 || inv.sgst_pct) totalsRows.push([`SGST (${inv.sgst_pct || 9}%)`, sgstAmount]);
  }

  // Render totals rows
  totalsRows.forEach(([label, val]) => {
    // Label (e.g., "Subtotal")
    drawText(label, totalsLabelX, cursor, { 
      size: FONTS.base, 
      color: rgb(0, 0, 0) // Explicit black
    }); 
    
    // Value (e.g., "40,000")
    drawText(fm(val), totalsValueX, cursor, { 
      size: FONTS.base, 
      color: rgb(0, 0, 0) // Explicit black
    }, { textAlign: 'right' });
    
    cursor -= 14;
  });

  /* Grand Total */
  cursor -= 4; 
  
  // GRAND TOTAL label
  drawText('GRAND TOTAL', totalsLabelX, cursor, { 
    size: FONTS.medium, 
    bold: true, 
    color: rgb(0, 0, 0) // Explicit black
  });
  // GRAND TOTAL value
  drawText(fm(grandTotal), totalsValueX, cursor, { 
    size: FONTS.medium, 
    bold: true, 
    color: rgb(0, 0, 0) // Explicit black
  }, { textAlign: 'right' });
}
