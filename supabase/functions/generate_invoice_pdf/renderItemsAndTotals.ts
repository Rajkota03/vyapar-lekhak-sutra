/* ────────────────────────────────────────────
   renderItemsAndTotals.ts
   Draws: column header, line-items, totals inside
          the Amount column, GRAND TOTAL grey bar
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
  let cursor = pos.topOfItems;           // first row
  const startY = cursor;                 // top of white block

  /* ───── column widths (flex) ───── */
  const colW = [
    PAGE.inner * 0.45, // Equipment
    PAGE.inner * 0.12, // PKG
    PAGE.inner * 0.20, // Rate
    PAGE.inner * 0.23, // Amount
  ];

  /* ───── header text (no grey fill) ───── */
  const headers = ['EQUIPMENT', 'PKG', 'Rate', 'Amount'];
  const hdrAlign = ['left', 'center', 'right', 'right'];

  headers.forEach((h, i) => {
    const colStart = PAGE.margin + colW.slice(0, i).reduce((a, b) => a + b, 0);
    let x = colStart + TABLE.padding;

    if (hdrAlign[i] === 'center') x = colStart + colW[i] / 2;
    if (hdrAlign[i] === 'right')  x = colStart + colW[i] - TABLE.padding;

    drawText(h, x, cursor - 12, {
      size: FONTS.base,
      bold: true,
      color: COLORS.text.primary,
    }, { textAlign: hdrAlign[i] });
  });

  /* underline header */
  page.drawLine({
    start: { x: PAGE.margin, y: cursor - TABLE.headerH + 2 },
    end:   { x: PAGE.margin + PAGE.inner, y: cursor - TABLE.headerH + 2 },
    thickness: 0.5,
    color: rgb(...COLORS.lines.light),
  });

  cursor -= TABLE.headerH;

  /* ───── table rows ───── */
  lines.forEach((l, idx) => {
    let colStart = PAGE.margin;

    /* Equipment (left) */
    drawText(l.description, colStart + TABLE.padding, cursor, { size: FONTS.base });

    colStart += colW[0];

    /* PKG (center) */
    drawText(String(l.qty ?? 1), colStart + colW[1] / 2, cursor, { size: FONTS.base }, { textAlign: 'center' });
    colStart += colW[1];

    /* Rate (right) */
    drawText(fm(l.unit_price), colStart + colW[2] - TABLE.padding, cursor, { size: FONTS.base }, { textAlign: 'right' });
    colStart += colW[2];

    /* Amount (right) */
    drawText(fm(l.amount), colStart + colW[3] - TABLE.padding, cursor, { size: FONTS.base }, { textAlign: 'right' });

    cursor -= TABLE.rowH;

    /* optional row rule */
    if (idx < lines.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: cursor + TABLE.rowH / 2 },
        end:   { x: PAGE.margin + PAGE.inner, y: cursor + TABLE.rowH / 2 },
        thickness: 0.25,
        color: rgb(...COLORS.lines.light),
      });
    }
  });

  /* ───── totals block inside Amount column ───── */
  cursor -= 20;                                      // gap after items

  const amtColX = PAGE.margin + colW[0] + colW[1] + colW[2];
  const amtColW = colW[3];
  const totalsX = amtColX + TABLE.padding;
  const totalsW = amtColW - TABLE.padding * 2;
  let totalsY   = cursor;

  const rows: [string, number][] = [
    ['Subtotal', invoice.subtotal],
  ];

  if (invoice.use_igst) {
    rows.push([`IGST (${invoice.igst_pct} %)`, invoice.igst]);
  } else {
    if (+invoice.cgst_pct) rows.push([`CGST (${invoice.cgst_pct} %)`, invoice.cgst]);
    if (+invoice.sgst_pct) rows.push([`SGST (${invoice.sgst_pct} %)`, invoice.sgst]);
  }

  /* draw each row */
  rows.forEach(([label, val]) => {
    drawText(label, totalsX, totalsY, { size: FONTS.base });

    drawText(
      fm(val),
      totalsX + totalsW,                 // right edge of amount column
      totalsY,
      { size: FONTS.base },
      { textAlign: 'right' },
    );
    totalsY -= 16;                       // line spacing
  });

  /* ───── GRAND TOTAL BAR ───── */
  totalsY -= 8;                          // extra space

  const barH = 24;
  drawRoundedRect(
    page,
    totalsX - TABLE.padding,
    totalsY - 10,
    totalsW + TABLE.padding * 2,
    barH,
    COLORS.background.light,
  );

  drawText('GRAND TOTAL', totalsX, totalsY, {
    size: FONTS.medium,
    bold: true,
  });

  drawText(
    fm(invoice.total),
    totalsX + totalsW,
    totalsY,
    { size: FONTS.medium, bold: true },
    { textAlign: 'right' },
  );

  /* ───── white background behind entire block ───── */
  const blockBottom = totalsY - 14;      // little padding below grand bar
  const blockHeight = startY - blockBottom;

  drawRoundedRect(
    page,
    PAGE.margin,
    blockBottom,
    PAGE.inner,
    blockHeight,
    COLORS.background.light,
  );
}
