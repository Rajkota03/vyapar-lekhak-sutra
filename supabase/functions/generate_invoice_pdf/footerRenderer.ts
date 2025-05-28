
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
import { embedImage } from './pdfUtils.ts';
import type { InvoiceData, CompanySettings, DrawTextOptions } from './types.ts';

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
  const positions = getBandPositions();
  let cursor = PAGE.margin + BANDS.footer - 20;

  /* ─────────── SIGNATURE SECTION ─────────── */
  if (invoice.show_my_signature && companySettings?.signature_url) {
    try {
      const signatureResult = await embedImage(pdfDoc, companySettings.signature_url);
      if (signatureResult) {
        const sigWidth = 80;
        const sigHeight = 40;
        const sigX = PAGE.margin;
        const sigY = cursor - sigHeight;
        
        page.drawImage(signatureResult.image, {
          x: sigX,
          y: sigY,
          width: sigWidth,
          height: sigHeight,
        });
        
        drawText('Authorized Signature', sigX, sigY - 10, {
          size: FONTS.small,
          color: COLORS.text.secondary,
        });
      }
    } catch (error) {
      console.warn('Failed to embed signature:', error);
    }
  }

  /* ─────────── CLIENT SIGNATURE (if required) ─────────── */
  if (invoice.require_client_signature) {
    const clientSigX = PAGE.width - PAGE.margin - 120;
    const clientSigY = cursor - 40;
    
    // Draw signature line
    page.drawLine({
      start: { x: clientSigX, y: clientSigY },
      end: { x: clientSigX + 100, y: clientSigY },
      thickness: 1,
      color: { r: COLORS.lines.medium[0], g: COLORS.lines.medium[1], b: COLORS.lines.medium[2] },
    });
    
    drawText('Client Signature', clientSigX, clientSigY - 10, {
      size: FONTS.small,
      color: COLORS.text.secondary,
    });
  }
}
