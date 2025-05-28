
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

// Helper function to format money values
function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function renderItemsAndTotals(
  page: any,
  drawText: (
    text: string,
    x: number,
    y: number,
    options?: DrawTextOptions,
    extra?: any,
  ) => void,
  invoice: InvoiceData,
  lineItems: LineItem[],
) {
  const positions = getBandPositions();
  let cursor = positions.topOfItems;

  /* ─────────── TABLE HEADER ─────────── */
  const tableWidth = PAGE.inner;
  const colWidths = TABLE.cols.map(col => col * tableWidth);
  
  drawRoundedRect(
    page,
    PAGE.margin,
    cursor - TABLE.headerH,
    tableWidth,
    TABLE.headerH,
    COLORS.background.medium,
  );

  const headers = ['Description', 'Qty', 'Rate', 'Amount'];
  let xPos = PAGE.margin;
  
  headers.forEach((header, i) => {
    drawText(header, xPos + TABLE.padding, cursor - 16, {
      size: FONTS.base,
      bold: true,
      color: COLORS.text.primary,
    });
    xPos += colWidths[i];
  });

  cursor -= TABLE.headerH + 4;

  /* ─────────── TABLE ROWS ─────────── */
  lineItems.forEach((item) => {
    xPos = PAGE.margin;
    
    // Description
    drawText(item.description || '', xPos + TABLE.padding, cursor, {
      size: FONTS.base,
      color: COLORS.text.primary,
    });
    xPos += colWidths[0];

    // Quantity
    drawText(String(item.qty || 1), xPos + TABLE.padding, cursor, {
      size: FONTS.base,
      color: COLORS.text.primary,
    });
    xPos += colWidths[1];

    // Rate
    drawText(formatMoney(item.unit_price || 0), xPos + TABLE.padding, cursor, {
      size: FONTS.base,
      color: COLORS.text.primary,
    });
    xPos += colWidths[2];

    // Amount
    drawText(formatMoney(item.amount || 0), xPos + TABLE.padding, cursor, {
      size: FONTS.base,
      color: COLORS.text.primary,
    });

    cursor -= TABLE.rowH;
  });

  // 14 pt gap before totals
  cursor -= 14;

  /* ─────────── TOTALS SECTION ─────────── */
  const totBox = {
    width: 220,
    x: PAGE.width - PAGE.margin - 220,
    y: cursor - 120, // Reserve space for totals
  };

  const totalsStartY = cursor;
  cursor = totalsStartY - 20;

  // Draw background for entire totals block
  const blockHeight = totalsStartY - (totBox.y);
  drawRoundedRect(
    page,
    totBox.x,
    totBox.y,
    totBox.width,
    blockHeight,
    COLORS.background.light,
  );

  const rows: [string, string][] = [
    ['Subtotal', formatMoney(invoice.subtotal)],
    [`CGST (${invoice.cgst_pct} %)`, formatMoney(invoice.cgst)],
    [`SGST (${invoice.sgst_pct} %)`, formatMoney(invoice.sgst)],
  ];
  if (invoice.use_igst) {
    rows.push([`IGST (${invoice.igst_pct} %)`, formatMoney(invoice.igst)]);
  }

  /* Regular totals rows */
  rows.forEach(([label, val]) => {
    drawText(label, totBox.x + 12, cursor, {
      size: FONTS.base,
      color: COLORS.text.primary,
    });
    drawText(
      val,
      totBox.x + totBox.width - 12,
      cursor,
      { size: FONTS.base, color: COLORS.text.primary },
      { textAlign: 'right' },
    );
    cursor -= 14;
  });

  /* ─────────── GRAND TOTAL GREY BAR ─────────── */
  const barHeight = 22;
  const barY = cursor - 4;
  
  page.drawRectangle({
    x: totBox.x,
    y: barY,
    width: totBox.width,
    height: barHeight,
    color: rgb(COLORS.background.medium[0], COLORS.background.medium[1], COLORS.background.medium[2]),
  });

  drawText('GRAND TOTAL', totBox.x + 12, barY + 6, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.primary,
  });
  drawText(
    formatMoney(invoice.total),
    totBox.x + totBox.width - 12,
    barY + 6,
    { size: FONTS.medium, bold: true, color: COLORS.text.primary },
    { textAlign: 'right' },
  );
}
