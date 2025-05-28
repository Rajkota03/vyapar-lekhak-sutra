
import { PAGE, BANDS, FONTS, COLORS, SIGNATURE, SPACING, getBandPositions, formatDate } from './layout.ts'
import { embedImage } from './pdfUtils.ts'
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import type { InvoiceData, CompanySettings, DrawTextOptions } from './types.ts'

export async function renderFooter(
  pdfDoc: any,
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null
) {
  const positions = getBandPositions()
  
 /* // Enhanced footer with better spacing
  page.drawLine({
    start: { x: PAGE.margin, y: positions.footerRuleY },
    end: { x: PAGE.width - PAGE.margin, y: positions.footerRuleY },
    thickness: 1,
    color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
  })*/
  
  const footerY = PAGE.margin + 70
  drawText('Thank you for your business!', PAGE.margin, footerY, { 
    size: FONTS.medium,
    color: COLORS.text.primary
  })
  drawText(invoice.companies?.name || 'Square Blue Media', PAGE.margin, footerY - 18, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  })
  
  // Enhanced signature section
  if (invoice.show_my_signature || invoice.require_client_signature) {
    const signatureUrl = companySettings?.signature_url
    if (signatureUrl) {
      const signatureResult = await embedImage(pdfDoc, signatureUrl)
      if (signatureResult) {
        page.drawImage(signatureResult.image, {
          x: PAGE.margin,
          y: PAGE.margin + 25,
          width: SIGNATURE.width,
          height: SIGNATURE.height,
        })
      }
    }
    
    // Signature line with better styling
    page.drawLine({
      start: { x: PAGE.margin, y: PAGE.margin + 20 },
      end: { x: PAGE.margin + SIGNATURE.lineWidth, y: PAGE.margin + 20 },
      thickness: 1,
      color: rgb(COLORS.lines.dark[0], COLORS.lines.dark[1], COLORS.lines.dark[2]),
    })
    
    drawText(formatDate(invoice.issue_date), PAGE.margin, PAGE.margin + 8, { 
      size: FONTS.small,
      color: COLORS.text.muted
    })
  }
}
