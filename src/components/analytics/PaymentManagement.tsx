
import React, { useState } from "react";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading3, BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/utils/formatNumber";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, AlertTriangle, CreditCard } from "lucide-react";

interface PaymentTrackingItem {
  id: string;
  number: string;
  clientName: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate: string;
  isOverdue: boolean;
}

interface PaymentManagementProps {
  paymentData: PaymentTrackingItem[];
  onPaymentUpdate: () => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({ 
  paymentData, 
  onPaymentUpdate 
}) => {
  const [updatingPayments, setUpdatingPayments] = useState<Set<string>>(new Set());
  const [partialPayments, setPartialPayments] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleMarkAsPaid = async (invoiceId: string) => {
    setUpdatingPayments(prev => new Set(prev).add(invoiceId));
    
    try {
      const invoice = paymentData.find(p => p.id === invoiceId);
      if (!invoice) return;

      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_amount: invoice.total
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Payment Updated",
        description: "Invoice marked as paid successfully.",
      });
      
      onPaymentUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  const handlePartialPayment = (invoiceId: string, amount: number) => {
    setPartialPayments(prev => ({
      ...prev,
      [invoiceId]: amount
    }));
  };

  const applyPartialPayment = async (invoiceId: string) => {
    const amount = partialPayments[invoiceId];
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    const invoice = paymentData.find(p => p.id === invoiceId);
    if (!invoice) return;

    if (amount > invoice.remainingAmount) {
      toast({
        title: "Amount Exceeds Balance",
        description: `Payment amount cannot exceed remaining balance of ₹${formatNumber(invoice.remainingAmount)}.`,
        variant: "destructive",
      });
      return;
    }

    setUpdatingPayments(prev => new Set(prev).add(invoiceId));
    
    try {
      const newPaidAmount = invoice.paidAmount + amount;
      const newRemainingAmount = invoice.total - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? 'paid' : 'pending';

      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus,
          paid_amount: newPaidAmount
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Payment Updated",
        description: `Partial payment of ₹${formatNumber(amount)} recorded successfully.`,
      });

      // Clear the input field
      setPartialPayments(prev => {
        const newState = { ...prev };
        delete newState[invoiceId];
        return newState;
      });
      
      onPaymentUpdate();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to record partial payment.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (status === 'paid') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isOverdue) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-orange-600" />;
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (status === 'paid') return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>;
    if (isOverdue) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending</Badge>;
  };

  // Group payments by status
  const paidInvoices = paymentData.filter(p => p.status === 'paid');
  const overdueInvoices = paymentData.filter(p => p.isOverdue);
  const pendingInvoices = paymentData.filter(p => p.status !== 'paid' && !p.isOverdue);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <BodyText className="text-sm text-muted-foreground">Paid</BodyText>
              <BodyText className="text-lg font-semibold text-green-600">
                ₹{formatNumber(paidInvoices.reduce((sum, p) => sum + p.total, 0))}
              </BodyText>
              <CaptionText>{paidInvoices.length} invoices</CaptionText>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <BodyText className="text-sm text-muted-foreground">Overdue</BodyText>
              <BodyText className="text-lg font-semibold text-red-600">
                ₹{formatNumber(overdueInvoices.reduce((sum, p) => sum + p.total, 0))}
              </BodyText>
              <CaptionText>{overdueInvoices.length} invoices</CaptionText>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <BodyText className="text-sm text-muted-foreground">Pending</BodyText>
              <BodyText className="text-lg font-semibold text-orange-600">
                ₹{formatNumber(pendingInvoices.reduce((sum, p) => sum + p.total, 0))}
              </BodyText>
              <CaptionText>{pendingInvoices.length} invoices</CaptionText>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Payment Actions */}
      <ModernCard>
        <div className="p-4 border-b">
          <Heading3>Payment Tracking & Management</Heading3>
          <CaptionText>Track and update payment status for your invoices</CaptionText>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {paymentData.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <BodyText className="text-muted-foreground">No invoices found</BodyText>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {paymentData.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(payment.status, payment.isOverdue)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BodyText className="font-medium">{payment.number}</BodyText>
                        {getStatusBadge(payment.status, payment.isOverdue)}
                      </div>
                      <CaptionText>{payment.clientName}</CaptionText>
                      <CaptionText>Due: {new Date(payment.dueDate).toLocaleDateString()}</CaptionText>
                    </div>
                    <div className="text-right">
                      <BodyText className="font-semibold">₹{formatNumber(payment.total)}</BodyText>
                      {payment.paidAmount > 0 && payment.status !== 'paid' && (
                        <CaptionText className="text-blue-600">
                          Paid: ₹{formatNumber(payment.paidAmount)}
                        </CaptionText>
                      )}
                      {payment.status !== 'paid' && (
                        <CaptionText>Remaining: ₹{formatNumber(payment.remainingAmount)}</CaptionText>
                      )}
                    </div>
                  </div>

                  {payment.status !== 'paid' && (
                    <div className="flex items-center gap-2 ml-4">
                      <Input
                        type="number"
                        placeholder="Amount"
                        className="w-24 h-8"
                        value={partialPayments[payment.id] || ''}
                        onChange={(e) => handlePartialPayment(payment.id, parseFloat(e.target.value) || 0)}
                        max={payment.remainingAmount}
                        min={0}
                        step="0.01"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyPartialPayment(payment.id)}
                        disabled={updatingPayments.has(payment.id) || !partialPayments[payment.id]}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                        disabled={updatingPayments.has(payment.id)}
                      >
                        Mark Paid
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
};
