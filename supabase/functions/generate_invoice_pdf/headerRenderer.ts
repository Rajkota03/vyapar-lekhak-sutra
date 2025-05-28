
import { PAGE, BANDS, FONTS, COLORS, getBandPositions } from './layout.ts'
import { drawRoundedRect, embedImage } from './pdfUtils.ts'
import type { InvoiceData, CompanyData, CompanySettings, DrawTextOptions } from './types.ts'

export async function renderHeader(
  pdfDoc: any,
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions) => void,
  invoice: InvoiceData,
  companySettings: CompanySettings | null
) {
  const positions = getBandPositions()
  let headerY = positions.topOfHeader + BANDS.header - 25
  
  // Logo positioning with improved scaling and layout
  const logoUrl = companySettings?.logo_url || invoice.companies?.logo_url
  const logoScale = Math.min(Number(companySettings?.logo_scale || 0.25), 1.0)
  const maxLogoSize = BANDS.header - 30
  
  console.log('Logo URL from settings:', companySettings?.logo_url)
  console.log('Logo URL from company:', invoice.companies?.logo_url) 
  console.log('Final logo URL:', logoUrl, 'Logo scale:', logoScale)
  
  let logoWidth = 0
  let logoHeight = 0
  
  if (logoUrl) {
    const logoResult = await embedImage(pdfDoc, logoUrl)
    if (logoResult) {
      logoWidth = Math.min(logoResult.width * logoScale, maxLogoSize)
      logoHeight = Math.min(logoResult.height * logoScale, maxLogoSize)
      
      // Center logo vertically in header band
      const logoY = positions.topOfHeader + (BANDS.header - logoHeight) / 2
      
      page.drawImage(logoResult.image, {
        x: PAGE.margin,
        y: logoY,
        width: logoWidth,
        height: logoHeight,
      })
      console.log('Logo embedded with dimensions:', logoWidth, 'x', logoHeight)
    }
  } else {
    console.log('No logo URL found, skipping logo embedding')
  }

  // Company info positioned better relative to logo
  const companyInfoX = logoWidth > 0 ? PAGE.margin + logoWidth + 30 : PAGE.width - PAGE.margin - 220
  let companyInfoY = headerY
  
  // Invoice title - properly pass color as array
  drawText('INVOICE', companyInfoX, companyInfoY, { 
    size: FONTS.h1, 
    bold: true,
    color: COLORS.text.primary
  })
  companyInfoY -= 25
  
  // Company name
  drawText(invoice.companies?.name || 'Square Blue Media', companyInfoX, companyInfoY, { 
    size: FONTS.h2, 
    bold: true,
    color: COLORS.text.primary
  })
  companyInfoY -= 18
  
  // Company address with better spacing
  const addressLines = [
    'H.NO. 8-3-224/11C/17.E-96,',
    'MADHURA NAGAR,',
    'HYDERABAD TELANGANA 500038'
  ]
  
  addressLines.forEach((line) => {
    drawText(line, companyInfoX, companyInfoY, { 
      size: FONTS.small, 
      color: COLORS.text.secondary
    })
    companyInfoY -= 14
  })
  
  // Contact information
  drawText('squarebluemedia@gmail.com', companyInfoX, companyInfoY, { 
    size: FONTS.small, 
    color: COLORS.text.secondary
  })
  companyInfoY -= 14
  
  if (invoice.companies?.gstin) {
    drawText(`GSTIN : ${invoice.companies.gstin}`, companyInfoX, companyInfoY, { 
      size: FONTS.small, 
      color: COLORS.text.secondary
    })
  }
}
