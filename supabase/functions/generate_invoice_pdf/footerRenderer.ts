/*  footerRenderer.ts
 *  – renders the footer section of the invoice
 */

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
  let cursor = PAGE.margin + BANDS.footer;

  /* ─────────── PAYMENT INSTRUCTIONS SECTION ─────────── */
  // Payment instructions box with light background
  const paymentBoxHeight = 60;
  drawRoundedRect(
    page,
    PAGE.margin,
    cursor,
    PAGE.inner * 0.6, // 60% of inner width
    paymentBoxHeight,
    COLORS.background.light,
    COLORS.lines.light
  );
  
  // Payment instructions title
  drawText('Payment Instructions', PAGE.margin + 15, cursor + paymentBoxHeight - 20, {
    size: FONTS.medium,
    bold: true,
    color: COLORS.text.primary,
  });
  
  // Payment instructions content
  const paymentText = companySettings?.payment_instructions || 
    "SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK, BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348, PAN NO.FDBPK8518L";
  
  // Split payment text into multiple lines if needed
  const paymentLines = paymentText.split(',');
  let paymentY = cursor + paymentBoxHeight - 40;
  
  paymentLines.forEach((line, index) => {
    if (index < 3) { // Limit to 3 lines
      drawText(line.trim(), PAGE.margin + 15, paymentY, {
        size: FONTS.small,
        color: COLORS.text.secondary,
      });
      paymentY -= SPACING.lineHeight;
    }
  });

  /* ─────────── SIGNATURE SECTION ─────────── */
  const signatureY = cursor - 20; // Position below payment instructions
  
  // Company signature (left side)
  if (invoice.show_my_signature && companySettings?.signature_url) {
    try {
      const signatureResult = await embedImage(pdfDoc, companySettings.signature_url);
      if (signatureResult) {
        const sigWidth = 100;
        const sigHeight = 50;
        const sigX = PAGE.margin;
        const sigY = signatureY - sigHeight;
        
        page.drawImage(signatureResult.image, {
          x: sigX,
          y: sigY,
          width: sigWidth,
          height: sigHeight,
        });
        
        // Signature line
        page.drawLine({
          start: { x: sigX, y: sigY - 5 },
          end: { x: sigX + 120, y: sigY - 5 },
          thickness: 1,
          color: { r: COLORS.lines.medium[0], g: COLORS.lines.medium[1], b: COLORS.lines.medium[2] },
        });
        
        // Signature label
        drawText('Authorized Signature', sigX, sigY - 20, {
          size: FONTS.small,
          color: COLORS.text.secondary,
        });
        
        // Date below signature
        drawText(formatDate(invoice.issue_date), sigX, sigY - 35, {
          size: FONTS.small,
          color: COLORS.text.secondary,
        });
      }
    } catch (error) {
      console.warn('Failed to embed signature:', error);
      
      // Fallback: just draw the signature line
      const sigX = PAGE.margin;
      const sigY = signatureY - 30;
      
      page.drawLine({
        start: { x: sigX, y: sigY },
        end: { x: sigX + 120, y: sigY },
        thickness: 1,
        color: { r: COLORS.lines.medium[0], g: COLORS.lines.medium[1], b: COLORS.lines.medium[2] },
      });
      
      drawText('Authorized Signature', sigX, sigY - 15, {
        size: FONTS.small,
        color: COLORS.text.secondary,
      });
      
      drawText(formatDate(invoice.issue_date), sigX, sigY - 30, {
        size: FONTS.small,
        color: COLORS.text.secondary,
      });
    }
  }

  /* ─────────── CLIENT SIGNATURE (if required) ─────────── */
  if (invoice.require_client_signature) {
    const clientSigX = PAGE.width - PAGE.margin - 120;
    const clientSigY = signatureY - 30;
    
    // Draw signature line
    page.drawLine({
      start: { x: clientSigX, y: clientSigY },
      end: { x: clientSigX + 120, y: clientSigY },
      thickness: 1,
      color: { r: COLORS.lines.medium[0], g: COLORS.lines.medium[1], b: COLORS.lines.medium[2] },
    });
    
    // Signature label
    drawText('Client Signature', clientSigX, clientSigY - 15, {
      size: FONTS.small,
      color: COLORS.text.secondary,
    });
    
    // Date field
    drawText('Date: ________________', clientSigX, clientSigY - 30, {
      size: FONTS.small,
      color: COLORS.text.secondary,
    });
  }
  
  /* ─────────── THANK YOU MESSAGE ─────────── */
  drawText('Thank you for your business!', PAGE.width / 2, PAGE.margin + 15, {
    size: FONTS.medium,
    color: COLORS.text.primary,
  }, { textAlign: 'center' });
}
