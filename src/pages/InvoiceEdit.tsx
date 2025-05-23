import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import DashboardLayout from "@/components/DashboardLayout";

// Custom Components
import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import InvoiceMeta from "@/components/invoice/InvoiceMeta";
import ClientSection from "@/components/invoice/ClientSection";
import ItemsSection from "@/components/invoice/ItemsSection";
import TotalsSection from "@/components/invoice/TotalsSection";

// Custom Hook
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { calcTotals, TaxConfig } from "@/utils/invoiceMath";

// Define form schema
const invoiceFormSchema = z.object({
  taxConfig: z.object({
    useIgst: z.boolean().default(false),
    cgstPct: z.number().default(9),
    sgstPct: z.number().default(9),
    igstPct: z.number().default(18)
  })
});
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
const InvoiceEdit = () => {
  const navigate = useNavigate();
  const {
    isEditing,
    isLoading,
    selectedDate,
    setSelectedDate,
    selectedClient,
    setSelectedClient,
    lineItems,
    setLineItems,
    clients,
    items,
    saveInvoiceMutation,
    isSubmitting,
    selectedCompanyId,
    existingInvoice
  } = useInvoiceData();

  // Initialize form with defaults or existing invoice data
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      taxConfig: {
        useIgst: existingInvoice?.use_igst || false,
        cgstPct: existingInvoice?.cgst_pct || 9,
        sgstPct: existingInvoice?.sgst_pct || 9,
        igstPct: existingInvoice?.igst_pct || 18
      }
    }
  });
  const taxConfig = form.watch('taxConfig') as TaxConfig;

  // Calculate totals using the utility function with tax configuration
  const totals = calcTotals(lineItems, taxConfig);

  // Extract individual total values
  const {
    subtotal,
    total: grandTotal
  } = totals;
  const cgstAmount = totals.cgst;
  const sgstAmount = totals.sgst;
  const igstAmount = totals.igst;

  // Handle form submission including tax config
  const handleSaveInvoice = () => {
    saveInvoiceMutation.mutate({
      navigate,
      taxConfig: form.getValues().taxConfig as TaxConfig
    });
  };

  // Loading state
  if (isLoading) {
    return <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="min-h-screen pb-20 bg-gray-50">
        <div className="mx-auto w-full max-w-screen-sm sm:max-w-screen-md px-3 sm:px-6">
          <InvoiceHeader isEditing={isEditing} isSubmitting={isSubmitting} canSave={!!selectedClient && lineItems.length > 0} onSave={handleSaveInvoice} />

          <div className="p-4 space-y-4 px-0 mx-0">
            <InvoiceMeta selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

            <ClientSection selectedClient={selectedClient} setSelectedClient={setSelectedClient} clients={clients} companyId={selectedCompanyId || ""} />

            <ItemsSection lineItems={lineItems} setLineItems={setLineItems} items={items} selectedCompanyId={selectedCompanyId} />

            {lineItems.length > 0 && <TotalsSection subtotal={subtotal} cgstAmount={cgstAmount} sgstAmount={sgstAmount} igstAmount={igstAmount} grandTotal={grandTotal} taxConfig={taxConfig} setValue={form.setValue} watch={form.watch} />}
          </div>
        </div>
      </div>
    </DashboardLayout>;
};
export default InvoiceEdit;