import {
  PAGE,
  BANDS,
  FONTS,
  COLORS,
  SPACING,
  getBandPositions,
  formatDate,
} from './layout.ts';
import { drawRoundedRect } from './pdfUtils.ts';
import { wrapLines, truncateText } from './textUtils.ts';
import type {
  InvoiceData,
  CompanySettings,
  DrawTextOptions,
} from './types.ts';

export function renderBillSection(
  page: any,
  drawText: (
    text: string,
    x: number,
    y: number,
    options?: DrawTextOptions,
    extraOptions?: any,
  ) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null,
) {
  const positions = getBandPositions();

  /* ───────────────── HEADER BAR ───────────────── */
  drawRoundedRect(
    page,
    PAGE.margin,
    positions.topOfBill,
    PAGE.inner,
    BANDS.bill,
    COLORS.background.light,
  );

  let billY = positions.topOfBill + BANDS.bill - 25;

  // BILL-TO
  drawText('BILL TO', PAGE.margin + 20, billY, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.muted,
  });
  billY -= 18;

  drawText(invoice.clients?.name || 'Client Name', PAGE.margin + 20, billY, {
    size: FONTS.large,
    bold: true,
    color: COLORS.text.primary,
  });
  billY -= 15;

  // Client address (wrap max 3 lines)
  const addressLines = invoice.clients?.billing_address
    ? invoice.clients.billing_address.split('\n').slice(0, 3)
    : [
        'C/O RAMANAIDU STUDIOS, FILM NAGAR',
        'HYDERABAD TELANGANA 500096',
      ];

  addressLines.forEach((line) => {
    if (billY > positions.topOfBill + 15) {
      drawText(line.trim(), PAGE.margin + 20, billY, {
        size: FONTS.base,
        color: COLORS.text.secondary,
      });
      billY -= SPACING.lineHeight;
    }
  });

  if (invoice.clients?.gstin && billY > positions.topOfBill + 15) {
    drawText(`GSTIN : ${invoice.clients.gstin}`, PAGE.margin + 20, billY, {
      size: FONTS.base,
      color: COLORS.text.secondary,
    });
  }

  /* ─────────── INVOICE-META GREY BOX ─────────── */

  const detailsBox = {
    x: PAGE.width - PAGE.margin - 206, // 6 pt left shift to keep right edge aligned
    y: positions.topOfBill + 20,
    width: 200, // widened from 180 → 200 pt
    height: 60,
  };

  /*drawRoundedRect(
    page,
    detailsBox.x,
    detailsBox.y,
    detailsBox.width,
    detailsBox.height,
    COLORS.background.medium,
  //);*/

  let detailsY = detailsBox.y + detailsBox.height - 15;

  // layout constants
  const labelWidth = 60; // reserve 60 pt for labels
  const valueX = detailsBox.x + 10 + labelWidth;
  const valueWidth = detailsBox.width - 20 - labelWidth; // 20 pt padding total

  const invoiceDetails = [
    { label: 'Invoice #', value: invoice.invoice_code || '25-26/02' },
    { label: 'Date', value: formatDate(invoice.issue_date) },
    { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' },
  ];

  invoiceDetails.forEach((detail) => {
    if (detailsY > detailsBox.y + 10) {
      // draw label
      drawText(detail.label, detailsBox.x + 10, detailsY, {
        size: FONTS.small,
        bold: true,
        color: COLORS.text.primary,
      });

      // wrap value text within valueWidth
      const lines = wrapLines(detail.value, valueWidth, FONTS.small);
      lines.forEach((ln: string, idx: number) => {
        const textY = detailsY - idx * 14; // 14 pt line spacing
        if (textY > detailsBox.y + 10) {
          drawText(ln, valueX, textY, {
            size: FONTS.small,
            color: COLORS.text.primary,
          });
        }
      });

      // step to next row (single spacing—14 pt)
      detailsY -= 14;
    }
  });
}
