
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import fontkit from 'https://esm.sh/@pdf-lib/fontkit@1.1.1'

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
    
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size in points
    
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
        size: options.size || 10,
        font,
        color: options.color || rgb(0, 0, 0),
        ...options
      })
    }
    
    let yPosition = height - 40 // Start from top with margin
    
    // Header Section - Logo and Company Info on Left, Invoice Title on Right
    let logoHeight = 0
    const logoUrl = companySettings?.logo_url || invoice.companies?.logo_url
    if (logoUrl) {
      try {
        const logoResponse = await fetch(logoUrl)
        if (logoResponse.ok) {
          const logoBytes = await logoResponse.arrayBuffer()
          const logo = await pdfDoc.embedPng(new Uint8Array(logoBytes))
          const logoDims = logo.scale(0.4) // Larger logo scale
          page.drawImage(logo, {
            x: 40,
            y: yPosition - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
          })
          logoHeight = logoDims.height
        }
      } catch (logoError) {
        console.warn('Failed to embed logo:', logoError)
      }
    }
    
    // Company name and details on the left
    drawText(invoice.companies?.name || 'Company Name', 40, yPosition - Math.max(logoHeight, 0) - 10, { size: 14, bold: true })
    
    // Invoice title on the right
    drawText('Invoice', width - 100, yPosition - 10, { size: 20, bold: true })
    
    yPosition -= Math.max(logoHeight, 40) + 20
    
    // Company address and details
    if (invoice.companies?.address) {
      const addressLines = invoice.companies.address.split('\n')
      addressLines.forEach((line: string) => {
        drawText(line, 40, yPosition, { size: 9, color: rgb(0.3, 0.3, 0.3) })
        yPosition -= 12
      })
    }
    
    // Company email and GSTIN
    yPosition -= 5
    if (invoice.companies?.name) {
      // Use company name to create email (placeholder logic)
      const companyEmail = 'squarebluemedia@gmail.com' // You can make this dynamic
      drawText(companyEmail, 40, yPosition, { size: 9, color: rgb(0.3, 0.3, 0.3) })
      yPosition -= 12
    }
    
    if (invoice.companies?.gstin) {
      drawText(`GSTIN : ${invoice.companies.gstin}`, 40, yPosition, { size: 9, color: rgb(0.3, 0.3, 0.3) })
      yPosition -= 12
    }
    
    // Invoice details (right side)
    let rightY = height - 80
    drawText(`H.NO. ${invoice.invoice_code || invoice.number}`, width - 160, rightY, { size: 10, color: rgb(0.3, 0.3, 0.3) })
    rightY -= 12
    drawText(`${invoice.companies?.address?.split(',').pop()?.trim() || 'HYDERABAD TELANGANA 500038'}`, width - 160, rightY, { size: 9, color: rgb(0.3, 0.3, 0.3) })
    rightY -= 20
    
    // Invoice details box
    drawText(`Invoice #`, width - 160, rightY, { size: 10, bold: true })
    drawText(`${invoice.invoice_code || invoice.number}`, width - 80, rightY, { size: 10 })
    rightY -= 15
    drawText('Date', width - 160, rightY, { size: 10, bold: true })
    drawText(`${new Date(invoice.issue_date).toLocaleDateString('en-GB')}`, width - 80, rightY, { size: 10 })
    rightY -= 15
    drawText('SAC / HSN CODE', width - 160, rightY, { size: 10, bold: true })
    drawText('998387', width - 80, rightY, { size: 10 })
    
    yPosition = Math.min(yPosition, rightY) - 30
    
    // Bill To Section
    drawText('BILL TO', 40, yPosition, { size: 10, bold: true, color: rgb(0.4, 0.4, 0.4) })
    yPosition -= 15
    drawText(invoice.clients?.name || 'Client Name', 40, yPosition, { size: 11, bold: true })
    
    if (invoice.clients?.billing_address) {
      yPosition -= 12
      const clientAddressLines = invoice.clients.billing_address.split('\n')
      clientAddressLines.forEach((line: string) => {
        drawText(line, 40, yPosition, { size: 9, color: rgb(0.3, 0.3, 0.3) })
        yPosition -= 11
      })
    }
    
    if (invoice.clients?.gstin) {
      yPosition -= 5
      drawText(`GSTIN : ${invoice.clients.gstin}`, 40, yPosition, { size: 9, color: rgb(0.3, 0.3, 0.3) })
    }
    
    // Project section
    yPosition -= 25
    drawText('PROJECT', 40, yPosition, { size: 10, bold: true, color: rgb(0.4, 0.4, 0.4) })
    yPosition -= 12
    drawText('CHEEKATLO', 40, yPosition, { size: 10 })
    
    yPosition -= 30
    
    // Table Header
    const tableStartY = yPosition
    const rowHeight = 20
    
    // Draw table header background
    page.drawRectangle({
      x: 40,
      y: tableStartY - rowHeight,
      width: width - 80,
      height: rowHeight,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.5,
    })
    
    // Table headers with better spacing
    drawText('EQUIPMENT', 50, tableStartY - 13, { size: 9, bold: true })
    drawText('PKG', 320, tableStartY - 13, { size: 9, bold: true })
    drawText('Rate', 370, tableStartY - 13, { size: 9, bold: true })
    drawText('Amount', 480, tableStartY - 13, { size: 9, bold: true })
    
    yPosition = tableStartY - rowHeight
    
    // Table Rows
    const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    
    lineItems?.forEach((item: any, index: number) => {
      yPosition -= rowHeight
      
      // Alternate row colors
      if (index % 2 === 1) {
        page.drawRectangle({
          x: 40,
          y: yPosition,
          width: width - 80,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.98),
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 0.5,
        })
      } else {
        page.drawRectangle({
          x: 40,
          y: yPosition,
          width: width - 80,
          height: rowHeight,
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 0.5,
        })
      }
      
      // Draw row data
      drawText(item.description, 50, yPosition + 6, { size: 9 })
      drawText(item.qty.toString(), 330, yPosition + 6, { size: 9 })
      drawText(currency(Number(item.unit_price)), 370, yPosition + 6, { size: 9 })
      drawText(currency(Number(item.amount)), 480, yPosition + 6, { size: 9 })
    })
    
    // Payment Instructions Section
    yPosition -= 40
    if (companySettings?.payment_note) {
      drawText('Payment Instructions', 50, yPosition, { size: 10, bold: true })
      yPosition -= 15
      
      const paymentLines = companySettings.payment_note.split('\n')
      paymentLines.forEach((line: string) => {
        drawText(line, 50, yPosition, { size: 9, color: rgb(0.3, 0.3, 0.3) })
        yPosition -= 12
      })
    }
    
    // Totals Section (Right aligned)
    let totalsY = yPosition - 30
    const totalsX = width - 200
    
    // Subtotal
    drawText('Subtotal', totalsX, totalsY, { size: 10 })
    drawText(currency(Number(invoice.subtotal)), width - 80, totalsY, { size: 10 })
    totalsY -= 15
    
    // Tax calculations
    if (!invoice.use_igst) {
      if (Number(invoice.cgst) > 0) {
        drawText(`CGST (${invoice.cgst_pct}%)`, totalsX, totalsY, { size: 10 })
        drawText(currency(Number(invoice.cgst)), width - 80, totalsY, { size: 10 })
        totalsY -= 15
      }
      
      if (Number(invoice.sgst) > 0) {
        drawText(`SGST (${invoice.sgst_pct}%)`, totalsX, totalsY, { size: 10 })
        drawText(currency(Number(invoice.sgst)), width - 80, totalsY, { size: 10 })
        totalsY -= 15
      }
    } else if (Number(invoice.igst) > 0) {
      drawText(`IGST (${invoice.igst_pct}%)`, totalsX, totalsY, { size: 10 })
      drawText(currency(Number(invoice.igst)), width - 80, totalsY, { size: 10 })
      totalsY -= 15
    }
    
    drawText('Total', totalsX, totalsY, { size: 10 })
    drawText(currency(Number(invoice.total)), width - 80, totalsY, { size: 10 })
    totalsY -= 20
    
    // Grand Total with background
    page.drawRectangle({
      x: totalsX - 10,
      y: totalsY - 5,
      width: 200,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    })
    
    drawText('GRAND TOTAL', totalsX, totalsY, { size: 12, bold: true })
    drawText(currency(Number(invoice.total)), width - 80, totalsY, { size: 12, bold: true })
    
    // Footer message
    yPosition = 120
    drawText('Thank you for your business!', 50, yPosition, { size: 10 })
    yPosition -= 15
    drawText(invoice.companies?.name || 'Company Name', 50, yPosition, { size: 10, bold: true })
    
    // Signature Section
    if (invoice.show_my_signature || invoice.require_client_signature) {
      yPosition -= 40
      
      if (invoice.show_my_signature) {
        // Use signature from company settings if available
        const signatureUrl = companySettings?.signature_url
        if (signatureUrl) {
          try {
            const signatureResponse = await fetch(signatureUrl)
            if (signatureResponse.ok) {
              const signatureBytes = await signatureResponse.arrayBuffer()
              const signature = await pdfDoc.embedPng(new Uint8Array(signatureBytes))
              const signatureDims = signature.scale(0.3)
              page.drawImage(signature, {
                x: 160,
                y: yPosition - 30,
                width: signatureDims.width,
                height: signatureDims.height,
              })
            }
          } catch (signatureError) {
            console.warn('Failed to embed signature:', signatureError)
          }
        }
        
        // Signature line and date
        page.drawLine({
          start: { x: 160, y: yPosition },
          end: { x: 260, y: yPosition },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
        
        // Date under signature
        drawText(new Date(invoice.issue_date).toLocaleDateString('en-GB'), 190, yPosition - 15, { size: 9 })
      }
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
