
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    invoiceCount: number;
  }>;
  outstandingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  avgInvoiceValue: number;
  topClients: Array<{
    name: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
  cashFlow: Array<{
    month: string;
    paid: number;
    outstanding: number;
  }>;
  taxBreakdown: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  quarterlyTax: Array<{
    quarter: string;
    totalTax: number;
  }>;
}

export const useAnalytics = (companyId?: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch basic invoice data
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select(`
            *,
            clients(name)
          `)
          .eq('company_id', companyId);

        if (invoicesError) throw invoicesError;

        if (!invoices) {
          setAnalytics({
            totalRevenue: 0,
            monthlyRevenue: [],
            outstandingAmount: 0,
            overdueAmount: 0,
            totalInvoices: 0,
            paidInvoices: 0,
            avgInvoiceValue: 0,
            topClients: [],
            cashFlow: [],
            taxBreakdown: { cgst: 0, sgst: 0, igst: 0 },
            quarterlyTax: []
          });
          return;
        }

        // Calculate metrics
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0);
        const outstandingAmount = invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.total : 0), 0);
        const overdueAmount = invoices.reduce((sum, inv) => {
          const isOverdue = new Date(inv.due_date) < new Date() && inv.status !== 'paid';
          return sum + (isOverdue ? inv.total : 0);
        }, 0);
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
        const avgInvoiceValue = invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0;

        // Monthly revenue
        const monthlyData = new Map();
        invoices.forEach(inv => {
          const month = new Date(inv.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { revenue: 0, invoiceCount: 0 });
          }
          const data = monthlyData.get(month);
          if (inv.status === 'paid') {
            data.revenue += inv.total;
          }
          data.invoiceCount += 1;
        });

        const monthlyRevenue = Array.from(monthlyData.entries()).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          invoiceCount: data.invoiceCount
        }));

        // Top clients
        const clientData = new Map();
        invoices.forEach(inv => {
          const clientName = inv.clients?.name || 'Unknown Client';
          if (!clientData.has(clientName)) {
            clientData.set(clientName, { totalAmount: 0, invoiceCount: 0 });
          }
          const data = clientData.get(clientName);
          data.totalAmount += inv.total;
          data.invoiceCount += 1;
        });

        const topClients = Array.from(clientData.entries())
          .map(([name, data]) => ({
            name,
            totalAmount: data.totalAmount,
            invoiceCount: data.invoiceCount
          }))
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5);

        // Cash flow data
        const cashFlowData = new Map();
        invoices.forEach(inv => {
          const month = new Date(inv.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!cashFlowData.has(month)) {
            cashFlowData.set(month, { paid: 0, outstanding: 0 });
          }
          const data = cashFlowData.get(month);
          if (inv.status === 'paid') {
            data.paid += inv.total;
          } else {
            data.outstanding += inv.total;
          }
        });

        const cashFlow = Array.from(cashFlowData.entries()).map(([month, data]) => ({
          month,
          paid: data.paid,
          outstanding: data.outstanding
        }));

        // Tax breakdown
        const taxBreakdown = invoices.reduce((acc, inv) => ({
          cgst: acc.cgst + (inv.cgst || 0),
          sgst: acc.sgst + (inv.sgst || 0),
          igst: acc.igst + (inv.igst || 0)
        }), { cgst: 0, sgst: 0, igst: 0 });

        // Quarterly tax
        const quarterlyData = new Map();
        invoices.forEach(inv => {
          const date = new Date(inv.issue_date);
          const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
          if (!quarterlyData.has(quarter)) {
            quarterlyData.set(quarter, 0);
          }
          quarterlyData.set(quarter, quarterlyData.get(quarter) + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0));
        });

        const quarterlyTax = Array.from(quarterlyData.entries()).map(([quarter, totalTax]) => ({
          quarter,
          totalTax
        }));

        setAnalytics({
          totalRevenue,
          monthlyRevenue,
          outstandingAmount,
          overdueAmount,
          totalInvoices: invoices.length,
          paidInvoices,
          avgInvoiceValue,
          topClients,
          cashFlow,
          taxBreakdown,
          quarterlyTax
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [companyId]);

  return { analytics, loading, error };
};
