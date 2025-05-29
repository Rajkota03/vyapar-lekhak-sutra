
import { PAGE, FONTS, COLORS, getBandPositions, TABLE } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { wrapLines } from './textUtils.ts';
import type { InvoiceData, LineItem, DrawTextOptions } from './types.ts';

/* money helper */
const fm = (n: number) => new Intl.NumberFormat('en-IN').format(n);

export function renderItemsAndTotals(
  page: any, // This is likely a pdf-lib PDFPage object
  drawText: (
    t: string, x: number, y: number,
    o?: DrawTextOptions, // Options like size, bold, color
    eo?: any            // Extra options, possibly for textAlign
  ) => void,
  inv: InvoiceData,
  items: LineItem[],    // IMPORTANT: Each LineItem in 'items' MUST have a valid 'qty' and 'unit_price'
                        // For "Signature Prime Lens", ensure 'qty' (for DAYS) is provided in your data.
) {
  const pos = getBandPositions(); // Assuming this provides key Y positions
  let cursor = pos.topOfItems - 30; // Start Y cursor below a certain point

  /* A. Column geometry - Aligned with grey bar */
  // Fractions define the proportion of width for each column
  const fractions = [0.08, 0.45, 0.14, 0.16, 0.17]; // S.NO (increased), Equipment (reduced), Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner); // Calculate actual widths

  // Calculate the starting X coordinate for each column - START AT PAGE.margin (no offset)
  const colX = [PAGE.margin]; // Start first column exactly at page margin
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i-1] + colWidths[i-1]);
  }

  console.log('Column positions:', colX);
  console.log('Column widths:', colWidths);

  /* Header row */
  const headers = ['S.NO','EQUIPMENT','DAYS','RATE','AMOUNT'];
  const align   = ['center','left','center','right','right']; // Text alignment for each header
  headers.forEach((h,i)=>{
    let headerXPosition = colX[i] + TABLE.padding; // Default for left-align
    if (align[i] === 'center') {
      headerXPosition = colX[i] + colWidths[i] / 2;
    } else if (align[i] === 'right') {
      headerXPosition = colX[i] + colWidths[i] - TABLE.padding;
    }
    drawText(h, headerXPosition, cursor - 6, // Y position adjusted slightly for vertical alignment
      { size:FONTS.base, bold:true, color: rgb(0,0,0) }, // Explicit black for headers
      { textAlign: align[i] }
    );
  });
  cursor -= TABLE.headerH; // Move cursor down past header height

  /* Item rows with text wrapping */
  items.forEach((r, idx) => {
    const itemQty = r.qty || 1; // Default to 1 if qty is missing, but data should be complete
    const itemUnitPrice = r.unit_price || 0; // Default to 0 if price is missing
    const calculatedAmount = itemQty * itemUnitPrice;
    
    // Handle equipment description with text wrapping
    const maxEquipmentWidth = colWidths[1] - TABLE.padding * 2;
    const wrappedLines = wrapLines(r.description, maxEquipmentWidth, FONTS.base);
    const rowHeight = Math.max(16, wrappedLines.length * 12); // Adjust row height based on wrapped text
    
    // S.NO (centered)
    drawText(String(idx + 1), colX[0] + colWidths[0] / 2, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'center' });
    
    // Equipment (left-aligned with padding) - Handle wrapped text
    wrappedLines.forEach((line, lineIdx) => {
      drawText(line, colX[1] + TABLE.padding, cursor - (lineIdx * 12), 
        { size: FONTS.base, color: rgb(0,0,0) });
    });
    
    // Days (centered)
    drawText(String(itemQty), colX[2] + colWidths[2] / 2, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'center' });
    
    // Rate (right-aligned with padding)
    drawText(fm(itemUnitPrice), colX[3] + colWidths[3] - TABLE.padding, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'right' });
    
    // Amount (right-aligned with padding)
    drawText(fm(calculatedAmount), colX[4] + colWidths[4] - TABLE.padding, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'right' });
    
    cursor -= rowHeight; // Move cursor down for next item, accounting for wrapped text
  });

  cursor -= 20; // Gap before totals section

  /* Calculations for Totals */
  const subtotal = items.reduce((sum, item) => sum + ((item.qty || 1) * (item.unit_price || 0)), 0);
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

  console.log('Totals calculation:', { subtotal, cgstAmount, sgstAmount, igstAmount, grandTotal });

  /* Separator Line before Totals */
  page.drawLine({ 
    start: { x: PAGE.margin, y: cursor }, 
    end: { x: PAGE.margin + PAGE.inner, y: cursor }, 
    thickness: 0.5, 
    color: rgb(...COLORS.lines.light)
  });
  cursor -= 12; // Move cursor down past line

  /* Totals Section - Updated positioning to align with new column layout */
  // Use the Days column start for labels and Amount column for values
  const totalsLabelX = colX[2]; // Start of Days column
  const totalsValueX = colX[4] + colWidths[4] - TABLE.padding; // Right-aligned in Amount column

  console.log('Totals positioning:', { totalsLabelX, totalsValueX, cursor });

  const totalsRowsData: [string, number][] = [['Subtotal', subtotal]];
  if (inv.use_igst) {
    if (igstAmount > 0) totalsRowsData.push([`IGST (${inv.igst_pct || 18}%)`, igstAmount]);
  } else {
    if (cgstAmount > 0) totalsRowsData.push([`CGST (${inv.cgst_pct || 9}%)`, cgstAmount]);
    if (sgstAmount > 0) totalsRowsData.push([`SGST (${inv.sgst_pct || 9}%)`, sgstAmount]);
  }

  totalsRowsData.forEach(([label, value]) => {
    drawText(label, totalsLabelX + TABLE.padding, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }); // Label text
    drawText(fm(value), totalsValueX, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'right' }); // Numeric value
    cursor -= 14; // Move cursor down for next total line
  });

  cursor -= 4; // Extra space before Grand Total
  
  drawText('GRAND TOTAL', totalsLabelX + TABLE.padding, cursor, 
    { size: FONTS.medium, bold: true, color: rgb(0,0,0) }); // Grand Total Label
  drawText(fm(grandTotal), totalsValueX, cursor, 
    { size: FONTS.medium, bold: true, color: rgb(0,0,0) }, { textAlign: 'right' }); // Grand Total Value

  console.log('Final cursor position:', cursor);
}
