
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LineItem } from "@/components/invoice/types/InvoiceTypes";
import { TaxConfig, calcTotals } from "@/utils/invoiceMath";
import { format } from "date-fns";

export type Client = {
  id: string;
  name: string;
  email?: string;
  gstin?: string;
  billing_address?: string;
  phone?: string;
};

export type Invoice = {
  id?: string;
  number: string;
  invoice_code?: string;
  company_id: string;
  client_id: string;
  issue_date: string;
  due_date?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
  use_igst?: boolean;
  cgst_pct?: number;
  sgst_pct?: number;
  igst_pct?: number;
  show_my_signature?: boolean;
  require_client_signature?: boolean;
};

interface SaveInvoiceParams {
  navigate: (path: string) => void;
  taxConfig: TaxConfig;
  showMySignature?: boolean;
  requireClientSignature?: boolean;
}

export const useInvoiceData = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: companies, error: companiesError } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user available for fetching companies');
        return [];
      }
      
      console.log('Fetching companies for user:', user.id);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);
        
      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }
      console.log('Companies fetched:', data?.length || 0, 'companies');
      return data || [];
    },
    enabled: !!user,
  });

  // Set first company as selected if not already set
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      console.log('Setting selected company:', companies[0].id);
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch existing invoice data if editing
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log('Fetching invoice data for ID:', id);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching invoice:', error);
        throw error;
      }
      console.log('Invoice data fetched:', data);
      return data;
    },
    enabled: !!id,
  });

  // Fetch invoice line items if editing
  const { data: invoiceLineItems, isLoading: isLoadingLines } = useQuery({
    queryKey: ['invoiceLines', id],
    queryFn: async () => {
      if (!id) return [];
      
      console.log('Fetching invoice line items for ID:', id);
      const { data, error } = await supabase
        .from('invoice_lines')
        .select(`
          *,
          items (*)
        `)
        .eq('invoice_id', id);
        
      if (error) {
        console.error('Error fetching invoice line items:', error);
        throw error;
      }
      console.log('Invoice line items fetched:', data);
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch clients for the selected company
  const { data: clients } = useQuery({
    queryKey: ['clients', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      console.log('Fetching clients for company:', selectedCompanyId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', selectedCompanyId);
        
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      console.log('Clients fetched:', data);
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch items for the selected company
  const { data: items } = useQuery({
    queryKey: ['items', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      console.log('Fetching items for company:', selectedCompanyId);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('company_id', selectedCompanyId);
        
      if (error) {
        console.error('Error fetching items:', error);
        throw error;
      }
      console.log('Items fetched:', data);
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  // Populate form with existing data if editing
  useEffect(() => {
    if (invoiceData && !isLoadingInvoice) {
      setSelectedDate(new Date(invoiceData.issue_date));
      setSelectedClient(invoiceData.clients);
      setSelectedCompanyId(invoiceData.company_id);
    }
  }, [invoiceData, isLoadingInvoice]);

  // Populate line items if editing
  useEffect(() => {
    if (invoiceLineItems && !isLoadingLines) {
      const formattedLines = invoiceLineItems.map(line => ({
        id: line.id,
        item_id: line.item_id,
        description: line.description,
        qty: Number(line.qty),
        unit_price: Number(line.unit_price),
        cgst: line.cgst ? Number(line.cgst) : undefined,
        sgst: line.sgst ? Number(line.sgst) : undefined,
        amount: Number(line.amount),
      }));
      
      setLineItems(formattedLines);
    }
  }, [invoiceLineItems, isLoadingLines]);

  // Save invoice mutation with improved error handling and debugging
  const saveInvoiceMutation = useMutation({
    mutationFn: async ({ navigate, taxConfig, showMySignature, requireClientSignature }: SaveInvoiceParams) => {
      if (!selectedClient || !user || !selectedCompanyId) {
        const missingItems = [];
        if (!selectedClient) missingItems.push("client");
        if (!user) missingItems.push("user authentication");
        if (!selectedCompanyId) missingItems.push("company selection");
        throw new Error(`Missing required fields: ${missingItems.join(", ")}`);
      }
      
      console.log('Starting invoice save process...', {
        selectedClient: selectedClient.id,
        lineItemsCount: lineItems.length,
        isEditing,
        selectedCompanyId,
        user: user.id
      });
      
      setIsSubmitting(true);
      
      try {
        // Generate invoice code for new invoices
        let invoiceCode = "";
        if (!isEditing) {
          console.log('Generating new invoice code...');
          const { data: codeData, error: codeError } = await supabase
            .rpc('next_invoice_number', { p_company_id: selectedCompanyId });
          
          if (codeError) {
            console.error('Error generating invoice code:', codeError);
            throw codeError;
          }
          invoiceCode = codeData;
          console.log('Generated invoice code:', invoiceCode);
        } else {
          invoiceCode = invoiceData?.invoice_code || "";
        }
        
        // Calculate totals with tax config
        const calculatedTotals = calcTotals(lineItems, taxConfig);
        console.log('Calculated totals:', calculatedTotals);
        
        // Prepare invoice payload
        const invoicePayload = {
          company_id: selectedCompanyId,
          client_id: selectedClient.id,
          issue_date: format(selectedDate, 'yyyy-MM-dd'),
          invoice_code: invoiceCode,
          number: invoiceCode,
          status: 'draft',
          subtotal: Number(calculatedTotals.subtotal.toFixed(2)),
          cgst: taxConfig.useIgst ? 0 : Number(calculatedTotals.cgst?.toFixed(2) || 0),
          sgst: taxConfig.useIgst ? 0 : Number(calculatedTotals.sgst?.toFixed(2) || 0),
          igst: taxConfig.useIgst ? Number(calculatedTotals.igst?.toFixed(2) || 0) : 0,
          total: Number(calculatedTotals.total.toFixed(2)),
          // Tax configuration
          use_igst: taxConfig.useIgst,
          cgst_pct: taxConfig.cgstPct,
          sgst_pct: taxConfig.sgstPct,
          igst_pct: taxConfig.igstPct,
          // Signature settings
          show_my_signature: showMySignature || false,
          require_client_signature: requireClientSignature || false
        };
        
        console.log('Invoice payload:', invoicePayload);
        
        let invoiceId: string;
        
        // Insert or update invoice
        if (isEditing) {
          console.log('Updating existing invoice:', id);
          const { error: updateError } = await supabase
            .from('invoices')
            .update(invoicePayload)
            .eq('id', id);
            
          if (updateError) {
            console.error('Error updating invoice:', updateError);
            throw updateError;
          }
          invoiceId = id!;
          console.log('Updated invoice with ID:', invoiceId);
        } else {
          console.log('Creating new invoice...');
          const { data: newInvoice, error: insertError } = await supabase
            .from('invoices')
            .insert(invoicePayload)
            .select('id')
            .single();
            
          if (insertError) {
            console.error('Error creating invoice:', insertError);
            throw insertError;
          }
          invoiceId = newInvoice.id;
          console.log('Created new invoice with ID:', invoiceId);
        }
        
        // Delete existing line items if editing
        if (isEditing) {
          console.log('Deleting existing line items...');
          const { error: deleteError } = await supabase
            .from('invoice_lines')
            .delete()
            .eq('invoice_id', invoiceId);
            
          if (deleteError) {
            console.error('Error deleting line items:', deleteError);
            throw deleteError;
          }
        }
        
        // Bulk insert lines
        if (lineItems.length > 0) {
          console.log('Inserting line items...');
          const linesPayload = lineItems.map(item => ({
            invoice_id: invoiceId,
            item_id: item.item_id,
            description: item.description,
            qty: item.qty,
            unit_price: item.unit_price,
            cgst: item.cgst || 0,
            sgst: item.sgst || 0,
            amount: item.amount,
            discount_amount: item.discount_amount || 0,
            note: item.note || '',
          }));
          
          console.log('Line items to insert:', linesPayload);
          
          const { error: lineItemsError } = await supabase
            .from('invoice_lines')
            .insert(linesPayload);
            
          if (lineItemsError) {
            console.error('Error inserting line items:', lineItemsError);
            throw lineItemsError;
          }
          
          console.log('Line items inserted successfully');
        }
        
        console.log('Invoice saved successfully!');
        
        toast({
          title: "Invoice saved",
          description: `Invoice ${invoiceCode} has been saved successfully.`,
        });
        
        // Invalidate and refetch queries
        await queryClient.invalidateQueries({ queryKey: ['invoices'] });
        await queryClient.invalidateQueries({ queryKey: ['invoices', selectedCompanyId] });
        await queryClient.invalidateQueries({ queryKey: ['companies'] });
        
        // Navigate to invoices list
        navigate('/invoices');
        
        return { success: true, invoiceId };
      } catch (error) {
        console.error('Error saving invoice:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        toast({
          variant: "destructive",
          title: "Error saving invoice",
          description: `Failed to save invoice: ${errorMessage}`,
        });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return {
    isEditing,
    isLoading: (isEditing && (isLoadingInvoice || isLoadingLines)) || !selectedCompanyId,
    selectedDate,
    setSelectedDate,
    selectedClient,
    setSelectedClient,
    lineItems,
    setLineItems,
    clients,
    items,
    saveInvoiceMutation,
    isSubmitting,
    selectedCompanyId,
    existingInvoice: invoiceData,
    companiesError,
  };
};
