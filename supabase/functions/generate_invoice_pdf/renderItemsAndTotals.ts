
import { PAGE, FONTS, COLORS, getBandPositions, TABLE } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { clipText, measureText, createClippedDrawText } from './textUtils.ts';
import type { InvoiceData, LineItem, DrawTextOptions } from './types.ts';

/* money helper */
const fm = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;

export function renderItemsAndTotals(
  page: any,
  drawText: (
    t: string, x: number, y: number,
    o?: DrawTextOptions,
    eo?: any
  ) => void,
  inv: InvoiceData,
  items: LineItem[],
) {
  const pos = getBandPositions();
  let cursor = pos.topOfItems - 30;

  // Create clipped text drawing function for constrained columns
  const drawClippedText = createClippedDrawText(page, drawText);

  /* Column geometry - optimized proportions */
  const fractions = [0.08, 0.35, 0.12, 0.22, 0.23]; // S.NO, Equipment, Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);

  // Calculate column positions starting at proper page margin
  const colX = [PAGE.margin];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i-1] + colWidths[i-1]);
  }

  console.log('Column positions:', colX);
  console.log('Column widths:', colWidths);

  // Calculate table height
  const maxRowHeight = 18;
  const totalTableHeight = TABLE.headerH + (items.length * maxRowHeight) + 20;

  // Draw table border
  page.drawRectangle({
    x: PAGE.margin,
    y: cursor - totalTableHeight,
    width: PAGE.inner,
    height: totalTableHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Draw vertical column separators
  for (let i = 1; i < colX.length; i++) {
    page.drawLine({
      start: { x: colX[i], y: cursor },
      end: { x: colX[i], y: cursor - totalTableHeight },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  // Draw horizontal line after header
  page.drawLine({
    start: { x: PAGE.margin, y: cursor - TABLE.headerH },
    end: { x: PAGE.margin + PAGE.inner, y: cursor - TABLE.headerH },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  /* Header row with proper text clipping */
  const headers = ['S.NO','EQUIPMENT','DAYS','RATE','AMOUNT'];
  const align = ['center','left','center','right','right'];
  
  headers.forEach((h, i) => {
    const maxHeaderWidth = colWidths[i] - TABLE.padding * 2;
    let headerXPosition = colX[i] + TABLE.padding;
    
    if (align[i] === 'center') {
      headerXPosition = colX[i] + colWidths[i] / 2;
    } else if (align[i] === 'right') {
      headerXPosition = colX[i] + colWidths[i] - TABLE.padding;
    }
    
    // Use clipped text for headers to ensure they fit
    if (align[i] === 'center' || align[i] === 'right') {
      drawText(h, headerXPosition, cursor - 6,
        { size: FONTS.base, bold: true, color: rgb(0,0,0) },
        { textAlign: align[i] }
      );
    } else {
      drawClippedText(h, headerXPosition, cursor - 6, maxHeaderWidth,
        { size: FONTS.base, bold: true, color: rgb(0,0,0) }
      );
    }
  });
  cursor -= TABLE.headerH;

  /* Item rows with proper text clipping */
  items.forEach((r, idx) => {
    const itemQty = r.qty || 1;
    const itemUnitPrice = r.unit_price || 0;
    const calculatedAmount = itemQty * itemUnitPrice;
    
    // S.NO (centered)
    drawText(String(idx + 1), colX[0] + colWidths[0] / 2, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'center' });
    
    // Equipment with proper text clipping - use full available width minus padding
    const equipmentMaxWidth = colWidths[1] - TABLE.padding * 2;
    const clippedDescription = clipText(r.description, equipmentMaxWidth, FONTS.base, false);
    drawText(clippedDescription, colX[1] + TABLE.padding, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) });
    
    // Days (centered)
    drawText(String(itemQty), colX[2] + colWidths[2] / 2, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'center' });
    
    // Rate (right-aligned)
    const rateText = fm(itemUnitPrice);
    drawText(rateText, colX[3] + colWidths[3] - TABLE.padding, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'right' });
    
    // Amount (right-aligned)
    const amountText = fm(calculatedAmount);
    drawText(amountText, colX[4] + colWidths[4] - TABLE.padding, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'right' });
    
    cursor -= maxRowHeight;
    
    // Draw horizontal separator line
    if (idx < items.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: cursor },
        end: { x: PAGE.margin + PAGE.inner, y: cursor },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
    }
  });

  cursor -= 20;

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
  cursor -= 12;

  /* Totals Section with proper alignment */
  const totalsLabelX = colX[2];
  const totalsValueX = colX[4] + colWidths[4] - TABLE.padding;

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
      { size: FONTS.base, color: rgb(0,0,0) });
    drawText(fm(value), totalsValueX, cursor, 
      { size: FONTS.base, color: rgb(0,0,0) }, { textAlign: 'right' });
    cursor -= 14;
  });

  cursor -= 4;
  
  drawText('GRAND TOTAL', totalsLabelX + TABLE.padding, cursor, 
    { size: FONTS.medium, bold: true, color: rgb(0,0,0) });
  drawText(fm(grandTotal), totalsValueX, cursor, 
    { size: FONTS.medium, bold: true, color: rgb(0,0,0) }, { textAlign: 'right' });

  console.log('Final cursor position:', cursor);
}
