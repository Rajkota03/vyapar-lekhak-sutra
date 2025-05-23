
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define types using the Database type
type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

const formSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  client_id: z.string().uuid("Please select a client"),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().optional(),
  status: z.string().default("draft"),
  subtotal: z.coerce.number().min(0, "Subtotal must be a positive number"),
  cgst: z.coerce.number().min(0).optional(),
  sgst: z.coerce.number().min(0).optional(),
  igst: z.coerce.number().min(0).optional(),
  total: z.coerce.number().min(0, "Total must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

const InvoiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  
  // Get the invoice data
  const { data: invoice, isLoading: isInvoiceLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });
  
  // Get companies for the dropdown
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      return data;
    },
  });
  
  // Set first company as selected if not already set
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompany) {
      if (invoice) {
        setSelectedCompany(invoice.company_id);
      } else {
        setSelectedCompany(companies[0].id);
      }
    }
  }, [companies, invoice, selectedCompany]);
  
  // Get clients for the dropdown
  const { data: clients } = useQuery({
    queryKey: ['clients', selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', selectedCompany);
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!selectedCompany,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
      client_id: "",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      due_date: "",
      status: "draft",
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    },
  });
  
  // Set form values when invoice data is loaded
  useEffect(() => {
    if (invoice) {
      form.reset({
        number: invoice.number,
        client_id: invoice.client_id,
        issue_date: invoice.issue_date ? format(new Date(invoice.issue_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        due_date: invoice.due_date ? format(new Date(invoice.due_date), "yyyy-MM-dd") : undefined,
        status: invoice.status || "draft",
        subtotal: invoice.subtotal,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        igst: invoice.igst || 0,
        total: invoice.total,
      });
      
      // Set the company to the one from the invoice
      setSelectedCompany(invoice.company_id);
    }
  }, [invoice, form]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      if (!selectedCompany) {
        toast({
          variant: "destructive",
          title: "No company selected",
          description: "Please select a company before saving the invoice.",
        });
        return;
      }
      
      // Ensure client_id is not empty
      if (!data.client_id) {
        toast({
          variant: "destructive", 
          title: "Client required",
          description: "Please select a client before saving the invoice."
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Create a properly typed invoice data object with all required fields
      const invoiceData = {
        company_id: selectedCompany,
        client_id: data.client_id,
        number: data.number,
        issue_date: data.issue_date,
        due_date: data.due_date || null,
        status: data.status || "draft",
        subtotal: data.subtotal || 0,
        cgst: data.cgst || 0,
        sgst: data.sgst || 0,
        igst: data.igst || 0,
        total: data.total || 0
      };
      
      if (id) {
        // Update existing invoice
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Invoice updated",
          description: `Invoice ${data.number} has been updated successfully.`,
        });
      } else {
        // Create new invoice
        const { error } = await supabase
          .from('invoices')
          .insert([invoiceData]);
          
        if (error) throw error;
        
        toast({
          title: "Invoice created",
          description: `Invoice ${data.number} has been created successfully.`,
        });
      }
      
      navigate("/invoices");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        variant: "destructive",
        title: "Error saving invoice",
        description: "There was an error saving the invoice. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInvoiceLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? "Edit Invoice" : "Create Invoice"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent>
            {companies && companies.length > 0 ? (
              <>
                {companies.length > 1 && (
                  <div className="mb-6">
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select 
                        value={selectedCompany || ""}
                        onValueChange={setSelectedCompany}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="client_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                              disabled={!clients || clients.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients?.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="issue_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subtotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtotal</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cgst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CGST (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sgst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SGST (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="igst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IGST (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/invoices")}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting || !selectedCompany || !clients || clients.length === 0}>
                        {isSubmitting ? "Saving..." : "Save Invoice"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="mb-2">You need to create a company first</p>
                <Button onClick={() => navigate("/company/new")}>Create Company</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceEdit;
