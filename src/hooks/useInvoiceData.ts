
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export type Client = {
  id: string;
  name: string;
  email?: string;
  gstin?: string;
  billing_address?: string;
  phone?: string;
};

export type LineItem = {
  id?: string;
  item_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  cgst?: number;
  sgst?: number;
  amount: number;
};

export type Item = {
  id: string;
  name: string;
  code?: string;
  default_price?: number;
  default_cgst?: number;
  default_sgst?: number;
};

type Invoice = {
  id?: string;
  number: string;
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
};

export const useInvoiceData = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  
  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*');
        
      if (error) throw error;
      return data || [];
    },
  });

  // Set first company as selected if not already set
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch existing invoice data if editing
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch invoice line items if editing
  const { data: invoiceLineItems, isLoading: isLoadingLines } = useQuery({
    queryKey: ['invoiceLines', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('invoice_lines')
        .select(`
          *,
          items (*)
        `)
        .eq('invoice_id', id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch clients for the selected company
  const { data: clients } = useQuery({
    queryKey: ['clients', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', selectedCompanyId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch items for the selected company
  const { data: items } = useQuery({
    queryKey: ['items', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('company_id', selectedCompanyId);
        
      if (error) throw error;
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

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = lineItems.reduce((sum, item) => {
    if (item.cgst) {
      return sum + (item.amount * item.cgst / 100);
    }
    return sum;
  }, 0);
  const sgstAmount = lineItems.reduce((sum, item) => {
    if (item.sgst) {
      return sum + (item.amount * item.sgst / 100);
    }
    return sum;
  }, 0);
  const grandTotal = subtotal + cgstAmount + sgstAmount;

  // Generate a new invoice number
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV-${year}${month}-${random}`;
  };

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (navigate: (path: string) => void) => {
      if (!selectedClient || !selectedCompanyId) {
        throw new Error("Client and company are required");
      }
      
      setIsSubmitting(true);
      
      try {
        // Format data for saving
        const invoiceNumber = isEditing && invoiceData ? 
          invoiceData.number : 
          generateInvoiceNumber();
          
        const invoicePayload: Invoice = {
          id: isEditing ? id : undefined,
          number: invoiceNumber,
          company_id: selectedCompanyId,
          client_id: selectedClient.id,
          issue_date: format(selectedDate, 'yyyy-MM-dd'),
          subtotal: Number(subtotal.toFixed(2)),
          cgst: Number(cgstAmount.toFixed(2)),
          sgst: Number(sgstAmount.toFixed(2)),
          igst: 0,
          total: Number(grandTotal.toFixed(2)),
          status: 'draft',
        };
        
        let invoiceId: string;
        
        // Insert or update invoice
        if (isEditing) {
          const { error: updateError } = await supabase
            .from('invoices')
            .update(invoicePayload)
            .eq('id', id);
            
          if (updateError) throw updateError;
          invoiceId = id!;
        } else {
          const { data: newInvoice, error: insertError } = await supabase
            .from('invoices')
            .insert(invoicePayload)
            .select('id')
            .single();
            
          if (insertError) throw insertError;
          invoiceId = newInvoice.id;
        }
        
        // Delete existing line items if editing
        if (isEditing) {
          const { error: deleteError } = await supabase
            .from('invoice_lines')
            .delete()
            .eq('invoice_id', invoiceId);
            
          if (deleteError) throw deleteError;
        }
        
        // Insert line items
        const lineItemsToInsert = lineItems.map(item => ({
          invoice_id: invoiceId,
          item_id: item.item_id,
          description: item.description,
          qty: item.qty,
          unit_price: item.unit_price,
          cgst: item.cgst,
          sgst: item.sgst,
          amount: item.amount,
        }));
        
        const { error: lineItemsError } = await supabase
          .from('invoice_lines')
          .insert(lineItemsToInsert);
          
        if (lineItemsError) throw lineItemsError;
        
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        toast({ 
          title: "Success", 
          description: `Invoice ${isEditing ? 'updated' : 'created'} successfully` 
        });
        navigate('/invoice-list');
        
        return { success: true };
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
    subtotal,
    cgstAmount,
    sgstAmount,
    grandTotal,
    saveInvoiceMutation,
    isSubmitting,
    selectedCompanyId,
  };
};
