import { BILL_BAR, COLORS, FONTS, POSITIONS, TEXT_HANDLING } from './layout.ts'
import type { InvoiceData, CompanySettings, DrawTextFunction } from './types.ts'

export function renderBillSection(
  page: any,
  drawText: DrawTextFunction,
  invoice: InvoiceData,
  companySettings: CompanySettings
) {
  // Draw bill-to background rectangle
  page.drawRectangle({
    x: POSITIONS.billTo.x,
    y: POSITIONS.billTo.y,
    width: POSITIONS.billTo.width,
    height: BILL_BAR.height,
    color: rgb(BILL_BAR.bgGray, BILL_BAR.bgGray, BILL_BAR.bgGray),
  })
  
  // Bill To header
  drawText('BILL TO', POSITIONS.billTo.x + BILL_BAR.padding, POSITIONS.billTo.labelY, { 
    size: FONTS.base, 
    bold: true, 
    color: COLORS.text.muted 
  })
  
  // Client name - with overflow handling
  const clientName = invoice.clients?.name || 'Client Name';
  drawText(TEXT_HANDLING.truncateWithEllipsis(clientName, TEXT_HANDLING.maxClientNameLength), 
    POSITIONS.billTo.x + BILL_BAR.padding, 
    POSITIONS.billTo.contentStartY, 
    { 
      size: FONTS.medium, 
      bold: true,
      maxWidth: 200 // Limit width to prevent overflow
    }
  )
  
  // Client address
  let addressY = POSITIONS.billTo.contentStartY - POSITIONS.billTo.lineSpacing;
  if (invoice.clients?.billing_address) {
    const clientAddressLines = invoice.clients.billing_address.split('\n')
    clientAddressLines.forEach((line: string) => {
      drawText(TEXT_HANDLING.truncateWithEllipsis(line, TEXT_HANDLING.maxClientNameLength), 
        POSITIONS.billTo.x + BILL_BAR.padding, 
        addressY, 
        { 
          size: FONTS.base, 
          color: COLORS.text.secondary,
          maxWidth: 250 // Limit width to prevent overflow
        }
      )
      addressY -= POSITIONS.billTo.lineSpacing;
    })
  } else {
    // Default address if none provided
    drawText('C/O RAMANAIDU STUDIOS, FILM NAGAR', 
      POSITIONS.billTo.x + BILL_BAR.padding, 
      addressY, 
      { 
        size: FONTS.base, 
        color: COLORS.text.secondary,
        maxWidth: 250 // Limit width to prevent overflow
      }
    )
    addressY -= POSITIONS.billTo.lineSpacing;
    
    drawText('HYDERABAD TELANGANA 500096', 
      POSITIONS.billTo.x + BILL_BAR.padding, 
      addressY, 
      { 
        size: FONTS.base, 
        color: COLORS.text.secondary,
        maxWidth: 250 // Limit width to prevent overflow
      }
    )
    addressY -= POSITIONS.billTo.lineSpacing;
  }
  
  // Client GSTIN
  if (invoice.clients?.gstin) {
    drawText(`GSTIN : ${invoice.clients.gstin}`, 
      POSITIONS.billTo.x + BILL_BAR.padding, 
      addressY, 
      { 
        size: FONTS.base, 
        color: COLORS.text.secondary,
        maxWidth: 250 // Limit width to prevent overflow
      }
    )
    addressY -= POSITIONS.billTo.lineSpacing;
  }
  
  // Project section
  drawText('PROJECT', 
    POSITIONS.billTo.x + BILL_BAR.padding, 
    addressY, 
    { 
      size: FONTS.base, 
      bold: true, 
      color: COLORS.text.muted
    }
  )
  addressY -= POSITIONS.billTo.lineSpacing;
  
  drawText('CHEEKATLO', 
    POSITIONS.billTo.x + BILL_BAR.padding, 
    addressY, 
    { 
      size: FONTS.base,
      maxWidth: 250 // Limit width to prevent overflow
    }
  )
  
  // Invoice details on the right side of bill-to section
  // Calculate positions to ensure proper alignment
  const detailsStartX = POSITIONS.billTo.x + POSITIONS.billTo.width - BILL_BAR.detailsWidth - BILL_BAR.detailsValueWidth;
  const detailsValueX = POSITIONS.billTo.x + POSITIONS.billTo.width - BILL_BAR.detailsValueWidth - BILL_BAR.padding;
  let detailsY = POSITIONS.billTo.contentStartY + 20;
  
  // Invoice number
  drawText('Invoice #', detailsStartX, detailsY, { size: FONTS.base, bold: true })
  const invoiceCode = invoice.invoice_code || invoice.number || '25-26/02';
  drawText(TEXT_HANDLING.truncateWithEllipsis(invoiceCode, TEXT_HANDLING.maxInvoiceCodeLength), 
    detailsValueX, 
    detailsY, 
    { 
      size: FONTS.base,
      maxWidth: BILL_BAR.detailsValueWidth - 10 // Prevent overflow
    }
  )
  detailsY -= 15;
  
  // Invoice date
  drawText('Date', detailsStartX, detailsY, { size: FONTS.base, bold: true })
  const formattedDate = new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  drawText(formattedDate, 
    detailsValueX, 
    detailsY, 
    { 
      size: FONTS.base,
      maxWidth: BILL_BAR.detailsValueWidth - 10 // Prevent overflow
    }
  )
  detailsY -= 15;
  
  // SAC/HSN code
  drawText('SAC/HSN', detailsStartX, detailsY, { size: FONTS.base, bold: true })
  const sacHsn = companySettings?.sac_hsn || '998387';
  drawText(sacHsn, 
    detailsValueX, 
    detailsY, 
    { 
      size: FONTS.base,
      maxWidth: BILL_BAR.detailsValueWidth - 10 // Prevent overflow
    }
  )
}

// Helper function to create RGB color
function rgb(r: number, g: number, b: number) {
  return { r, g, b };
}
