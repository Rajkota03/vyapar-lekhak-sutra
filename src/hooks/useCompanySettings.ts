
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompanySettings = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: any) => {
      if (!companyId) throw new Error('Company ID required');

      const { data, error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: companyId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings', companyId] });
    },
  });

  // Helper getters with fallbacks
  const getters = {
    get quantityLabel() {
      return settings?.quantity_column_label || 'QTY';
    },
    get invoiceNumberPrefix() {
      return settings?.invoice_number_prefix || 'INV';
    },
    get defaultDueDays() {
      return settings?.due_days || 30;
    },
    get defaultCgstPct() {
      return settings?.default_cgst_pct || 9;
    },
    get defaultSgstPct() {
      return settings?.default_sgst_pct || 9;
    },
    get defaultIgstPct() {
      return settings?.default_igst_pct || 18;
    },
    get showMySignature() {
      return settings?.show_my_signature ?? true;
    },
    get requireClientSignature() {
      return settings?.require_client_signature ?? false;
    },
    get defaultNote() {
      return settings?.default_note || '';
    },
    get paymentNote() {
      return settings?.payment_note || 'Thank you for your business!';
    },
  };

  return {
    settings: settings ? { ...settings, ...getters } : null,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};
