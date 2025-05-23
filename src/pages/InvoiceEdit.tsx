
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

// UI Components
import DashboardLayout from "@/components/DashboardLayout";

// Custom Components
import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import InvoiceMeta from "@/components/invoice/InvoiceMeta";
import ClientSection from "@/components/invoice/ClientSection";
import ItemsSection from "@/components/invoice/ItemsSection";
import TotalsSection from "@/components/invoice/TotalsSection";
import SignatureSection from "@/components/invoice/SignatureSection";

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
  }),
  showMySignature: z.boolean().default(false),
  requireClientSignature: z.boolean().default(false)
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
      },
      showMySignature: existingInvoice?.show_my_signature || false,
      requireClientSignature: existingInvoice?.require_client_signature || false
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

  // Generate invoice number for display
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const invoiceNumber = isEditing && existingInvoice ? 
    existingInvoice.number : 
    generateInvoiceNumber();

  // Handle form submission including tax config and signatures
  const handleSaveInvoice = () => {
    const formValues = form.getValues();
    saveInvoiceMutation.mutate({
      navigate,
      taxConfig: formValues.taxConfig as TaxConfig,
      showMySignature: formValues.showMySignature,
      requireClientSignature: formValues.requireClientSignature
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

            {/* Smaller header with date and invoice number */}
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-700 mt-2 mb-3">
              <span>{format(selectedDate, 'dd MMM yyyy')}</span>
              <span>#{invoiceNumber}</span>
            </div>

            <ClientSection selectedClient={selectedClient} setSelectedClient={setSelectedClient} clients={clients} companyId={selectedCompanyId || ""} />

            <ItemsSection lineItems={lineItems} setLineItems={setLineItems} items={items} selectedCompanyId={selectedCompanyId} />

            {lineItems.length > 0 && <TotalsSection subtotal={subtotal} cgstAmount={cgstAmount} sgstAmount={sgstAmount} igstAmount={igstAmount} grandTotal={grandTotal} taxConfig={taxConfig} setValue={form.setValue} watch={form.watch} />}

            <SignatureSection 
              showMySignature={form.watch('showMySignature')}
              requireClientSignature={form.watch('requireClientSignature')}
              onShowMySignatureChange={(value) => form.setValue('showMySignature', value)}
              onRequireClientSignatureChange={(value) => form.setValue('requireClientSignature', value)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>;
};

export default InvoiceEdit;
