import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
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
const Invoices = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch user's companies
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error: companiesError
  } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user available for fetching companies');
        return [];
      }
      console.log('Fetching companies for user:', user.id);
      const {
        data,
        error
      } = await supabase.from('companies').select('*').eq('owner_id', user.id);
      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }
      console.log('Companies fetched successfully:', data?.length || 0, 'companies');
      return data || [];
    },
    enabled: !!user
  });

  // Set first company as selected if not already set
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      console.log('Setting selected company:', companies[0].id);
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch invoices with improved error handling
  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
    refetch: refetchInvoices
  } = useQuery({
    queryKey: ['invoices', selectedCompanyId, filterStatus, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) {
        console.log('No company selected or user not available for fetching invoices');
        return [];
      }
      console.log('Fetching invoices for company:', selectedCompanyId, 'with status filter:', filterStatus);
      let query = supabase.from('invoices').select(`
          id,
          invoice_code,
          number,
          issue_date,
          total,
          status,
          clients ( name )
        `).eq('company_id', selectedCompanyId);
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      query = query.order('created_at', {
        ascending: false
      });
      const {
        data: invoicesData,
        error
      } = await query;
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      console.log('Invoices fetched successfully:', invoicesData?.length || 0, 'invoices');
      return invoicesData as Invoice[] || [];
    },
    enabled: !!selectedCompanyId && !!user
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

  // Sort invoices
  const sortedInvoices = React.useMemo(() => {
    if (!invoices || !sortField || !sortDirection) return invoices || [];
    return [...invoices].sort((a, b) => {
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
  }, [invoices, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or reset
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

  // Loading state
  if (isLoadingCompanies) {
    return <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>;
  }
  if (companiesError || invoicesError) {
    console.error('Error loading data:', {
      companiesError,
      invoicesError
    });
    return <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading data. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </DashboardLayout>;
  }
  if (!user) {
    return <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view invoices</p>
        </div>
      </DashboardLayout>;
  }
  if (!companies || companies.length === 0) {
    return <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You need to create a company before creating invoices.</p>
          <Button onClick={() => navigate('/company/new')}>
            Create Company
          </Button>
        </div>
      </DashboardLayout>;
  }
  const handleInvoiceClick = (invoiceId: string) => {
    console.log('Clicking on invoice:', invoiceId);
    navigate(`/invoices/${invoiceId}`);
  };
  const handleCreateInvoice = () => {
    // Clear any cached invoice data
    queryClient.removeQueries({
      queryKey: ['invoice']
    });
    navigate('/invoices/new');
  };
  const floatingActions = [{
    label: "New Invoice",
    onClick: handleCreateInvoice,
    variant: "primary" as const,
    icon: <Plus className="h-6 w-6" />
  }];
  return <DashboardLayout>
      <div className="space-y-6 bg-white px-0 py-[8px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight px-[8px]">Invoices</h1>
        </div>

        {/* Company Selector */}
        {companies && companies.length > 1 && <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Company:</label>
            <select value={selectedCompanyId || ''} onChange={e => setSelectedCompanyId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {companies.map(company => <option key={company.id} value={company.id}>
                  {company.name}
                </option>)}
            </select>
          </div>}

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('sent')}>
                  Sent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('paid')}>
                  Paid
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sort Dropdown */}
          {isMobile ? <MobileSortDropdown sortField={sortField} sortDirection={sortDirection} onSort={handleSort} /> : <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sort by: {sortField ? sortField.charAt(0).toUpperCase() + sortField.slice(1) : 'Date'} {sortDirection === 'asc' ? '↑' : '↓'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSort('number')}>
                    Invoice #
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('client')}>
                    Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('date')}>
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('amount')}>
                    Amount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('status')}>
                    Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
        </div>

        {/* Invoices Table */}
        {isLoadingInvoices ? <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div> : sortedInvoices && sortedInvoices.length > 0 ? <InvoiceTable invoices={sortedInvoices} onInvoiceClick={handleInvoiceClick} sortField={sortField} sortDirection={sortDirection} onSort={!isMobile ? handleSort : undefined} /> : <div className="text-center py-12 border rounded-md">
            <p className="text-muted-foreground mb-4">No invoices found</p>
            <Button variant="outline" onClick={handleCreateInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first invoice
            </Button>
          </div>}

        {/* Floating Action Button */}
        <FloatingActionBar actions={floatingActions} show={true} />
      </div>
    </DashboardLayout>;
};
export default Invoices;