
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Invoice = {
  id: string;
  number: string;
  issue_date: string;
  due_date: string | null;
  total: number;
  status: string | null;
  client_id: string;
  clients: {
    name: string;
  };
};

type FilterStatus = "all" | "sent" | "paid" | "draft";

const Invoices = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Fetch companies
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
  React.useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch invoices for the selected company
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedCompanyId, filterStatus],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq('company_id', selectedCompanyId);
        
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
        
      const { data, error } = await query;
      if (error) throw error;
      
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

  return (
    <DashboardLayout>
      <div className="relative min-h-screen pb-20">
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Invoices</h1>
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
                  className="overflow-hidden hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{invoice.number}</h3>
                        <p className="text-sm text-muted-foreground">{invoice.clients?.name}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status || 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex justify-between mt-3 text-sm">
                      <span>{invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : 'No date'}</span>
                      <span className="font-medium">₹{invoice.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invoices found</p>
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg"
          onClick={() => navigate('/invoices/new')}
        >
          <Plus size={24} />
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
