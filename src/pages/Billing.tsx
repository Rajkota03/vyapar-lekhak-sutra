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
import DraggableInvoiceTable from "@/components/invoice/DraggableInvoiceTable";
import { convertProFormaToInvoice } from "@/utils/proformaConversion";

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
  const [invoiceOrder, setInvoiceOrder] = useState<string[]>([]);
  const [proformaOrder, setProformaOrder] = useState<string[]>([]);

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

  // Fetch invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', selectedCompanyId, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
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
        .order('issue_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return invoicesData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user
  });

  // Fetch pro formas
  const { data: proformas, isLoading: isLoadingProFormas } = useQuery({
    queryKey: ['proformas', selectedCompanyId, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
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
        .order('issue_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return proformaData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user
  });

  // Initialize orders when data loads
  useEffect(() => {
    if (invoices && invoiceOrder.length === 0) {
      setInvoiceOrder(invoices.map(inv => inv.id));
    }
  }, [invoices, invoiceOrder.length]);

  useEffect(() => {
    if (proformas && proformaOrder.length === 0) {
      setProformaOrder(proformas.map(pf => pf.id));
    }
  }, [proformas, proformaOrder.length]);

  // Filter and sort data based on search and drag order
  const getFilteredAndOrderedData = (data: Invoice[], order: string[]) => {
    if (!data) return [];
    
    // Filter by search query
    const filtered = searchQuery.trim() 
      ? data.filter(item => 
          item.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.invoice_code?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data;

    // Apply custom order if search is empty
    if (!searchQuery.trim() && order.length > 0) {
      const ordered = [];
      const dataMap = new Map(filtered.map(item => [item.id, item]));
      
      // Add items in custom order
      for (const id of order) {
        const item = dataMap.get(id);
        if (item) {
          ordered.push(item);
          dataMap.delete(id);
        }
      }
      
      // Add any remaining items (new ones not in order)
      ordered.push(...Array.from(dataMap.values()));
      return ordered;
    }
    
    return filtered;
  };

  const filteredInvoices = useMemo(() => 
    getFilteredAndOrderedData(invoices || [], invoiceOrder), 
    [invoices, invoiceOrder, searchQuery]
  );

  const filteredProFormas = useMemo(() => 
    getFilteredAndOrderedData(proformas || [], proformaOrder), 
    [proformas, proformaOrder, searchQuery]
  );

  // Handle reordering
  const handleReorder = (items: Invoice[]) => {
    const newOrder = items.map(item => item.id);
    if (activeTab === 'invoices') {
      setInvoiceOrder(newOrder);
    } else {
      setProformaOrder(newOrder);
    }
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

  // Handle deletion
  const handleDelete = async (documentId: string) => {
    try {
      console.log('Deleting document:', documentId);
      
      // Delete line items first
      const { error: lineItemsError } = await supabase
        .from('invoice_lines')
        .delete()
        .eq('invoice_id', documentId);

      if (lineItemsError) {
        throw new Error('Failed to delete document items');
      }

      // Delete the document
      const { error: documentError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', documentId);

      if (documentError) {
        throw new Error('Failed to delete document');
      }

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['proformas'] });

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
      });
    }
  };

  // Handle Pro Forma to Invoice conversion
  const handleConvertProForma = async (proformaId: string) => {
    if (!selectedCompanyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No company selected",
      });
      return;
    }

    try {
      await convertProFormaToInvoice({
        proformaId,
        companyId: selectedCompanyId,
        onSuccess: (newInvoiceId) => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['proformas'] });
          
          // Navigate to the new invoice
          navigate(`/invoices/${newInvoiceId}`);
        }
      });
    } catch (error) {
      // Error handling is done in the conversion function
      console.error('Conversion failed:', error);
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
              <DraggableInvoiceTable
                invoices={currentData}
                onInvoiceClick={handleClick}
                onReorder={handleReorder}
                onDelete={handleDelete}
                searchQuery={searchQuery}
                documentType="invoice"
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
              <DraggableInvoiceTable
                invoices={currentData}
                onInvoiceClick={handleClick}
                onReorder={handleReorder}
                onDelete={handleDelete}
                onConvert={handleConvertProForma}
                searchQuery={searchQuery}
                documentType="proforma"
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
