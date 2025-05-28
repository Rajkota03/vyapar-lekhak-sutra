
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleSharePdf = async (invoiceId: string) => {
  try {
    console.log('Generating PDF for sharing invoice:', invoiceId);
    
    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your invoice PDF...",
    });
    
    // Force regeneration to ensure latest logo settings are applied
    const { data, error } = await supabase.functions.invoke(
      'generate_invoice_pdf',
      { body: { invoice_id: invoiceId, force_regenerate: true } }
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
    console.log('PDF URL received for sharing:', url);
    
    if (!url) {
      console.error('No PDF URL in response:', data);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "PDF URL not available. Please try again.",
      });
      return;
    }

    // Check if native sharing is available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoiceId}`,
          text: 'Please find the invoice attached.',
          url: url,
        });
        
        toast({
          title: "Success",
          description: "PDF shared successfully",
        });
        return;
      } catch (shareError) {
        // User cancelled sharing or sharing failed, continue to fallback
        console.log('Native sharing cancelled or failed:', shareError);
      }
    }

    // Fallback for devices without native sharing
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "PDF link copied to clipboard. You can now paste it in WhatsApp, email, or any messaging app.",
        });
        return;
      } catch (clipboardError) {
        console.error('Clipboard copy failed:', clipboardError);
      }
    }

    // Final fallback - open in new tab
    window.open(url, '_blank');
    toast({
      title: "PDF Opened",
      description: "PDF opened in new tab. You can copy the URL from your browser to share it.",
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
