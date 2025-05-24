
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { InvoicePdfPreview } from "@/components/InvoicePdfPreview";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  invoiceId?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  pdfUrl,
  invoiceId,
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'preview'>('pdf');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId && viewMode === 'preview') {
      fetchInvoiceData();
    }
  }, [isOpen, invoiceId, viewMode]);

  const fetchInvoiceData = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    try {
      // Fetch invoice with related data
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          companies (*),
          clients (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch line items
      const { data: lineItems, error: linesError } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (linesError) throw linesError;

      setInvoiceData({
        invoice,
        company: invoice.companies,
        client: invoice.clients,
        lines: lineItems || []
      });
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full h-[98vh] p-2 sm:p-4 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pdf')}
              >
                PDF View
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('preview')}
              >
                Live Preview
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden bg-white rounded-lg">
            {viewMode === 'pdf' && pdfUrl ? (
              <iframe 
                src={pdfUrl} 
                className="w-full h-full border-0" 
                title="Invoice PDF"
                style={{ minHeight: '80vh' }}
              />
            ) : viewMode === 'preview' && invoiceData ? (
              <div className="w-full h-full overflow-auto">
                <InvoicePdfPreview {...invoiceData} />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {viewMode === 'pdf' ? 'No PDF available' : 'No invoice data available'}
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
