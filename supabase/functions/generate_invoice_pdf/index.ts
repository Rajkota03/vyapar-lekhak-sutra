
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PAGE } from './layout.ts'
import { createPDFContext, createDrawTextFunction } from './pdfUtils.ts'
import { renderHeader } from './headerRenderer.ts'
import { renderBillSection } from './billRenderer.ts'
import { renderItemsAndTotals } from './renderItemsAndTotals.ts'
import { renderPayment } from './renderPayment.ts'
import { renderFooter } from './footerRenderer.ts'
import type { InvoiceData, CompanySettings, LineItem } from './types.ts'

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
    const { pdfDoc, context } = await createPDFContext()
    const page = pdfDoc.addPage([PAGE.width, PAGE.height])
    context.page = page
    
    const drawText = createDrawTextFunction(context)
    
    // Render PDF sections in new order
    await renderHeader(pdfDoc, page, drawText, invoice as InvoiceData, companySettings as CompanySettings)
    renderBillSection(page, drawText, invoice as InvoiceData, companySettings as CompanySettings)
    renderItemsAndTotals(page, drawText, invoice as InvoiceData, lineItems as LineItem[])
    await renderPayment(pdfDoc, page, drawText, companySettings as CompanySettings)
    await renderFooter(pdfDoc, page, drawText, invoice as InvoiceData, companySettings as CompanySettings)
    
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

    console.log('PDF generated successfully with refactored layout')
    
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
