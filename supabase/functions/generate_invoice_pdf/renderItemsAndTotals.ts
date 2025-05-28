
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

  /* ───── table header ───── */
  const tableWidth = PAGE.inner - 220;          // 220 pt reserved for totals col
  const colW = TABLE.cols.map((f) => f * tableWidth);

  // Clean header without background
  ['EQUIPMENT', 'PKG', 'Rate', 'Amount'].forEach((h, i) => {
    const x =
      PAGE.margin + colW.slice(0, i).reduce((a, b) => a + b, 0) + TABLE.padding;
    drawText(h, x, cursor - 16, {
      size: FONTS.base,
      bold: true,
      color: COLORS.text.primary,
    });
  });

  cursor -= TABLE.headerH + 4;         // move below header
  
  // Draw header underline
  page.drawLine({
    start: { x: PAGE.margin, y: cursor + 2 },
    end: { x: PAGE.margin + tableWidth, y: cursor + 2 },
    thickness: 0.5,
    color: rgb(...COLORS.lines.light),
  });

  cursor -= 8; // Space after header line

  /* ───── table rows ───── */
  lines.forEach((l, index) => {
    let x = PAGE.margin;

    drawText(l.description, x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[0];

    drawText(String(l.qty ?? 1), x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[1];

    drawText(fm(l.unit_price), x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[2];

    drawText(fm(l.amount), x + TABLE.padding, cursor, { size: FONTS.base });
    
    cursor -= TABLE.rowH;
    
    // Add subtle line between rows (except last)
    if (index < lines.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: cursor + TABLE.rowH / 2 },
        end: { x: PAGE.margin + tableWidth, y: cursor + TABLE.rowH / 2 },
        thickness: 0.25,
        color: rgb(...COLORS.lines.light),
      });
    }
  });

  /* ───── totals rows prep ───── */
  cursor -= 20;                       // gap before totals

  const totalsCol = { x: PAGE.width - PAGE.margin - 220, w: 220 };
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
  
  rows.push(['Total', invoice.total]);

  /* ───── draw subtotal / tax rows ───── */
  rows.forEach(([lbl, val], index) => {
    const isGrandTotal = index === rows.length - 1;
    
    if (isGrandTotal) {
      // Draw GRAND TOTAL with light background
      drawRoundedRect(
        page,
        totalsCol.x,
        cursor - 8,
        totalsCol.w,
        20,
        COLORS.background.light,
      );
      
      drawText('GRAND TOTAL', totalsCol.x + 12, cursor, { 
        size: FONTS.medium, 
        bold: true,
        color: COLORS.text.primary,
      });
      drawText(
        fm(val),
        totalsCol.x + totalsCol.w - 12,
        cursor,
        { size: FONTS.medium, bold: true },
        { textAlign: 'right' },
      );
    } else {
      drawText(lbl, totalsCol.x + 12, cursor, { size: FONTS.base });
      drawText(
        fm(val),
        totalsCol.x + totalsCol.w - 12,
        cursor,
        { size: FONTS.base },
        { textAlign: 'right' },
      );
    }
    cursor -= 18;
  });
}
