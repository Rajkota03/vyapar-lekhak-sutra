
/* ────────────────────────────────────────────
   renderItemsAndTotals.ts
   Draws: table header, line-items, white bg,
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

  /* ───── table header (grey) ───── */
  const tableWidth = PAGE.inner - 220;          // 220 pt reserved for totals col
  const colW = TABLE.cols.map((f) => f * tableWidth);

  // REMOVED: Grey header background
  // drawRoundedRect(
  //   page,
  //   PAGE.margin,
  //   cursor - TABLE.headerH,
  //   tableWidth,
  //   TABLE.headerH,
  //   COLORS.background.medium,          // grey fill
  // );

  ['Description', 'Qty', 'Rate', 'Amount'].forEach((h, i) => {
    const x =
      PAGE.margin + colW.slice(0, i).reduce((a, b) => a + b, 0) + TABLE.padding;
    drawText(h, x, cursor - 16, {
      size: FONTS.base,
      bold: true,
      color: COLORS.text.primary,
    });
  });

  cursor -= TABLE.headerH + 4;         // move below header
  const headerBottom = cursor;         // record end-of-header Y

  /* ───── table rows ───── */
  lines.forEach((l) => {
    let x = PAGE.margin;

    drawText(l.description, x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[0];

    drawText(String(l.qty ?? 1), x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[1];

    drawText(fm(l.unit_price), x + TABLE.padding, cursor, { size: FONTS.base });
    x += colW[2];

    drawText(fm(l.amount), x + TABLE.padding, cursor, { size: FONTS.base });
    cursor -= TABLE.rowH;
  });

  /* ───── totals rows prep ───── */
  cursor -= 14;                       // gap before totals

  const totalsCol = { x: PAGE.width - PAGE.margin - 220, w: 220 };
  const rows: [string, number][] = [
    ['Subtotal', invoice.subtotal],
    [`CGST (${invoice.cgst_pct} %)`, invoice.cgst],
    [`SGST (${invoice.sgst_pct} %)`, invoice.sgst],
  ];
  if (invoice.use_igst) {
    rows.push([`IGST (${invoice.igst_pct} %)`, invoice.igst]);
  }

  /* grand-total bar Y */
  const barY = cursor - rows.length * 14 - 4;
  const barH = 22;

  /* ───── white background (covers header→bar) ───── */
  const blockBottom = barY - 6;                     // a bit below grand bar
  const blockHeight = headerBottom - blockBottom + 6;

  drawRoundedRect(
    page,
    PAGE.margin,
    blockBottom,
    PAGE.inner,
    blockHeight,
    COLORS.background.light,
  );

  /* ───── draw subtotal / tax rows ───── */
  rows.forEach(([lbl, val]) => {
    drawText(lbl, totalsCol.x + 12, cursor, { size: FONTS.base });
    drawText(
      fm(val),
      totalsCol.x + totalsCol.w - 12,
      cursor,
      { size: FONTS.base },
      { textAlign: 'right' },
    );
    cursor -= 14;
  });

  /* ───── grand-total grey bar ───── */
  page.drawRectangle({
    x: totalsCol.x,
    y: barY,
    width: totalsCol.w,
    height: barH,
    color: rgb(...COLORS.background.medium),
  });
  drawText('GRAND TOTAL', totalsCol.x + 12, barY + 6, {
    size: FONTS.medium,
    bold: true,
  });
  drawText(
    fm(invoice.total),
    totalsCol.x + totalsCol.w - 12,
    barY + 6,
    { size: FONTS.medium, bold: true },
    { textAlign: 'right' },
  );
}
