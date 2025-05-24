
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleSharePdf = async (invoiceId: string) => {
  try {
    console.log('Generating PDF for invoice:', invoiceId);
    
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
    console.log('PDF URL received:', url);
    
    if (!url) {
      console.error('No PDF URL in response:', data);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "PDF URL not available. Please try again.",
      });
      return;
    }

    // Try native Share API for mobile devices
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Invoice PDF',
          text: 'Please find attached invoice PDF.',
          url,
        });
        
        toast({
          title: "Success",
          description: "PDF shared successfully",
        });
        return;
      } catch (err) {
        console.log('Share cancelled or failed:', err);
        // Fall through to desktop behavior
      }
    }

    // Desktop fallback – open in new tab and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceId}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "PDF download started",
    });
    
  } catch (error) {
    console.error('Error sharing PDF:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to share PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
};
