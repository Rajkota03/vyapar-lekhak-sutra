import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import fontkit from 'https://esm.sh/@pdf-lib/fontkit@1.1.1'
import { 
  PAGE, 
  COMPANY_BLOCK, 
  BILL_BAR, 
  TABLE, 
  FONTS, 
  COLORS, 
  SIGNATURE, 
  SPACING, 
  POSITIONS 
} from '../../../src/lib/pdf/layout.ts'

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

    const { invoice_id, preview = false } = await req.json()
    
    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'invoice_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating PDF for invoice:', invoice_id, 'Preview mode:', preview)

    // Fetch invoice with related data - using maybeSingle to handle missing records gracefully
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        companies (*),
        clients (*)
      `)
      .eq('id', invoice_id)
      .maybeSingle()

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invoice', details: invoiceError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!invoice) {
      console.error('Invoice not found:', invoice_id)
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { 
          status: 404, 
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

    // Create PDF using pdf-lib
    const pdfDoc = await PDFDocument.create()
    
    // Register fontkit to enable custom font embedding
    pdfDoc.registerFontkit(fontkit)
    
    const page = pdfDoc.addPage([PAGE.width, PAGE.height]) // A4 size in points
    
    // Load fonts with proper Unicode support
    let unicodeFont
    let fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    try {
      // Fetch Noto Sans font from Google Fonts for Unicode support
      const fontUrl = 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf'
      const fontResponse = await fetch(fontUrl)
      if (fontResponse.ok) {
        const fontBytes = await fontResponse.arrayBuffer()
        unicodeFont = await pdfDoc.embedFont(new Uint8Array(fontBytes))
        console.log('Unicode font loaded successfully')
      } else {
        throw new Error(`Font fetch failed with status: ${fontResponse.status}`)
      }
    } catch (fontError) {
      console.warn('Failed to load Unicode font, using fallback:', fontError)
      unicodeFont = null
    }
    
    const { width, height } = page.getSize()
    const margin = PAGE.margin
    
    // Helper function to draw text with Unicode support
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      // Use Unicode font if available and text contains rupee symbol
      const useUnicodeFont = unicodeFont && text.includes('₹')
      const font = useUnicodeFont ? unicodeFont : (options.bold ? boldFont : fallbackFont)
      
      // Only replace rupee symbol if we don't have Unicode font support
      const displayText = useUnicodeFont ? text : text.replace(/₹/g, 'Rs.')
      
      page.drawText(displayText, {
        x,
        y,
        size: options.size || FONTS.base,
        font,
        color: options.color || rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]),
        ...options
      })
    }
    
    // ===== HEADER SECTION =====
    let yPosition = height - margin
    
    // Logo positioning - top left
    let logoHeight = 0
    const logoUrl = companySettings?.logo_url || invoice.companies?.logo_url
    const logoScale = Number(companySettings?.logo_scale || COMPANY_BLOCK.logoScale)
    
    if (logoUrl) {
      try {
        console.log('Attempting to load logo from:', logoUrl)
        const logoResponse = await fetch(logoUrl)
        if (logoResponse.ok) {
          const logoBytes = await logoResponse.arrayBuffer()
          let logo
          
          // Try to determine the image type and embed accordingly
          const contentType = logoResponse.headers.get('content-type') || ''
          console.log('Logo content type:', contentType)
          
          if (contentType.includes('png') || logoUrl.toLowerCase().includes('.png')) {
            logo = await pdfDoc.embedPng(new Uint8Array(logoBytes))
          } else if (contentType.includes('jpeg') || contentType.includes('jpg') || logoUrl.toLowerCase().includes('.jpg') || logoUrl.toLowerCase().includes('.jpeg')) {
            logo = await pdfDoc.embedJpg(new Uint8Array(logoBytes))
          } else {
            // Default to PNG
            logo = await pdfDoc.embedPng(new Uint8Array(logoBytes))
          }
          
          // Calculate proper logo dimensions using the scale
          const originalDims = logo.size()
          const scaledWidth = originalDims.width * logoScale
          const scaledHeight = originalDims.height * logoScale
          
          // Position logo at top-left with proper scaling
          page.drawImage(logo, {
            x: margin,
            y: yPosition - scaledHeight,
            width: scaledWidth,
            height: scaledHeight,
          })
          logoHeight = scaledHeight
          console.log('Logo embedded successfully with scale:', logoScale, 'Scaled dimensions:', scaledWidth, 'x', scaledHeight)
        }
      } catch (logoError) {
        console.warn('Failed to embed logo:', logoError)
      }
    }
    
    // Company info on the right side
    let rightY = yPosition
    
    // Invoice title
    drawText('Invoice', width - margin - COMPANY_BLOCK.rightColumnWidth, rightY, { size: FONTS.h1, bold: true })
    rightY -= 20
    
    // Company name
    drawText(invoice.companies?.name || 'Square Blue Media', width - margin - COMPANY_BLOCK.rightColumnWidth, rightY, { size: FONTS.h2, bold: true })
    rightY -= 15
    
    // Company address
    const addressLines = [
      `H.NO. 8-3-224/11C/17.E-96,`,
      `MADHURA NAGAR,`,
      `HYDERABAD TELANGANA 500038`
    ]
    
    addressLines.forEach((line) => {
      drawText(line, width - margin - COMPANY_BLOCK.rightColumnWidth, rightY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      rightY -= 12
    })
    
    // Company email
    drawText('squarebluemedia@gmail.com', width - margin - COMPANY_BLOCK.rightColumnWidth, rightY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
    rightY -= 12
    
    // Company GSTIN
    if (invoice.companies?.gstin) {
      drawText(`GSTIN : ${invoice.companies.gstin}`, width - margin - COMPANY_BLOCK.rightColumnWidth, rightY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      rightY -= 20
    }
    
    // Move to next section based on the larger of logo or company info
    yPosition = Math.min(yPosition - Math.max(logoHeight + 20, height - rightY), rightY) - 20
    
    // ===== BILL TO SECTION =====
    // Draw bill-to background rectangle
    page.drawRectangle({
      x: margin,
      y: yPosition - BILL_BAR.height,
      width: width - margin * 2,
      height: BILL_BAR.height,
      color: rgb(BILL_BAR.bgGray, BILL_BAR.bgGray, BILL_BAR.bgGray),
    })
    
    // Bill To header
    drawText('BILL TO', margin + BILL_BAR.padding, yPosition - 20, { size: FONTS.base, bold: true, color: rgb(COLORS.text.muted[0], COLORS.text.muted[1], COLORS.text.muted[2]) })
    yPosition -= 35
    
    // Client name
    drawText(invoice.clients?.name || 'Client Name', margin + BILL_BAR.padding, yPosition, { size: FONTS.medium, bold: true })
    yPosition -= 15
    
    // Client address
    if (invoice.clients?.billing_address) {
      const clientAddressLines = invoice.clients.billing_address.split('\n')
      clientAddressLines.forEach((line: string) => {
        drawText(line, margin + BILL_BAR.padding, yPosition, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
        yPosition -= 12
      })
    } else {
      // Default address if none provided
      drawText('C/O RAMANAIDU STUDIOS, FILM NAGAR', margin + BILL_BAR.padding, yPosition, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      yPosition -= 12
      drawText('HYDERABAD TELANGANA 500096', margin + BILL_BAR.padding, yPosition, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      yPosition -= 12
    }
    
    // Client GSTIN
    if (invoice.clients?.gstin) {
      drawText(`GSTIN : ${invoice.clients.gstin}`, margin + BILL_BAR.padding, yPosition, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      yPosition -= 20
    }
    
    // Project section
    drawText('PROJECT', margin + BILL_BAR.padding, yPosition, { size: FONTS.base, bold: true, color: rgb(COLORS.text.muted[0], COLORS.text.muted[1], COLORS.text.muted[2]) })
    yPosition -= 15
    drawText('CHEEKATLO', margin + BILL_BAR.padding, yPosition, { size: FONTS.base })
    
    // Invoice details on the right side of bill-to section
    let detailsY = yPosition + 80
    
    // Invoice number
    drawText('Invoice #', width - margin - 200, detailsY, { size: FONTS.base, bold: true })
    drawText(invoice.invoice_code || invoice.number || '25-26/02', width - margin - 80, detailsY, { size: FONTS.base })
    detailsY -= 15
    
    // Invoice date
    drawText('Date', width - margin - 200, detailsY, { size: FONTS.base, bold: true })
    const formattedDate = new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    drawText(formattedDate, width - margin - 80, detailsY, { size: FONTS.base })
    detailsY -= 15
    
    // SAC/HSN code
    drawText('SAC / HSN CODE', width - margin - 200, detailsY, { size: FONTS.base, bold: true })
    drawText(companySettings?.sac_hsn || '998387', width - margin - 80, detailsY, { size: FONTS.base })
    
    // Reset Y position to below the bill-to section
    yPosition = height - margin - BILL_BAR.height - 180
    
    // ===== ITEMS TABLE =====
    // Table headers
    drawText('EQUIPMENT', margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.base, bold: true })
    drawText('PKG', margin + POSITIONS.table.colPositions[1], yPosition, { size: FONTS.base, bold: true })
    drawText('Rate', margin + POSITIONS.table.colPositions[2], yPosition, { size: FONTS.base, bold: true })
    drawText('Amount', margin + POSITIONS.table.colPositions[3], yPosition, { size: FONTS.base, bold: true })
    
    // Draw horizontal line below headers
    page.drawLine({
      start: { x: margin, y: yPosition - 10 },
      end: { x: width - margin, y: yPosition - 10 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    
    yPosition -= 30
    
    // Table Rows
    const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    
    lineItems?.forEach((item: any, index: number) => {
      // Draw item description
      drawText(item.description, margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.base })
      
      // Draw dates if available
      if (item.description.includes('ALEXA')) {
        yPosition -= 15
        drawText('Dates : 17/04/25,19/04/25, 22/04/25', margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.small, color: rgb(COLORS.text.muted[0], COLORS.text.muted[1], COLORS.text.muted[2]) })
      }
      
      // Draw quantity, rate and amount
      drawText(item.qty.toString(), margin + POSITIONS.table.colPositions[1], yPosition + 15, { size: FONTS.base })
      drawText(currency(Number(item.unit_price)), margin + POSITIONS.table.colPositions[2], yPosition + 15, { size: FONTS.base })
      drawText(currency(Number(item.amount)), margin + POSITIONS.table.colPositions[3], yPosition + 15, { size: FONTS.base })
      
      // Draw horizontal line below row
      page.drawLine({
        start: { x: margin, y: yPosition - 10 },
        end: { x: width - margin, y: yPosition - 10 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })
      
      yPosition -= 40
    })
    
    // ===== PAYMENT INSTRUCTIONS SECTION =====
    drawText('Payment Instructions', margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.base, bold: true })
    yPosition -= 15
    
    if (companySettings?.payment_note) {
      const paymentLines = companySettings.payment_note.split('\n')
      paymentLines.forEach((line: string) => {
        drawText(line, margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.small, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
        yPosition -= 12
      })
    } else {
      // Default payment instructions
      drawText('SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,', margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.small, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      yPosition -= 12
      drawText('BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,', margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.small, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      yPosition -= 12
      drawText('PAN NO.FDBPK8518L', margin + POSITIONS.table.colPositions[0], yPosition, { size: FONTS.small, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
    }
    
    // ===== TOTALS SECTION =====
    let totalsY = yPosition
    const totalsX = width - margin - POSITIONS.totals.x
    
    // Draw horizontal line above totals
    page.drawLine({
      start: { x: margin, y: totalsY - 10 },
      end: { x: width - margin, y: totalsY - 10 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    
    totalsY -= 30
    
    // Subtotal
    drawText('Subtotal', totalsX, totalsY, { size: FONTS.base })
    drawText(currency(Number(invoice.subtotal || 0)), width - margin - 20, totalsY, { size: FONTS.base, align: 'right' })
    totalsY -= POSITIONS.totals.lineSpacing
    
    // Tax calculations
    if (!invoice.use_igst) {
      if (Number(invoice.cgst_pct || 0) > 0) {
        drawText(`CGST (${invoice.cgst_pct || 9}%)`, totalsX, totalsY, { size: FONTS.base })
        drawText(currency(Number(invoice.cgst || 0)), width - margin - 20, totalsY, { size: FONTS.base, align: 'right' })
        totalsY -= POSITIONS.totals.lineSpacing
      }
      
      if (Number(invoice.sgst_pct || 0) > 0) {
        drawText(`SGST (${invoice.sgst_pct || 9}%)`, totalsX, totalsY, { size: FONTS.base })
        drawText(currency(Number(invoice.sgst || 0)), width - margin - 20, totalsY, { size: FONTS.base, align: 'right' })
        totalsY -= POSITIONS.totals.lineSpacing
      }
    } else if (Number(invoice.igst_pct || 0) > 0) {
      drawText(`IGST (${invoice.igst_pct || 18}%)`, totalsX, totalsY, { size: FONTS.base })
      drawText(currency(Number(invoice.igst || 0)), width - margin - 20, totalsY, { size: FONTS.base, align: 'right' })
      totalsY -= POSITIONS.totals.lineSpacing
    }
    
    // Total
    drawText('Total', totalsX, totalsY, { size: FONTS.base })
    drawText(currency(Number(invoice.total || 0)), width - margin - 20, totalsY, { size: FONTS.base, align: 'right' })
    totalsY -= 25
    
    // Grand Total with background
    page.drawRectangle({
      x: totalsX - 10,
      y: totalsY - 5,
      width: POSITIONS.grandTotal.width,
      height: POSITIONS.grandTotal.height,
      color: rgb(POSITIONS.grandTotal.bgColor[0], POSITIONS.grandTotal.bgColor[1], POSITIONS.grandTotal.bgColor[2]),
    })
    
    drawText('GRAND TOTAL', totalsX, totalsY, { size: FONTS.large, bold: true })
    drawText(currency(Number(invoice.total || 0)), width - margin - 20, totalsY, { size: FONTS.large, bold: true, align: 'right' })
    
    // ===== FOOTER SECTION =====
    // Thank you message
    const footerY = POSITIONS.footer.startY
    drawText('Thank you for your business!', margin + POSITIONS.table.colPositions[0], footerY, { size: FONTS.base })
    drawText(invoice.companies?.name || 'Square Blue Media', margin + POSITIONS.table.colPositions[0], footerY - 15, { size: FONTS.base, bold: true })
    
    // Signature Section
    if (invoice.show_my_signature || invoice.require_client_signature) {
      // Use signature from company settings if available
      const signatureUrl = companySettings?.signature_url
      if (signatureUrl) {
        try {
          const signatureResponse = await fetch(signatureUrl)
          if (signatureResponse.ok) {
            const signatureBytes = await signatureResponse.arrayBuffer()
            const signature = await pdfDoc.embedPng(new Uint8Array(signatureBytes))
            const signatureDims = signature.scale(SIGNATURE.scale)
            page.drawImage(signature, {
              x: margin + POSITIONS.table.colPositions[0],
              y: footerY - 60,
              width: signatureDims.width,
              height: signatureDims.height,
            })
          }
        } catch (signatureError) {
          console.warn('Failed to embed signature:', signatureError)
        }
      }
      
      // Signature line
      page.drawLine({
        start: { x: margin + POSITIONS.table.colPositions[0], y: footerY - 70 },
        end: { x: margin + POSITIONS.table.colPositions[0] + SIGNATURE.lineWidth, y: footerY - 70 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      })
      
      // Date under signature
      drawText(new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), margin + POSITIONS.table.colPositions[0], footerY - 85, { size: FONTS.small })
    }
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()
    console.log('PDF generated, size:', pdfBytes.length, 'bytes')
    
    // Upload to Supabase Storage with organized structure
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

    console.log('PDF uploaded successfully:', data)

    // Get public URL using the uploaded file path
    const { data: urlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(data.path)

    const pdfUrl = urlData.publicUrl
    console.log('PDF public URL:', pdfUrl)

    // Update invoice with PDF URL (only if not preview)
    if (!preview) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ pdf_url: pdfUrl })
        .eq('id', invoice_id)

      if (updateError) {
        console.error('Error updating invoice with PDF URL:', updateError)
      } else {
        console.log('Invoice updated with PDF URL')
      }
    }

    console.log('PDF generated successfully:', pdfUrl)
    
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
