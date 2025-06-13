
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ConvertProFormaOptions {
  proformaId: string;
  companyId: string;
  onSuccess?: (newInvoiceId: string) => void;
}

export const convertProFormaToInvoice = async ({ 
  proformaId, 
  companyId, 
  onSuccess 
}: ConvertProFormaOptions) => {
  try {
    console.log('=== CONVERTING PRO FORMA TO INVOICE ===');
    console.log('Pro Forma ID:', proformaId);
    console.log('Company ID:', companyId);

    // 1. Fetch the original pro forma
    const { data: proforma, error: proformaError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', proformaId)
      .single();

    if (proformaError || !proforma) {
      throw new Error('Failed to fetch pro forma');
    }

    console.log('Original pro forma fetched:', proforma);

    // 2. Fetch pro forma line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('invoice_lines')
      .select('*')
      .eq('invoice_id', proformaId);

    if (lineItemsError) {
      throw new Error('Failed to fetch pro forma line items');
    }

    console.log('Line items fetched:', lineItems?.length || 0);

    // 3. Generate new invoice number
    const { data: invoiceNumber, error: numberError } = await supabase
      .rpc('next_doc_number', { 
        p_company_id: companyId,
        p_doc_type: 'invoice'
      });

    if (numberError || !invoiceNumber) {
      throw new Error('Failed to generate invoice number');
    }

    console.log('Generated invoice number:', invoiceNumber);

    // 4. Create new invoice (copy pro forma data but change number and status)
    const newInvoiceData = {
      company_id: proforma.company_id,
      client_id: proforma.client_id,
      issue_date: proforma.issue_date,
      due_date: proforma.due_date,
      subtotal: proforma.subtotal,
      cgst: proforma.cgst,
      sgst: proforma.sgst,
      igst: proforma.igst,
      total: proforma.total,
      use_igst: proforma.use_igst,
      cgst_pct: proforma.cgst_pct,
      sgst_pct: proforma.sgst_pct,
      igst_pct: proforma.igst_pct,
      show_my_signature: proforma.show_my_signature,
      require_client_signature: proforma.require_client_signature,
      notes: proforma.notes,
      number: invoiceNumber,
      invoice_code: invoiceNumber,
      status: 'draft',
      document_type_id: null // Regular invoice, not custom document type
    };

    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(newInvoiceData)
      .select()
      .single();

    if (invoiceError || !newInvoice) {
      throw new Error('Failed to create invoice');
    }

    console.log('New invoice created:', newInvoice);

    // 5. Copy line items to new invoice
    if (lineItems && lineItems.length > 0) {
      const newLineItems = lineItems.map(item => ({
        invoice_id: newInvoice.id,
        item_id: item.item_id,
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price,
        cgst: item.cgst,
        sgst: item.sgst,
        amount: item.amount,
        discount_amount: item.discount_amount || 0,
        note: item.note || ''
      }));

      const { error: lineItemsInsertError } = await supabase
        .from('invoice_lines')
        .insert(newLineItems);

      if (lineItemsInsertError) {
        throw new Error('Failed to copy line items to invoice');
      }

      console.log('Line items copied successfully');
    }

    toast({
      title: "Success",
      description: `Pro Forma ${proforma.number} converted to Invoice ${invoiceNumber}`,
    });

    onSuccess?.(newInvoice.id);
    return newInvoice;

  } catch (error) {
    console.error('=== CONVERSION ERROR ===', error);
    toast({
      variant: "destructive",
      title: "Conversion Failed",
      description: error instanceof Error ? error.message : "Failed to convert Pro Forma to Invoice",
    });
    throw error;
  }
};
