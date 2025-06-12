
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/context/CompanyContext";
import { toast } from "@/hooks/use-toast";

export interface CustomDocumentType {
  id: string;
  company_id: string;
  name: string;
  code_prefix: string;
  next_sequence: number;
  created_at: string;
  updated_at: string;
}

export const useCustomDocumentTypes = () => {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const { data: customDocumentTypes, isLoading } = useQuery({
    queryKey: ['custom-document-types', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('custom_document_types')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('name');

      if (error) {
        console.error('Error fetching custom document types:', error);
        throw error;
      }

      return data as CustomDocumentType[];
    },
    enabled: !!currentCompany?.id,
  });

  const createCustomDocumentType = useMutation({
    mutationFn: async ({ name, codePrefix }: { name: string; codePrefix: string }) => {
      if (!currentCompany?.id) {
        throw new Error('No company selected');
      }

      const { data, error } = await supabase
        .from('custom_document_types')
        .insert({
          company_id: currentCompany.id,
          name,
          code_prefix: codePrefix,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating custom document type:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-document-types'] });
      toast({
        title: "Success",
        description: "Custom document type created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating custom document type:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create custom document type. Please try again.",
      });
    },
  });

  const deleteCustomDocumentType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_document_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting custom document type:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-document-types'] });
      toast({
        title: "Success",
        description: "Custom document type deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting custom document type:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete custom document type. Please try again.",
      });
    },
  });

  return {
    customDocumentTypes: customDocumentTypes || [],
    isLoading,
    createCustomDocumentType,
    deleteCustomDocumentType,
  };
};
