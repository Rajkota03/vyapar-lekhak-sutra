
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
  
  let billY = positions.topOfBill + BANDS.bill - 25
  
  // Bill To section with better typography
  drawText('BILL TO', PAGE.margin + 20, billY, { 
    size: FONTS.medium, 
    bold: true, 
    color: COLORS.text.muted
  })
  billY -= 18
  
  drawText(invoice.clients?.name || 'Client Name', PAGE.margin + 20, billY, { 
    size: FONTS.large, 
    bold: true,
    color: COLORS.text.primary
  })
  billY -= 15
  
  // Client address with improved formatting
  if (invoice.clients?.billing_address) {
    const clientAddressLines = invoice.clients.billing_address.split('\n').slice(0, 3)
    clientAddressLines.forEach((line: string) => {
      if (billY > positions.topOfBill + 15) {
        drawText(line.trim(), PAGE.margin + 20, billY, { 
          size: FONTS.base, 
          color: COLORS.text.secondary
        })
        billY -= SPACING.lineHeight
      }
    })
  } else {
    const defaultAddress = [
      'C/O RAMANAIDU STUDIOS, FILM NAGAR',
      'HYDERABAD TELANGANA 500096'
    ]
    defaultAddress.forEach((line) => {
      if (billY > positions.topOfBill + 15) {
        drawText(line, PAGE.margin + 20, billY, { 
          size: FONTS.base, 
          color: COLORS.text.secondary
        })
        billY -= SPACING.lineHeight
      }
    })
  }
  
  if (invoice.clients?.gstin && billY > positions.topOfBill + 15) {
    drawText(`GSTIN : ${invoice.clients.gstin}`, PAGE.margin + 20, billY, { 
      size: FONTS.base, 
      color: COLORS.text.secondary
    })
  }
  
  // Invoice details section - properly positioned with better spacing
  const detailsBox = {
    x: PAGE.width - PAGE.margin - 150,
    y: positions.topOfBill + 20,
    width: 130,
    height: 60
  }
  
  // Background for details box
  drawRoundedRect(
    page,
    detailsBox.x,
    detailsBox.y,
    detailsBox.width,
    detailsBox.height,
    COLORS.background.medium
  )
  
  let detailsY = detailsBox.y + detailsBox.height - 15
  
  // Invoice details with consistent spacing
  const invoiceDetails = [
    { label: 'Invoice #', value: invoice.invoice_code || '25-26/02' },
    { label: 'Date', value: formatDate(invoice.issue_date) },
    { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' }
  ]
  
  invoiceDetails.forEach(detail => {
    if (detailsY > detailsBox.y + 10) {
      drawText(detail.label, detailsBox.x + 10, detailsY, { 
        size: FONTS.small, 
        bold: true,
        color: COLORS.text.primary
      })
      drawText(detail.value, detailsBox.x + detailsBox.width - 10, detailsY, { 
        size: FONTS.small,
        color: COLORS.text.primary
      }, { textAlign: 'right' })
      detailsY -= 16
    }
  })
}
