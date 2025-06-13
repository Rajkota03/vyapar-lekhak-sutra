
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/context/CompanyContext";
import { toast } from "@/hooks/use-toast";

export const useCopyInvoice = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  const copyInvoice = useMutation({
    mutationFn: async ({ 
      sourceInvoiceId, 
      targetType, 
      customTypeId 
    }: { 
      sourceInvoiceId: string; 
      targetType: string; 
      customTypeId?: string; 
    }) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      console.log('Copying invoice:', sourceInvoiceId, 'to type:', targetType, 'custom type:', customTypeId);

      // Fetch the source invoice
      const { data: sourceInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', sourceInvoiceId)
        .single();

      if (fetchError) {
        console.error('Error fetching source invoice:', fetchError);
        throw fetchError;
      }

      // Fetch the source invoice line items
      const { data: sourceLineItems, error: lineItemsError } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', sourceInvoiceId);

      if (lineItemsError) {
        console.error('Error fetching line items:', lineItemsError);
        throw lineItemsError;
      }

      // Generate new document number
      let newDocumentNumber;
      if (customTypeId) {
        const { data: generatedNumber, error: numberError } = await supabase
          .rpc('next_doc_number', { 
            p_company_id: currentCompany.id,
            p_doc_type: 'custom',
            p_custom_type_id: customTypeId
          });

        if (numberError) {
          console.error('Error generating custom document number:', numberError);
          throw numberError;
        }
        newDocumentNumber = generatedNumber;
      } else {
        const { data: generatedNumber, error: numberError } = await supabase
          .rpc('next_doc_number', { 
            p_company_id: currentCompany.id,
            p_doc_type: targetType
          });

        if (numberError) {
          console.error('Error generating document number:', numberError);
          throw numberError;
        }
        newDocumentNumber = generatedNumber;
      }

      // Create the new invoice
      const newInvoiceData = {
        company_id: sourceInvoice.company_id,
        client_id: sourceInvoice.client_id,
        issue_date: new Date().toISOString().split('T')[0], // Today's date
        due_date: sourceInvoice.due_date,
        subtotal: sourceInvoice.subtotal,
        cgst: sourceInvoice.cgst,
        sgst: sourceInvoice.sgst,
        igst: sourceInvoice.igst,
        total: sourceInvoice.total,
        use_igst: sourceInvoice.use_igst,
        cgst_pct: sourceInvoice.cgst_pct,
        sgst_pct: sourceInvoice.sgst_pct,
        igst_pct: sourceInvoice.igst_pct,
        show_my_signature: sourceInvoice.show_my_signature,
        require_client_signature: sourceInvoice.require_client_signature,
        notes: sourceInvoice.notes,
        document_type_id: customTypeId || null,
        status: 'draft',
        number: newDocumentNumber,
        invoice_code: newDocumentNumber
      };

      console.log('Creating new invoice with data:', newInvoiceData);

      const { data: newInvoice, error: createError } = await supabase
        .from('invoices')
        .insert(newInvoiceData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating new invoice:', createError);
        throw createError;
      }

      // Copy line items
      if (sourceLineItems && sourceLineItems.length > 0) {
        const newLineItems = sourceLineItems.map(item => ({
          invoice_id: newInvoice.id,
          item_id: item.item_id,
          description: item.description,
          qty: item.qty,
          unit_price: item.unit_price,
          cgst: item.cgst,
          sgst: item.sgst,
          amount: item.amount,
          discount_amount: item.discount_amount,
          note: item.note
        }));

        const { error: lineItemsInsertError } = await supabase
          .from('invoice_lines')
          .insert(newLineItems);

        if (lineItemsInsertError) {
          console.error('Error copying line items:', lineItemsInsertError);
          throw lineItemsInsertError;
        }
      }

      return { newInvoice, targetType, customTypeId };
    },
    onSuccess: ({ newInvoice, targetType, customTypeId }) => {
      console.log('Invoice copied successfully:', newInvoice);
      
      // Invalidate ALL relevant queries to ensure data is refreshed
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['custom-documents'] });
      
      // Also invalidate specific company queries
      if (currentCompany?.id) {
        queryClient.invalidateQueries({ queryKey: ['invoices', currentCompany.id] });
        queryClient.invalidateQueries({ queryKey: ['proformas', currentCompany.id] });
        queryClient.invalidateQueries({ queryKey: ['quotations', currentCompany.id] });
        if (customTypeId) {
          queryClient.invalidateQueries({ queryKey: ['custom-documents', customTypeId, currentCompany.id] });
        }
      }

      // Determine the document type name for the toast
      let docTypeName = 'Document';
      if (customTypeId) {
        docTypeName = 'Document';
      } else {
        docTypeName = targetType === 'proforma' ? 'Pro Forma' : 
                    targetType === 'quote' ? 'Quotation' : 'Invoice';
      }

      toast({
        title: "Success",
        description: `${docTypeName} ${newInvoice.number} created successfully`,
      });

      // Navigate to the new document
      let navigationPath = '';
      if (customTypeId) {
        navigationPath = `/custom/${customTypeId}/${newInvoice.id}`;
      } else {
        const basePath = targetType === 'proforma' ? '/proforma' : 
                        targetType === 'quote' ? '/quotations' : '/invoices';
        navigationPath = `${basePath}/${newInvoice.id}`;
      }
      
      navigate(navigationPath);
    },
    onError: (error) => {
      console.error('Error copying invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy document. Please try again.",
      });
    },
  });

  return {
    copyInvoice: copyInvoice.mutate,
    isLoading: copyInvoice.isPending,
  };
};
