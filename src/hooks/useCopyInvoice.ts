
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

      try {
        // Fetch the source invoice
        const { data: sourceInvoice, error: fetchError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', sourceInvoiceId)
          .single();

        if (fetchError) {
          console.error('🛑 Error fetching source invoice:', fetchError);
          throw fetchError;
        }

        console.log('✅ Source invoice fetched:', sourceInvoice.number || sourceInvoice.invoice_code);

        // Fetch the source invoice line items
        const { data: sourceLineItems, error: lineItemsError } = await supabase
          .from('invoice_lines')
          .select('*')
          .eq('invoice_id', sourceInvoiceId);

        if (lineItemsError) {
          console.error('🛑 Error fetching line items:', lineItemsError);
          throw lineItemsError;
        }

        console.log('✅ Line items fetched:', sourceLineItems?.length || 0);

        // Generate new document number and determine document type
        let newDocumentNumber;
        let finalDocumentType;
        
        if (customTypeId) {
          console.log('📝 Handling custom document type with ID:', customTypeId);
          
          try {
            const { data: generatedNumber, error: numberError } = await supabase
              .rpc('next_doc_number', { 
                p_company_id: currentCompany.id,
                p_doc_type: 'custom',
                p_custom_type_id: customTypeId
              });

            console.log('📝 Custom document number generation result:', { generatedNumber, numberError });

            if (numberError) {
              console.error('🛑 Error generating custom document number:', numberError);
              throw numberError;
            }
            newDocumentNumber = generatedNumber;
            finalDocumentType = 'custom';
          } catch (e) {
            console.error('🛑 Unexpected error in custom number generation:', e);
            throw e;
          }
        } else {
          // Handle built-in document types - map to correct RPC parameter
          let rpcDocType = targetType;
          if (targetType === 'credit') {
            rpcDocType = 'credit';
            finalDocumentType = 'credit';
          } else if (targetType === 'quote') {
            rpcDocType = 'quote';
            finalDocumentType = 'quote';
          } else if (targetType === 'proforma') {
            rpcDocType = 'proforma';
            finalDocumentType = 'proforma';
          } else {
            rpcDocType = 'invoice';
            finalDocumentType = 'invoice';
          }
          
          console.log('📝 Built-in document type mapping:', {
            originalTargetType: targetType,
            rpcDocType: rpcDocType,
            finalDocumentType: finalDocumentType
          });

          try {
            // Call the 2-parameter version of the function explicitly
            const { data: generatedNumber, error: numberError } = await supabase
              .rpc('next_doc_number', { 
                p_company_id: currentCompany.id,
                p_doc_type: rpcDocType
              });

            console.log('📝 Built-in document number generation result:', {
              generatedNumber,
              numberError,
              rpcParams: {
                p_company_id: currentCompany.id,
                p_doc_type: rpcDocType
              }
            });

            if (numberError) {
              console.error('🛑 Error generating document number:', numberError);
              throw numberError;
            }
            
            newDocumentNumber = generatedNumber;
          } catch (e) {
            console.error('🛑 Unexpected error in built-in number generation:', e);
            throw e;
          }
        }

        console.log('✅ Final document details:', {
          newDocumentNumber,
          finalDocumentType
        });

        // Create the new invoice with the correct document_type
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
          document_type: finalDocumentType, // This is the key fix - always set the correct document_type
          status: 'draft',
          number: newDocumentNumber,
          invoice_code: newDocumentNumber
        };

        console.log('📝 Creating new invoice with data:', JSON.stringify(newInvoiceData, null, 2));

        try {
          const { data: newInvoice, error: createError } = await supabase
            .from('invoices')
            .insert(newInvoiceData)
            .select()
            .single();

          console.log('📝 Invoice creation result:', { newInvoice, createError });

          if (createError) {
            console.error('🛑 Error creating new invoice:', createError);
            throw createError;
          }

          console.log('✅ New invoice created successfully:', {
            id: newInvoice.id,
            number: newInvoice.number,
            invoice_code: newInvoice.invoice_code,
            document_type: newInvoice.document_type
          });

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

            console.log('📝 Copying line items:', newLineItems.length);

            const { error: lineItemsInsertError } = await supabase
              .from('invoice_lines')
              .insert(newLineItems);

            if (lineItemsInsertError) {
              console.error('🛑 Error copying line items:', lineItemsInsertError);
              throw lineItemsInsertError;
            }

            console.log('✅ Line items copied successfully');
          }

          console.log('=== COPY OPERATION SUCCESS ===');

          return { newInvoice, targetType: finalDocumentType, customTypeId };
        } catch (e) {
          console.error('🛑 Unexpected error in invoice creation:', e);
          throw e;
        }
      } catch (e) {
        console.error('🛑 Unexpected error in copy operation:', e);
        throw e;
      }
    },
    onSuccess: ({ newInvoice, targetType, customTypeId }) => {
      console.log('✅ Copy operation completed successfully');
      console.log('Target document type:', targetType);
      
      // Invalidate all relevant queries to refresh the lists
      queryClient.removeQueries({ queryKey: ['invoices'] });
      queryClient.removeQueries({ queryKey: ['proformas'] });
      queryClient.removeQueries({ queryKey: ['quotations'] });
      queryClient.removeQueries({ queryKey: ['custom-documents'] });
      
      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['custom-documents'] });

      // Determine the document type name and navigation path
      let docTypeName = 'Document';
      let navigationPath = '';
      
      if (customTypeId) {
        docTypeName = 'Document';
        navigationPath = `/custom/${customTypeId}/${newInvoice.id}`;
      } else {
        switch (targetType) {
          case 'proforma':
            docTypeName = 'Pro Forma';
            navigationPath = `/proforma/${newInvoice.id}`;
            break;
          case 'quote':
            docTypeName = 'Quotation';
            navigationPath = `/quotations/${newInvoice.id}`;
            break;
          case 'invoice':
            docTypeName = 'Invoice';
            navigationPath = `/invoices/${newInvoice.id}`;
            break;
          case 'credit':
            docTypeName = 'Credit Note';
            navigationPath = `/invoices/${newInvoice.id}`;
            break;
          default:
            docTypeName = 'Document';
            navigationPath = `/invoices/${newInvoice.id}`;
        }
      }

      // Show success message
      toast({
        title: "Copy Successful!",
        description: `${docTypeName} ${newInvoice.number} has been created successfully. Redirecting...`,
        duration: 4000,
      });

      console.log('Navigating to:', navigationPath);

      // Navigate after a delay to allow queries to refresh
      setTimeout(() => {
        navigate(navigationPath);
      }, 1500);
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
