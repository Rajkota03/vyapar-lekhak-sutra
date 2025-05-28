
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  PAGE, 
  BANDS, 
  TABLE, 
  FONTS, 
  COLORS, 
  SIGNATURE, 
  SPACING, 
  getBandPositions 
} from '@/lib/pdf/layout';

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
  const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const logoUrl = companySettings?.logo_url || currentCompany?.logo_url;
  const logoScale = Math.min(Number(companySettings?.logo_scale || 0.25), 1.0);
  const maxLogoSize = BANDS.header - 20;

  // Convert RGB array to CSS color
  const rgbToCSS = (rgb: number[]) => `rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`;
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get band positions
  const positions = getBandPositions();

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
      {/* Header Band */}
      <div 
        className="absolute"
        style={{
          top: `${PAGE.height - PAGE.margin - BANDS.header}px`,
          left: `${PAGE.margin}px`,
          right: `${PAGE.margin}px`,
          height: `${BANDS.header}px`,
        }}
      >
        <div className="flex justify-between items-start h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="object-contain"
                style={{
                  maxWidth: `${maxLogoSize * logoScale}px`,
                  maxHeight: `${maxLogoSize}px`,
                  width: 'auto',
                  height: 'auto'
                }}
                onLoad={() => setLogoError(null)}
                onError={() => setLogoError(`Failed to load: ${logoUrl}`)}
                crossOrigin="anonymous"
              />
            )}
            {logoError && (
              <div className="text-xs text-red-500 mt-1">{logoError}</div>
            )}
          </div>
          
          {/* Company info */}
          <div className="text-right" style={{ width: '200px' }}>
            <h1 
              className="font-bold mb-2"
              style={{
                fontSize: `${FONTS.h1}px`,
                color: rgbToCSS(COLORS.text.primary)
              }}
            >
              Invoice
            </h1>
            
            <h2 
              className="font-bold mb-1"
              style={{
                fontSize: `${FONTS.h2}px`,
                color: rgbToCSS(COLORS.text.primary)
              }}
            >
              {currentCompany?.name || 'Square Blue Media'}
            </h2>
            
            <div style={{ fontSize: `${FONTS.base}px`, color: rgbToCSS(COLORS.text.secondary) }}>
              <p className="mb-1">H.NO. 8-3-224/11C/17.E-96,</p>
              <p className="mb-1">MADHURA NAGAR,</p>
              <p className="mb-1">HYDERABAD TELANGANA 500038</p>
              <p className="mb-1">squarebluemedia@gmail.com</p>
              <p>GSTIN : {currentCompany?.gstin || '36FDBPK8518L1Z4'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Bar Band */}
      <div 
        className="absolute"
        style={{
          top: `${positions.topOfBill}px`,
          left: `${PAGE.margin}px`,
          right: `${PAGE.margin}px`,
          height: `${BANDS.bill}px`,
          backgroundColor: rgbToCSS(COLORS.background.light),
          padding: '20px'
        }}
      >
        <div className="flex justify-between h-full">
          <div>
            <p 
              className="font-bold uppercase tracking-wide mb-2"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.muted)
              }}
            >
              BILL TO
            </p>
            
            <h3 
              className="font-bold mb-1"
              style={{
                fontSize: `${FONTS.medium}px`,
                color: rgbToCSS(COLORS.text.primary)
              }}
            >
              {client?.name || 'SURESH PRODUCTIONS PVT LTD'}
            </h3>
            
            <div style={{ fontSize: `${FONTS.base}px`, color: rgbToCSS(COLORS.text.secondary) }}>
              <p className="mb-1">C/O RAMANAIDU STUDIOS, FILM NAGAR</p>
              <p className="mb-2">HYDERABAD TELANGANA 500096</p>
              <p>GSTIN : {client?.gstin || '36AADCS0841F1ZN'}</p>
            </div>
          </div>
          
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold mr-4" style={{ fontSize: `${FONTS.base}px` }}>Invoice #</span>
                <span style={{ fontSize: `${FONTS.base}px` }}>
                  {invoice?.invoice_code || invoice?.number || '25-26/02'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-bold mr-4" style={{ fontSize: `${FONTS.base}px` }}>Date</span>
                <span style={{ fontSize: `${FONTS.base}px` }}>
                  {formatDate(invoice?.issue_date) || '23 Apr 2025'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-bold mr-4" style={{ fontSize: `${FONTS.base}px` }}>SAC/HSN CODE</span>
                <span style={{ fontSize: `${FONTS.base}px` }}>
                  {companySettings?.sac_hsn || '998387'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div 
        className="absolute"
        style={{
          top: `${positions.topOfBill - 14}px`,
          left: `${PAGE.margin}px`,
          right: `${PAGE.margin}px`,
          bottom: `${positions.bottomOfTable}px`,
          overflow: 'hidden'
        }}
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 font-bold uppercase tracking-wide pb-2 border-b border-gray-300">
          <div className="col-span-6" style={{ color: rgbToCSS(COLORS.text.primary) }}>EQUIPMENT</div>
          <div className="col-span-1 text-center" style={{ color: rgbToCSS(COLORS.text.primary) }}>PKG</div>
          <div className="col-span-2 text-right" style={{ color: rgbToCSS(COLORS.text.primary) }}>Rate</div>
          <div className="col-span-3 text-right" style={{ color: rgbToCSS(COLORS.text.primary) }}>Amount</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: `${positions.topOfBill - 34 - positions.bottomOfTable}px`, overflow: 'hidden' }}>
          {lines?.map((line, i) => (
            <div key={i} className="border-b border-gray-200 py-2">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <div className="font-medium" style={{ color: rgbToCSS(COLORS.text.primary) }}>
                    {line.description}
                  </div>
                  {line.description.includes('ALEXA') && (
                    <div 
                      className="text-xs mt-1"
                      style={{ color: rgbToCSS(COLORS.text.muted) }}
                    >
                      Dates : 17/04/25,19/04/25, 22/04/25
                    </div>
                  )}
                </div>
                <div className="col-span-1 text-center">{line.qty}</div>
                <div className="col-span-2 text-right">{currency(Number(line.unit_price))}</div>
                <div className="col-span-3 text-right">{currency(Number(line.amount))}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Band */}
      <div 
        className="absolute"
        style={{
          bottom: `${PAGE.margin + BANDS.footer}px`,
          left: `${PAGE.margin}px`,
          right: `${PAGE.margin}px`,
          height: `${BANDS.totals}px`,
        }}
      >
        <div className="grid grid-cols-2 gap-8 h-full">
          {/* Payment Instructions */}
          <div>
            <p 
              className="font-bold mb-3"
              style={{
                fontSize: `${FONTS.medium}px`,
                color: rgbToCSS(COLORS.text.primary)
              }}
            >
              Payment Instructions
            </p>
            
            <p 
              style={{
                fontSize: `${FONTS.small}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              {companySettings?.payment_note || 
                `SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,
                BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,
                PAN NO.FDBPK8518L`}
            </p>
          </div>

          {/* Totals */}
          <div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span style={{ color: rgbToCSS(COLORS.text.primary) }}>Subtotal</span>
                <span style={{ color: rgbToCSS(COLORS.text.primary) }}>{currency(Number(invoice?.subtotal || 214500))}</span>
              </div>
              
              {(!invoice?.use_igst && Number(invoice?.cgst_pct || 9) > 0) && (
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span style={{ color: rgbToCSS(COLORS.text.primary) }}>CGST ({invoice?.cgst_pct || 9}%)</span>
                  <span style={{ color: rgbToCSS(COLORS.text.primary) }}>{currency(Number(invoice?.cgst || 19305))}</span>
                </div>
              )}
              
              {(!invoice?.use_igst && Number(invoice?.sgst_pct || 9) > 0) && (
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span style={{ color: rgbToCSS(COLORS.text.primary) }}>SGST ({invoice?.sgst_pct || 9}%)</span>
                  <span style={{ color: rgbToCSS(COLORS.text.primary) }}>{currency(Number(invoice?.sgst || 19305))}</span>
                </div>
              )}
              
              {(invoice?.use_igst && Number(invoice?.igst_pct || 18) > 0) && (
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span style={{ color: rgbToCSS(COLORS.text.primary) }}>IGST ({invoice?.igst_pct || 18}%)</span>
                  <span style={{ color: rgbToCSS(COLORS.text.primary) }}>{currency(Number(invoice?.igst || 38610))}</span>
                </div>
              )}
              
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span style={{ color: rgbToCSS(COLORS.text.primary) }}>Total</span>
                <span style={{ color: rgbToCSS(COLORS.text.primary) }}>{currency(Number(invoice?.total || 253110))}</span>
              </div>
              
              <div 
                className="flex justify-between py-3 px-3 font-bold"
                style={{
                  backgroundColor: rgbToCSS(COLORS.background.light),
                  fontSize: `${FONTS.large}px`,
                  color: rgbToCSS(COLORS.text.primary)
                }}
              >
                <span>GRAND TOTAL</span>
                <span>{currency(Number(invoice?.total || 253110))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Band */}
      <div 
        className="absolute"
        style={{
          bottom: `${PAGE.margin}px`,
          left: `${PAGE.margin}px`,
          right: `${PAGE.margin}px`,
          height: `${BANDS.footer}px`,
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}
      >
        <p 
          className="mb-2"
          style={{
            fontSize: `${FONTS.base}px`,
            color: rgbToCSS(COLORS.text.primary)
          }}
        >
          Thank you for your business!
        </p>
        
        <p 
          className="font-bold mb-4"
          style={{
            fontSize: `${FONTS.base}px`,
            color: rgbToCSS(COLORS.text.primary)
          }}
        >
          {currentCompany?.name || 'Square Blue Media'}
        </p>
        
        {/* Signature Section */}
        {invoice?.show_my_signature && (
          <div>
            {companySettings?.signature_url && (
              <img 
                src={companySettings.signature_url} 
                alt="Signature" 
                style={{
                  width: `${SIGNATURE.width}px`,
                  height: `${SIGNATURE.height}px`,
                  objectFit: 'contain',
                  marginBottom: '8px'
                }} 
              />
            )}
            
            <div 
              style={{
                borderTop: `1px solid ${rgbToCSS(COLORS.text.primary)}`,
                width: `${SIGNATURE.lineWidth}px`,
                marginBottom: '8px'
              }}
            ></div>
            
            <p 
              style={{
                fontSize: `${FONTS.small}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              {formatDate(invoice?.issue_date) || '23 Apr 2025'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
