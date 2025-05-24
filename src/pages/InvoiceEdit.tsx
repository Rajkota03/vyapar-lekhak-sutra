import React, { useState } from "react";
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
import PreviewModal from "@/components/invoice/PreviewModal";

// Custom Hook
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { calcTotals, TaxConfig } from "@/utils/invoiceMath";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
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

  // Generate invoice code for display
  const invoiceCode = existingInvoice?.invoice_code || "Will be generated on save";

  // Handle preview with better error handling
  const handlePreview = async () => {
    if (!existingInvoice?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please save the invoice first before generating a preview.",
      });
      return;
    }
    
    setIsGeneratingPreview(true);
    
    try {
      console.log('Generating preview for invoice:', existingInvoice.id);
      
      const { data, error } = await supabase.functions.invoke('generate_invoice_pdf', {
        body: { 
          invoice_id: existingInvoice.id, 
          preview: true 
        }
      });
      
      if (error) {
        console.error('Error generating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: `Failed to generate preview: ${error.message || 'Unknown error'}`,
        });
        return;
      }
      
      if (!data?.pdf_url) {
        console.error('No PDF URL in preview response:', data);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: "Preview URL not available. Please try again.",
        });
        return;
      }
      
      console.log('Preview URL generated:', data.pdf_url);
      setPdfUrl(data.pdf_url);
      setPreviewOpen(true);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        variant: "destructive",
        title: "Preview Error",
        description: `Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Handle form submission including tax config and signatures
  const handleSaveInvoice = () => {
    console.log('Save button clicked');
    console.log('Can save?', !!selectedClient && lineItems.length > 0);
    console.log('Selected client:', selectedClient);
    console.log('Line items:', lineItems);
    
    if (!selectedClient || lineItems.length === 0) {
      console.log('Cannot save: missing client or line items');
      return;
    }
    
    const formValues = form.getValues();
    console.log('Form values:', formValues);
    
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
          <InvoiceHeader 
            isEditing={isEditing} 
            isSubmitting={isSubmitting} 
            canSave={!!selectedClient && lineItems.length > 0} 
            onSave={handleSaveInvoice}
            onPreview={isEditing ? handlePreview : undefined}
            invoiceId={existingInvoice?.id}
            invoiceCode={existingInvoice?.invoice_code}
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
        pdfUrl={pdfUrl}
        invoiceId={existingInvoice?.id}
      />
    </DashboardLayout>;
};

export default InvoiceEdit;
