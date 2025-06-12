
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/context/CompanyContext";
import { toast } from "@/hooks/use-toast";

export interface CustomDocument {
  id: string;
  number: string;
  invoice_code: string | null;
  issue_date: string;
  total: number;
  status: string | null;
  clients: {
    name: string;
  } | null;
  document_type_id: string;
}

export const useCustomDocuments = (documentTypeId: string) => {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const { data: documents, isLoading, error, refetch } = useQuery({
    queryKey: ['custom-documents', documentTypeId, currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id || !documentTypeId) {
        console.log('No company ID or document type ID for custom documents query');
        return [];
      }
      
      console.log('Fetching custom documents for type:', documentTypeId, 'company:', currentCompany.id);
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          number,
          invoice_code,
          issue_date,
          total,
          status,
          clients ( name )
        `)
        .eq('company_id', currentCompany.id)
        .eq('document_type_id', documentTypeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom documents:', error);
        throw error;
      }

      console.log('Custom documents fetched:', data?.length || 0);
      return data as CustomDocument[] || [];
    },
    enabled: !!currentCompany?.id && !!documentTypeId,
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // First delete line items
      const { error: lineItemsError } = await supabase
        .from('invoice_lines')
        .delete()
        .eq('invoice_id', documentId);
      
      if (lineItemsError) {
        console.error('Error deleting line items:', lineItemsError);
        throw lineItemsError;
      }

      // Then delete the document
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-documents'] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document. Please try again.",
      });
    },
  });

  return {
    documents: documents || [],
    isLoading,
    error,
    refetch,
    deleteDocument,
  };
};
