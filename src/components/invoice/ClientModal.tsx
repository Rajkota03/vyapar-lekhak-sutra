
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Schema for client form validation
const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  billing_address: z.string().optional().or(z.literal("")),
  address2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onClientSelected: (client: any) => void;
  existingClient?: any;
}

const ClientModal: React.FC<ClientModalProps> = ({
  open,
  onOpenChange,
  companyId,
  onClientSelected,
  existingClient,
}) => {
  const queryClient = useQueryClient();
  
  // Initialize the form with existing client data or default values
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: existingClient
      ? {
          name: existingClient.name || "",
          email: existingClient.email || "",
          phone: existingClient.phone || "",
          gstin: existingClient.gstin || "",
          billing_address: existingClient.billing_address || "",
          address2: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          gstin: "",
          billing_address: "",
          address2: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        },
  });

  // Mutation for upserting client
  const clientMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      // Create full address from individual fields if provided
      let fullAddress = values.billing_address || "";
      if (values.address2) fullAddress += fullAddress ? `\n${values.address2}` : values.address2;
      
      const cityStateZip = [
        values.city, 
        values.state && values.zip ? `${values.state}, ${values.zip}` : values.state || values.zip
      ].filter(Boolean).join(", ");
      
      if (cityStateZip) fullAddress += fullAddress ? `\n${cityStateZip}` : cityStateZip;
      if (values.country) fullAddress += fullAddress ? `\n${values.country}` : values.country;

      const clientData = {
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        gstin: values.gstin || null,
        billing_address: fullAddress || null,
        company_id: companyId,
        ...(existingClient?.id ? { id: existingClient.id } : {}),
      };

      // Upsert client data
      const { data, error } = existingClient?.id
        ? await supabase
            .from("clients")
            .update(clientData)
            .eq("id", existingClient.id)
            .select()
            .single()
        : await supabase
            .from("clients")
            .insert(clientData)
            .select()
            .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients", companyId] });
      onClientSelected(data);
      toast({
        title: "Success",
        description: `Client ${existingClient ? "updated" : "created"} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: `Failed to ${existingClient ? "update" : "create"} client. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ClientFormValues) => {
    clientMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingClient ? "Edit" : "Add"} Client</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Client name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="GSTIN" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="billing_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Address line 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Address line 2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ZIP" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={clientMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={clientMutation.isPending}>
                {clientMutation.isPending ? "Saving..." : existingClient ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
