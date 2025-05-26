
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
  const [logoError, setLogoError] = useState<string | null>(null);

  // Fetch fresh company data to ensure we have the latest updates
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

  // Fetch company settings with fresh data
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

  // Use fresh company data if available, otherwise fall back to props
  const currentCompany = freshCompanyData || company;

  const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Use logo from company settings if available, otherwise fall back to company logo
  const logoUrl = companySettings?.logo_url || currentCompany?.logo_url;
  const logoScale = Number(companySettings?.logo_scale || 0.3);
  
  console.log('=== INVOICE PREVIEW DEBUG ===');
  console.log('Company ID:', currentCompany?.id);
  console.log('Fresh company data:', freshCompanyData);
  console.log('Company settings:', companySettings);
  console.log('Logo URL:', logoUrl);
  console.log('Logo scale:', logoScale);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-8 font-sans text-sm">
      {/* Header Section - Logo left, Company info right */}
      <div className="flex justify-between items-start mb-8">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          {logoUrl && (
            <div>
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="object-contain"
                style={{
                  width: `${64 * logoScale}px`,
                  height: `${64 * logoScale}px`
                }}
                onLoad={() => {
                  console.log('✅ Logo loaded successfully with scale:', logoScale);
                  setLogoError(null);
                }}
                onError={(e) => {
                  console.error('❌ Logo failed to load:', logoUrl);
                  setLogoError(`Failed to load: ${logoUrl}`);
                }}
                crossOrigin="anonymous"
              />
              {logoError && (
                <div className="text-xs text-red-500 mt-1">
                  {logoError}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Company info and invoice details on the right */}
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{currentCompany?.name || 'Square Blue Media'}</h2>
          {currentCompany?.address && (
            <p className="text-gray-600 text-xs mb-1">{currentCompany.address}</p>
          )}
          <p className="text-gray-600 text-xs mb-1">squarebluemedia@gmail.com</p>
          {currentCompany?.gstin && (
            <p className="text-gray-600 text-xs mb-3">GSTIN: {currentCompany.gstin}</p>
          )}
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoice</h1>
          <p className="text-xs text-gray-600 mb-1">H.NO. {invoice?.invoice_code || invoice?.number}</p>
          <p className="text-xs text-gray-600 mb-3">HYDERABAD TELANGANA 500038</p>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Invoice #</span>
              <span>{invoice?.invoice_code || invoice?.number}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium">Date</span>
              <span>{new Date(invoice?.issue_date).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium">SAC / HSN CODE</span>
              <span>998387</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-6">
        <p className="font-bold text-gray-600 text-xs mb-2 uppercase tracking-wide">Bill To</p>
        <h3 className="font-bold text-gray-800 mb-1">{client?.name || 'SURESH PRODUCTIONS PVT LTD'}</h3>
        {client?.billing_address && (
          <p className="text-gray-600 text-xs mb-1">{client.billing_address}</p>
        )}
        {client?.gstin && (
          <p className="text-gray-600 text-xs">GSTIN: {client.gstin}</p>
        )}
      </div>

      {/* Project Section */}
      <div className="mb-6">
        <p className="font-bold text-gray-600 text-xs mb-2 uppercase tracking-wide">Project</p>
        <p className="text-gray-800 text-sm">CHEEKATLO</p>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        {/* Table Header */}
        <div className="bg-gray-100 border border-gray-300 p-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wide">
            <div className="col-span-6">Equipment</div>
            <div className="col-span-2 text-center">PKG</div>
            <div className="col-span-2 text-center">Rate</div>
            <div className="col-span-2 text-center">Amount</div>
          </div>
        </div>

        {/* Table Body */}
        {lines?.map((line, i) => (
          <div key={i} className={`border-l border-r border-b border-gray-300 p-3 ${i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="grid grid-cols-12 gap-2 text-xs">
              <div className="col-span-6">{line.description}</div>
              <div className="col-span-2 text-center">{line.qty}</div>
              <div className="col-span-2 text-center">{currency(Number(line.unit_price))}</div>
              <div className="col-span-2 text-center">{currency(Number(line.amount))}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Instructions */}
      {companySettings?.payment_note && (
        <div className="mb-8">
          <p className="font-bold text-gray-800 mb-3 text-sm">Payment Instructions</p>
          <p className="text-xs text-gray-600">{companySettings.payment_note}</p>
        </div>
      )}

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-full sm:w-80">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>{currency(Number(invoice?.subtotal || 0))}</span>
            </div>
            
            {!invoice?.use_igst && Number(invoice?.cgst || 0) > 0 && (
              <div className="flex justify-between py-1">
                <span>CGST ({invoice?.cgst_pct || 9}%)</span>
                <span>{currency(Number(invoice.cgst))}</span>
              </div>
            )}
            
            {!invoice?.use_igst && Number(invoice?.sgst || 0) > 0 && (
              <div className="flex justify-between py-1">
                <span>SGST ({invoice?.sgst_pct || 9}%)</span>
                <span>{currency(Number(invoice.sgst))}</span>
              </div>
            )}
            
            {invoice?.use_igst && Number(invoice?.igst || 0) > 0 && (
              <div className="flex justify-between py-1">
                <span>IGST ({invoice?.igst_pct || 18}%)</span>
                <span>{currency(Number(invoice.igst))}</span>
              </div>
            )}
            
            <div className="flex justify-between py-1">
              <span>Total</span>
              <span>{currency(Number(invoice?.total || 0))}</span>
            </div>
            
            <div className="flex justify-between py-3 bg-gray-100 px-3 -mx-3 font-bold text-base">
              <span>GRAND TOTAL</span>
              <span>{currency(Number(invoice?.total || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <p className="text-sm mb-2">Thank you for your business!</p>
        <p className="text-sm font-bold">{currentCompany?.name || 'Square Blue Media'}</p>
        
        {/* Signature Section */}
        {invoice?.show_my_signature && (
          <div className="mt-8">
            {companySettings?.signature_url && (
              <img src={companySettings.signature_url} alt="Signature" className="w-24 h-12 object-contain mb-2" />
            )}
            <div className="border-t border-gray-800 w-32 mb-2"></div>
            <p className="text-xs text-gray-600">{new Date(invoice.issue_date).toLocaleDateString('en-GB')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
