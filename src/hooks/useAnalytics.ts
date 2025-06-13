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
  paymentTracking: Array<{
    id: string;
    number: string;
    clientName: string;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: string;
    isOverdue: boolean;
  }>;
  monthlyTaxBreakdown: Array<{
    month: string;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  }>;
}

export type FilterPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface AnalyticsFilters {
  period: FilterPeriod;
  startDate?: Date;
  endDate?: Date;
  selectedMonth?: string;
  selectedQuarter?: string;
  selectedYear?: number;
}

export const useAnalytics = (companyId?: string, filters?: AnalyticsFilters) => {
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

        // Fetch basic invoice data with date filtering
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
            quarterlyTax: [],
            paymentTracking: [],
            monthlyTaxBreakdown: []
          });
          return;
        }

        // Apply client-side filtering if needed
        let filteredInvoices = invoices;
        if (filters) {
          filteredInvoices = invoices.filter(inv => {
            const issueDate = new Date(inv.issue_date);
            
            if (filters.period === 'custom' && filters.startDate && filters.endDate) {
              return issueDate >= filters.startDate && issueDate <= filters.endDate;
            } else if (filters.period === 'yearly' && filters.selectedYear) {
              return issueDate.getFullYear() === filters.selectedYear;
            } else if (filters.period === 'quarterly' && filters.selectedQuarter) {
              const [quarter, year] = filters.selectedQuarter.split(' ');
              const quarterNum = parseInt(quarter.replace('Q', ''));
              const startMonth = (quarterNum - 1) * 3;
              const endMonth = quarterNum * 3 - 1;
              return issueDate.getFullYear() === parseInt(year) && 
                     issueDate.getMonth() >= startMonth && 
                     issueDate.getMonth() <= endMonth;
            } else if (filters.period === 'monthly' && filters.selectedMonth) {
              const [monthName, year] = filters.selectedMonth.split(' ');
              const monthNum = new Date(`${monthName} 1, ${year}`).getMonth();
              return issueDate.getFullYear() === parseInt(year) && 
                     issueDate.getMonth() === monthNum;
            }
            return true;
          });
        }

        // Calculate metrics using the new paid_amount column
        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
        const outstandingAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total - (inv.paid_amount || 0)), 0);
        const overdueAmount = filteredInvoices.reduce((sum, inv) => {
          const isOverdue = new Date(inv.due_date) < new Date() && inv.status !== 'paid';
          return sum + (isOverdue ? (inv.total - (inv.paid_amount || 0)) : 0);
        }, 0);
        const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid').length;
        const avgInvoiceValue = filteredInvoices.length > 0 ? filteredInvoices.reduce((sum, inv) => sum + inv.total, 0) / filteredInvoices.length : 0;

        // Payment tracking data with accurate paid amounts
        const paymentTracking = filteredInvoices.map(inv => ({
          id: inv.id,
          number: inv.number,
          clientName: inv.clients?.name || 'Unknown Client',
          total: inv.total,
          paidAmount: inv.paid_amount || 0,
          remainingAmount: inv.total - (inv.paid_amount || 0),
          status: inv.status,
          dueDate: inv.due_date,
          isOverdue: new Date(inv.due_date) < new Date() && inv.status !== 'paid'
        }));

        // Monthly revenue using actual paid amounts
        const monthlyData = new Map();
        filteredInvoices.forEach(inv => {
          const month = new Date(inv.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { revenue: 0, invoiceCount: 0 });
          }
          const data = monthlyData.get(month);
          data.revenue += inv.paid_amount || 0;
          data.invoiceCount += 1;
        });

        const monthlyRevenue = Array.from(monthlyData.entries()).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          invoiceCount: data.invoiceCount
        }));

        // Monthly tax breakdown
        const monthlyTaxData = new Map();
        filteredInvoices.forEach(inv => {
          const month = new Date(inv.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyTaxData.has(month)) {
            monthlyTaxData.set(month, { cgst: 0, sgst: 0, igst: 0 });
          }
          const data = monthlyTaxData.get(month);
          data.cgst += inv.cgst || 0;
          data.sgst += inv.sgst || 0;
          data.igst += inv.igst || 0;
        });

        const monthlyTaxBreakdown = Array.from(monthlyTaxData.entries()).map(([month, data]) => ({
          month,
          cgst: data.cgst,
          sgst: data.sgst,
          igst: data.igst,
          totalTax: data.cgst + data.sgst + data.igst
        }));

        // Top clients
        const clientData = new Map();
        filteredInvoices.forEach(inv => {
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

        // Cash flow data using actual paid amounts
        const cashFlowData = new Map();
        filteredInvoices.forEach(inv => {
          const month = new Date(inv.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!cashFlowData.has(month)) {
            cashFlowData.set(month, { paid: 0, outstanding: 0 });
          }
          const data = cashFlowData.get(month);
          data.paid += inv.paid_amount || 0;
          data.outstanding += inv.total - (inv.paid_amount || 0);
        });

        const cashFlow = Array.from(cashFlowData.entries()).map(([month, data]) => ({
          month,
          paid: data.paid,
          outstanding: data.outstanding
        }));

        // Tax breakdown
        const taxBreakdown = filteredInvoices.reduce((acc, inv) => ({
          cgst: acc.cgst + (inv.cgst || 0),
          sgst: acc.sgst + (inv.sgst || 0),
          igst: acc.igst + (inv.igst || 0)
        }), { cgst: 0, sgst: 0, igst: 0 });

        // Quarterly tax
        const quarterlyData = new Map();
        filteredInvoices.forEach(inv => {
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
          totalInvoices: filteredInvoices.length,
          paidInvoices,
          avgInvoiceValue,
          topClients,
          cashFlow,
          taxBreakdown,
          quarterlyTax,
          paymentTracking,
          monthlyTaxBreakdown
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [companyId, filters]);

  return { analytics, loading, error };
};
