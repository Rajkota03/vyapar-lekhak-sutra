
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Section, Stack } from "@/components/ui/primitives/Spacing";
import { Heading2, Heading3, BodyText } from "@/components/ui/primitives/Typography";
import { useCompany } from "@/context/CompanyContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { CashFlowChart } from "@/components/analytics/CashFlowChart";
import { KpiCards } from "@/components/analytics/KpiCards";
import { TopClientsTable } from "@/components/analytics/TopClientsTable";
import { TaxComplianceCard } from "@/components/analytics/TaxComplianceCard";
import { BarChart3, TrendingUp, Users, FileText, AlertCircle, Calendar } from "lucide-react";

const Analytics = () => {
  const { currentCompany } = useCompany();
  const { analytics, loading, error } = useAnalytics(currentCompany?.id);

  if (!currentCompany) {
    return (
      <DashboardLayout>
        <AppHeader title="Analytics" showBack backPath="/dashboard" />
        <div className="p-6">
          <ModernCard className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Heading2 className="mb-2">No Company Selected</Heading2>
            <BodyText>Please select a company to view analytics.</BodyText>
          </ModernCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AppHeader title="Analytics" showBack backPath="/dashboard" />
      
      <div className="p-6 space-y-6">
        {loading && (
          <ModernCard className="text-center py-8">
            <BodyText>Loading analytics...</BodyText>
          </ModernCard>
        )}

        {error && (
          <ModernCard className="text-center py-8 border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <BodyText className="text-destructive">Error loading analytics: {error}</BodyText>
          </ModernCard>
        )}

        {!loading && !error && analytics && (
          <>
            {/* KPI Overview */}
            <Section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <Heading2>Business Overview</Heading2>
              </div>
              <KpiCards analytics={analytics} />
            </Section>

            {/* Revenue Analytics */}
            <Section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Heading2>Revenue Analytics</Heading2>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <ModernCard>
                  <Heading3 className="mb-4">Monthly Revenue Trend</Heading3>
                  <RevenueChart data={analytics.monthlyRevenue} />
                </ModernCard>
                <ModernCard>
                  <Heading3 className="mb-4">Top Clients</Heading3>
                  <TopClientsTable clients={analytics.topClients} />
                </ModernCard>
              </div>
            </Section>

            {/* Cash Flow */}
            <Section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <Heading2>Cash Flow</Heading2>
              </div>
              <ModernCard>
                <Heading3 className="mb-4">Outstanding vs Paid Amounts</Heading3>
                <CashFlowChart data={analytics.cashFlow} />
              </ModernCard>
            </Section>

            {/* Tax Compliance */}
            <Section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <Heading2>Tax Compliance</Heading2>
              </div>
              <TaxComplianceCard analytics={analytics} />
            </Section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
