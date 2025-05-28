
import { PAGE, BANDS, FONTS, COLORS, SPACING, getBandPositions, formatDate } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import type { InvoiceData, CompanySettings, DrawTextOptions } from './types.ts'

export function renderBillSection(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions, extraOptions?: any) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null
) {
  const positions = getBandPositions()
  
  // Single unified grey background for the entire bill section
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
    color: COLORS.text.muted
  })
  billY -= 20
  
  drawText(invoice.clients?.name || 'Client Name', PAGE.margin + 25, billY, { 
    size: FONTS.large, 
    bold: true,
    color: COLORS.text.primary
  })
  billY -= 16
  
  // Client address with improved formatting
  if (invoice.clients?.billing_address) {
    const clientAddressLines = invoice.clients.billing_address.split('\n').slice(0, 3)
    clientAddressLines.forEach((line: string) => {
      drawText(line.trim(), PAGE.margin + 25, billY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary
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
        color: COLORS.text.secondary
      })
      billY -= SPACING.lineHeight
    })
  }
  
  if (invoice.clients?.gstin && billY > positions.topOfBill + 15) {
    drawText(`GSTIN : ${invoice.clients.gstin}`, PAGE.margin + 25, billY, { 
      size: FONTS.base, 
      color: COLORS.text.secondary
    })
  }
  
  // Invoice details section - positioned within the same grey box
  const detailsStartY = positions.topOfBill + BANDS.bill - 25
  const labelX = PAGE.width - PAGE.margin - 220  // Start further left
  const valueX = PAGE.width - PAGE.margin - 25   // End with proper margin
  
  let detailsY = detailsStartY
  
  // Invoice details with better spacing and no separate background
  const invoiceDetails = [
    { label: 'Invoice #', value: invoice.invoice_code || '25-26/02' },
    { label: 'Date', value: formatDate(invoice.issue_date) },
    { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' }
  ]
  
  invoiceDetails.forEach(detail => {
    drawText(detail.label, labelX, detailsY, { 
      size: FONTS.base, 
      bold: true,
      color: COLORS.text.primary
    })
    drawText(detail.value, valueX, detailsY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'right' })
    detailsY -= 18  // Consistent spacing
  })
}
