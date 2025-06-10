
import { supabase } from '@/integrations/supabase/client';
import { getInvoicePDFBlob } from './pdfGeneration';

export const handleSharePdf = async (invoiceId: string) => {
  try {
    console.log('PDF share requested for invoice:', invoiceId);
    
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

    // Generate PDF blob
    const pdfBlob = await getInvoicePDFBlob(
      invoiceData,
      invoiceData.clients,
      invoiceData.companies,
      formattedLineItems
    );

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], `invoice-${invoiceData.number}.pdf`, {
        type: 'application/pdf'
      });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoiceData.number}`,
          text: `Invoice ${invoiceData.number} from ${invoiceData.companies.name}`,
          files: [file]
        });
        return;
      }
    }

    // Fallback: Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error sharing PDF:', error);
    alert('Error sharing PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
