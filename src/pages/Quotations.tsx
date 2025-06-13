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

type Quotation = {
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

const Quotations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  // Fetch quotations using the new document_type field
  const { data: quotations, isLoading: isLoadingQuotations } = useQuery({
    queryKey: ['quotations', selectedCompanyId, filterStatus, user?.id],
    queryFn: async () => {
      if (!selectedCompanyId || !user) return [];
      
      console.log('=== FETCHING QUOTATIONS WITH DETAILED LOGGING ===');
      console.log('Company ID:', selectedCompanyId);
      console.log('Filter Status:', filterStatus);
      console.log('User ID:', user.id);
      
      try {
        let query = supabase
          .from('invoices')
          .select(`
            id,
            invoice_code,
            number,
            issue_date,
            total,
            status,
            document_type,
            clients ( name )
          `)
          .eq('company_id', selectedCompanyId)
          .eq('document_type', 'quote'); // Use the new document_type field

        if (filterStatus !== 'all') {
          console.log('Applying status filter:', filterStatus);
          query = query.eq('status', filterStatus);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data: quotationData, error } = await query;
        
        console.log('❓ Quotations fetch →', {
          data: quotationData,
          error: error,
          dataLength: quotationData?.length || 0,
          query: 'invoices table with document_type = quote'
        });

        if (error) {
          console.error('🛑 Supabase query error:', error);
          throw error;
        }

        console.log('=== QUOTATIONS QUERY RESULT ===');
        console.log('Total quotations found:', quotationData?.length || 0);
        console.log('Raw data from Supabase:', JSON.stringify(quotationData, null, 2));
        
        // Log each document for debugging
        quotationData?.forEach((doc, index) => {
          console.log(`Quotation ${index + 1}:`, {
            id: doc.id,
            number: doc.number,
            invoice_code: doc.invoice_code,
            document_type: doc.document_type,
            status: doc.status,
            client: doc.clients?.name
          });
        });

        return quotationData as Quotation[] || [];
      } catch (e) {
        console.error('🛑 Unexpected error fetching quotations:', e);
        throw e;
      }
    },
    enabled: !!selectedCompanyId && !!user,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Sort quotations
  const sortedQuotations = React.useMemo(() => {
    if (!quotations || !sortField || !sortDirection) return quotations || [];
    return [...quotations].sort((a, b) => {
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
  }, [quotations, sortField, sortDirection]);

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

  // Force refresh when component mounts or when coming back to this page
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Force refreshing quotations...');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    }, 1000);
    return () => clearTimeout(timer);
  }, [queryClient]);

  // Debug effect to log when quotations change
  useEffect(() => {
    console.log('Quotations state updated:', quotations?.length || 0, 'documents');
    if (quotations && quotations.length > 0) {
      console.log('First quotation in state:', JSON.stringify(quotations[0], null, 2));
    }
  }, [quotations]);

  if (isLoadingCompanies) {
    return <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>;
  }

  if (!user) {
    return <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view quotations</p>
        </div>
      </DashboardLayout>;
  }

  if (!companies || companies.length === 0) {
    return <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You need to create a company before creating quotations.</p>
          <Button onClick={() => navigate('/company/new')}>
            Create Company
          </Button>
        </div>
      </DashboardLayout>;
  }

  const handleQuotationClick = (quotationId: string) => {
    navigate(`/quotations/${quotationId}`);
  };

  const handleCreateQuotation = () => {
    queryClient.removeQueries({ queryKey: ['invoice'] });
    navigate('/quotations/new');
  };

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    queryClient.removeQueries({ queryKey: ['quotations'] });
    queryClient.invalidateQueries({ queryKey: ['quotations'] });
    toast({
      title: "Refreshing...",
      description: "Updating quotations list",
      duration: 2000,
    });
  };

  const floatingActions = [{
    label: "New Quotation",
    onClick: handleCreateQuotation,
    variant: "primary" as const,
    icon: <Plus className="h-6 w-6" />
  }];

  return <DashboardLayout>
      <div className="space-y-6 bg-white px-0 py-[8px] my-[8px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight px-[8px]">Quotations</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="mr-2"
          >
            Refresh
          </Button>
        </div>

        {/* Company Selector */}
        {companies && companies.length > 1 && <div className="flex items-center space-x-2 px-[8px]">
            <label className="text-sm font-medium">Company:</label>
            <select value={selectedCompanyId || ''} onChange={e => setSelectedCompanyId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {companies.map(company => <option key={company.id} value={company.id}>
                  {company.name}
                </option>)}
            </select>
          </div>}

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
          {isMobile ? <MobileSortDropdown sortField={sortField} sortDirection={sortDirection} onSort={handleSort} /> : <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sort by: {sortField ? sortField.charAt(0).toUpperCase() + sortField.slice(1) : 'Date'} {sortDirection === 'asc' ? '↑' : '↓'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSort('number')}>Quotation #</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('client')}>Client</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('date')}>Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('amount')}>Amount</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('status')}>Status</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
        </div>

        {/* Debug info - Updated for new filtering approach */}
        <div className="px-[8px] text-xs text-gray-500 space-y-1">
          <div>Company: {selectedCompanyId}</div>
          <div>Quotations found: {quotations?.length || 0}</div>
          <div>Filter: {filterStatus}</div>
          <div>Loading: {isLoadingQuotations ? 'Yes' : 'No'}</div>
        </div>

        {/* Quotations Table */}
        {isLoadingQuotations ? <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div> : sortedQuotations && sortedQuotations.length > 0 ? <InvoiceTable invoices={sortedQuotations} onInvoiceClick={handleQuotationClick} sortField={sortField} sortDirection={sortDirection} onSort={!isMobile ? handleSort : undefined} /> : <div className="text-center py-12 border rounded-md mx-[8px]">
            <p className="text-muted-foreground mb-4">No quotations found</p>
            <Button variant="outline" onClick={handleCreateQuotation}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first quotation
            </Button>
          </div>}

        {/* Floating Action Button */}
        <FloatingActionBar actions={floatingActions} show={true} />
      </div>
    </DashboardLayout>;
};

export default Quotations;
