
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import fontkit from 'https://esm.sh/@pdf-lib/fontkit@1.1.1'
import { 
  PAGE, 
  BANDS, 
  TABLE, 
  FONTS, 
  COLORS, 
  SIGNATURE, 
  SPACING, 
  getBandPositions,
  formatCurrency,
  formatDate
} from './layout.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { invoice_id, preview = false, force_regenerate = false, timestamp } = await req.json()
    
    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'invoice_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating PDF for invoice:', invoice_id, 'Preview mode:', preview, 'Force regenerate:', force_regenerate, 'Timestamp:', timestamp)

    // Fetch invoice with related data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        companies (*),
        clients (*)
      `)
      .eq('id', invoice_id)
      .maybeSingle()

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invoice' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch company settings for logo and signature
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', invoice.company_id)
      .maybeSingle()

    // Fetch invoice line items
    const { data: lineItems, error: linesError } = await supabase
      .from('invoice_lines')
      .select(`
        *,
        items (*)
      `)
      .eq('invoice_id', invoice_id)

    if (linesError) {
      console.error('Error fetching line items:', linesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invoice line items' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine if we should regenerate PDF
    let shouldRegenerate = force_regenerate || preview
    
    // Only check cache if NOT forcing regeneration and NOT preview
    if (!force_regenerate && !preview) {
      console.log('Checking if PDF exists and if regeneration is needed...')
      
      const filePath = `company_${invoice.company_id}/${invoice.invoice_code}.pdf`
      
      try {
        const { data: existingFile } = await supabase.storage
          .from('invoices')
          .list(`company_${invoice.company_id}`, {
            search: `${invoice.invoice_code}.pdf`
          })
        
        if (existingFile && existingFile.length > 0) {
          const pdfCreatedAt = new Date(existingFile[0].created_at)
          const settingsUpdatedAt = companySettings?.updated_at ? new Date(companySettings.updated_at) : new Date(0)
          
          console.log('PDF created at:', pdfCreatedAt.toISOString())
          console.log('Settings updated at:', settingsUpdatedAt.toISOString())
          
          // Regenerate if settings were updated after PDF was created
          if (settingsUpdatedAt > pdfCreatedAt) {
            console.log('Company settings updated after PDF creation, regenerating...')
            shouldRegenerate = true
          } else {
            console.log('PDF exists and is up to date, using existing version')
            const { data } = supabase.storage
              .from('invoices')
              .getPublicUrl(filePath)
            
            return new Response(
              JSON.stringify({ pdf_url: data.publicUrl }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } else {
          console.log('No existing PDF found, will generate new one')
          shouldRegenerate = true
        }
      } catch (error) {
        console.log('Error checking existing PDF, will regenerate:', error)
        shouldRegenerate = true
      }
    }

    if (force_regenerate) {
      console.log('Force regeneration requested, bypassing all cache checks')
      shouldRegenerate = true
    }

    // Create PDF using pdf-lib
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)
    
    const page = pdfDoc.addPage([PAGE.width, PAGE.height])
    
    // Load fonts with proper Unicode support
    let unicodeFont
    let fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    try {
      const fontUrl = 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf'
      const fontResponse = await fetch(fontUrl)
      if (fontResponse.ok) {
        const fontBytes = await fontResponse.arrayBuffer()
        unicodeFont = await pdfDoc.embedFont(new Uint8Array(fontBytes))
        console.log('Unicode font loaded successfully')
      }
    } catch (fontError) {
      console.warn('Failed to load Unicode font, using fallback:', fontError)
      unicodeFont = null
    }
    
    // Helper function to draw text with Unicode support and better spacing
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      const useUnicodeFont = unicodeFont && text.includes('₹')
      const font = useUnicodeFont ? unicodeFont : (options.bold ? boldFont : fallbackFont)
      const displayText = useUnicodeFont ? text : text.replace(/₹/g, 'Rs.')
      
      page.drawText(displayText, {
        x,
        y,
        size: options.size || FONTS.base,
        font,
        color: options.color || rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]),
        lineHeight: options.lineHeight || SPACING.lineHeight,
        ...options
      })
    }
    
    // Helper function to draw a rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, color: number[], radius = 4) => {
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(color[0], color[1], color[2]),
      })
    }
    
    // Get band positions
    const positions = getBandPositions()
    
    // ===== HEADER BAND =====
    let headerY = positions.topOfHeader + BANDS.header - 25
    
    // Logo positioning with improved scaling and layout
    const logoUrl = companySettings?.logo_url || invoice.companies?.logo_url
    const logoScale = Math.min(Number(companySettings?.logo_scale || 0.25), 1.0)
    const maxLogoSize = BANDS.header - 30 // More space around logo
    
    console.log('Logo URL from settings:', companySettings?.logo_url)
    console.log('Logo URL from company:', invoice.companies?.logo_url) 
    console.log('Final logo URL:', logoUrl, 'Logo scale:', logoScale)
    
    let logoWidth = 0
    let logoHeight = 0
    
    if (logoUrl) {
      try {
        console.log('Loading logo with scale:', logoScale)
        const logoResponse = await fetch(logoUrl)
        if (logoResponse.ok) {
          const logoBytes = await logoResponse.arrayBuffer()
          let logo
          
          const contentType = logoResponse.headers.get('content-type') || ''
          if (contentType.includes('png') || logoUrl.toLowerCase().includes('.png')) {
            logo = await pdfDoc.embedPng(new Uint8Array(logoBytes))
          } else {
            logo = await pdfDoc.embedJpg(new Uint8Array(logoBytes))
          }
          
          const originalDims = logo.size()
          logoWidth = Math.min(originalDims.width * logoScale, maxLogoSize)
          logoHeight = Math.min(originalDims.height * logoScale, maxLogoSize)
          
          // Center logo vertically in header band
          const logoY = positions.topOfHeader + (BANDS.header - logoHeight) / 2
          
          page.drawImage(logo, {
            x: PAGE.margin,
            y: logoY,
            width: logoWidth,
            height: logoHeight,
          })
          console.log('Logo embedded with dimensions:', logoWidth, 'x', logoHeight)
        } else {
          console.log('Failed to fetch logo, HTTP status:', logoResponse.status)
        }
      } catch (logoError) {
        console.warn('Failed to embed logo:', logoError)
      }
    } else {
      console.log('No logo URL found, skipping logo embedding')
    }

    // Company info positioned better relative to logo
    const companyInfoX = logoWidth > 0 ? PAGE.margin + logoWidth + 30 : PAGE.width - PAGE.margin - 220
    let companyInfoY = headerY
    
    // Invoice title
    drawText('INVOICE', companyInfoX, companyInfoY, { 
      size: FONTS.h1, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    companyInfoY -= 25
    
    // Company name
    drawText(invoice.companies?.name || 'Square Blue Media', companyInfoX, companyInfoY, { 
      size: FONTS.h2, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
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
        color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
      })
      companyInfoY -= SPACING.lineHeight
    })
    
    // Contact information
    drawText('squarebluemedia@gmail.com', companyInfoX, companyInfoY, { 
      size: FONTS.small, 
      color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
    })
    companyInfoY -= SPACING.lineHeight
    
    if (invoice.companies?.gstin) {
      drawText(`GSTIN : ${invoice.companies.gstin}`, companyInfoX, companyInfoY, { 
        size: FONTS.small, 
        color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
      })
    }
    
    // ===== BILL BAR BAND =====
    // Enhanced bill-to background with rounded corners effect
    drawRoundedRect(
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
      color: rgb(COLORS.text.muted[0], COLORS.text.muted[1], COLORS.text.muted[2]) 
    })
    billY -= 20
    
    drawText(invoice.clients?.name || 'Client Name', PAGE.margin + 25, billY, { 
      size: FONTS.large, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    billY -= 16
    
    // Client address with improved formatting
    if (invoice.clients?.billing_address) {
      const clientAddressLines = invoice.clients.billing_address.split('\n').slice(0, 3)
      clientAddressLines.forEach((line: string) => {
        drawText(line.trim(), PAGE.margin + 25, billY, { 
          size: FONTS.base, 
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
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
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
        })
        billY -= SPACING.lineHeight
      })
    }
    
    if (invoice.clients?.gstin && billY > positions.topOfBill + 15) {
      drawText(`GSTIN : ${invoice.clients.gstin}`, PAGE.margin + 25, billY, { 
        size: FONTS.base, 
        color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
      })
    }
    
    // Invoice details box with improved layout
    const detailsBoxX = PAGE.width - PAGE.margin - 180
    const detailsBoxY = positions.topOfBill + 15
    const detailsBoxWidth = 160
    const detailsBoxHeight = BANDS.bill - 30
    
    // Details background
    drawRoundedRect(
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
      { label: 'Invoice #', value: invoice.invoice_code || invoice.number || '25-26/02' },
      { label: 'Date', value: formatDate(invoice.issue_date) },
      { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' }
    ]
    
    invoiceDetails.forEach(detail => {
      drawText(detail.label, labelX, detailsY, { 
        size: FONTS.base, 
        bold: true,
        color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
      })
      drawText(detail.value, valueX, detailsY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
      }, { textAlign: 'right' })
      detailsY -= 18
    })
    
    // ===== ITEMS TABLE BAND =====
    let tableY = positions.topOfBill - SPACING.sectionGap
    
    // Enhanced table headers with better spacing
    const colWidths = TABLE.cols.map(ratio => PAGE.inner * ratio)
    let colX = PAGE.margin
    
    // Table header background
    drawRoundedRect(
      PAGE.margin,
      tableY - TABLE.headerH + 5,
      PAGE.inner,
      TABLE.headerH,
      COLORS.background.accent
    )
    
    // Header text with improved positioning
    const headerY = tableY - 8
    drawText('EQUIPMENT', colX + TABLE.padding, headerY, { 
      size: FONTS.medium, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    colX += colWidths[0]
    
    drawText('PKG', colX + TABLE.padding, headerY, { 
      size: FONTS.medium, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    colX += colWidths[1]
    
    drawText('Rate', colX + TABLE.padding, headerY, { 
      size: FONTS.medium, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    colX += colWidths[2]
    
    drawText('Amount', colX + TABLE.padding, headerY, { 
      size: FONTS.medium, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    
    tableY -= TABLE.headerH + SPACING.itemSpacing
    
    // Table rows with improved formatting
    let rowIndex = 0
    let isAlternateRow = false
    
    while (tableY - TABLE.rowH > positions.bottomOfTable && rowIndex < (lineItems?.length || 0)) {
      const item = lineItems![rowIndex]
      
      // Alternate row background
      if (isAlternateRow) {
        drawRoundedRect(
          PAGE.margin,
          tableY - TABLE.rowH + 2,
          PAGE.inner,
          TABLE.rowH,
          [0.98, 0.98, 0.98]
        )
      }
      
      colX = PAGE.margin
      
      // Equipment description
      drawText(item.description, colX + TABLE.padding, tableY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
      })
      colX += colWidths[0]
      
      // Package quantity (centered)
      const qtyX = colX + (colWidths[1] / 2) - 10
      drawText(item.qty.toString(), qtyX, tableY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
      })
      colX += colWidths[1]
      
      // Rate (right-aligned)
      const rateText = formatCurrency(Number(item.unit_price))
      const rateX = colX + colWidths[2] - TABLE.padding - 40
      drawText(rateText, rateX, tableY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
      })
      colX += colWidths[2]
      
      // Amount (right-aligned)
      const amountText = formatCurrency(Number(item.amount))
      const amountX = colX + colWidths[3] - TABLE.padding - 40
      drawText(amountText, amountX, tableY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
      })
      
      // Row separator line
      if (rowIndex < (lineItems?.length || 0) - 1) {
        page.drawLine({
          start: { x: PAGE.margin + 10, y: tableY - TABLE.rowH + 2 },
          end: { x: PAGE.width - PAGE.margin - 10, y: tableY - TABLE.rowH + 2 },
          thickness: 0.5,
          color: rgb(COLORS.lines.light[0], COLORS.lines.light[1], COLORS.lines.light[2]),
        })
      }
      
      tableY -= TABLE.rowH
      rowIndex++
      isAlternateRow = !isAlternateRow
    }
    
    // ===== TOTALS BAND =====
    const totalsStartY = positions.yTotals + 10
    
    // Payment instructions with improved layout
    drawText('Payment Instructions', PAGE.margin, totalsStartY, { 
      size: FONTS.large, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    
    let paymentY = totalsStartY - 20
    if (companySettings?.payment_note) {
      const paymentLines = companySettings.payment_note.split('\n').slice(0, 6)
      paymentLines.forEach((line: string) => {
        drawText(line.trim(), PAGE.margin, paymentY, { 
          size: FONTS.small, 
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
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
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) 
        })
        paymentY -= SPACING.lineHeight
      })
    }
    
    // Enhanced totals section with better formatting
    const totalsX = PAGE.width - PAGE.margin - 200
    let totalsY = totalsStartY
    
    // Totals background
    drawRoundedRect(
      totalsX - 10,
      totalsY - 90,
      210,
      100,
      COLORS.background.light
    )
    
    // Subtotal
    drawText('Subtotal', totalsX, totalsY, { 
      size: FONTS.base,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    drawText(formatCurrency(Number(invoice.subtotal || 0)), totalsX + 130, totalsY, { 
      size: FONTS.base,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    totalsY -= 18
    
    // Tax calculations with improved spacing
    if (!invoice.use_igst) {
      if (Number(invoice.cgst_pct || 0) > 0) {
        drawText(`CGST (${invoice.cgst_pct || 9}%)`, totalsX, totalsY, { 
          size: FONTS.base,
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2])
        })
        drawText(formatCurrency(Number(invoice.cgst || 0)), totalsX + 130, totalsY, { 
          size: FONTS.base,
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2])
        })
        totalsY -= 18
      }
      
      if (Number(invoice.sgst_pct || 0) > 0) {
        drawText(`SGST (${invoice.sgst_pct || 9}%)`, totalsX, totalsY, { 
          size: FONTS.base,
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2])
        })
        drawText(formatCurrency(Number(invoice.sgst || 0)), totalsX + 130, totalsY, { 
          size: FONTS.base,
          color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2])
        })
        totalsY -= 18
      }
    } else if (Number(invoice.igst_pct || 0) > 0) {
      drawText(`IGST (${invoice.igst_pct || 18}%)`, totalsX, totalsY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2])
      })
      drawText(formatCurrency(Number(invoice.igst || 0)), totalsX + 130, totalsY, { 
        size: FONTS.base,
        color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2])
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
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    drawText(formatCurrency(Number(invoice.total || 0)), totalsX + 130, totalsY, { 
      size: FONTS.base,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    totalsY -= 25
    
    // Grand Total with enhanced styling
    drawRoundedRect(
      totalsX - 5,
      totalsY - 5,
      190,
      25,
      COLORS.background.accent
    )
    
    drawText('GRAND TOTAL', totalsX, totalsY, { 
      size: FONTS.large, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    drawText(formatCurrency(Number(invoice.total || 0)), totalsX + 130, totalsY, { 
      size: FONTS.large, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    
    // ===== FOOTER BAND =====
    // Enhanced footer with better spacing
    page.drawLine({
      start: { x: PAGE.margin, y: positions.footerRuleY },
      end: { x: PAGE.width - PAGE.margin, y: positions.footerRuleY },
      thickness: 1,
      color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
    })
    
    const footerY = PAGE.margin + 70
    drawText('Thank you for your business!', PAGE.margin, footerY, { 
      size: FONTS.medium,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    drawText(invoice.companies?.name || 'Square Blue Media', PAGE.margin, footerY - 18, { 
      size: FONTS.medium, 
      bold: true,
      color: rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2])
    })
    
    // Enhanced signature section
    if (invoice.show_my_signature || invoice.require_client_signature) {
      const signatureUrl = companySettings?.signature_url
      if (signatureUrl) {
        try {
          const signatureResponse = await fetch(signatureUrl)
          if (signatureResponse.ok) {
            const signatureBytes = await signatureResponse.arrayBuffer()
            const signature = await pdfDoc.embedPng(new Uint8Array(signatureBytes))
            
            page.drawImage(signature, {
              x: PAGE.margin,
              y: PAGE.margin + 25,
              width: SIGNATURE.width,
              height: SIGNATURE.height,
            })
          }
        } catch (signatureError) {
          console.warn('Failed to embed signature:', signatureError)
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
        color: rgb(COLORS.text.muted[0], COLORS.text.muted[1], COLORS.text.muted[2])
      })
    }
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()
    console.log('PDF generated, size:', pdfBytes.length, 'bytes')
    
    // Upload to Supabase Storage with force overwrite
    const filePath = `company_${invoice.company_id}/${invoice.invoice_code}.pdf`
    console.log('Uploading PDF to storage with path:', filePath)
    
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(filePath, pdfBytes, {
        upsert: true,
        contentType: 'application/pdf',
      })

    if (error) {
      console.error('Error uploading PDF:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get public URL with cache busting parameter if force regenerated
    const { data: urlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(data.path)

    let pdfUrl = urlData.publicUrl
    
    // Add cache busting parameter for force regenerated PDFs
    if (force_regenerate && timestamp) {
      pdfUrl = `${pdfUrl}?v=${timestamp}`
    }
    
    console.log('PDF public URL:', pdfUrl)

    // Update invoice with PDF URL (only if not preview)
    if (!preview) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ pdf_url: pdfUrl })
        .eq('id', invoice_id)

      if (updateError) {
        console.error('Error updating invoice with PDF URL:', updateError)
      }
    }

    console.log('PDF generated successfully with enhanced layout')
    
    return new Response(
      JSON.stringify({ pdf_url: pdfUrl }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
