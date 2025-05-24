
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { invoice_id } = await req.json()
    
    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'invoice_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Getting or generating PDF for invoice:', invoice_id)

    // Check if invoice exists first
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, pdf_url, status')
      .eq('id', invoice_id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching invoice:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invoice', details: fetchError.message }),
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

    // If PDF URL already exists, return it
    if (invoice.pdf_url) {
      console.log('PDF already exists:', invoice.pdf_url)
      return new Response(
        JSON.stringify({ pdf_url: invoice.pdf_url }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate new PDF by calling the existing function
    console.log('Generating new PDF...')
    const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
      'generate_invoice_pdf',
      {
        body: { 
          invoice_id: invoice_id, 
          preview: false 
        }
      }
    )

    if (pdfError) {
      console.error('Error generating PDF:', pdfError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate PDF', details: pdfError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if PDF was generated and URL is available
    if (pdfData && pdfData.pdf_url) {
      console.log('PDF generated successfully:', pdfData.pdf_url)
      return new Response(
        JSON.stringify({ pdf_url: pdfData.pdf_url }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the updated invoice to get the PDF URL
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .select('pdf_url')
      .eq('id', invoice_id)
      .maybeSingle()

    if (updateError) {
      console.error('Error fetching updated invoice:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to get PDF URL after generation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!updatedInvoice?.pdf_url) {
      console.error('PDF URL not available after generation')
      return new Response(
        JSON.stringify({ error: 'PDF generation completed but URL not available' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('PDF generated successfully:', updatedInvoice.pdf_url)
    
    return new Response(
      JSON.stringify({ pdf_url: updatedInvoice.pdf_url }),
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
