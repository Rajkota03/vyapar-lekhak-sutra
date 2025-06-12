import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";

// UI Components
import DashboardLayout from "@/components/DashboardLayout";
import { Textarea } from "@/components/ui/textarea";

// Custom Components
import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import InvoiceMeta from "@/components/invoice/InvoiceMeta";
import ClientSection from "@/components/invoice/ClientSection";
import ItemsSection from "@/components/invoice/ItemsSection";
import TotalsSection from "@/components/invoice/TotalsSection";
import SignatureSection from "@/components/invoice/SignatureSection";
import PreviewModal from "@/components/invoice/PreviewModal";

// Premium UI Components
import { Container, Section, Stack } from "@/components/ui/primitives/Spacing";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { Heading3, CaptionText } from "@/components/ui/primitives/Typography";

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
  requireClientSignature: z.boolean().default(false),
  notes: z.string().optional()
});
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const InvoiceEdit = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  
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
    existingInvoice,
    documentType
  } = useInvoiceData();

  // Log invoice ID extraction
  useEffect(() => {
    console.log('=== INVOICE EDIT DEBUG ===');
    console.log('URL params:', params);
    console.log('params.id:', params.id);
    console.log('params.invoiceId:', params.invoiceId);
    console.log('Extracted invoice ID:', invoiceId);
    console.log('Existing invoice from hook:', existingInvoice);
    console.log('Document type from hook:', documentType);
  }, [params, invoiceId, existingInvoice, documentType]);

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
      requireClientSignature: existingInvoice?.require_client_signature || false,
      notes: existingInvoice?.notes || ""
    }
  });

  // Update form when existing invoice data changes
  useEffect(() => {
    if (existingInvoice) {
      form.reset({
        taxConfig: {
          useIgst: existingInvoice.use_igst || false,
          cgstPct: existingInvoice.cgst_pct || 9,
          sgstPct: existingInvoice.sgst_pct || 9,
          igstPct: existingInvoice.igst_pct || 18
        },
        showMySignature: existingInvoice.show_my_signature || false,
        requireClientSignature: existingInvoice.require_client_signature || false,
        notes: existingInvoice.notes || ""
      });

      // Set invoice number from existing data
      setInvoiceNumber(existingInvoice.number || "");

      // Show notes section if there are existing notes
      if (existingInvoice.notes && existingInvoice.notes.trim() !== "") {
        setShowNotesSection(true);
      }
    }
  }, [existingInvoice, form]);

  // Generate invoice number for new invoices
  useEffect(() => {
    if (!isEditing || !existingInvoice) {
      const generateInvoiceNumber = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `INV-${year}${month}-${random}`;
      };
      setInvoiceNumber(generateInvoiceNumber());
    }
  }, [isEditing, existingInvoice]);

  const taxConfig = form.watch('taxConfig') as TaxConfig;
  const notes = form.watch('notes');

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

  // Generate invoice code for display
  const invoiceCode = existingInvoice?.invoice_code || "Will be generated on save";

  // Handle invoice number change
  const handleInvoiceNumberChange = (newNumber: string) => {
    setInvoiceNumber(newNumber);
  };

  // Handle preview
  const handlePreview = () => {
    setIsGeneratingPreview(true);
    setPreviewOpen(true);
    // Reset generating state after modal opens
    setTimeout(() => setIsGeneratingPreview(false), 100);
  };

  // Handle form submission including tax config and signatures
  const handleSaveInvoice = () => {
    if (!selectedClient || lineItems.length === 0) {
      return;
    }
    
    const formValues = form.getValues();
    
    saveInvoiceMutation.mutate({
      navigate,
      taxConfig: formValues.taxConfig as TaxConfig,
      showMySignature: formValues.showMySignature,
      requireClientSignature: formValues.requireClientSignature,
      notes: formValues.notes || "",
      invoiceNumber: invoiceNumber
    });
  };

  const handleShowMySignatureChange = (value: boolean) => {
    form.setValue('showMySignature', value);
  };

  const handleRequireClientSignatureChange = (value: boolean) => {
    form.setValue('requireClientSignature', value);
  };

  const handleNotesChange = (value: string) => {
    form.setValue('notes', value);
  };

  const toggleNotesSection = () => {
    if (showNotesSection) {
      // Clear notes when hiding section
      form.setValue('notes', '');
    }
    setShowNotesSection(!showNotesSection);
  };

  // Loading state
  if (isLoading) {
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
      <div className="min-h-screen bg-background" style={{ paddingBottom: existingInvoice?.id ? '80px' : '20px' }}>
        <Container>
          <InvoiceHeader 
            isEditing={isEditing} 
            isSubmitting={isSubmitting} 
            canSave={!!selectedClient && lineItems.length > 0} 
            onSave={handleSaveInvoice}
            onPreview={existingInvoice?.id ? handlePreview : undefined}
            invoiceId={existingInvoice?.id || invoiceId}
            invoiceCode={existingInvoice?.invoice_code}
            isGeneratingPreview={isGeneratingPreview}
            documentType={documentType}
          />

          <Section className="pt-6 space-y-8">
            <InvoiceMeta 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
              invoiceNumber={invoiceNumber}
              onInvoiceNumberChange={handleInvoiceNumberChange}
              isEditing={true}
            />

            <ClientSection 
              selectedClient={selectedClient} 
              setSelectedClient={setSelectedClient} 
              clients={clients} 
              companyId={selectedCompanyId || ""} 
            />

            <ItemsSection lineItems={lineItems} setLineItems={setLineItems} items={items} selectedCompanyId={selectedCompanyId} />

            {lineItems.length > 0 && (
              <TotalsSection 
                subtotal={subtotal} 
                cgstAmount={cgstAmount} 
                sgstAmount={sgstAmount} 
                igstAmount={igstAmount} 
                grandTotal={grandTotal} 
                taxConfig={taxConfig} 
                setValue={form.setValue} 
                watch={form.watch} 
              />
            )}

            {/* Notes Section */}
            <Stack>
              {!showNotesSection ? (
                <PremiumButton
                  variant="outline"
                  onClick={toggleNotesSection}
                  className="w-full border-dashed h-12"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Notes
                </PremiumButton>
              ) : (
                <ModernCard variant="outlined" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <Heading3 className="text-base">Notes</Heading3>
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={toggleNotesSection}
                      className="h-6 w-6 p-0 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </PremiumButton>
                  </div>
                  <Textarea
                    placeholder="Add any additional notes or payment instructions..."
                    value={notes || ""}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="min-h-[80px] text-sm resize-none border-0 p-0 focus-visible:ring-0"
                  />
                </ModernCard>
              )}
            </Stack>

            <SignatureSection 
              showMySignature={form.watch('showMySignature')}
              requireClientSignature={form.watch('requireClientSignature')}
              onShowMySignatureChange={handleShowMySignatureChange}
              onRequireClientSignatureChange={handleRequireClientSignatureChange}
            />
          </Section>
        </Container>
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
