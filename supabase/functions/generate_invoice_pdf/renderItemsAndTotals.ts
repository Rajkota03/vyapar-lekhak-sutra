
import {
  PAGE,
  TABLE,
  FONTS,
  COLORS,
  getBandPositions,
} from './layout.ts';
import { drawRoundedRect } from './pdfUtils.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import type { InvoiceData, LineItem, DrawTextOptions } from './types.ts';

/* Money formatter */
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
  const pos = getBandPositions();
  let cursor = pos.topOfItems;          // first row y
  const startY = cursor;               // remember top for white bg

  /* -------- table header -------- */
  const tableWidth = PAGE.inner - 220;
  const colW = TABLE.cols.map((f) => f * tableWidth);

  drawRoundedRect(
    page,
    PAGE.margin,
    cursor - TABLE.headerH,
    tableWidth,
    TABLE.headerH,
    COLORS.background.medium,
  );

  ['Description', 'Qty', 'Rate', 'Amount'].forEach((h, i) => {
    let x = PAGE.margin + colW.slice(0, i).reduce((a, b) => a + b, 0) + TABLE.padding;
    drawText(h, x, cursor - 16, {
      size: FONTS.base,
      bold: true,
      color: COLORS.text.primary,
    });
  });
  cursor -= TABLE.headerH + 4;

  /* -------- table rows -------- */
  lines.forEach((l) => {
    let x = PAGE.margin;

    drawText(l.description, x + TABLE.padding, cursor, { size: FONTS.base });          // desc
    x += colW[0];

    drawText(String(l.qty ?? 1), x + TABLE.padding, cursor, { size: FONTS.base });     // qty
    x += colW[1];

    drawText(fm(l.unit_price), x + TABLE.padding, cursor, { size: FONTS.base });       // rate
    x += colW[2];

    drawText(fm(l.amount), x + TABLE.padding, cursor, { size: FONTS.base });           // amount
    cursor -= TABLE.rowH;
  });

  /* -------- totals -------- */
  cursor -= 14; // gap before totals

  const tot = { x: PAGE.width - PAGE.margin - 220, w: 220 };
  const rows: [string, number][] = [
    ['Subtotal', invoice.subtotal],
    [`CGST (${invoice.cgst_pct} %)`, invoice.cgst],
    [`SGST (${invoice.sgst_pct} %)`, invoice.sgst],
  ];
  if (invoice.use_igst) rows.push([`IGST (${invoice.igst_pct} %)`, invoice.igst]);

  /* -------- grand-total bar position calculation -------- */
  let totalsCursor = cursor;
  rows.forEach(() => {
    totalsCursor -= 14;
  });
  
  const barH = 22;
  const barY = totalsCursor - 4;
  
  /* -------- white background BEFORE drawing totals -------- */
  const blockBottom = barY - 6;
  const blockHeight = startY - blockBottom + 6;
  drawRoundedRect(
    page,
    PAGE.margin,
    blockBottom,
    PAGE.inner,
    blockHeight,
    COLORS.background.light,
  );

  /* -------- draw totals rows -------- */
  rows.forEach(([lbl, val]) => {
    drawText(lbl, tot.x + 12, cursor, { size: FONTS.base });
    drawText(fm(val), tot.x + tot.w - 12, cursor, { size: FONTS.base }, { textAlign: 'right' });
    cursor -= 14;
  });

  /* -------- grand-total bar -------- */
  page.drawRectangle({
    x: tot.x,
    y: barY,
    width: tot.w,
    height: barH,
    color: rgb(...COLORS.background.medium),
  });
  drawText('GRAND TOTAL', tot.x + 12, barY + 6, { size: FONTS.medium, bold: true });
  drawText(
    fm(invoice.total),
    tot.x + tot.w - 12,
    barY + 6,
    { size: FONTS.medium, bold: true },
    { textAlign: 'right' },
  );
}
