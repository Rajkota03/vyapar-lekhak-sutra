
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Define types using the Database type
type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Fetch companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
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
    queryKey: ['invoices', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq('company_id', selectedCompanyId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
      
      // Refetch invoices
      // Note: React Query will automatically refetch the data
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        variant: "destructive",
        title: "Error deleting invoice",
        description: "There was an error deleting the invoice.",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <Button asChild>
            <Link to="/invoices/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>

        {companies && companies.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Invoice List</CardTitle>
              <CardDescription>
                Manage your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length > 1 && (
                <div className="mb-4">
                  <label className="text-sm font-medium">Select Company:</label>
                  <select
                    value={selectedCompanyId || ''}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="ml-2 p-1 border rounded"
                  >
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.number}</TableCell>
                          <TableCell>{invoice.clients?.name}</TableCell>
                          <TableCell>{invoice.issue_date ? format(new Date(invoice.issue_date), 'dd/MM/yyyy') : '-'}</TableCell>
                          <TableCell>{invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '-'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {invoice.status || 'Draft'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">₹{invoice.total.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No invoices found. Create your first invoice!</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate('/invoices/new')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="mb-4">You need to create a company before creating invoices.</p>
              <Button onClick={() => navigate('/company/new')}>
                Create Company
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InvoiceList;
