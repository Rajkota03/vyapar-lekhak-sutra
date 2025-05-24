
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleDownloadPdf = async (invoiceId: string, invoiceCode?: string) => {
  try {
    console.log('Downloading PDF for invoice:', invoiceId);
    
    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your invoice PDF...",
    });
    
    const { data, error } = await supabase.functions.invoke(
      'get_or_generate_pdf',
      { body: { invoice_id: invoiceId } }
    );
    
    if (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate PDF: ${error.message || 'Unknown error'}`,
      });
      return;
    }
    
    const url = data?.pdf_url;
    console.log('PDF URL received for download:', url);
    
    if (!url) {
      console.error('No PDF URL in response:', data);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "PDF URL not available. Please try again.",
      });
      return;
    }

    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceCode || invoiceId}.pdf`;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "PDF download started",
    });
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
};
