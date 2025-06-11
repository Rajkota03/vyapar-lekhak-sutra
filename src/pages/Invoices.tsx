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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      sent: { label: "Sent", variant: "default" as const },
      paid: { label: "Paid", variant: "default" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Manage your invoices and track payments
            </p>
          </div>
          <Button onClick={handleCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {/* Company Selector */}
        {companies && companies.length > 1 && (
          <div className="flex items-center space-x-2">
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

        {/* Filter Dropdown */}
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

        {/* Invoices Table */}
        <div className="rounded-md border">
          {isLoadingInvoices ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleInvoiceClick(invoice.id)}
                  >
                    <TableCell className="font-medium">
                      {invoice.invoice_code || invoice.number || 'Draft'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{invoice.clients?.name || 'No client'}</div>
                        <div className="sm:hidden text-xs text-muted-foreground">
                          {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
                        </div>
                        <div className="sm:hidden">
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No invoices found</p>
              <Button variant="outline" onClick={handleCreateInvoice}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first invoice
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
