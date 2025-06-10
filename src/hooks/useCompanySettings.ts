
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useCompanySettings = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      console.log('=== FETCHING COMPANY SETTINGS ===');
      console.log('Company ID:', companyId);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company settings:', error);
        throw error;
      }
      
      console.log('Fetched company settings:', data);
      return data;
    },
    enabled: !!companyId,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!companyId) throw new Error('Company ID required');

      console.log('=== UPDATING COMPANY SETTINGS ===');
      console.log('Company ID:', companyId);
      console.log('Updates:', updates);

      const { data, error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: companyId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating company settings:', error);
        throw error;
      }
      
      console.log('Updated company settings result:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('=== SETTINGS UPDATE SUCCESS ===');
      console.log('Updated data:', data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['company-settings', companyId] });
    },
    onError: (error) => {
      console.error('=== SETTINGS UPDATE ERROR ===');
      console.error('Error:', error);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
