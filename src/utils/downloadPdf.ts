
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleDownloadPdf = async (
  invoiceId: string, 
  invoiceCode?: string, 
  onLoadingChange?: (loading: boolean) => void
) => {
  try {
    console.log('Downloading PDF for invoice:', invoiceId);
    
    // Start loading animation
    onLoadingChange?.(true);
    
    // Show loading toast
    toast({
      title: "Preparing PDF",
      description: "Generating fresh PDF...",
    });
    
    // Force regeneration with timestamp to bust cache
    const timestamp = Date.now();
    const { data, error } = await supabase.functions.invoke(
      'generate_invoice_pdf',
      { 
        body: { 
          invoice_id: invoiceId, 
          force_regenerate: true,
          timestamp: timestamp
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
    
    // Add cache busting parameter to ensure fresh download
    const pdfUrl = `${data.pdf_url}?v=${timestamp}`;
    await downloadPdfFile(pdfUrl, invoiceCode || invoiceId);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  } finally {
    // Stop loading animation
    onLoadingChange?.(false);
  }
};

async function downloadPdfFile(url: string, filename: string) {
  // Enhanced mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  console.log('Device detection:', { isMobile, isSafari, isIOS });
  
  // For mobile Safari or iOS, always open in new tab
  if (isIOS || (isMobile && isSafari)) {
    console.log('Opening PDF in new tab for mobile Safari/iOS');
    window.open(url, '_blank');
    toast({
      title: "PDF Opened",
      description: "PDF opened in new tab. Use Safari's share button to save or print.",
    });
    return;
  }
  
  // For mobile devices (non-iOS), try opening in new tab first
  if (isMobile) {
    console.log('Opening PDF in new tab for mobile device');
    window.open(url, '_blank');
    toast({
      title: "PDF Opened",
      description: "PDF opened in new tab. Use your browser's download option to save.",
    });
    return;
  }
  
  // For desktop browsers, try to download directly
  try {
    console.log('Attempting direct download for desktop');
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
      description: "PDF download completed",
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
