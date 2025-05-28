
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
    
    // Always force regeneration to ensure latest settings are applied
    // and add a timestamp to bypass any potential caching
    const { data, error } = await supabase.functions.invoke(
      'generate_invoice_pdf',
      { 
        body: { 
          invoice_id: invoiceId, 
          force_regenerate: true,
          timestamp: Date.now() // Add timestamp to ensure unique request
        } 
      }
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

    // Add cache-busting parameter to the URL to ensure fresh download
    const cacheBustingUrl = `${url}?v=${Date.now()}`;

    // Detect if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // On iOS, open PDF in new tab instead of trying to download
      window.open(cacheBustingUrl, '_blank');
      toast({
        title: "PDF Opened",
        description: "PDF opened in new tab. Use share button to save or print.",
      });
    } else {
      // For other platforms, try to download
      try {
        const response = await fetch(cacheBustingUrl);
        const blob = await response.blob();
        
        // Create a download link and trigger it
        const link = document.createElement('a');
        const objectURL = URL.createObjectURL(blob);
        link.href = objectURL;
        link.download = `invoice-${invoiceCode || invoiceId}.pdf`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(objectURL);
        
        toast({
          title: "Success",
          description: "PDF download started",
        });
      } catch (downloadError) {
        console.error('Download failed, opening in new tab:', downloadError);
        // Fallback to opening in new tab
        window.open(cacheBustingUrl, '_blank');
        toast({
          title: "PDF Opened",
          description: "PDF opened in new tab. Use browser's save option to download.",
        });
      }
    }
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
};
