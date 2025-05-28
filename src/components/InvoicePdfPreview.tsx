import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  PAGE, 
  COMPANY_BLOCK, 
  BILL_BAR, 
  TABLE, 
  FONTS, 
  COLORS, 
  SIGNATURE, 
  SPACING, 
  POSITIONS 
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
  const logoScale = Number(companySettings?.logo_scale || COMPANY_BLOCK.logoScale);

  // Convert RGB array from layout constants to CSS color
  const rgbToCSS = (rgb: number[]) => `rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`;
  
  // Convert 0-1 scale gray to CSS color
  const grayToCSS = (value: number) => `rgb(${value * 255}, ${value * 255}, ${value * 255})`;

  // Format date in DD MMM YYYY format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div 
      className="w-full mx-auto bg-white font-sans"
      style={{
        width: `${PAGE.width}px`,
        minHeight: `${PAGE.height}px`,
        padding: `${PAGE.margin}px`,
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative',
        boxSizing: 'border-box',
        fontSize: `${FONTS.base}px`,
        fontFamily: 'Helvetica, Arial, sans-serif',
        border: '1px solid #eee'
      }}
    >
      {/* Header Section */}
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
                  width: `${COMPANY_BLOCK.logoMax * logoScale}px`,
                  maxHeight: `${COMPANY_BLOCK.logoMax * logoScale}px`
                }}
                onLoad={() => {
                  setLogoError(null);
                }}
                onError={(e) => {
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
        <div 
          className="text-right"
          style={{
            width: `${COMPANY_BLOCK.rightColumnWidth}px`
          }}
        >
          <h1 
            className="font-bold text-gray-800 mb-2"
            style={{
              fontSize: `${FONTS.h1}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            Invoice
          </h1>
          
          <h2 
            className="font-bold text-gray-800 mb-1"
            style={{
              fontSize: `${FONTS.h2}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            {currentCompany?.name || 'Square Blue Media'}
          </h2>
          
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            H.NO. 8-3-224/11C/17.E-96,
          </p>
          
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            MADHURA NAGAR,
          </p>
          
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            HYDERABAD TELANGANA 500038
          </p>
          
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            squarebluemedia@gmail.com
          </p>
          
          <p 
            className="text-gray-600 mb-3"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            GSTIN : {currentCompany?.gstin || '36FDBPK8518L1Z4'}
          </p>
        </div>
      </div>

      {/* Bill To Section with gray background */}
      <div 
        style={{
          backgroundColor: grayToCSS(BILL_BAR.bgGray),
          padding: `${BILL_BAR.padding}px`,
          marginBottom: `${SPACING.section}px`,
          position: 'relative',
          minHeight: `${BILL_BAR.height}px`
        }}
      >
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p 
              className="font-bold text-gray-600 mb-2 uppercase tracking-wide"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.muted)
              }}
            >
              BILL TO
            </p>
            
            <h3 
              className="font-bold text-gray-800 mb-1"
              style={{
                fontSize: `${FONTS.medium}px`,
                color: rgbToCSS(COLORS.text.primary)
              }}
            >
              {client?.name || 'SURESH PRODUCTIONS PVT LTD'}
            </h3>
            
            <p 
              className="text-gray-600 mb-1"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              C/O RAMANAIDU STUDIOS, FILM NAGAR
            </p>
            
            <p 
              className="text-gray-600 mb-1"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              HYDERABAD TELANGANA 500096
            </p>
            
            <p 
              className="text-gray-600 mb-4"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              GSTIN : {client?.gstin || '36AADCS0841F1ZN'}
            </p>
            
            <p 
              className="font-bold text-gray-600 mb-2 uppercase tracking-wide"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.muted)
              }}
            >
              PROJECT
            </p>
            
            <p 
              className="text-gray-800"
              style={{
                fontSize: `${FONTS.medium}px`,
                color: rgbToCSS(COLORS.text.primary)
              }}
            >
              CHEEKATLO
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span 
                  className="font-bold mr-4"
                  style={{
                    fontSize: `${FONTS.base}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  Invoice #
                </span>
                <span
                  style={{
                    fontSize: `${FONTS.base}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  {invoice?.invoice_code || invoice?.number || '25-26/02'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span 
                  className="font-bold mr-4"
                  style={{
                    fontSize: `${FONTS.base}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  Date
                </span>
                <span
                  style={{
                    fontSize: `${FONTS.base}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  {formatDate(invoice?.issue_date) || '23 Apr 2025'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span 
                  className="font-bold mr-4"
                  style={{
                    fontSize: `${FONTS.base}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  SAC / HSN CODE
                </span>
                <span
                  style={{
                    fontSize: `${FONTS.base}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  {companySettings?.sac_hsn || '998387'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div 
        className="mb-6"
        style={{
          marginBottom: `${SPACING.section}px`
        }}
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 font-bold uppercase tracking-wide w-full border-b border-gray-300 pb-2">
          <div 
            className="col-span-6"
            style={{
              paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            EQUIPMENT
          </div>
          <div 
            className="col-span-2 text-center"
            style={{
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            PKG
          </div>
          <div 
            className="col-span-2 text-right"
            style={{
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            Rate
          </div>
          <div 
            className="col-span-2 text-right"
            style={{
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            Amount
          </div>
        </div>

        {/* Table Body */}
        {lines?.map((line, i) => (
          <div key={i} className="border-b border-gray-200 py-3">
            <div className="grid grid-cols-12 gap-2 w-full">
              <div className="col-span-6">
                <div 
                  className="font-medium"
                  style={{
                    paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`,
                    color: rgbToCSS(COLORS.text.primary)
                  }}
                >
                  {line.description}
                </div>
                {line.description.includes('ALEXA') && (
                  <div 
                    className="text-gray-500 text-xs mt-1"
                    style={{
                      paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`,
                      color: rgbToCSS(COLORS.text.muted)
                    }}
                  >
                    Dates : 17/04/25,19/04/25, 22/04/25
                  </div>
                )}
              </div>
              <div className="col-span-2 text-center">{line.qty}</div>
              <div className="col-span-2 text-right">{currency(Number(line.unit_price))}</div>
              <div className="col-span-2 text-right">{currency(Number(line.amount))}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <p 
            className="font-bold text-gray-800 mb-3"
            style={{
              fontSize: `${FONTS.medium}px`,
              marginBottom: `${SPACING.paragraph}px`,
              paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            Payment Instructions
          </p>
          
          <p 
            className="text-gray-600"
            style={{
              fontSize: `${FONTS.small}px`,
              color: rgbToCSS(COLORS.text.secondary),
              paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`
            }}
          >
            {companySettings?.payment_note || 
              `SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,
              BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,
              PAN NO.FDBPK8518L`}
          </p>
        </div>

        {/* Totals Section */}
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
                backgroundColor: rgbToCSS(POSITIONS.grandTotal.bgColor),
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

      {/* Footer */}
      <div 
        style={{
          marginTop: '60px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}
      >
        <p 
          className="mb-2"
          style={{
            fontSize: `${FONTS.base}px`,
            marginBottom: `${SPACING.paragraph}px`,
            paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`,
            color: rgbToCSS(COLORS.text.primary)
          }}
        >
          Thank you for your business!
        </p>
        
        <p 
          className="font-bold"
          style={{
            fontSize: `${FONTS.base}px`,
            paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`,
            color: rgbToCSS(COLORS.text.primary)
          }}
        >
          {currentCompany?.name || 'Square Blue Media'}
        </p>
        
        {/* Signature Section */}
        {invoice?.show_my_signature && (
          <div 
            style={{
              marginTop: `${SPACING.section}px`,
              paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`
            }}
          >
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
              className="text-gray-600"
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
