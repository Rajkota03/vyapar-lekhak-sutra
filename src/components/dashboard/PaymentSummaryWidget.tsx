
import React from "react";
import { Link } from "react-router-dom";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/utils/formatNumber";
import { CreditCard, AlertTriangle, CheckCircle, Clock, ArrowRight, FileText, Receipt } from "lucide-react";

interface PaymentData {
  id: string;
  number: string;
  clientName: string;
  total: number;
  remainingAmount: number;
  status: string;
  isOverdue: boolean;
  dueDate: string;
  documentType: 'invoice' | 'proforma';
}

interface PaymentSummaryWidgetProps {
  paymentData: PaymentData[];
}

export const PaymentSummaryWidget: React.FC<PaymentSummaryWidgetProps> = ({ paymentData }) => {
  const overdueInvoices = paymentData.filter(p => p.isOverdue);
  const pendingInvoices = paymentData.filter(p => p.status !== 'paid' && !p.isOverdue);
  const totalOutstanding = paymentData.reduce((sum, p) => sum + p.remainingAmount, 0);

  // Separate by document type
  const invoices = paymentData.filter(p => p.documentType === 'invoice');
  const proformas = paymentData.filter(p => p.documentType === 'proforma');

  // Get top 3 overdue items by amount
  const topOverdueItems = overdueInvoices
    .sort((a, b) => b.remainingAmount - a.remainingAmount)
    .slice(0, 3);

  const getDocumentIcon = (documentType: 'invoice' | 'proforma') => {
    return documentType === 'invoice' ? <Receipt className="h-3 w-3" /> : <FileText className="h-3 w-3" />;
  };

  const getDocumentBadgeColor = (documentType: 'invoice' | 'proforma') => {
    return documentType === 'invoice' ? 'default' : 'secondary';
  };

  return (
    <ModernCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <BodyText className="font-semibold">Payment Overview</BodyText>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/payments" className="flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <BodyText className="text-sm font-semibold text-red-600">
              {overdueInvoices.length}
            </BodyText>
            <CaptionText className="text-red-600">Overdue</CaptionText>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <BodyText className="text-sm font-semibold text-orange-600">
              {pendingInvoices.length}
            </BodyText>
            <CaptionText className="text-orange-600">Pending</CaptionText>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <BodyText className="text-sm font-semibold">
              ₹{formatNumber(totalOutstanding)}
            </BodyText>
            <CaptionText>Outstanding</CaptionText>
          </div>
        </div>

        {/* Document Type Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 border rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Receipt className="h-3 w-3 text-blue-600" />
              <CaptionText className="text-blue-600 font-medium">Invoices</CaptionText>
            </div>
            <BodyText className="text-sm font-semibold">{invoices.length}</BodyText>
          </div>
          
          <div className="text-center p-2 border rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-green-600" />
              <CaptionText className="text-green-600 font-medium">Pro Formas</CaptionText>
            </div>
            <BodyText className="text-sm font-semibold">{proformas.length}</BodyText>
          </div>
        </div>

        {/* Recent Overdue Items */}
        {topOverdueItems.length > 0 && (
          <div>
            <CaptionText className="text-muted-foreground mb-2">Recent Overdue</CaptionText>
            <div className="space-y-2">
              {topOverdueItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BodyText className="text-sm font-medium truncate">
                        {item.number}
                      </BodyText>
                      <Badge variant={getDocumentBadgeColor(item.documentType)} className="text-xs h-4 px-1">
                        {getDocumentIcon(item.documentType)}
                        <span className="ml-1">{item.documentType === 'invoice' ? 'INV' : 'PF'}</span>
                      </Badge>
                    </div>
                    <CaptionText className="text-muted-foreground truncate">
                      {item.clientName}
                    </CaptionText>
                  </div>
                  <div className="text-right ml-2">
                    <BodyText className="text-sm font-semibold text-red-600">
                      ₹{formatNumber(item.remainingAmount)}
                    </BodyText>
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paymentData.length === 0 && (
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <CaptionText className="text-muted-foreground">
              No payment data available
            </CaptionText>
          </div>
        )}
      </div>
    </ModernCard>
  );
};
