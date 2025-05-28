
import {
  PAGE,
  BANDS,
  FONTS,
  COLORS,
  getBandPositions,
} from './layout.ts';
import { embedImage } from './pdfUtils.ts';
import type { CompanySettings, DrawTextOptions } from './types.ts';

export async function renderPayment(
  pdfDoc: any,
  page: any,
  drawText: (
    text: string,
    x: number,
    y: number,
    options?: DrawTextOptions,
    extra?: any,
  ) => void,
  companySettings: CompanySettings | null,
) {
  const positions = getBandPositions();
  let cursor = positions.topOfPayment + BANDS.payment - 25;

  /* ─────────── PAYMENT INSTRUCTIONS HEADING ─────────── */
  drawText('Payment Instructions', PAGE.margin, cursor, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.muted,
  });
  cursor -= 18;

  /* ─────────── PAYMENT NOTE LINES ─────────── */
  const noteLines = (companySettings?.payment_note || '').split('\n');
  noteLines.forEach((line) => {
    drawText(line, PAGE.margin, cursor, { 
      size: FONTS.base, 
      color: COLORS.text.secondary 
    });
    cursor -= 14;
  });

  /* ─────────── QR CODE (if present) ─────────── */
  if (companySettings?.payment_qr_url) {
    try {
      const qrResult = await embedImage(pdfDoc, companySettings.payment_qr_url);
      if (qrResult) {
        const qrSize = 50;
        const qrX = PAGE.width - PAGE.margin - qrSize - 10;
        const qrY = positions.topOfPayment + BANDS.payment - qrSize - 20;
        
        page.drawImage(qrResult.image, {
          x: qrX,
          y: qrY,
          width: qrSize,
          height: qrSize,
        });
      }
    } catch (error) {
      console.warn('Failed to embed QR code:', error);
    }
  }
}
