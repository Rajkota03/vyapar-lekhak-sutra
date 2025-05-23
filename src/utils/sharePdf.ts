
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";

export const handleSharePdf = async (invoiceId: string) => {
  try {
    console.log('Generating PDF for invoice:', invoiceId);
    
    const { data, error } = await supabase.functions.invoke(
      'get_or_generate_pdf',
      { body: { invoice_id: invoiceId } }
    );
    
    if (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF",
      });
      return;
    }
    
    const url = data?.pdf_url;
    console.log('PDF URL received:', url);
    
    if (!url) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "PDF URL not available",
      });
      return;
    }

    // Try native Share API for mobile devices
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Invoice',
          text: 'Please find attached invoice PDF.',
          url,
        });
        return;
      } catch (err) {
        console.log('Share cancelled or failed:', err);
        // Fall through to desktop behavior
      }
    }

    // Desktop fallback – open in new tab then auto-download
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceId}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Success",
      description: "PDF is being downloaded",
    });
    
  } catch (error) {
    console.error('Error sharing PDF:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to share PDF",
    });
  }
};
