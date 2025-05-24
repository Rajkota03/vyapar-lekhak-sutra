
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    // Fetch invoice with related data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        companies (*),
        clients (*)
      `)
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError)
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

    // Create PDF
    const doc = new jsPDF()
    
    // Set up fonts and colors
    doc.setFont('helvetica')
    
    // Header - Company info
    doc.setFontSize(24)
    doc.setTextColor(40, 40, 40)
    doc.text(invoice.companies?.name || 'Company Name', 20, 30)
    
    // Invoice title
    doc.setFontSize(32)
    doc.setTextColor(100, 100, 100)
    doc.text('Invoice', 140, 30)
    
    // Invoice details
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Invoice#: ${invoice.invoice_code || invoice.number}`, 140, 40)
    doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 140, 45)
    
    // Company address
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    if (invoice.companies?.address) {
      const addressLines = invoice.companies.address.split('\n')
      let yPos = 45
      addressLines.forEach(line => {
        doc.text(line, 20, yPos)
        yPos += 4
      })
    }
    if (invoice.companies?.gstin) {
      doc.text(`GSTIN: ${invoice.companies.gstin}`, 20, yPos + 5)
    }
    
    // Bill To section
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Bill To:', 20, 80)
    
    doc.setFontSize(10)
    doc.text(invoice.clients?.name || 'Client Name', 20, 90)
    if (invoice.clients?.billing_address) {
      const clientAddressLines = invoice.clients.billing_address.split('\n')
      let yPos = 95
      clientAddressLines.forEach(line => {
        doc.text(line, 20, yPos)
        yPos += 4
      })
    }
    if (invoice.clients?.gstin) {
      doc.text(`GSTIN: ${invoice.clients.gstin}`, 20, 110)
    }
    
    // Total Due section
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Total Due:', 140, 80)
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text(`₹ ${Number(invoice.total).toFixed(2)}`, 140, 90)
    
    // Table header
    let yPos = 130
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 5, 170, 10, 'F')
    
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text('ITEM DESCRIPTION', 25, yPos)
    doc.text('PRICE', 120, yPos)
    doc.text('QTY', 140, yPos)
    doc.text('TOTAL', 160, yPos)
    
    // Table content
    yPos += 10
    doc.setTextColor(40, 40, 40)
    
    lineItems?.forEach((item) => {
      // Item description
      doc.text(item.description, 25, yPos)
      
      // Price
      doc.text(`₹${Number(item.unit_price).toFixed(2)}`, 120, yPos)
      
      // Quantity
      doc.text(item.qty.toString(), 140, yPos)
      
      // Total
      doc.text(`₹${Number(item.amount).toFixed(2)}`, 160, yPos)
      
      yPos += 8
    })
    
    // Totals section
    yPos += 10
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPos, 190, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    
    // Subtotal
    doc.text('SUB TOTAL', 130, yPos)
    doc.text(`₹${Number(invoice.subtotal).toFixed(2)}`, 160, yPos)
    yPos += 6
    
    // Tax details
    if (invoice.use_igst && Number(invoice.igst) > 0) {
      doc.text(`IGST ${invoice.igst_pct}%`, 130, yPos)
      doc.text(`₹${Number(invoice.igst).toFixed(2)}`, 160, yPos)
      yPos += 6
    } else {
      if (Number(invoice.cgst) > 0) {
        doc.text(`CGST ${invoice.cgst_pct}%`, 130, yPos)
        doc.text(`₹${Number(invoice.cgst).toFixed(2)}`, 160, yPos)
        yPos += 6
      }
      if (Number(invoice.sgst) > 0) {
        doc.text(`SGST ${invoice.sgst_pct}%`, 130, yPos)
        doc.text(`₹${Number(invoice.sgst).toFixed(2)}`, 160, yPos)
        yPos += 6
      }
    }
    
    // Grand Total
    yPos += 5
    doc.setDrawColor(40, 40, 40)
    doc.line(130, yPos, 190, yPos)
    yPos += 8
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Grand Total', 130, yPos)
    doc.text(`₹${Number(invoice.total).toFixed(2)}`, 160, yPos)
    
    // Signature section if enabled
    if (invoice.show_my_signature || invoice.require_client_signature) {
      yPos += 30
      
      if (invoice.show_my_signature) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Authorized Signature:', 20, yPos)
        
        // Add signature line
        doc.setDrawColor(200, 200, 200)
        doc.line(20, yPos + 15, 80, yPos + 15)
      }
      
      if (invoice.require_client_signature) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Client Signature:', 120, yPos)
        
        // Add signature line
        doc.setDrawColor(200, 200, 200)
        doc.line(120, yPos + 15, 180, yPos + 15)
      }
    }
    
    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')
    
    // Upload to Supabase Storage
    const fileName = `invoice-${invoice.invoice_code || invoice.number}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(fileName)

    const pdfUrl = urlData.publicUrl

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
