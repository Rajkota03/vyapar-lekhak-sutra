
/*  footerRenderer.ts
 *  – renders the footer section of the invoice
 */

import {
  PAGE,
  BANDS,
  FONTS,
  COLORS,
  getBandPositions,
  formatDate,
} from './layout.ts';
import { drawRoundedRect } from './pdfUtils.ts';
import type { InvoiceData, CompanySettings, DrawTextOptions } from './types.ts';

// Helper function to format money values
function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function renderFooter(
  pdfDoc: any,
  page: any,
  drawText: (
    text: string,
    x: number,
    y: number,
    options?: DrawTextOptions,
    extra?: any,
  ) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null,
) {
  /* ─────────── BOX GEOMETRY ─────────── */
  const pos = getBandPositions();
  const totBox = {
    width: 220,                                     // ⬅ widened from 200
    x: PAGE.width - PAGE.margin - 220,              // keep right edge same
    y: PAGE.margin + BANDS.footer + 40,             // height anchor
  };
  let cursor = totBox.y + BANDS.totals - 20;

  /* ─────────── PAYMENT INSTRUCTIONS (left) ─────────── */
  const noteLines = (companySettings?.payment_note || '').split('\n');
  drawText('Payment Instructions', PAGE.margin, cursor, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.primary,
  });
  cursor -= 18;
  noteLines.forEach((ln) => {
    drawText(ln, PAGE.margin, cursor, { size: FONTS.base, color: COLORS.text.secondary });
    cursor -= 14;
  });

  /* reset cursor for totals */
  cursor = totBox.y + BANDS.totals - 20;

  /* white background - using existing color */
  drawRoundedRect(
    page,
    totBox.x,
    totBox.y,
    totBox.width,
    BANDS.totals,
    COLORS.background.light,
  );

  const rows: [string, string][] = [
    ['Subtotal', formatMoney(invoice.subtotal)],
    [`CGST (${invoice.cgst_pct} %)`, formatMoney(invoice.cgst_total)],
    [`SGST (${invoice.sgst_pct} %)`, formatMoney(invoice.sgst_total)],
  ];
  if (invoice.use_igst) {
    rows.push([`IGST (${invoice.igst_pct} %)`, formatMoney(invoice.igst_total)]);
  }

  /* regular rows */
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

  /* ─────────── GRAND TOTAL HIGHLIGHT ─────────── */
  const barHeight = 22;
  const barY = cursor - 4;
  page.drawRectangle({
    x: totBox.x,
    y: barY,
    width: totBox.width,            // full 220 pt
    height: barHeight,
    color: COLORS.background.medium,
  });

  drawText('GRAND TOTAL', totBox.x + 12, barY + 6, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.primary,
  });
  drawText(
    formatMoney(invoice.grand_total),
    totBox.x + totBox.width - 12,
    barY + 6,
    { size: FONTS.medium, bold: true, color: COLORS.text.primary },
    { textAlign: 'right' },
  );
}
