
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/primitives/Card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { handleSharePdf } from "@/utils/sharePdf";

type Invoice = {
  id: string;
  invoice_code: string | null;
  issue_date: string;
  total: number;
  status: string | null;
  clients: {
    name: string;
  };
};

type FilterStatus = "all" | "sent" | "paid" | "draft";

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Fetch user's companies
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching companies for user:', user.id);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);
        
      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }
      console.log('Companies fetched:', data);
      return data || [];
    },
    enabled: !!user,
  });

  // Set first company as selected if not already set
  React.useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      console.log('Setting selected company:', companies[0].id);
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedCompanyId, filterStatus],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      console.log('Fetching invoices for company:', selectedCompanyId, 'with status filter:', filterStatus);
      
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_code,
          issue_date,
          total,
          status,
          clients ( name )
        `)
        .eq('company_id', selectedCompanyId)
        .order('issue_date', { ascending: false });
        
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
        
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      console.log('Invoices fetched:', data);
      return data as Invoice[] || [];
    },
    enabled: !!selectedCompanyId,
  });

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Empty state
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view invoices</p>
        </div>
      </DashboardLayout>
    );
  }

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

  const handleCardClick = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handlePdfShare = async (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    await handleSharePdf(invoiceId);
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-screen pb-20">
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Invoices</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  {filterStatus === 'all' ? 'All' : 
                   filterStatus === 'sent' ? 'Sent' :
                   filterStatus === 'paid' ? 'Paid' : 'Draft'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("sent")}>
                  Sent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("paid")}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("draft")}>
                  Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Card 
                  key={invoice.id} 
                  className="mb-3 overflow-hidden hover:shadow-md transition-shadow p-0 cursor-pointer"
                  onClick={() => handleCardClick(invoice.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{invoice.invoice_code || 'Draft Invoice'}</h3>
                        <p className="text-sm text-muted-foreground">{invoice.clients?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status || 'Draft'}
                        </Badge>
                        <button
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={(e) => handlePdfShare(e, invoice.id)}
                        >
                          <FileText
                            size={18}
                            className="text-gray-500 hover:text-blue-600"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-sm">
                      <span>{invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}</span>
                      <span className="font-medium">₹{invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invoices yet</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2"
                onClick={() => navigate('/invoices/new')}
              >
                Create Invoice
              </Button>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full p-0 shadow-lg"
          onClick={() => navigate('/invoices/new')}
        >
          <Plus size={24} />
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
