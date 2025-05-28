
import { PAGE, BANDS, FONTS, COLORS, SPACING, getBandPositions, formatCurrency } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import type { InvoiceData, CompanySettings, DrawTextOptions } from './types.ts'

export function renderTotalsSection(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null
) {
  const positions = getBandPositions()
  const totalsStartY = positions.yTotals + 10
  
  // Payment instructions with improved layout
  drawText('Payment Instructions', PAGE.margin, totalsStartY, { 
    size: FONTS.large, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  
  let paymentY = totalsStartY - 20
  if (companySettings?.payment_note) {
    const paymentLines = companySettings.payment_note.split('\n').slice(0, 6)
    paymentLines.forEach((line: string) => {
      drawText(line.trim(), PAGE.margin, paymentY, { 
        size: FONTS.small, 
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      paymentY -= SPACING.lineHeight
    })
  } else {
    const defaultPayment = [
      'SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,',
      'BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,',
      'PAN NO.FDBPK8518L'
    ]
    defaultPayment.forEach((line) => {
      drawText(line, PAGE.margin, paymentY, { 
        size: FONTS.small, 
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      paymentY -= SPACING.lineHeight
    })
  }
  
  // Enhanced totals section with better formatting
  const totalsX = PAGE.width - PAGE.margin - 200
  let totalsY = totalsStartY
  
  // Totals background
  drawRoundedRect(
    page,
    totalsX - 10,
    totalsY - 90,
    210,
    100,
    COLORS.background.light
  )
  
  // Subtotal
  drawText('Subtotal', totalsX, totalsY, { 
    size: FONTS.base,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  drawText(formatCurrency(Number(invoice.subtotal || 0)), totalsX + 130, totalsY, { 
    size: FONTS.base,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  totalsY -= 18
  
  // Tax calculations with improved spacing
  if (!invoice.use_igst) {
    if (Number(invoice.cgst_pct || 0) > 0) {
      drawText(`CGST (${invoice.cgst_pct || 9}%)`, totalsX, totalsY, { 
        size: FONTS.base,
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      drawText(formatCurrency(Number(invoice.cgst || 0)), totalsX + 130, totalsY, { 
        size: FONTS.base,
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      totalsY -= 18
    }
    
    if (Number(invoice.sgst_pct || 0) > 0) {
      drawText(`SGST (${invoice.sgst_pct || 9}%)`, totalsX, totalsY, { 
        size: FONTS.base,
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      drawText(formatCurrency(Number(invoice.sgst || 0)), totalsX + 130, totalsY, { 
        size: FONTS.base,
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      totalsY -= 18
    }
  } else if (Number(invoice.igst_pct || 0) > 0) {
    drawText(`IGST (${invoice.igst_pct || 18}%)`, totalsX, totalsY, { 
      size: FONTS.base,
      color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
    })
    drawText(formatCurrency(Number(invoice.igst || 0)), totalsX + 130, totalsY, { 
      size: FONTS.base,
      color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
    })
    totalsY -= 18
  }
  
  // Subtotal line
  page.drawLine({
    start: { x: totalsX, y: totalsY + 5 },
    end: { x: totalsX + 180, y: totalsY + 5 },
    thickness: 0.5,
    color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
  })
  
  drawText('Total', totalsX, totalsY, { 
    size: FONTS.base,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  drawText(formatCurrency(Number(invoice.total || 0)), totalsX + 130, totalsY, { 
    size: FONTS.base,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  totalsY -= 25
  
  // Grand Total with enhanced styling
  drawRoundedRect(
    page,
    totalsX - 5,
    totalsY - 5,
    190,
    25,
    COLORS.background.accent
  )
  
  drawText('GRAND TOTAL', totalsX, totalsY, { 
    size: FONTS.large, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  drawText(formatCurrency(Number(invoice.total || 0)), totalsX + 130, totalsY, { 
    size: FONTS.large, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
}
