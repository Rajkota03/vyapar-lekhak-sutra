import {
  PAGE,
  BANDS,
  FONTS,
  COLORS,
  SIGNATURE,
  getBandPositions,
  formatDate,
} from './layout.ts';
import { embedImage } from './pdfUtils.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import type {
  InvoiceData,
  CompanySettings,
  DrawTextOptions,
} from './types.ts';

export async function renderFooter(
  pdfDoc: any,
  page: any,
  drawText: (
    text: string,
    x: number,
    y: number,
    options?: DrawTextOptions,
  ) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null,
) {
  /* ───── Spacer (we removed horizontal rule) ─── */
  const footerY = PAGE.margin + 60; // was 70 → lifts block 10 pt

  drawText('Thank you for your business!', PAGE.margin, footerY, {
    size: FONTS.medium,
    color: COLORS.text.primary,
  });

  drawText(invoice.companies?.name || 'Square Blue Media', PAGE.margin, footerY - 18, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.primary,
  });

  /* ───── Optional signature block ─── */
  if (invoice.show_my_signature || invoice.require_client_signature) {
    const signatureUrl = companySettings?.signature_url;

    let embedded = null;
    if (signatureUrl) {
      embedded = await embedImage(pdfDoc, signatureUrl);
      if (embedded) {
        page.drawImage(embedded.image, {
          x: PAGE.margin,
          y: PAGE.margin + 25,
          width: SIGNATURE.width,
          height: SIGNATURE.height,
        });
      }
    }

    // Only draw line if we actually placed a signature (or if you always want it)
    if (embedded) {
      page.drawLine({
        start: { x: PAGE.margin, y: PAGE.margin + 20 },
        end: {
          x: PAGE.margin + SIGNATURE.lineWidth,
          y: PAGE.margin + 20,
        },
        thickness: 1,
        color: rgb(
          COLORS.lines.dark[0],
          COLORS.lines.dark[1],
          COLORS.lines.dark[2],
        ),
      });

      drawText(formatDate(invoice.issue_date), PAGE.margin, PAGE.margin + 8, {
        size: FONTS.small,
        color: COLORS.text.muted,
      });
    }
  }
}