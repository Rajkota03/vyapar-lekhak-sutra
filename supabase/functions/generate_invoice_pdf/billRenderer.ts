
import { PAGE, BANDS, FONTS, COLORS, SPACING, getBandPositions, formatDate } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import type { InvoiceData, CompanySettings, DrawTextOptions } from './types.ts'

export function renderBillSection(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null
) {
  const positions = getBandPositions()
  
  // Enhanced bill-to background with rounded corners effect
  drawRoundedRect(
    page,
    PAGE.margin,
    positions.topOfBill,
    PAGE.inner,
    BANDS.bill,
    COLORS.background.light
  )
  
  let billY = positions.topOfBill + BANDS.bill - 20
  
  // Bill To section with better typography
  drawText('BILL TO', PAGE.margin + 25, billY, { 
    size: FONTS.medium, 
    bold: true, 
    color: { r: COLORS.text.muted[0], g: COLORS.text.muted[1], b: COLORS.text.muted[2] }
  })
  billY -= 20
  
  drawText(invoice.clients?.name || 'Client Name', PAGE.margin + 25, billY, { 
    size: FONTS.large, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  billY -= 16
  
  // Client address with improved formatting
  if (invoice.clients?.billing_address) {
    const clientAddressLines = invoice.clients.billing_address.split('\n').slice(0, 3)
    clientAddressLines.forEach((line: string) => {
      drawText(line.trim(), PAGE.margin + 25, billY, { 
        size: FONTS.base, 
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      billY -= SPACING.lineHeight
    })
  } else {
    const defaultAddress = [
      'C/O RAMANAIDU STUDIOS, FILM NAGAR',
      'HYDERABAD TELANGANA 500096'
    ]
    defaultAddress.forEach((line) => {
      drawText(line, PAGE.margin + 25, billY, { 
        size: FONTS.base, 
        color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
      })
      billY -= SPACING.lineHeight
    })
  }
  
  if (invoice.clients?.gstin && billY > positions.topOfBill + 15) {
    drawText(`GSTIN : ${invoice.clients.gstin}`, PAGE.margin + 25, billY, { 
      size: FONTS.base, 
      color: { r: COLORS.text.secondary[0], g: COLORS.text.secondary[1], b: COLORS.text.secondary[2] }
    })
  }
  
  // Invoice details box with improved layout
  const detailsBoxX = PAGE.width - PAGE.margin - 180
  const detailsBoxY = positions.topOfBill + 15
  const detailsBoxWidth = 160
  const detailsBoxHeight = BANDS.bill - 30
  
  // Details background
  drawRoundedRect(
    page,
    detailsBoxX,
    detailsBoxY,
    detailsBoxWidth,
    detailsBoxHeight,
    COLORS.background.medium
  )
  
  let detailsY = positions.topOfBill + BANDS.bill - 25
  const labelX = detailsBoxX + 15
  const valueX = detailsBoxX + detailsBoxWidth - 15
  
  // Invoice details with better alignment
  const invoiceDetails = [
    { label: 'Invoice #', value: invoice.invoice_code || '25-26/02' },
    { label: 'Date', value: formatDate(invoice.issue_date) },
    { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' }
  ]
  
  invoiceDetails.forEach(detail => {
    drawText(detail.label, labelX, detailsY, { 
      size: FONTS.base, 
      bold: true,
      color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
    })
    drawText(detail.value, valueX, detailsY, { 
      size: FONTS.base,
      color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
    }, { textAlign: 'right' })
    detailsY -= 18
  })
}
