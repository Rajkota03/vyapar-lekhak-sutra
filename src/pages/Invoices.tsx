
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Invoice = {
  id: string;
  invoice_code: string | null;
  number: string;
  issue_date: string;
  total: number;
  status: string | null;
  clients: {
    name: string;
  } | null;
};

type FilterStatus = "all" | "sent" | "paid" | "draft";

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Fetch user's companies
  const { data: companies, isLoading: isLoadingCompanies, error: companiesError } = useQuery({
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
      console.log('Companies fetched successfully:', data?.length || 0, 'companies');
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

  // Fetch invoices with improved error handling
  const { data: invoices, isLoading: isLoadingInvoices, error: invoicesError, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices', selectedCompanyId, filterStatus, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) {
        console.log('No company selected or user not available for fetching invoices');
        return [];
      }
      
      console.log('Fetching invoices for company:', selectedCompanyId, 'with status filter:', filterStatus);
      
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_code,
          number,
          issue_date,
          total,
          status,
          clients ( name )
        `)
        .eq('company_id', selectedCompanyId);
        
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      query = query.order('created_at', { ascending: false });
        
      const { data: invoicesData, error } = await query;
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      console.log('Invoices fetched successfully:', invoicesData?.length || 0, 'invoices');
      return invoicesData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user,
  });

  // Force refresh invoices when component mounts
  useEffect(() => {
    if (selectedCompanyId && user) {
      refetchInvoices();
    }
  }, [selectedCompanyId, user, refetchInvoices]);

  // Debug log for invoices data
  useEffect(() => {
    console.log('Current invoices data:', invoices);
  }, [invoices]);

  // Loading state
  if (isLoadingCompanies) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Error states
  if (companiesError || invoicesError) {
    console.error('Error loading data:', { companiesError, invoicesError });
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading data. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view invoices</p>
        </div>
      </DashboardLayout>
    );
  }

  // No companies state
  if (!companies || companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You need to create a company before creating invoices.</p>
          <Button onClick={() => navigate('/company/new')}>
            Create Company
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleInvoiceClick = (invoiceId: string) => {
    console.log('Clicking on invoice:', invoiceId);
    navigate(`/invoices/${invoiceId}`);
  };

  const handleCreateInvoice = () => {
    // Clear any cached invoice data
    queryClient.removeQueries({ queryKey: ['invoice'] });
    navigate('/invoices/new');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Invoices</h1>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={handleCreateInvoice}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>

          {companies && companies.length > 1 && (
            <div className="mt-2">
              <select
                value={selectedCompanyId || ''}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoadingInvoices ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm">
              {/* Card Header */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold mb-2">Invoice List</h2>
                <p className="text-gray-600">Manage your invoices</p>
              </div>

              {/* Table Header */}
              <div className="px-6 py-3 border-b bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600">
                  <div>Invoice Number</div>
                  <div>Client</div>
                  <div>Issue Date</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleInvoiceClick(invoice.id)}
                  >
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="font-medium text-gray-900">
                        {invoice.invoice_code || invoice.number || 'Draft Invoice'}
                      </div>
                      <div className="text-gray-700">
                        {invoice.clients?.name || 'No client'}
                      </div>
                      <div className="text-gray-600">
                        {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">No invoices yet</p>
              <Button 
                variant="outline" 
                onClick={handleCreateInvoice}
              >
                Create Invoice
              </Button>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg bg-gray-900 hover:bg-gray-800"
          onClick={handleCreateInvoice}
        >
          <Plus size={24} />
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
