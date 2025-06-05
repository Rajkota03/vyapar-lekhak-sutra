import {
  PAGE,
  BANDS,
  FONTS,
  COLORS,
  SPACING,
  TEXT_HANDLING,
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

  /* ───────────────── BILL TO SECTION (LEFT SIDE) ───────────────── */
  // Bill-to section with gray background - separate from invoice details
  const billToWidth = PAGE.inner * 0.5 - 10; // Half width minus gap
  
  drawRoundedRect(
    page,
    PAGE.margin,
    positions.topOfBill,
    billToWidth,
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

  // Client name with truncation to prevent overflow
  const clientName = invoice.clients?.name || 'Client Name';
  const truncatedClientName = truncateText(
    clientName, 
    TEXT_HANDLING.maxClientNameWidth, 
    FONTS.large
  );
  
  drawText(truncatedClientName, PAGE.margin + 20, billY, {
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
      // Truncate address lines if too long
      const truncatedLine = truncateText(
        line.trim(), 
        billToWidth - 40, // Account for padding
        FONTS.base
      );
      
      drawText(truncatedLine, PAGE.margin + 20, billY, {
        size: FONTS.base,
        color: COLORS.text.secondary,
      });
      billY -= SPACING.lineHeight;
    }
  });

  if (invoice.clients?.gstin && billY > positions.topOfBill + 15) {
    const gstinText = `GSTIN : ${invoice.clients.gstin}`;
    const truncatedGstin = truncateText(
      gstinText,
      billToWidth - 40,
      FONTS.base
    );
    
    drawText(truncatedGstin, PAGE.margin + 20, billY, {
      size: FONTS.base,
      color: COLORS.text.secondary,
    });
  }

  /* ─────────── INVOICE-META SECTION (RIGHT SIDE) ─────────── */
  // Invoice details section with gray background - separate from bill-to
  const detailsBox = {
    x: PAGE.margin + billToWidth + 20, // Position after bill-to section with gap
    y: positions.topOfBill,
    width: PAGE.inner * 0.5 - 10, // Half width minus gap
    height: BANDS.bill,
  };

  drawRoundedRect(
    page,
    detailsBox.x,
    detailsBox.y,
    detailsBox.width,
    detailsBox.height,
    COLORS.background.medium, // Slightly darker gray for contrast
  );

  let detailsY = detailsBox.y + detailsBox.height - 25;

  // Layout constants
  const labelWidth = 70; // Reserve 70pt for labels
  const detailsValueX = detailsBox.x + 15 + labelWidth;
  const valueWidth = detailsBox.width - 30 - labelWidth; // 30pt padding total

  const invoiceDetails = [
    { label: 'Invoice #', value: invoice.invoice_code || 'INV-2505-004' },
    { label: 'Date', value: formatDate(invoice.issue_date) },
    { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' },
  ];

  invoiceDetails.forEach((detail) => {
    if (detailsY > detailsBox.y + 10) {
      // Draw label
      drawText(detail.label, detailsBox.x + 15, detailsY, {
        size: FONTS.small,
        bold: true,
        color: COLORS.text.primary,
      });

      // Truncate value text to prevent overflow
      const truncatedValue = truncateText(
        detail.value,
        valueWidth,
        FONTS.small
      );
      
      // Draw value
      drawText(truncatedValue, detailsValueX, detailsY, {
        size: FONTS.small,
        color: COLORS.text.primary,
      });

      // Step to next row (single spacing—14 pt)
      detailsY -= 18; // Increased spacing between rows
    }
  });
}
