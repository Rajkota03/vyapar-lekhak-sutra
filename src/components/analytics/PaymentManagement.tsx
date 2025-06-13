
import React, { useState } from "react";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading3, BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/utils/formatNumber";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, AlertTriangle, CreditCard, Calendar, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

      if (error) {
        console.error('Error marking as paid:', error);
        throw error;
      }

      toast({
        title: "Payment Updated",
        description: "Invoice marked as paid successfully.",
      });
      
      onPaymentUpdate();
    } catch (error) {
      console.error('Error updating payment:', error);
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
      
      // Use only valid status values - keeping current status if not fully paid
      const newStatus = newRemainingAmount <= 0 ? 'paid' : invoice.status;

      console.log('Updating invoice with:', {
        invoiceId,
        currentPaidAmount: invoice.paidAmount,
        paymentAmount: amount,
        newPaidAmount,
        newRemainingAmount,
        currentStatus: invoice.status,
        newStatus
      });

      const { error } = await supabase
        .from('invoices')
        .update({ 
          paid_amount: newPaidAmount
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }

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

  // Mobile Card Component
  const PaymentCard = ({ payment }: { payment: PaymentTrackingItem }) => (
    <ModernCard className="p-4 space-y-4">
      {/* Header with status and invoice number */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(payment.status, payment.isOverdue)}
          <BodyText className="font-semibold">{payment.number}</BodyText>
        </div>
        {getStatusBadge(payment.status, payment.isOverdue)}
      </div>

      {/* Client and Due Date */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <BodyText className="text-sm">{payment.clientName}</BodyText>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <CaptionText className={payment.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
            Due: {new Date(payment.dueDate).toLocaleDateString()}
          </CaptionText>
        </div>
      </div>

      {/* Amount Details */}
      <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
        <div>
          <CaptionText className="text-muted-foreground mb-1">Total Amount</CaptionText>
          <BodyText className="font-semibold">₹{formatNumber(payment.total)}</BodyText>
        </div>
        <div>
          <CaptionText className="text-muted-foreground mb-1">Remaining</CaptionText>
          <BodyText className={payment.remainingAmount > 0 ? "font-semibold text-red-600" : "font-semibold text-green-600"}>
            ₹{formatNumber(payment.remainingAmount)}
          </BodyText>
        </div>
      </div>

      {/* Paid Amount */}
      {payment.paidAmount > 0 && (
        <div>
          <CaptionText className="text-muted-foreground mb-1">Paid Amount</CaptionText>
          <BodyText className="text-green-600 font-medium">₹{formatNumber(payment.paidAmount)}</BodyText>
        </div>
      )}

      {/* Actions */}
      {payment.status !== 'paid' ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount"
              className="flex-1"
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
          </div>
          <Button
            className="w-full"
            onClick={() => handleMarkAsPaid(payment.id)}
            disabled={updatingPayments.has(payment.id)}
          >
            Mark as Paid
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center py-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Payment Completed
          </Badge>
        </div>
      )}
    </ModernCard>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <BodyText className="text-sm text-muted-foreground mb-1">Paid Invoices</BodyText>
              <BodyText className="text-2xl font-bold text-green-600">
                ₹{formatNumber(paidInvoices.reduce((sum, p) => sum + p.total, 0))}
              </BodyText>
              <CaptionText className="text-muted-foreground">{paidInvoices.length} invoices</CaptionText>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <BodyText className="text-sm text-muted-foreground mb-1">Overdue</BodyText>
              <BodyText className="text-2xl font-bold text-red-600">
                ₹{formatNumber(overdueInvoices.reduce((sum, p) => sum + p.total, 0))}
              </BodyText>
              <CaptionText className="text-muted-foreground">{overdueInvoices.length} invoices</CaptionText>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <BodyText className="text-sm text-muted-foreground mb-1">Pending</BodyText>
              <BodyText className="text-2xl font-bold text-orange-600">
                ₹{formatNumber(pendingInvoices.reduce((sum, p) => sum + p.total, 0))}
              </BodyText>
              <CaptionText className="text-muted-foreground">{pendingInvoices.length} invoices</CaptionText>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Payment Management Section */}
      <ModernCard>
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <Heading3>Payment Management</Heading3>
              <CaptionText className="text-muted-foreground">Track and update payment status for your invoices</CaptionText>
            </div>
          </div>
        </div>
        
        {paymentData.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <BodyText className="text-muted-foreground text-lg mb-2">No invoices found</BodyText>
            <CaptionText className="text-muted-foreground">Create your first invoice to start tracking payments</CaptionText>
          </div>
        ) : (
          <>
            {/* Mobile Layout - Cards */}
            {isMobile ? (
              <div className="p-4 space-y-4">
                {paymentData.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            ) : (
              /* Desktop Layout - Table */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right w-[280px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentData.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status, payment.isOverdue)}
                            {getStatusBadge(payment.status, payment.isOverdue)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <BodyText className="font-medium">{payment.number}</BodyText>
                        </TableCell>
                        <TableCell>
                          <BodyText>{payment.clientName}</BodyText>
                        </TableCell>
                        <TableCell>
                          <CaptionText className={payment.isOverdue ? "text-red-600 font-medium" : ""}>
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </CaptionText>
                        </TableCell>
                        <TableCell className="text-right">
                          <BodyText className="font-semibold">₹{formatNumber(payment.total)}</BodyText>
                        </TableCell>
                        <TableCell className="text-right">
                          <BodyText className={payment.paidAmount > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                            ₹{formatNumber(payment.paidAmount)}
                          </BodyText>
                        </TableCell>
                        <TableCell className="text-right">
                          <BodyText className={payment.remainingAmount > 0 ? "font-medium" : "text-muted-foreground"}>
                            ₹{formatNumber(payment.remainingAmount)}
                          </BodyText>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status !== 'paid' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                className="w-24 h-9 text-sm"
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
                                className="h-9 px-3"
                              >
                                Update
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMarkAsPaid(payment.id)}
                                disabled={updatingPayments.has(payment.id)}
                                className="h-9 px-3"
                              >
                                Mark Paid
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </ModernCard>
    </div>
  );
};
