
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleDownloadPdf = async (invoiceId: string, invoiceCode?: string) => {
  try {
    console.log('Downloading PDF for invoice:', invoiceId);
    
    // Show loading toast
    toast({
      title: "Preparing PDF",
      description: "Getting your invoice PDF...",
    });
    
    // First, try to get existing PDF without regenerating
    const { data: existingPdfData, error: existingError } = await supabase.functions.invoke(
      'get_or_generate_pdf',
      { 
        body: { 
          invoice_id: invoiceId
        } 
      }
    );
    
    if (existingError) {
      console.error('Error getting existing PDF:', existingError);
      
      // Fallback to force regeneration if getting existing PDF fails
      const { data, error } = await supabase.functions.invoke(
        'generate_invoice_pdf',
        { 
          body: { 
            invoice_id: invoiceId, 
            force_regenerate: true,
            timestamp: Date.now()
          } 
        }
      );
      
      if (error) {
        console.error('Error generating PDF:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || 'Failed to generate PDF',
        });
        return;
      }
      
      if (!data?.pdf_url) {
        toast({
          variant: "destructive",
          title: "Error", 
          description: "PDF URL not available. Please try again.",
        });
        return;
      }
      
      await downloadPdfFile(data.pdf_url, invoiceCode || invoiceId);
    } else {
      // Use existing PDF for faster download
      const url = existingPdfData?.pdf_url;
      
      if (!url) {
        toast({
          variant: "destructive",
          title: "Error", 
          description: "PDF URL not available. Please try again.",
        });
        return;
      }
      
      await downloadPdfFile(url, invoiceCode || invoiceId);
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

async function downloadPdfFile(url: string, filename: string) {
  // Detect if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // On iOS, open PDF in new tab instead of trying to download
    window.open(url, '_blank');
    toast({
      title: "PDF Opened",
      description: "PDF opened in new tab. Use share button to save or print.",
    });
  } else {
    // For other platforms, try to download directly
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      const objectURL = URL.createObjectURL(blob);
      link.href = objectURL;
      link.download = `invoice-${filename}.pdf`;
      
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
      window.open(url, '_blank');
      toast({
        title: "PDF Opened",
        description: "PDF opened in new tab. Use browser's save option to download.",
      });
    }
  }
}
