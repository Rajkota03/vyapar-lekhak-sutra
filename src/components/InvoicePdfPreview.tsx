
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!company?.id) return;
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();
      
      if (!error && data) {
        setCompanySettings(data);
      }
    };

    fetchCompanySettings();
  }, [company?.id]);

  const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Use logo from company settings if available, otherwise fall back to company logo
  const logoUrl = companySettings?.logo_url || company?.logo_url;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-8 font-sans text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex-1">
          {logoUrl && (
            <img src={logoUrl} alt="Company Logo" className="w-20 h-15 mb-4 object-contain" />
          )}
          <h2 className="text-xl font-bold text-gray-800 mb-2">{company?.name || 'Company Name'}</h2>
          {company?.address && (
            <p className="text-gray-600 text-xs mb-1">{company.address}</p>
          )}
          {company?.gstin && (
            <p className="text-gray-600 text-xs">GSTIN: {company.gstin}</p>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h1>
          <p className="text-sm mb-1">Invoice # {invoice?.invoice_code || invoice?.number}</p>
          <p className="text-sm mb-1">Date: {new Date(invoice?.issue_date).toLocaleDateString('en-IN')}</p>
          {invoice?.due_date && (
            <p className="text-sm text-gray-600">Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>
          )}
        </div>
      </div>

      {/* Bill To Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="font-bold text-gray-800 mb-3">Bill To:</p>
        <h3 className="font-bold text-gray-800 mb-2">{client?.name || 'Client Name'}</h3>
        {client?.billing_address && (
          <p className="text-gray-600 text-sm mb-1">{client.billing_address}</p>
        )}
        {client?.phone && (
          <p className="text-gray-600 text-sm mb-1">Phone: {client.phone}</p>
        )}
        {client?.email && (
          <p className="text-gray-600 text-sm mb-1">Email: {client.email}</p>
        )}
        {client?.gstin && (
          <p className="text-gray-600 text-sm">GSTIN: {client.gstin}</p>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-6">
        {/* Table Header */}
        <div className="bg-gray-100 border border-gray-300 p-3 font-bold">
          <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm">
            <div className="col-span-6">Item Description</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
        </div>

        {/* Table Body */}
        {lines?.map((line, i) => (
          <div key={i} className="border-l border-r border-b border-gray-300 p-3">
            <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm">
              <div className="col-span-6">{line.description}</div>
              <div className="col-span-2 text-right">{currency(Number(line.unit_price))}</div>
              <div className="col-span-2 text-center">{line.qty}</div>
              <div className="col-span-2 text-right">{currency(Number(line.amount))}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-full sm:w-64">
          <div className="space-y-2">
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
            
            <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
              <span>Grand Total</span>
              <span>{currency(Number(invoice?.total || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      {companySettings?.payment_note && (
        <div className="mb-8">
          <p className="font-bold text-gray-800 mb-3">Payment Terms:</p>
          <p className="text-sm text-gray-600">{companySettings.payment_note}</p>
        </div>
      )}

      {/* Signature Section */}
      {(invoice?.show_my_signature || invoice?.require_client_signature) && (
        <div className="flex flex-col sm:flex-row justify-between gap-8 mt-12">
          {invoice?.show_my_signature && (
            <div className="flex-1">
              <p className="text-sm mb-8">Authorized Signature:</p>
              {companySettings?.signature_url && (
                <img src={companySettings.signature_url} alt="Signature" className="w-32 h-12 object-contain mb-2" />
              )}
              <div className="border-t border-gray-800 w-40"></div>
            </div>
          )}
          
          {invoice?.require_client_signature && (
            <div className="flex-1">
              <p className="text-sm mb-8">Client Signature:</p>
              <div className="border-t border-gray-800 w-40 mt-12"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
