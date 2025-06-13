import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingActionBar } from "@/components/layout/FloatingActionBar";
import BillingInvoiceTable from "@/components/invoice/BillingInvoiceTable";

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

type SortDirection = 'asc' | 'desc';

const Billing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL params, default to 'invoices'
  const activeTab = searchParams.get('tab') || 'invoices';
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
    setSearchQuery(""); // Clear search when switching tabs
  };

  // Fetch user's companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Set first company as selected if not already set
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch invoices with refetch on focus and better cache management
  const { data: invoices, isLoading: isLoadingInvoices, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices', selectedCompanyId, user?.id, sortDirection],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
      console.log('Fetching invoices for company:', selectedCompanyId);
      
      const { data: invoicesData, error } = await supabase
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
        .eq('company_id', selectedCompanyId)
        .is('document_type_id', null)
        .not('number', 'like', 'PF-%')
        .not('number', 'like', 'QUO-%')
        .order('issue_date', { ascending: sortDirection === 'asc' })
        .order('created_at', { ascending: sortDirection === 'asc' });

      if (error) throw error;
      console.log('Invoices fetched:', invoicesData?.length || 0);
      return invoicesData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });

  // Fetch pro formas with refetch on focus and better cache management
  const { data: proformas, isLoading: isLoadingProFormas, refetch: refetchProformas } = useQuery({
    queryKey: ['proformas', selectedCompanyId, user?.id, sortDirection],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
      console.log('Fetching proformas for company:', selectedCompanyId);
      
      const { data: proformaData, error } = await supabase
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
        .eq('company_id', selectedCompanyId)
        .like('number', 'PF-%')
        .order('issue_date', { ascending: sortDirection === 'asc' })
        .order('created_at', { ascending: sortDirection === 'asc' });

      if (error) throw error;
      console.log('Proformas fetched:', proformaData?.length || 0);
      return proformaData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });

  // Listen for navigation events and refetch data
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refetching data...');
      if (activeTab === 'invoices') {
        refetchInvoices();
      } else if (activeTab === 'proformas') {
        refetchProformas();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    // Also refetch when coming back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, refetchInvoices, refetchProformas]);

  // Filter data based on search
  const getFilteredData = (data: Invoice[]) => {
    if (!data) return [];
    
    return searchQuery.trim() 
      ? data.filter(item => 
          item.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.invoice_code?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data;
  };

  const filteredInvoices = useMemo(() => 
    getFilteredData(invoices || []), 
    [invoices, searchQuery]
  );

  const filteredProFormas = useMemo(() => 
    getFilteredData(proformas || []), 
    [proformas, searchQuery]
  );

  // Handle sorting
  const handleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle clicks
  const handleInvoiceClick = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleProFormaClick = (proformaId: string) => {
    navigate(`/proforma/${proformaId}`);
  };

  const handleCreateInvoice = () => {
    queryClient.removeQueries({ queryKey: ['invoice'] });
    navigate('/invoices/new');
  };

  const handleCreateProForma = () => {
    queryClient.removeQueries({ queryKey: ['invoice'] });
    navigate('/proforma/new');
  };

  // New action handlers for swipe functionality
  const handleEdit = (invoiceId: string) => {
    const basePath = activeTab === 'invoices' ? '/invoices' : '/proforma';
    navigate(`${basePath}/${invoiceId}`);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      // Refetch data after deletion
      if (activeTab === 'invoices') {
        refetchInvoices();
      } else {
        refetchProformas();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document",
      });
    }
  };

  const handleDuplicate = async (invoiceId: string) => {
    try {
      // Fetch the original invoice data
      const { data: originalInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (fetchError || !originalInvoice) throw fetchError;

      // Create a new invoice with duplicated data
      const { data: newInvoice, error: createError } = await supabase
        .from('invoices')
        .insert({
          ...originalInvoice,
          id: undefined,
          number: `${originalInvoice.number}-COPY`,
          invoice_code: null,
          status: 'draft',
          created_at: undefined,
          updated_at: undefined
        })
        .select()
        .single();

      if (createError || !newInvoice) throw createError;

      // Fetch and duplicate line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (lineItemsError) throw lineItemsError;

      if (lineItems && lineItems.length > 0) {
        const duplicatedLineItems = lineItems.map(item => ({
          ...item,
          id: undefined,
          invoice_id: newInvoice.id,
          created_at: undefined,
          updated_at: undefined
        }));

        const { error: lineItemsInsertError } = await supabase
          .from('invoice_lines')
          .insert(duplicatedLineItems);

        if (lineItemsInsertError) throw lineItemsInsertError;
      }

      toast({
        title: "Success",
        description: "Document duplicated successfully",
      });

      // Navigate to the new invoice
      const basePath = activeTab === 'invoices' ? '/invoices' : '/proforma';
      navigate(`${basePath}/${newInvoice.id}`);
    } catch (error) {
      console.error('Error duplicating document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate document",
      });
    }
  };

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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view billing documents</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You need to create a company before creating billing documents.</p>
          <Button onClick={() => navigate('/company/new')}>
            Create Company
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentData = activeTab === 'invoices' ? filteredInvoices : filteredProFormas;
  const isLoading = activeTab === 'invoices' ? isLoadingInvoices : isLoadingProFormas;
  const handleClick = activeTab === 'invoices' ? handleInvoiceClick : handleProFormaClick;
  const handleCreate = activeTab === 'invoices' ? handleCreateInvoice : handleCreateProForma;
  const createLabel = activeTab === 'invoices' ? 'New Invoice' : 'New Pro Forma';
  const emptyMessage = activeTab === 'invoices' ? 'No invoices found' : 'No pro forma documents found';
  const createFirstMessage = activeTab === 'invoices' ? 'Create your first invoice' : 'Create your first pro forma';

  const floatingActions = [
    {
      label: createLabel,
      onClick: handleCreate,
      variant: "primary" as const,
      icon: <Plus className="h-6 w-6" />
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-white px-0 py-[8px] my-[8px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight px-[8px]">Billing</h1>
        </div>

        {/* Company Selector */}
        {companies && companies.length > 1 && (
          <div className="flex items-center space-x-2 px-[8px]">
            <label className="text-sm font-medium">Company:</label>
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              📄 Invoices ({invoices?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="proformas" className="flex items-center gap-2">
              📋 Pro Formas ({proformas?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative mb-4 px-[8px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by client name or document number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <TabsContent value="invoices" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : currentData && currentData.length > 0 ? (
              <BillingInvoiceTable
                invoices={currentData}
                onInvoiceClick={handleClick}
                sortDirection={sortDirection}
                onSort={handleSort}
                searchQuery={searchQuery}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ) : (
              <div className="text-center py-12 border rounded-md mx-[8px]">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? `No invoices found matching "${searchQuery}"` : emptyMessage}
                </p>
                {!searchQuery && (
                  <Button variant="outline" onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {createFirstMessage}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="proformas" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : currentData && currentData.length > 0 ? (
              <BillingInvoiceTable
                invoices={currentData}
                onInvoiceClick={handleClick}
                sortDirection={sortDirection}
                onSort={handleSort}
                searchQuery={searchQuery}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ) : (
              <div className="text-center py-12 border rounded-md mx-[8px]">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? `No pro formas found matching "${searchQuery}"` : emptyMessage}
                </p>
                {!searchQuery && (
                  <Button variant="outline" onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {createFirstMessage}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <FloatingActionBar actions={floatingActions} show={true} />
      </div>
    </DashboardLayout>
  );
};

export default Billing;
