
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
        size: options.size || 11,
        font,
        color: options.color || rgb(0, 0, 0),
        ...options
      })
    }
    
    let yPosition = height - 60 // Start from top
    
    // Header Section with Logo
    // Use logo from company settings if available, otherwise fall back to company logo
    const logoUrl = companySettings?.logo_url || invoice.companies?.logo_url
    if (logoUrl) {
      try {
        const logoResponse = await fetch(logoUrl)
        if (logoResponse.ok) {
          const logoBytes = await logoResponse.arrayBuffer()
          const logo = await pdfDoc.embedPng(new Uint8Array(logoBytes))
          const logoDims = logo.scale(0.3)
          page.drawImage(logo, {
            x: 40,
            y: yPosition - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
          })
          yPosition -= logoDims.height + 10
        }
      } catch (logoError) {
        console.warn('Failed to embed logo:', logoError)
      }
    }
    
    drawText(invoice.companies?.name || 'Company Name', 40, yPosition, { size: 16, bold: true })
    drawText('INVOICE', width - 140, yPosition, { size: 18, bold: true })
    
    yPosition -= 20
    if (invoice.companies?.address) {
      const addressLines = invoice.companies.address.split('\n')
      addressLines.forEach((line: string) => {
        drawText(line, 40, yPosition, { size: 9, color: rgb(0.4, 0.4, 0.4) })
        yPosition -= 12
      })
    }
    
    // Invoice details (right side)
    let rightY = height - 80
    drawText(`Invoice # ${invoice.invoice_code || invoice.number}`, width - 200, rightY, { size: 10 })
    rightY -= 15
    drawText(`Date: ${new Date(invoice.issue_date).toLocaleDateString('en-IN')}`, width - 200, rightY, { size: 10 })
    
    if (invoice.due_date) {
      rightY -= 15
      drawText(`Due: ${new Date(invoice.due_date).toLocaleDateString('en-IN')}`, width - 200, rightY, { size: 10 })
    }
    
    yPosition = Math.min(yPosition, rightY) - 30
    
    // Bill To Section
    page.drawRectangle({
      x: 40,
      y: yPosition - 80,
      width: width - 80,
      height: 80,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    })
    
    drawText('Bill To:', 50, yPosition - 20, { bold: true })
    yPosition -= 35
    drawText(invoice.clients?.name || 'Client Name', 50, yPosition, { size: 12, bold: true })
    
    if (invoice.clients?.billing_address) {
      yPosition -= 15
      const clientAddressLines = invoice.clients.billing_address.split('\n')
      clientAddressLines.forEach((line: string) => {
        drawText(line, 50, yPosition, { size: 10 })
        yPosition -= 12
      })
    }
    
    if (invoice.clients?.phone) {
      yPosition -= 5
      drawText(`Phone: ${invoice.clients.phone}`, 50, yPosition, { size: 10 })
    }
    
    if (invoice.clients?.gstin) {
      yPosition -= 15
      drawText(`GSTIN: ${invoice.clients.gstin}`, 50, yPosition, { size: 10 })
    }
    
    yPosition -= 40
    
    // Table Header
    const tableStartY = yPosition
    const rowHeight = 25
    
    page.drawRectangle({
      x: 40,
      y: tableStartY - rowHeight,
      width: width - 80,
      height: rowHeight,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    })
    
    drawText('Item Description', 50, tableStartY - 15, { bold: true })
    drawText('Price', width - 200, tableStartY - 15, { bold: true })
    drawText('Qty', width - 150, tableStartY - 15, { bold: true })
    drawText('Total', width - 100, tableStartY - 15, { bold: true })
    
    yPosition = tableStartY - rowHeight
    
    // Table Rows
    // Use proper rupee symbol with Unicode font support
    const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    
    lineItems?.forEach((item: any) => {
      yPosition -= rowHeight
      
      // Draw row border
      page.drawRectangle({
        x: 40,
        y: yPosition,
        width: width - 80,
        height: rowHeight,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      })
      
      drawText(item.description, 50, yPosition + 8)
      drawText(currency(Number(item.unit_price)), width - 200, yPosition + 8)
      drawText(item.qty.toString(), width - 150, yPosition + 8)
      drawText(currency(Number(item.amount)), width - 100, yPosition + 8)
    })
    
    // Totals Section
    yPosition -= 40
    const totalsX = width - 250
    
    drawText('Subtotal', totalsX, yPosition)
    drawText(currency(Number(invoice.subtotal)), width - 80, yPosition)
    
    if (!invoice.use_igst && Number(invoice.cgst) > 0) {
      yPosition -= 20
      drawText(`CGST (${invoice.cgst_pct}%)`, totalsX, yPosition)
      drawText(currency(Number(invoice.cgst)), width - 80, yPosition)
    }
    
    if (!invoice.use_igst && Number(invoice.sgst) > 0) {
      yPosition -= 20
      drawText(`SGST (${invoice.sgst_pct}%)`, totalsX, yPosition)
      drawText(currency(Number(invoice.sgst)), width - 80, yPosition)
    }
    
    if (invoice.use_igst && Number(invoice.igst) > 0) {
      yPosition -= 20
      drawText(`IGST (${invoice.igst_pct}%)`, totalsX, yPosition)
      drawText(currency(Number(invoice.igst)), width - 80, yPosition)
    }
    
    // Grand Total
    yPosition -= 25
    page.drawLine({
      start: { x: totalsX, y: yPosition + 15 },
      end: { x: width - 40, y: yPosition + 15 },
      thickness: 2,
      color: rgb(0, 0, 0),
    })
    
    drawText('Grand Total', totalsX, yPosition, { bold: true })
    drawText(currency(Number(invoice.total)), width - 80, yPosition, { bold: true })
    
    // Payment Terms
    if (companySettings?.payment_note) {
      yPosition -= 40
      drawText('Payment Terms:', 50, yPosition, { bold: true })
      yPosition -= 20
      
      // Split payment note into lines if it's too long
      const paymentLines = companySettings.payment_note.split('\n')
      paymentLines.forEach((line: string) => {
        drawText(line, 50, yPosition, { size: 10 })
        yPosition -= 15
      })
    }
    
    // Signature Section
    if (invoice.show_my_signature || invoice.require_client_signature) {
      yPosition -= 60
      
      if (invoice.show_my_signature) {
        drawText('Authorized Signature:', 50, yPosition, { size: 10 })
        
        // Use signature from company settings if available
        const signatureUrl = companySettings?.signature_url
        if (signatureUrl) {
          try {
            const signatureResponse = await fetch(signatureUrl)
            if (signatureResponse.ok) {
              const signatureBytes = await signatureResponse.arrayBuffer()
              const signature = await pdfDoc.embedPng(new Uint8Array(signatureBytes))
              const signatureDims = signature.scale(0.5)
              page.drawImage(signature, {
                x: 50,
                y: yPosition - 50,
                width: signatureDims.width,
                height: signatureDims.height,
              })
            }
          } catch (signatureError) {
            console.warn('Failed to embed signature:', signatureError)
          }
        }
        
        page.drawLine({
          start: { x: 50, y: yPosition - 40 },
          end: { x: 200, y: yPosition - 40 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
      }
      
      if (invoice.require_client_signature) {
        drawText('Client Signature:', width - 200, yPosition, { size: 10 })
        page.drawLine({
          start: { x: width - 200, y: yPosition - 40 },
          end: { x: width - 50, y: yPosition - 40 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
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
