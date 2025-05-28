
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PAGE, FONTS } from '@/lib/pdf/layout';
import { InvoiceHeader } from './InvoicePdfPreview/InvoiceHeader';
import { InvoiceBillBar } from './InvoicePdfPreview/InvoiceBillBar';
import { InvoiceItemsTable } from './InvoicePdfPreview/InvoiceItemsTable';
import { InvoiceTotalsSection } from './InvoicePdfPreview/InvoiceTotalsSection';
import { InvoiceFooter } from './InvoicePdfPreview/InvoiceFooter';

interface InvoicePdfPreviewProps {
  invoice: any;
  company: any;
  client: any;
  lines: any[];
}

export const InvoicePdfPreview: React.FC<InvoicePdfPreviewProps> = ({ 
  invoice, 
  company, 
  client, 
  lines 
}) => {
  // Fetch fresh company data
  const { data: freshCompanyData } = useQuery({
    queryKey: ['companies', company?.id],
    queryFn: async () => {
      if (!company?.id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  // Fetch company settings
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings', company?.id],
    queryFn: async () => {
      if (!company?.id) return null;
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const currentCompany = freshCompanyData || company;

  return (
    <div 
      className="w-full mx-auto bg-white font-sans relative"
      style={{
        width: `${PAGE.width}px`,
        minHeight: `${PAGE.height}px`,
        padding: `${PAGE.margin}px`,
        maxWidth: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        fontSize: `${FONTS.base}px`,
        fontFamily: 'Helvetica, Arial, sans-serif',
        border: '1px solid #eee'
      }}
    >
      <InvoiceHeader 
        company={currentCompany} 
        companySettings={companySettings} 
      />
      
      <InvoiceBillBar 
        client={client} 
        invoice={invoice} 
        companySettings={companySettings} 
      />
      
      <InvoiceItemsTable lines={lines} />
      
      <InvoiceTotalsSection 
        invoice={invoice} 
        companySettings={companySettings} 
      />
      
      <InvoiceFooter 
        invoice={invoice} 
        company={currentCompany} 
        companySettings={companySettings} 
      />
    </div>
  );
};
