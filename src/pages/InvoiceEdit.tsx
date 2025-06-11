import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import PreviewModal from "@/components/invoice/PreviewModal";

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
  const params = useParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
  // Extract invoice ID from URL - handle both patterns
  const invoiceId = params.id || params.invoiceId || (params["*"] && params["*"].includes("/") ? params["*"].split("/")[1] : params["*"]);
  
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

  // Log invoice ID extraction
  useEffect(() => {
    console.log('=== INVOICE EDIT DEBUG ===');
    console.log('URL params:', params);
    console.log('params.id:', params.id);
    console.log('params.invoiceId:', params.invoiceId);
    console.log('Extracted invoice ID:', invoiceId);
    console.log('Existing invoice from hook:', existingInvoice);
  }, [params, invoiceId, existingInvoice]);

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

  // Update form when existing invoice data changes
  useEffect(() => {
    if (existingInvoice) {
      console.log('=== UPDATING FORM WITH EXISTING INVOICE DATA ===');
      console.log('Existing invoice signature settings:');
      console.log('- show_my_signature:', existingInvoice.show_my_signature);
      console.log('- require_client_signature:', existingInvoice.require_client_signature);
      
      form.reset({
        taxConfig: {
          useIgst: existingInvoice.use_igst || false,
          cgstPct: existingInvoice.cgst_pct || 9,
          sgstPct: existingInvoice.sgst_pct || 9,
          igstPct: existingInvoice.igst_pct || 18
        },
        showMySignature: existingInvoice.show_my_signature || false,
        requireClientSignature: existingInvoice.require_client_signature || false
      });
    }
  }, [existingInvoice, form]);

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

  // Generate invoice code for display
  const invoiceCode = existingInvoice?.invoice_code || "Will be generated on save";

  // Handle preview
  const handlePreview = () => {
    setIsGeneratingPreview(true);
    setPreviewOpen(true);
    // Reset generating state after modal opens
    setTimeout(() => setIsGeneratingPreview(false), 100);
  };

  // Handle form submission including tax config and signatures
  const handleSaveInvoice = () => {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Can save?', !!selectedClient && lineItems.length > 0);
    console.log('Selected client:', selectedClient);
    console.log('Line items:', lineItems);
    console.log('Selected company ID:', selectedCompanyId);
    
    if (!selectedClient || lineItems.length === 0) {
      console.log('Cannot save: missing client or line items');
      return;
    }
    
    const formValues = form.getValues();
    console.log('=== CURRENT FORM VALUES ===');
    console.log('Tax config:', formValues.taxConfig);
    console.log('Show my signature:', formValues.showMySignature);
    console.log('Require client signature:', formValues.requireClientSignature);
    
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50" style={{ paddingBottom: existingInvoice?.id ? '80px' : '20px' }}>
        <div className="mx-auto w-full max-w-screen-sm sm:max-w-screen-md px-3 sm:px-6">
          <InvoiceHeader 
            isEditing={isEditing} 
            isSubmitting={isSubmitting} 
            canSave={!!selectedClient && lineItems.length > 0} 
            onSave={handleSaveInvoice}
            onPreview={existingInvoice?.id ? handlePreview : undefined}
            invoiceId={existingInvoice?.id || invoiceId}
            invoiceCode={existingInvoice?.invoice_code}
            isGeneratingPreview={isGeneratingPreview}
          />

          <div className="p-4 space-y-4 px-0 mx-0">
            <InvoiceMeta selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

            {/* Smaller header with date and invoice code */}
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-700 mt-2 mb-3">
              <span>{format(selectedDate, 'dd MMM yyyy')}</span>
              <div className="text-right">
                <div>#{existingInvoice?.number || invoiceCode}</div>
                {existingInvoice?.invoice_code && (
                  <span className="text-xs text-gray-500">#{existingInvoice.invoice_code}</span>
                )}
              </div>
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

      <PreviewModal
        isOpen={previewOpen}
        onOpenChange={setPreviewOpen}
        invoiceId={existingInvoice?.id || invoiceId}
      />
    </DashboardLayout>
  );
};

export default InvoiceEdit;

}
