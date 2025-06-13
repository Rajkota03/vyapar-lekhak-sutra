
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import InvoiceTable from "@/components/invoice/InvoiceTable";
import MobileSortDropdown from "@/components/invoice/MobileSortDropdown";
import { FloatingActionBar } from "@/components/layout/FloatingActionBar";

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
type SortField = 'number' | 'client' | 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

const Billing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL params, default to 'invoices'
  const activeTab = searchParams.get('tab') || 'invoices';
  
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
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
    queryKey: ['invoices', selectedCompanyId, filterStatus, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
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
        .eq('company_id', selectedCompanyId)
        .is('document_type_id', null)
        .not('number', 'like', 'PF-%')
        .not('number', 'like', 'QUO-%');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data: invoicesData, error } = await query;
      if (error) throw error;
      return invoicesData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user
  });

  // Fetch pro formas
  const { data: proformas, isLoading: isLoadingProFormas } = useQuery({
    queryKey: ['proformas', selectedCompanyId, filterStatus, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
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
        .eq('company_id', selectedCompanyId)
        .like('number', 'PF-%');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data: proformaData, error } = await query;
      if (error) throw error;
      return proformaData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user
  });

  // Sort function
  const sortDocuments = (documents: Invoice[]) => {
    if (!documents || !sortField || !sortDirection) return documents || [];
    
    return [...documents].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'number':
          aValue = a.invoice_code || a.number || '';
          bValue = b.invoice_code || b.number || '';
          break;
        case 'client':
          aValue = a.clients?.name || '';
          bValue = b.clients?.name || '';
          break;
        case 'date':
          aValue = a.issue_date ? new Date(a.issue_date).getTime() : 0;
          bValue = b.issue_date ? new Date(b.issue_date).getTime() : 0;
          break;
        case 'amount':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedInvoices = sortDocuments(invoices || []);
  const sortedProFormas = sortDocuments(proformas || []);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const currentData = activeTab === 'invoices' ? sortedInvoices : sortedProFormas;
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

          <TabsContent value="invoices" className="space-y-4">
            {/* Filter and Sort Controls */}
            <div className="flex items-center justify-between px-[8px]">
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('draft')}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('sent')}>Sent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('paid')}>Paid</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sort Dropdown */}
              {isMobile ? (
                <MobileSortDropdown
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Sort by: {sortField ? sortField.charAt(0).toUpperCase() + sortField.slice(1) : 'Date'} {sortDirection === 'asc' ? '↑' : '↓'}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSort('number')}>Invoice #</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('client')}>Client</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('date')}>Date</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('amount')}>Amount</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('status')}>Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Invoices Table */}
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : currentData && currentData.length > 0 ? (
              <InvoiceTable
                invoices={currentData}
                onInvoiceClick={handleClick}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={!isMobile ? handleSort : undefined}
              />
            ) : (
              <div className="text-center py-12 border rounded-md mx-[8px]">
                <p className="text-muted-foreground mb-4">{emptyMessage}</p>
                <Button variant="outline" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createFirstMessage}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="proformas" className="space-y-4">
            {/* Filter and Sort Controls - Same as invoices */}
            <div className="flex items-center justify-between px-[8px]">
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('draft')}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('sent')}>Sent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('paid')}>Paid</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sort Dropdown */}
              {isMobile ? (
                <MobileSortDropdown
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Sort by: {sortField ? sortField.charAt(0).toUpperCase() + sortField.slice(1) : 'Date'} {sortDirection === 'asc' ? '↑' : '↓'}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSort('number')}>Pro Forma #</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('client')}>Client</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('date')}>Date</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('amount')}>Amount</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('status')}>Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Pro Formas Table */}
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : currentData && currentData.length > 0 ? (
              <InvoiceTable
                invoices={currentData}
                onInvoiceClick={handleClick}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={!isMobile ? handleSort : undefined}
              />
            ) : (
              <div className="text-center py-12 border rounded-md mx-[8px]">
                <p className="text-muted-foreground mb-4">{emptyMessage}</p>
                <Button variant="outline" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createFirstMessage}
                </Button>
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
