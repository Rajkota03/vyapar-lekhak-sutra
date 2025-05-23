
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
type Item = Database['public']['Tables']['items']['Row'];

const ItemList: React.FC = () => {
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

  // Fetch items for the selected company
  const { data: items, isLoading } = useQuery({
    queryKey: ['items', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('company_id', selectedCompanyId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Item deleted",
        description: "The item has been deleted successfully.",
      });
      
      // React Query will automatically refetch the data
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Error deleting item",
        description: "There was an error deleting the item.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Items Catalog</h1>
          <Button asChild>
            <Link to="/items/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Item
            </Link>
          </Button>
        </div>

        {companies && companies.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Item List</CardTitle>
              <CardDescription>
                Manage your items catalog
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
              ) : items && items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Default Price</TableHead>
                        <TableHead>GST (%)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.code || '-'}</TableCell>
                          <TableCell className="text-right">{item.default_price ? `₹${parseFloat(item.default_price.toString()).toFixed(2)}` : '-'}</TableCell>
                          <TableCell>
                            {item.default_cgst && item.default_sgst ? 
                              `${parseFloat(item.default_cgst.toString()) + parseFloat(item.default_sgst.toString())}%` : 
                              '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/items/${item.id}`)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
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
                  <p className="text-muted-foreground">No items found. Add your first item to the catalog!</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate('/items/new')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="mb-4">You need to create a company before adding items to your catalog.</p>
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

export default ItemList;
