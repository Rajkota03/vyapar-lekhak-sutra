
/* ────────────────────────────────────────────
   renderItemsAndTotals.ts
   Draws: table header, line-items, clean design,
          subtotal / tax rows, GRAND TOTAL bar
   ──────────────────────────────────────────── */

import {
  PAGE,
  TABLE,
  FONTS,
  COLORS,
  getBandPositions,
} from './layout.ts';
import { drawRoundedRect } from './pdfUtils.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import type {
  InvoiceData,
  LineItem,
  DrawTextOptions,
} from './types.ts';

/* — money formatter — */
const fm = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

export function renderItemsAndTotals(
  page: any,
  drawText: (
    text: string,
    x: number,
    y: number,
    opts?: DrawTextOptions,
    extra?: any,
  ) => void,
  invoice: InvoiceData,
  lines: LineItem[],
) {
  /* ───── initial Y positions ───── */
  const pos = getBandPositions();
  let cursor = pos.topOfItems;        // first row baseline
  const startY = cursor;              // top of block for bg calc

  /* ───── table header - items section only ───── */
  const itemsTableWidth = 420;       // Fixed width for items table
  const colW = [
    itemsTableWidth * 0.45,          // Equipment - 45%
    itemsTableWidth * 0.12,          // PKG - 12%
    itemsTableWidth * 0.20,          // Rate - 20%
    itemsTableWidth * 0.23,          // Amount - 23%
  ];

  // Clean header without background
  const headers = ['EQUIPMENT', 'PKG', 'Rate', 'Amount'];
  const headerAlignments = ['left', 'center', 'right', 'right'];
  
  headers.forEach((h, i) => {
    let x = PAGE.margin + colW.slice(0, i).reduce((a, b) => a + b, 0) + TABLE.padding;
    
    // Adjust x position for center and right alignment
    if (headerAlignments[i] === 'center') {
      x += (colW[i] - TABLE.padding * 2) / 2 - 10; // Approximate center adjustment
    } else if (headerAlignments[i] === 'right') {
      x += colW[i] - TABLE.padding * 2 - 20; // Right alignment
    }
    
    drawText(h, x, cursor - 16, {
      size: FONTS.base,
      bold: true,
      color: COLORS.text.primary,
    });
  });

  cursor -= TABLE.headerH + 4;         // move below header
  
  // Draw header underline - only for items table
  page.drawLine({
    start: { x: PAGE.margin, y: cursor + 2 },
    end: { x: PAGE.margin + itemsTableWidth, y: cursor + 2 },
    thickness: 0.5,
    color: rgb(...COLORS.lines.light),
  });

  cursor -= 8; // Space after header line

  /* ───── table rows ───── */
  lines.forEach((l, index) => {
    let x = PAGE.margin;

    // Equipment description
    drawText(l.description, x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[0];

    // PKG (centered)
    const qtyText = String(l.qty ?? 1);
    const qtyX = x + (colW[1] / 2) - 5; // Center in column
    drawText(qtyText, qtyX, cursor, { size: FONTS.base });
    x += colW[1];

    // Rate (right-aligned)
    const rateText = fm(l.unit_price);
    const rateX = x + colW[2] - TABLE.padding - 40; // Right align
    drawText(rateText, rateX, cursor, { size: FONTS.base });
    x += colW[2];

    // Amount (right-aligned)
    const amountText = fm(l.amount);
    const amountX = x + colW[3] - TABLE.padding - 40; // Right align
    drawText(amountText, amountX, cursor, { size: FONTS.base });
    
    cursor -= TABLE.rowH;
    
    // Add subtle line between rows (except last)
    if (index < lines.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: cursor + TABLE.rowH / 2 },
        end: { x: PAGE.margin + itemsTableWidth, y: cursor + TABLE.rowH / 2 },
        thickness: 0.25,
        color: rgb(...COLORS.lines.light),
      });
    }
  });

  /* ───── totals section on the right ───── */
  const totalsX = PAGE.margin + itemsTableWidth + 20; // Position to the right of items table
  const totalsWidth = 220;
  let totalsY = pos.topOfItems - TABLE.headerH - 20; // Start aligned with items

  const rows: [string, number][] = [
    ['Subtotal', invoice.subtotal],
  ];
  
  if (invoice.use_igst) {
    rows.push([`IGST (${invoice.igst_pct}%)`, invoice.igst]);
  } else {
    if (Number(invoice.cgst_pct) > 0) {
      rows.push([`CGST (${invoice.cgst_pct}%)`, invoice.cgst]);
    }
    if (Number(invoice.sgst_pct) > 0) {
      rows.push([`SGST (${invoice.sgst_pct}%)`, invoice.sgst]);
    }
  }

  /* ───── draw subtotal / tax rows ───── */
  rows.forEach(([lbl, val], index) => {
    drawText(lbl, totalsX + 12, totalsY, { size: FONTS.base });
    drawText(
      fm(val),
      totalsX + totalsWidth - 12,
      totalsY,
      { size: FONTS.base },
      { textAlign: 'right' },
    );
    totalsY -= 18;
  });

  /* ───── GRAND TOTAL with background ───── */
  totalsY -= 6; // Extra space before grand total
  
  drawRoundedRect(
    page,
    totalsX,
    totalsY - 8,
    totalsWidth,
    20,
    COLORS.background.light,
  );
  
  drawText('GRAND TOTAL', totalsX + 12, totalsY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary,
  });
  drawText(
    fm(invoice.total),
    totalsX + totalsWidth - 12,
    totalsY,
    { size: FONTS.medium, bold: true },
    { textAlign: 'right' },
  );
}
