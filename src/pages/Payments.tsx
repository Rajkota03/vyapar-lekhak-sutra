
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { useCompany } from "@/context/CompanyContext";
import { useAnalytics, AnalyticsFilters } from "@/hooks/useAnalytics";
import { PaymentManagement } from "@/components/analytics/PaymentManagement";
import { AlertCircle } from "lucide-react";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading2, BodyText } from "@/components/ui/primitives/Typography";

const Payments = () => {
  const { currentCompany } = useCompany();
  const [filters] = useState<AnalyticsFilters>({
    period: 'monthly',
    selectedMonth: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    selectedYear: new Date().getFullYear()
  });
  
  const { analytics, loading, error } = useAnalytics(currentCompany?.id, filters);

  const handlePaymentUpdate = () => {
    // Force refetch of analytics data after payment update
    window.location.reload();
  };

  if (!currentCompany) {
    return (
      <DashboardLayout>
        <AppHeader title="Payments" showBack backPath="/dashboard" />
        <div className="p-6">
          <ModernCard className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Heading2 className="mb-2">No Company Selected</Heading2>
            <BodyText>Please select a company to view payments.</BodyText>
          </ModernCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AppHeader title="Payments" showBack backPath="/dashboard" />
      
      <div className="p-6 space-y-6">
        {loading && (
          <ModernCard className="text-center py-8">
            <BodyText>Loading payment data...</BodyText>
          </ModernCard>
        )}

        {error && (
          <ModernCard className="text-center py-8 border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <BodyText className="text-destructive">Error loading payment data: {error}</BodyText>
          </ModernCard>
        )}

        {!loading && !error && analytics && (
          <PaymentManagement 
            paymentData={analytics.paymentTracking} 
            onPaymentUpdate={handlePaymentUpdate}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
