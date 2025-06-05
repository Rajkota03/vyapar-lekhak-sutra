import { truncateText } from './textUtils.ts';
import { PAGE, BANDS, FONTS, COLORS, getBandPositions } from './layout.ts'
import { drawRoundedRect, embedImage } from './pdfUtils.ts'
import type { InvoiceData, CompanyData, CompanySettings, DrawTextOptions } from './types.ts'

export async function renderHeader(
  pdfDoc: any,
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions, extraOptions?: any) => void,
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
      // Calculate logo dimensions while maintaining aspect ratio
      const aspectRatio = logoResult.width / logoResult.height
      
      // Limit logo height to 80% of header band height
      const maxHeight = BANDS.header * 0.8
      logoHeight = Math.min(logoResult.height * logoScale, maxHeight)
      logoWidth = logoHeight * aspectRatio
      
      // Ensure logo width doesn't exceed 30% of page inner width
      const maxWidth = PAGE.inner * 0.3
      if (logoWidth > maxWidth) {
        logoWidth = maxWidth
        logoHeight = logoWidth / aspectRatio
      }
      
      // Position logo at left margin with vertical centering
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

  // Company info positioned to the right of logo with proper spacing
  const companyInfoX = PAGE.margin + (logoWidth > 0 ? logoWidth + 20 : 0)
  let companyInfoY = positions.topOfHeader + BANDS.header - 30
  
  // Invoice title - properly pass color as array
  drawText('INVOICE', companyInfoX, companyInfoY, { 
    size: FONTS.h1, 
    bold: true,
    color: COLORS.text.primary
  })
  companyInfoY -= 25
  
  // Company name with truncation to prevent overflow
  const companyName = invoice.companies?.name || 'Square Blue Media'
  const truncatedCompanyName = truncateText(
    companyName,
    PAGE.inner - (logoWidth + 40), // Available width minus logo and padding
    FONTS.h2
  )
  
  drawText(truncatedCompanyName, companyInfoX, companyInfoY, { 
    size: FONTS.h2, 
    bold: true,
    color: COLORS.text.primary
  })
  companyInfoY -= 18
  
  // Company address with better spacing and overflow handling
  const addressLines = [
    invoice.companies?.address_line1 || 'H.NO. 8-3-224/11C/17.E-96,',
    invoice.companies?.address_line2 || 'MADHURA NAGAR,',
    invoice.companies?.address_city_state_zip || 'HYDERABAD TELANGANA 500038'
  ]
  
  addressLines.forEach((line) => {
    const truncatedLine = truncateText(
      line,
      PAGE.inner - (logoWidth + 40), // Available width minus logo and padding
      FONTS.small
    )
    
    drawText(truncatedLine, companyInfoX, companyInfoY, { 
      size: FONTS.small, 
      color: COLORS.text.secondary
    })
    companyInfoY -= 14
  })
  
  // Contact information with overflow handling
  const emailText = invoice.companies?.email || 'squarebluemedia@gmail.com'
  const truncatedEmail = truncateText(
    emailText,
    PAGE.inner - (logoWidth + 40), // Available width minus logo and padding
    FONTS.small
  )
  
  drawText(truncatedEmail, companyInfoX, companyInfoY, { 
    size: FONTS.small, 
    color: COLORS.text.secondary
  })
  companyInfoY -= 14
  
  if (invoice.companies?.gstin) {
    const gstinText = `GSTIN : ${invoice.companies.gstin}`
    const truncatedGstin = truncateText(
      gstinText,
      PAGE.inner - (logoWidth + 40), // Available width minus logo and padding
      FONTS.small
    )
    
    drawText(truncatedGstin, companyInfoX, companyInfoY, { 
      size: FONTS.small, 
      color: COLORS.text.secondary
    })
  }
}
