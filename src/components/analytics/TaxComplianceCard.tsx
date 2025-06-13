
import React from "react";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading3, BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { AnalyticsData } from "@/hooks/useAnalytics";
import { formatNumber } from "@/utils/formatNumber";

interface TaxComplianceCardProps {
  analytics: AnalyticsData;
}

export const TaxComplianceCard: React.FC<TaxComplianceCardProps> = ({ analytics }) => {
  const totalTax = analytics.taxBreakdown.cgst + analytics.taxBreakdown.sgst + analytics.taxBreakdown.igst;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ModernCard>
        <Heading3 className="mb-4">Tax Breakdown</Heading3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <BodyText>CGST</BodyText>
            <BodyText className="font-semibold">₹{formatNumber(analytics.taxBreakdown.cgst)}</BodyText>
          </div>
          <div className="flex justify-between items-center">
            <BodyText>SGST</BodyText>
            <BodyText className="font-semibold">₹{formatNumber(analytics.taxBreakdown.sgst)}</BodyText>
          </div>
          <div className="flex justify-between items-center">
            <BodyText>IGST</BodyText>
            <BodyText className="font-semibold">₹{formatNumber(analytics.taxBreakdown.igst)}</BodyText>
          </div>
          <hr />
          <div className="flex justify-between items-center">
            <BodyText className="font-semibold">Total Tax</BodyText>
            <BodyText className="font-bold text-primary">₹{formatNumber(totalTax)}</BodyText>
          </div>
        </div>
      </ModernCard>

      <ModernCard>
        <Heading3 className="mb-4">Quarterly Tax Liability</Heading3>
        <div className="space-y-3">
          {analytics.quarterlyTax.length === 0 ? (
            <CaptionText>No quarterly data available</CaptionText>
          ) : (
            analytics.quarterlyTax.map((quarter, index) => (
              <div key={index} className="flex justify-between items-center">
                <BodyText>{quarter.quarter}</BodyText>
                <BodyText className="font-semibold">₹{formatNumber(quarter.totalTax)}</BodyText>
              </div>
            ))
          )}
        </div>
      </ModernCard>
    </div>
  );
};
