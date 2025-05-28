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
  getBandPositions 
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
    
    // Helper function to draw text with Unicode support
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
        ...options
      })
    }
    
    // Get band positions
    const positions = getBandPositions()
    
    // ===== HEADER BAND =====
    let headerY = positions.topOfHeader + BANDS.header - 20
    
    // Logo positioning with proper scaling - only if logo_url exists
    const logoUrl = companySettings?.logo_url || invoice.companies?.logo_url
    const logoScale = Math.min(Number(companySettings?.logo_scale || 0.25), 1.0)
    const maxLogoSize = BANDS.header - 20
    
    console.log('Logo URL from settings:', companySettings?.logo_url)
    console.log('Logo URL from company:', invoice.companies?.logo_url) 
    console.log('Final logo URL:', logoUrl, 'Logo scale:', logoScale)
    
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
          const scaledWidth = Math.min(originalDims.width * logoScale, maxLogoSize)
          const scaledHeight = Math.min(originalDims.height * logoScale, maxLogoSize)
          
          // Ensure logo fits within header band
          const logoY = Math.max(positions.topOfHeader + 10, headerY - scaledHeight)
          
          page.drawImage(logo, {
            x: PAGE.margin,
            y: logoY,
            width: scaledWidth,
            height: scaledHeight,
          })
          console.log('Logo embedded with dimensions:', scaledWidth, 'x', scaledHeight)
        } else {
          console.log('Failed to fetch logo, HTTP status:', logoResponse.status)
        }
      } catch (logoError) {
        console.warn('Failed to embed logo:', logoError)
      }
    } else {
      console.log('No logo URL found, skipping logo embedding')
    }

    // Company info on the right side of header
    const rightX = PAGE.width - PAGE.margin - 200
    let rightY = headerY
    
    drawText('Invoice', rightX, rightY, { size: FONTS.h1, bold: true })
    rightY -= 18
    
    drawText(invoice.companies?.name || 'Square Blue Media', rightX, rightY, { size: FONTS.h2, bold: true })
    rightY -= 14
    
    const addressLines = [
      'H.NO. 8-3-224/11C/17.E-96,',
      'MADHURA NAGAR,',
      'HYDERABAD TELANGANA 500038'
    ]
    
    addressLines.forEach((line) => {
      drawText(line, rightX, rightY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      rightY -= 12
    })
    
    drawText('squarebluemedia@gmail.com', rightX, rightY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
    rightY -= 12
    
    if (invoice.companies?.gstin) {
      drawText(`GSTIN : ${invoice.companies.gstin}`, rightX, rightY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
    }
    
    // ===== BILL BAR BAND =====
    // Draw bill-to background rectangle
    page.drawRectangle({
      x: PAGE.margin,
      y: positions.topOfBill,
      width: PAGE.inner,
      height: BANDS.bill,
      color: rgb(COLORS.background.light[0], COLORS.background.light[1], COLORS.background.light[2]),
    })
    
    let billY = positions.topOfBill + BANDS.bill - 15
    
    // Bill To section
    drawText('BILL TO', PAGE.margin + 20, billY, { size: FONTS.base, bold: true, color: rgb(COLORS.text.muted[0], COLORS.text.muted[1], COLORS.text.muted[2]) })
    billY -= 15
    
    drawText(invoice.clients?.name || 'Client Name', PAGE.margin + 20, billY, { size: FONTS.medium, bold: true })
    billY -= 12
    
    if (invoice.clients?.billing_address) {
      const clientAddressLines = invoice.clients.billing_address.split('\n').slice(0, 2) // Limit to fit in band
      clientAddressLines.forEach((line: string) => {
        drawText(line, PAGE.margin + 20, billY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
        billY -= 10
      })
    } else {
      drawText('C/O RAMANAIDU STUDIOS, FILM NAGAR', PAGE.margin + 20, billY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      billY -= 10
      drawText('HYDERABAD TELANGANA 500096', PAGE.margin + 20, billY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
      billY -= 10
    }
    
    if (invoice.clients?.gstin && billY > positions.topOfBill + 10) {
      drawText(`GSTIN : ${invoice.clients.gstin}`, PAGE.margin + 20, billY, { size: FONTS.base, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
    }
    
    // Invoice details on the right side of bill bar
    let detailsY = positions.topOfBill + BANDS.bill - 15
    const detailsX = PAGE.width - PAGE.margin - 150
    
    drawText('Invoice #', detailsX, detailsY, { size: FONTS.base, bold: true })
    drawText(invoice.invoice_code || invoice.number || '25-26/02', detailsX + 60, detailsY, { size: FONTS.base })
    detailsY -= 12
    
    drawText('Date', detailsX, detailsY, { size: FONTS.base, bold: true })
    const formattedDate = new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    drawText(formattedDate, detailsX + 60, detailsY, { size: FONTS.base })
    detailsY -= 12
    
    drawText('SAC/HSN CODE', detailsX, detailsY, { size: FONTS.base, bold: true })
    drawText(companySettings?.sac_code || '998387', detailsX + 60, detailsY, { size: FONTS.base })
    
    // ===== ITEMS TABLE BAND =====
    let tableY = positions.topOfBill - 14
    
    // Table headers
    const colWidths = TABLE.cols.map(ratio => PAGE.inner * ratio)
    let colX = PAGE.margin
    
    drawText('EQUIPMENT', colX, tableY, { size: FONTS.base, bold: true })
    colX += colWidths[0]
    drawText('PKG', colX, tableY, { size: FONTS.base, bold: true })
    colX += colWidths[1]
    drawText('Rate', colX, tableY, { size: FONTS.base, bold: true })
    colX += colWidths[2]
    drawText('Amount', colX, tableY, { size: FONTS.base, bold: true })
    
    // Header underline
    page.drawLine({
      start: { x: PAGE.margin, y: tableY - 8 },
      end: { x: PAGE.width - PAGE.margin, y: tableY - 8 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    
    tableY -= 20
    
    // Table rows with overflow protection
    const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    let rowIndex = 0
    
    while (tableY - TABLE.rowH > positions.bottomOfTable && rowIndex < (lineItems?.length || 0)) {
      const item = lineItems![rowIndex]
      
      colX = PAGE.margin
      drawText(item.description, colX, tableY, { size: FONTS.base })
      colX += colWidths[0]
      drawText(item.qty.toString(), colX, tableY, { size: FONTS.base })
      colX += colWidths[1]
      drawText(currency(Number(item.unit_price)), colX, tableY, { size: FONTS.base })
      colX += colWidths[2]
      drawText(currency(Number(item.amount)), colX, tableY, { size: FONTS.base })
      
      // Row underline
      page.drawLine({
        start: { x: PAGE.margin, y: tableY - 6 },
        end: { x: PAGE.width - PAGE.margin, y: tableY - 6 },
        thickness: 0.3,
        color: rgb(0.9, 0.9, 0.9),
      })
      
      tableY -= TABLE.rowH
      rowIndex++
    }
    
    // ===== TOTALS BAND =====
    // Payment instructions on the left
    drawText('Payment Instructions', PAGE.margin, positions.yTotals, { size: FONTS.base, bold: true })
    
    let paymentY = positions.yTotals - 15
    if (companySettings?.payment_note) {
      const paymentLines = companySettings.payment_note.split('\n').slice(0, 5) // Limit lines to fit in band
      paymentLines.forEach((line: string) => {
        drawText(line, PAGE.margin, paymentY, { size: FONTS.small, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
        paymentY -= 10
      })
    } else {
      const defaultPayment = [
        'SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,',
        'BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,',
        'PAN NO.FDBPK8518L'
      ]
      defaultPayment.forEach((line) => {
        drawText(line, PAGE.margin, paymentY, { size: FONTS.small, color: rgb(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]) })
        paymentY -= 10
      })
    }
    
    // Totals on the right
    const totalsX = PAGE.width - PAGE.margin - 200
    let totalsY = positions.yTotals
    
    drawText('Subtotal', totalsX, totalsY, { size: FONTS.base })
    drawText(currency(Number(invoice.subtotal || 0)), totalsX + 120, totalsY, { size: FONTS.base })
    totalsY -= 15
    
    // Tax calculations
    if (!invoice.use_igst) {
      if (Number(invoice.cgst_pct || 0) > 0) {
        drawText(`CGST (${invoice.cgst_pct || 9}%)`, totalsX, totalsY, { size: FONTS.base })
        drawText(currency(Number(invoice.cgst || 0)), totalsX + 120, totalsY, { size: FONTS.base })
        totalsY -= 15
      }
      
      if (Number(invoice.sgst_pct || 0) > 0) {
        drawText(`SGST (${invoice.sgst_pct || 9}%)`, totalsX, totalsY, { size: FONTS.base })
        drawText(currency(Number(invoice.sgst || 0)), totalsX + 120, totalsY, { size: FONTS.base })
        totalsY -= 15
      }
    } else if (Number(invoice.igst_pct || 0) > 0) {
      drawText(`IGST (${invoice.igst_pct || 18}%)`, totalsX, totalsY, { size: FONTS.base })
      drawText(currency(Number(invoice.igst || 0)), totalsX + 120, totalsY, { size: FONTS.base })
      totalsY -= 15
    }
    
    drawText('Total', totalsX, totalsY, { size: FONTS.base })
    drawText(currency(Number(invoice.total || 0)), totalsX + 120, totalsY, { size: FONTS.base })
    totalsY -= 20
    
    // Grand Total with background
    page.drawRectangle({
      x: totalsX - 10,
      y: totalsY - 5,
      width: 200,
      height: 20,
      color: rgb(COLORS.background.light[0], COLORS.background.light[1], COLORS.background.light[2]),
    })
    
    drawText('GRAND TOTAL', totalsX, totalsY, { size: FONTS.large, bold: true })
    drawText(currency(Number(invoice.total || 0)), totalsX + 120, totalsY, { size: FONTS.large, bold: true })
    
    // ===== FOOTER BAND =====
    // Horizontal rule
    page.drawLine({
      start: { x: PAGE.margin, y: positions.footerRuleY },
      end: { x: PAGE.width - PAGE.margin, y: positions.footerRuleY },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    
    const footerY = PAGE.margin + 60
    drawText('Thank you for your business!', PAGE.margin, footerY, { size: FONTS.base })
    drawText(invoice.companies?.name || 'Square Blue Media', PAGE.margin, footerY - 15, { size: FONTS.base, bold: true })
    
    // Signature Section
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
              y: PAGE.margin + 20,
              width: SIGNATURE.width,
              height: SIGNATURE.height,
            })
          }
        } catch (signatureError) {
          console.warn('Failed to embed signature:', signatureError)
        }
      }
      
      // Signature line
      page.drawLine({
        start: { x: PAGE.margin, y: PAGE.margin + 15 },
        end: { x: PAGE.margin + SIGNATURE.lineWidth, y: PAGE.margin + 15 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      })
      
      drawText(formattedDate, PAGE.margin, PAGE.margin + 5, { size: FONTS.small })
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

    console.log('PDF generated successfully with band-based layout')
    
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
