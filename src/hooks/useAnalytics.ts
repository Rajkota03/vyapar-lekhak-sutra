
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
    documentType: 'invoice' | 'proforma';
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

// Helper function to determine document type based on number prefix
const getDocumentType = (number: string): 'invoice' | 'proforma' | 'quotation' | 'credit' => {
  if (number.startsWith('PF-')) return 'proforma';
  if (number.startsWith('QUO-')) return 'quotation';
  if (number.startsWith('CR-')) return 'credit';
  return 'invoice';
};

// Helper function to check if document should be included in payment tracking
const isPaymentRelevant = (documentType: 'invoice' | 'proforma' | 'quotation' | 'credit'): boolean => {
  return documentType === 'invoice' || documentType === 'proforma';
};

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

        // Fetch all document data with date filtering
        const { data: allDocuments, error: documentsError } = await supabase
          .from('invoices')
          .select(`
            *,
            clients(name)
          `)
          .eq('company_id', companyId);

        if (documentsError) throw documentsError;

        if (!allDocuments) {
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
        let filteredDocuments = allDocuments;
        if (filters) {
          filteredDocuments = allDocuments.filter(doc => {
            const issueDate = new Date(doc.issue_date);
            
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

        // Separate documents by type
        const invoicesAndProformas = filteredDocuments.filter(doc => {
          const docType = getDocumentType(doc.number);
          return isPaymentRelevant(docType);
        });

        const quotations = filteredDocuments.filter(doc => getDocumentType(doc.number) === 'quotation');
        const creditNotes = filteredDocuments.filter(doc => getDocumentType(doc.number) === 'credit');

        // Calculate metrics using only payment-relevant documents (invoices and proformas)
        const totalRevenue = invoicesAndProformas.reduce((sum, doc) => sum + (doc.paid_amount || 0), 0);
        const outstandingAmount = invoicesAndProformas.reduce((sum, doc) => sum + (doc.total - (doc.paid_amount || 0)), 0);
        const overdueAmount = invoicesAndProformas.reduce((sum, doc) => {
          const isOverdue = new Date(doc.due_date) < new Date() && doc.status !== 'paid';
          return sum + (isOverdue ? (doc.total - (doc.paid_amount || 0)) : 0);
        }, 0);
        const paidInvoices = invoicesAndProformas.filter(doc => doc.status === 'paid').length;
        const avgInvoiceValue = invoicesAndProformas.length > 0 ? invoicesAndProformas.reduce((sum, doc) => sum + doc.total, 0) / invoicesAndProformas.length : 0;

        // Payment tracking data with document type classification - only payment-relevant documents
        const paymentTracking = invoicesAndProformas.map(doc => {
          const docType = getDocumentType(doc.number);
          return {
            id: doc.id,
            number: doc.number,
            clientName: doc.clients?.name || 'Unknown Client',
            total: doc.total,
            paidAmount: doc.paid_amount || 0,
            remainingAmount: doc.total - (doc.paid_amount || 0),
            status: doc.status,
            dueDate: doc.due_date,
            isOverdue: new Date(doc.due_date) < new Date() && doc.status !== 'paid',
            documentType: docType as 'invoice' | 'proforma'
          };
        });

        // Monthly revenue using actual paid amounts from payment-relevant documents only
        const monthlyData = new Map();
        invoicesAndProformas.forEach(doc => {
          const month = new Date(doc.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { revenue: 0, invoiceCount: 0 });
          }
          const data = monthlyData.get(month);
          data.revenue += doc.paid_amount || 0;
          data.invoiceCount += 1;
        });

        const monthlyRevenue = Array.from(monthlyData.entries()).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          invoiceCount: data.invoiceCount
        }));

        // Monthly tax breakdown - use all documents for tax calculations
        const monthlyTaxData = new Map();
        filteredDocuments.forEach(doc => {
          const month = new Date(doc.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyTaxData.has(month)) {
            monthlyTaxData.set(month, { cgst: 0, sgst: 0, igst: 0 });
          }
          const data = monthlyTaxData.get(month);
          data.cgst += doc.cgst || 0;
          data.sgst += doc.sgst || 0;
          data.igst += doc.igst || 0;
        });

        const monthlyTaxBreakdown = Array.from(monthlyTaxData.entries()).map(([month, data]) => ({
          month,
          cgst: data.cgst,
          sgst: data.sgst,
          igst: data.igst,
          totalTax: data.cgst + data.sgst + data.igst
        }));

        // Top clients - use payment-relevant documents only
        const clientData = new Map();
        invoicesAndProformas.forEach(doc => {
          const clientName = doc.clients?.name || 'Unknown Client';
          if (!clientData.has(clientName)) {
            clientData.set(clientName, { totalAmount: 0, invoiceCount: 0 });
          }
          const data = clientData.get(clientName);
          data.totalAmount += doc.total;
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

        // Cash flow data using payment-relevant documents only
        const cashFlowData = new Map();
        invoicesAndProformas.forEach(doc => {
          const month = new Date(doc.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!cashFlowData.has(month)) {
            cashFlowData.set(month, { paid: 0, outstanding: 0 });
          }
          const data = cashFlowData.get(month);
          data.paid += doc.paid_amount || 0;
          data.outstanding += doc.total - (doc.paid_amount || 0);
        });

        const cashFlow = Array.from(cashFlowData.entries()).map(([month, data]) => ({
          month,
          paid: data.paid,
          outstanding: data.outstanding
        }));

        // Tax breakdown - use all documents
        const taxBreakdown = filteredDocuments.reduce((acc, doc) => ({
          cgst: acc.cgst + (doc.cgst || 0),
          sgst: acc.sgst + (doc.sgst || 0),
          igst: acc.igst + (doc.igst || 0)
        }), { cgst: 0, sgst: 0, igst: 0 });

        // Quarterly tax - use all documents
        const quarterlyData = new Map();
        filteredDocuments.forEach(doc => {
          const date = new Date(doc.issue_date);
          const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
          if (!quarterlyData.has(quarter)) {
            quarterlyData.set(quarter, 0);
          }
          quarterlyData.set(quarter, quarterlyData.get(quarter) + (doc.cgst || 0) + (doc.sgst || 0) + (doc.igst || 0));
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
          totalInvoices: invoicesAndProformas.length,
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
