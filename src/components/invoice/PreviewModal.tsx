
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateInvoicePDF } from "@/utils/pdfGeneration";
import pdfMake from 'pdfmake/build/pdfmake';

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  invoiceId,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch invoice data when modal opens
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice-preview', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      // Fetch invoice data with related information
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (*),
          companies (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Failed to fetch invoice data');
      }

      // Fetch invoice line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_lines')
        .select(`
          *,
          items (*)
        `)
        .eq('invoice_id', invoiceId);

      if (lineItemsError) {
        throw new Error('Failed to fetch invoice line items');
      }

      // Transform line items to match expected format
      const formattedLineItems = (lineItems || []).map(item => ({
        id: item.id,
        item_id: item.item_id,
        description: item.description,
        qty: Number(item.qty),
        unit_price: Number(item.unit_price),
        cgst: Number(item.cgst || 0),
        sgst: Number(item.sgst || 0),
        amount: Number(item.amount),
        discount_amount: Number(item.discount_amount || 0),
        note: item.note || ''
      }));

      return {
        invoice,
        lineItems: formattedLineItems
      };
    },
    enabled: !!invoiceId && isOpen,
  });

  // Generate PDF preview when data is available
  useEffect(() => {
    const generatePreview = async () => {
      if (!invoiceData || !isOpen) return;

      setIsGenerating(true);
      try {
        const docDefinition = await generateInvoicePDF(
          invoiceData.invoice,
          invoiceData.invoice.clients,
          invoiceData.invoice.companies,
          invoiceData.lineItems
        );

        // Generate PDF blob and create object URL
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setIsGenerating(false);
        });
      } catch (error) {
        console.error('Error generating PDF preview:', error);
        setIsGenerating(false);
      }
    };

    generatePreview();
  }, [invoiceData, isOpen]);

  // Cleanup object URL when modal closes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [pdfUrl]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setIsGenerating(false);
    }
  }, [isOpen, pdfUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[98vw] w-full p-2 sm:p-4 overflow-hidden"
        style={{ maxHeight: '95dvh', height: '95dvh' }}
      >
        <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden bg-white rounded-lg">
            {isLoading || isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-muted-foreground">
                    {isLoading ? 'Loading invoice data...' : 'Generating PDF preview...'}
                  </p>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#view=FitH`}
                className="w-full h-full border-0 rounded-lg"
                title="Invoice Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Unable to generate preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
