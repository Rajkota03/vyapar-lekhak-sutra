
import { supabase } from "@/integrations/supabase/client";

export const handleSharePdf = async (invoiceId: string) => {
  try {
    console.log('Attempting to share PDF for invoice:', invoiceId);
    
    // For now, just show a message that PDF sharing is not available
    if (navigator.share) {
      await navigator.share({
        title: 'Invoice',
        text: `Invoice #${invoiceId}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sharing PDF:', error);
    return { success: false, error };
  }
};
