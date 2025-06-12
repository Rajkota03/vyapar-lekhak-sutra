
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useCompanySettings = (providedCompanyId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch current company if no companyId provided
  const { data: currentCompany } = useQuery({
    queryKey: ['current-company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user && !providedCompanyId,
  });

  const companyId = providedCompanyId || currentCompany?.id;

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

  // Helper getters with fallbacks - using correct database column names
  const getters = {
    get quantityLabel() {
      return settings?.quantity_column_label || 'QTY';
    },
    get invoiceNumberPrefix() {
      return settings?.invoice_prefix || 'INV';
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
      return settings?.signature_url ? true : false;
    },
    get requireClientSignature() {
      return false; // This field doesn't exist in company_settings, removing
    },
    get defaultNote() {
      return settings?.default_note || '';
    },
    get paymentNote() {
      return settings?.payment_note || 'Thank you for your business!';
    },
    get logoUrl() {
      return settings?.logo_url || '';
    },
    get logoScale() {
      return Number(settings?.logo_scale || 0.3);
    },
    get signatureScale() {
      return Number(settings?.signature_scale || 1.0);
    },
  };

  return {
    settings: settings ? { ...settings, ...getters } : null,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
    companyId,
    // Also expose individual getters for direct access
    quantityLabel: getters.quantityLabel,
    invoiceNumberPrefix: getters.invoiceNumberPrefix,
    defaultDueDays: getters.defaultDueDays,
    defaultCgstPct: getters.defaultCgstPct,
    defaultSgstPct: getters.defaultSgstPct,
    defaultIgstPct: getters.defaultIgstPct,
    showMySignature: getters.showMySignature,
    requireClientSignature: getters.requireClientSignature,
    defaultNote: getters.defaultNote,
    paymentNote: getters.paymentNote,
    logoUrl: getters.logoUrl,
    logoScale: getters.logoScale,
    signatureScale: getters.signatureScale,
  };
};
