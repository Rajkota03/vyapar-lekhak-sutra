
import { supabase } from '@/integrations/supabase/client';
import { downloadInvoicePDF } from './pdfGeneration';

export const handleDownloadPdf = async (
  invoiceId: string, 
  invoiceCode?: string | null, 
  setIsDownloading?: (loading: boolean) => void
) => {
  if (setIsDownloading) {
    setIsDownloading(true);
  }
  
  try {
    console.log('PDF download requested for invoice:', invoiceId, 'with code:', invoiceCode);
    
    // Fetch invoice data with related information
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (*),
        companies (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error('Failed to fetch invoice data');
    }

    // Fetch invoice line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('invoice_lines')
      .select(`
        *,
        items (*)
      `)
      .eq('invoice_id', invoiceId);

    if (lineItemsError) {
      throw new Error('Failed to fetch invoice line items');
    }

    // Transform line items to match expected format
    const formattedLineItems = (lineItems || []).map(item => ({
      id: item.id,
      item_id: item.item_id,
      description: item.description,
      qty: Number(item.qty),
      unit_price: Number(item.unit_price),
      cgst: Number(item.cgst || 0),
      sgst: Number(item.sgst || 0),
      amount: Number(item.amount),
      discount_amount: Number(item.discount_amount || 0),
      note: item.note || ''
    }));

    // Generate and download PDF
    await downloadInvoicePDF(
      invoiceData,
      invoiceData.clients,
      invoiceData.companies,
      formattedLineItems
    );

  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Error downloading PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    if (setIsDownloading) {
      setIsDownloading(false);
    }
  }
};
