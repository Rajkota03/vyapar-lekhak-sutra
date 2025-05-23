
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MoreVertical, Plus, X, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// UI Components
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
type Client = {
  id: string;
  name: string;
  email?: string;
  gstin?: string;
};

type Item = {
  id: string;
  name: string;
  code?: string;
  default_price?: number;
  default_cgst?: number;
  default_sgst?: number;
};

type LineItem = {
  id?: string;
  item_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  cgst?: number;
  sgst?: number;
  amount: number;
};

type Invoice = {
  id?: string;
  number: string;
  company_id: string;
  client_id: string;
  issue_date: string;
  due_date?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
};

const InvoiceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  
  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
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
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch existing invoice data if editing
  const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch invoice line items if editing
  const { data: invoiceLineItems, isLoading: isLoadingLines } = useQuery({
    queryKey: ['invoiceLines', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('invoice_lines')
        .select(`
          *,
          items (*)
        `)
        .eq('invoice_id', id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch clients for the selected company
  const { data: clients } = useQuery({
    queryKey: ['clients', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', selectedCompanyId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch items for the selected company
  const { data: items } = useQuery({
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

  // Populate form with existing data if editing
  useEffect(() => {
    if (invoiceData && !isLoadingInvoice) {
      setSelectedDate(new Date(invoiceData.issue_date));
      setSelectedClient(invoiceData.clients);
      setSelectedCompanyId(invoiceData.company_id);
    }
  }, [invoiceData, isLoadingInvoice]);

  // Populate line items if editing
  useEffect(() => {
    if (invoiceLineItems && !isLoadingLines) {
      const formattedLines = invoiceLineItems.map(line => ({
        id: line.id,
        item_id: line.item_id,
        description: line.description,
        qty: Number(line.qty),
        unit_price: Number(line.unit_price),
        cgst: line.cgst ? Number(line.cgst) : undefined,
        sgst: line.sgst ? Number(line.sgst) : undefined,
        amount: Number(line.amount),
      }));
      
      setLineItems(formattedLines);
    }
  }, [invoiceLineItems, isLoadingLines]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = lineItems.reduce((sum, item) => {
    if (item.cgst) {
      return sum + (item.amount * item.cgst / 100);
    }
    return sum;
  }, 0);
  const sgstAmount = lineItems.reduce((sum, item) => {
    if (item.sgst) {
      return sum + (item.amount * item.sgst / 100);
    }
    return sum;
  }, 0);
  const grandTotal = subtotal + cgstAmount + sgstAmount;

  // Add a new line item from the selected item
  const addLineItem = (item: Item) => {
    const newItem: LineItem = {
      item_id: item.id,
      description: item.name,
      qty: 1,
      unit_price: item.default_price || 0,
      cgst: item.default_cgst,
      sgst: item.default_sgst,
      amount: item.default_price || 0,
    };
    
    setLineItems([...lineItems, newItem]);
    setItemPickerOpen(false);
  };

  // Update line item quantity or price
  const updateLineItem = (index: number, field: string, value: number) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };
    
    if (field === 'qty') {
      item.qty = value;
      item.amount = item.qty * item.unit_price;
    } else if (field === 'unit_price') {
      item.unit_price = value;
      item.amount = item.qty * item.unit_price;
    }
    
    updatedItems[index] = item;
    setLineItems(updatedItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    setLineItems(updatedItems);
  };

  // Generate a new invoice number
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV-${year}${month}-${random}`;
  };

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClient || !selectedCompanyId) {
        throw new Error("Client and company are required");
      }
      
      setIsSubmitting(true);
      
      try {
        // Format data for saving
        const invoiceNumber = isEditing && invoiceData ? 
          invoiceData.number : 
          generateInvoiceNumber();
          
        const invoiceData: Invoice = {
          id: isEditing ? id : undefined,
          number: invoiceNumber,
          company_id: selectedCompanyId,
          client_id: selectedClient.id,
          issue_date: format(selectedDate, 'yyyy-MM-dd'),
          subtotal: Number(subtotal.toFixed(2)),
          cgst: Number(cgstAmount.toFixed(2)),
          sgst: Number(sgstAmount.toFixed(2)),
          igst: 0,
          total: Number(grandTotal.toFixed(2)),
          status: 'draft',
        };
        
        let invoiceId: string;
        
        // Insert or update invoice
        if (isEditing) {
          const { error: updateError } = await supabase
            .from('invoices')
            .update(invoiceData)
            .eq('id', id);
            
          if (updateError) throw updateError;
          invoiceId = id!;
        } else {
          const { data: newInvoice, error: insertError } = await supabase
            .from('invoices')
            .insert(invoiceData)
            .select('id')
            .single();
            
          if (insertError) throw insertError;
          invoiceId = newInvoice.id;
        }
        
        // Delete existing line items if editing
        if (isEditing) {
          const { error: deleteError } = await supabase
            .from('invoice_lines')
            .delete()
            .eq('invoice_id', invoiceId);
            
          if (deleteError) throw deleteError;
        }
        
        // Insert line items
        const lineItemsToInsert = lineItems.map(item => ({
          invoice_id: invoiceId,
          item_id: item.item_id,
          description: item.description,
          qty: item.qty,
          unit_price: item.unit_price,
          cgst: item.cgst,
          sgst: item.sgst,
          amount: item.amount,
        }));
        
        const { error: lineItemsError } = await supabase
          .from('invoice_lines')
          .insert(lineItemsToInsert);
          
        if (lineItemsError) throw lineItemsError;
        
        return { success: true };
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ 
        title: "Success", 
        description: `Invoice ${isEditing ? 'updated' : 'created'} successfully` 
      });
      navigate('/invoice-list');
    },
    onError: (error) => {
      console.error(error);
      toast({ 
        title: "Error", 
        description: `Failed to ${isEditing ? 'update' : 'create'} invoice`, 
        variant: "destructive" 
      });
    }
  });

  // Filter clients by search term
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Filter items by search term
  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Client Selection Modal
  const ClientModal = () => (
    <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {filteredClients.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => {
                    setSelectedClient(client);
                    setClientModalOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="font-medium">{client.name}</div>
                  {client.email && <div className="text-sm text-muted-foreground">{client.email}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No clients found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Item Picker Modal
  const ItemPickerModal = () => (
    <Dialog open={itemPickerOpen} onOpenChange={setItemPickerOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {filteredItems && filteredItems.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => {
                    addLineItem(item);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{item.name}</div>
                    {item.default_price && <div>₹{item.default_price.toFixed(2)}</div>}
                  </div>
                  {item.code && <div className="text-sm text-muted-foreground">Code: {item.code}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No items found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Tax and Settings Sheet
  const TaxSettingsSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tax & Settings</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-4">Tax settings will be implemented in a future update.</p>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Loading state
  if ((isEditing && (isLoadingInvoice || isLoadingLines)) || !selectedCompanyId) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-20">
        {/* Header with back button and save */}
        <div className="sticky top-0 z-10 bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/invoice-list')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                {isEditing ? "Edit Invoice" : "New Invoice"}
              </h1>
            </div>
            <div className="flex items-center">
              <TaxSettingsSheet />
              <Button
                onClick={() => saveInvoiceMutation.mutate()}
                disabled={!selectedClient || lineItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-8">
          {/* Step 1: Meta */}
          <div className="space-y-3">
            <h2 className="font-medium text-lg">Invoice Details</h2>
            <div className="bg-white rounded-lg border p-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invoice Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Step 2: Client */}
          <div className="space-y-3">
            <h2 className="font-medium text-lg">Client</h2>
            <div className="bg-white rounded-lg border p-4">
              {selectedClient ? (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{selectedClient.name}</h3>
                    {selectedClient.email && (
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                    )}
                    {selectedClient.gstin && (
                      <p className="text-sm text-muted-foreground">GSTIN: {selectedClient.gstin}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setClientModalOpen(true)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline" 
                  className="w-full"
                  onClick={() => setClientModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Customer
                </Button>
              )}
            </div>
          </div>

          {/* Step 3: Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-lg">Items</h2>
              <Button
                variant="outline"
                size="sm" 
                onClick={() => setItemPickerOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="bg-white rounded-lg border">
              {lineItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="align-top font-medium">{item.description}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.qty}
                              min={1}
                              onChange={(e) => updateLineItem(index, 'qty', Number(e.target.value))}
                              className="w-16 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.unit_price}
                              min={0}
                              onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                              className="w-24 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLineItem(index)}
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items added</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setItemPickerOpen(true)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          {lineItems.length > 0 && (
            <div className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CGST (9%)</span>
                <span>₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SGST (9%)</span>
                <span>₹{sgstAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between font-medium">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ClientModal />
      <ItemPickerModal />
    </DashboardLayout>
  );
};

export default InvoiceEdit;
