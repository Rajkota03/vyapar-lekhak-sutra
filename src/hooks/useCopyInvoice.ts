
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

      console.log('=== COPY OPERATION START ===');
      console.log('Source Invoice ID:', sourceInvoiceId);
      console.log('Target Type:', targetType);
      console.log('Custom Type ID:', customTypeId);
      console.log('Company ID:', currentCompany.id);

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

      console.log('Source invoice fetched:', sourceInvoice.number || sourceInvoice.invoice_code);

      // Fetch the source invoice line items
      const { data: sourceLineItems, error: lineItemsError } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', sourceInvoiceId);

      if (lineItemsError) {
        console.error('Error fetching line items:', lineItemsError);
        throw lineItemsError;
      }

      console.log('Line items fetched:', sourceLineItems?.length || 0);

      // Generate new document number based on target type
      let newDocumentNumber;
      let documentPrefix;
      
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
        documentPrefix = generatedNumber;
      } else {
        // Use the correct document type for RPC call
        const docTypeMap = {
          'invoice': 'invoice',
          'proforma': 'proforma', 
          'quote': 'quote'
        };

        const rpcDocType = docTypeMap[targetType as keyof typeof docTypeMap] || targetType;
        console.log('RPC document type:', rpcDocType);

        const { data: generatedNumber, error: numberError } = await supabase
          .rpc('next_doc_number', { 
            p_company_id: currentCompany.id,
            p_doc_type: rpcDocType
          });

        if (numberError) {
          console.error('Error generating document number:', numberError);
          throw numberError;
        }
        
        console.log('Generated number from RPC:', generatedNumber);
        
        // For quotations, ensure we always use QUO- prefix
        if (targetType === 'quote') {
          // The RPC should return QUO-X format, but let's ensure it
          documentPrefix = generatedNumber.startsWith('QUO-') ? generatedNumber : `QUO-${generatedNumber}`;
        } else if (targetType === 'proforma') {
          documentPrefix = generatedNumber.startsWith('PF-') ? generatedNumber : `PF-${generatedNumber}`;
        } else {
          documentPrefix = generatedNumber.startsWith('INV-') ? generatedNumber : `INV-${generatedNumber}`;
        }
        
        newDocumentNumber = documentPrefix;
      }

      console.log('Final document prefix/number:', documentPrefix);

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
        number: documentPrefix,
        invoice_code: documentPrefix
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

      console.log('New invoice created:', newInvoice.id, newInvoice.number);

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

        console.log('Line items copied:', newLineItems.length);
      }

      console.log('=== COPY OPERATION SUCCESS ===');

      return { newInvoice, targetType, customTypeId };
    },
    onSuccess: ({ newInvoice, targetType, customTypeId }) => {
      console.log('Copy operation completed successfully');
      
      // Comprehensive query invalidation
      queryClient.removeQueries({ queryKey: ['invoices'] });
      queryClient.removeQueries({ queryKey: ['proformas'] });
      queryClient.removeQueries({ queryKey: ['quotations'] });
      queryClient.removeQueries({ queryKey: ['custom-documents'] });
      
      // Force immediate refetch
      queryClient.invalidateQueries({ 
        queryKey: ['invoices'], 
        refetchType: 'all',
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['proformas'], 
        refetchType: 'all',
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['quotations'], 
        refetchType: 'all',
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['custom-documents'], 
        refetchType: 'all',
        exact: false 
      });

      // Determine the document type name for the toast
      let docTypeName = 'Document';
      let navigationPath = '';
      
      if (customTypeId) {
        docTypeName = 'Document';
        navigationPath = `/custom/${customTypeId}/${newInvoice.id}`;
      } else {
        if (targetType === 'proforma') {
          docTypeName = 'Pro Forma';
          navigationPath = `/proforma/${newInvoice.id}`;
        } else if (targetType === 'quote') {
          docTypeName = 'Quotation';
          navigationPath = `/quotations/${newInvoice.id}`;
        } else {
          docTypeName = 'Invoice';
          navigationPath = `/invoices/${newInvoice.id}`;
        }
      }

      // Show success message immediately
      toast({
        title: "Copy Successful!",
        description: `${docTypeName} ${newInvoice.number} has been created successfully. Redirecting...`,
        duration: 4000,
      });

      console.log('Navigating to:', navigationPath);

      // Navigate after a delay to allow queries to refresh
      setTimeout(() => {
        navigate(navigationPath);
      }, 2000); // 2 second delay to ensure queries refresh
    },
    onError: (error) => {
      console.error('=== COPY OPERATION FAILED ===');
      console.error('Error copying invoice:', error);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy document. Please try again.",
        duration: 5000,
      });
    },
  });

  return {
    copyInvoice: copyInvoice.mutate,
    isLoading: copyInvoice.isPending,
  };
};
