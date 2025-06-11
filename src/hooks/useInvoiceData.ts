
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/context/CompanyContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { calcTotals, TaxConfig } from "@/utils/invoiceMath";

interface LineItem {
  id?: string;
  item_id: string;
  description: string;
  qty: number;
  unit_price: number;
  cgst: number;
  sgst: number;
  amount: number;
  discount_amount?: number;
  note?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  billing_address?: string;
  shipping_address?: string;
  gstin?: string;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  unit_price: number;
}

export const useInvoiceData = () => {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();

  // Extract invoice ID from params - handle both /invoices/:id and /invoices/:companyId/:invoiceId patterns
  const invoiceId = params.id || params.invoiceId || (params["*"] && params["*"].includes("/") ? params["*"].split("/")[1] : params["*"]);
  const selectedCompanyId = params.companyId || currentCompany?.id || null;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState<any>(null);

  // Log URL params extraction
  useEffect(() => {
    console.log('=== URL PARAMS EXTRACTION ===');
    console.log('Raw params object:', params);
    console.log('params.id:', params.id);
    console.log('params.invoiceId:', params.invoiceId);
    console.log('params["*"]:', params["*"]);
    console.log('Extracted Invoice ID:', invoiceId);
    console.log('URL pathname:', window.location.pathname);
    console.log('Selected Company ID:', selectedCompanyId);
  }, [params, invoiceId, selectedCompanyId]);

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) {
        console.log('No company ID for clients query');
        return [];
      }
      
      console.log('=== FETCHING CLIENTS ===');
      console.log('Company ID:', selectedCompanyId);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', selectedCompanyId);
      if (error) {
        console.error('Error fetching clients:', error);
        throw new Error(error.message);
      }
      console.log('Clients fetched:', data?.length || 0);
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) {
        console.log('No company ID for items query');
        return [];
      }
      
      console.log('=== FETCHING ITEMS ===');
      console.log('Company ID:', selectedCompanyId);
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('company_id', selectedCompanyId);
      if (error) {
        console.error('Error fetching items:', error);
        throw new Error(error.message);
      }
      console.log('Items fetched:', data?.length || 0);
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      console.log('=== FETCHING EXISTING INVOICE ===');
      console.log('Invoice ID:', invoiceId);
      
      setIsEditing(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
      if (error) {
        console.error('Error fetching invoice:', error);
        throw new Error(error.message);
      }
      
      console.log('Invoice fetched:', data);
      setSelectedDate(new Date(data.issue_date));
      
      // Fetch the client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', data.client_id)
        .single();

      if (clientError) {
        console.error('Error fetching client:', clientError);
        throw new Error(clientError.message);
      }
      
      console.log('Client fetched:', clientData);
      setSelectedClient(clientData);

      // Fetch line items
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (lineItemsError) {
        console.error('Error fetching line items:', lineItemsError);
        throw new Error(lineItemsError.message);
      }

      // Transform line items to match expected format
      const formattedLineItems = (lineItemsData || []).map(item => ({
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

      console.log('Line items fetched and formatted:', formattedLineItems);
      setLineItems(formattedLineItems);
      setExistingInvoice(data);
      return data;
    },
    enabled: !!invoiceId,
  });

  const saveInvoiceMutation = useMutation({
    mutationFn: async ({
      navigate,
      taxConfig,
      showMySignature,
      requireClientSignature
    }: {
      navigate: any;
      taxConfig: TaxConfig;
      showMySignature: boolean;
      requireClientSignature: boolean;
    }) => {
      console.log('=== SAVE INVOICE MUTATION START ===');
      console.log('Selected Company ID:', selectedCompanyId);
      console.log('Selected Client:', selectedClient);
      console.log('Line Items:', lineItems);
      console.log('Tax config:', taxConfig);
      console.log('Show my signature:', showMySignature);
      console.log('Require client signature:', requireClientSignature);
      
      if (!selectedClient || !selectedCompanyId) {
        const errorMsg = `Missing required data - Client: ${!!selectedClient}, Company: ${!!selectedCompanyId}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (lineItems.length === 0) {
        const errorMsg = 'No line items to save';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const totals = calcTotals(lineItems, taxConfig);
      console.log('Calculated totals:', totals);

      const invoiceData = {
        company_id: selectedCompanyId,
        client_id: selectedClient.id,
        issue_date: format(selectedDate, 'yyyy-MM-dd'),
        subtotal: totals.subtotal,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        total: totals.total,
        use_igst: taxConfig.useIgst,
        cgst_pct: taxConfig.cgstPct,
        sgst_pct: taxConfig.sgstPct,
        igst_pct: taxConfig.igstPct,
        show_my_signature: showMySignature,
        require_client_signature: requireClientSignature
      };

      console.log('Final invoice data to save:', invoiceData);

      let savedInvoice;

      if (isEditing && existingInvoice) {
        console.log('=== UPDATING EXISTING INVOICE ===');
        console.log('Existing invoice ID:', existingInvoice.id);
        
        const { data: updatedInvoice, error: updateError } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', existingInvoice.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating invoice:', updateError);
          throw updateError;
        }

        console.log('Updated invoice:', updatedInvoice);
        savedInvoice = updatedInvoice;

        // Delete existing line items
        console.log('Deleting existing line items for invoice:', existingInvoice.id);
        const { error: deleteError } = await supabase
          .from('invoice_lines')
          .delete()
          .eq('invoice_id', existingInvoice.id);

        if (deleteError) {
          console.error('Error deleting existing line items:', deleteError);
          throw deleteError;
        }
        console.log('Existing line items deleted');
      } else {
        console.log('=== CREATING NEW INVOICE ===');
        
        // Generate invoice number
        const { data: invoiceNumber, error: numberError } = await supabase
          .rpc('next_invoice_number', { p_company_id: selectedCompanyId });

        if (numberError) {
          console.error('Error generating invoice number:', numberError);
          throw numberError;
        }

        console.log('Generated invoice number:', invoiceNumber);

        const newInvoiceData = {
          ...invoiceData,
          number: invoiceNumber,
          invoice_code: invoiceNumber
        };

        console.log('New invoice data:', newInvoiceData);

        const { data: newInvoice, error: createError } = await supabase
          .from('invoices')
          .insert(newInvoiceData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating invoice:', createError);
          throw createError;
        }

        console.log('Created invoice:', newInvoice);
        savedInvoice = newInvoice;
      }

      // Insert line items
      if (lineItems.length > 0) {
        console.log('=== INSERTING LINE ITEMS ===');
        console.log('Line items to insert:', lineItems);
        
        const lineItemsData = lineItems.map(item => ({
          invoice_id: savedInvoice.id,
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

        console.log('Formatted line items data:', lineItemsData);

        const { error: lineItemsError } = await supabase
          .from('invoice_lines')
          .insert(lineItemsData);

        if (lineItemsError) {
          console.error('Error inserting line items:', lineItemsError);
          throw lineItemsError;
        }

        console.log('Line items inserted successfully');
      }

      console.log('=== SAVE INVOICE MUTATION SUCCESS ===');
      return savedInvoice;
    },
    onSuccess: (savedInvoice) => {
      console.log('=== INVOICE SAVED SUCCESSFULLY ===');
      console.log('Saved invoice:', savedInvoice);
      console.log('Signature settings in saved invoice:');
      console.log('- show_my_signature:', savedInvoice.show_my_signature);
      console.log('- require_client_signature:', savedInvoice.require_client_signature);
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', savedInvoice.id] });
      
      toast({
        title: "Success",
        description: `Invoice ${savedInvoice.number} saved successfully`,
      });

      navigate(`/invoices/${savedInvoice.id}`);
    },
    onError: (error) => {
      console.error('=== INVOICE SAVE ERROR ===');
      console.error('Error details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save invoice. Please try again.",
      });
    },
  });

  return {
    isEditing,
    isLoading: isLoadingClients || isLoadingItems || isLoadingInvoice,
    selectedDate,
    setSelectedDate,
    selectedClient,
    setSelectedClient,
    lineItems,
    setLineItems,
    clients,
    items,
    saveInvoiceMutation,
    isSubmitting: saveInvoiceMutation.isPending,
    selectedCompanyId,
    existingInvoice
  };
};
