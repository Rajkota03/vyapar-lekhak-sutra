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
  const logoScale = Number(companySettings?.logo_scale || 0.3);

  // Convert RGB array from layout constants to CSS color
  const rgbToCSS = (rgb: number[]) => `rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`;
  
  // Convert 0-1 scale gray to CSS color
  const grayToCSS = (value: number) => `rgb(${value * 255}, ${value * 255}, ${value * 255})`;

  return (
    <div 
      className="w-full mx-auto bg-white font-sans text-sm"
      style={{
        width: `${PAGE.width}px`,
        padding: `${PAGE.margin}px`,
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative',
        boxSizing: 'border-box',
        fontSize: `${FONTS.base}px`
      }}
    >
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
                  width: `${COMPANY_BLOCK.logoMax * logoScale}px`,
                  maxHeight: `${COMPANY_BLOCK.logoMax * logoScale}px`
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
        <div 
          className="text-right"
          style={{
            width: `${COMPANY_BLOCK.rightColumnWidth}px`
          }}
        >
          <h2 
            className="font-bold text-gray-800 mb-1"
            style={{
              fontSize: `${FONTS.h1}px`
            }}
          >
            {currentCompany?.name || 'Square Blue Media'}
          </h2>
          
          {currentCompany?.address && (
            <p 
              className="text-gray-600 mb-1"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              {currentCompany.address}
            </p>
          )}
          
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            squarebluemedia@gmail.com
          </p>
          
          {currentCompany?.gstin && (
            <p 
              className="text-gray-600 mb-3"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              GSTIN: {currentCompany.gstin}
            </p>
          )}
          
          <h1 
            className="font-bold text-gray-800 mb-2"
            style={{
              fontSize: `${FONTS.h2}px`
            }}
          >
            Invoice
          </h1>
          
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            H.NO. {invoice?.invoice_code || invoice?.number}
          </p>
          
          <p 
            className="text-gray-600 mb-3"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            HYDERABAD TELANGANA 500038
          </p>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span 
                className="font-medium"
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                Invoice #
              </span>
              <span
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                {invoice?.invoice_code || invoice?.number}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span 
                className="font-medium"
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                Date
              </span>
              <span
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                {new Date(invoice?.issue_date).toLocaleDateString('en-GB')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span 
                className="font-medium"
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                SAC / HSN CODE
              </span>
              <span
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                998387
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div 
        className="mb-6"
        style={{
          marginBottom: `${SPACING.section}px`
        }}
      >
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
            fontSize: `${FONTS.medium}px`
          }}
        >
          {client?.name || 'SURESH PRODUCTIONS PVT LTD'}
        </h3>
        
        {client?.billing_address && (
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            {client.billing_address}
          </p>
        )}
        
        {client?.gstin && (
          <p 
            className="text-gray-600"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            GSTIN: {client.gstin}
          </p>
        )}
      </div>

      {/* Project Section */}
      <div 
        className="mb-6"
        style={{
          marginBottom: `${SPACING.section}px`
        }}
      >
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
            fontSize: `${FONTS.medium}px`
          }}
        >
          CHEEKATLO
        </p>
      </div>

      {/* Items Table */}
      <div 
        className="mb-6"
        style={{
          marginBottom: `${SPACING.section}px`
        }}
      >
        {/* Table Header */}
        <div 
          className="border border-gray-300 p-3"
          style={{
            backgroundColor: grayToCSS(TABLE.headerBgColor),
            height: `${TABLE.rowH}px`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px'
          }}
        >
          <div 
            className="grid grid-cols-12 gap-2 font-bold uppercase tracking-wide w-full"
            style={{
              fontSize: `${FONTS.base}px`
            }}
          >
            <div 
              className="col-span-6"
              style={{
                paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`
              }}
            >
              EQUIPMENT
            </div>
            <div 
              className="col-span-2 text-center"
              style={{
                paddingLeft: `${POSITIONS.table.colPositions[1] - POSITIONS.table.colPositions[0] - 50}px`
              }}
            >
              PKG
            </div>
            <div 
              className="col-span-2 text-center"
              style={{
                paddingLeft: `${POSITIONS.table.colPositions[2] - POSITIONS.table.colPositions[1] - 50}px`
              }}
            >
              Rate
            </div>
            <div 
              className="col-span-2 text-center"
              style={{
                paddingLeft: `${POSITIONS.table.colPositions[3] - POSITIONS.table.colPositions[2] - 50}px`
              }}
            >
              Amount
            </div>
          </div>
        </div>

        {/* Table Body */}
        {lines?.map((line, i) => (
          <div 
            key={i} 
            className="border-l border-r border-b border-gray-300 p-3"
            style={{
              backgroundColor: i % 2 === 1 ? grayToCSS(TABLE.altRowBgColor) : '#ffffff',
              height: `${TABLE.rowH}px`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              borderColor: grayToCSS(TABLE.borderColor)
            }}
          >
            <div 
              className="grid grid-cols-12 gap-2 w-full"
              style={{
                fontSize: `${FONTS.base}px`
              }}
            >
              <div 
                className="col-span-6"
                style={{
                  paddingLeft: `${POSITIONS.table.colPositions[0] - PAGE.margin}px`
                }}
              >
                {line.description}
              </div>
              <div 
                className="col-span-2 text-center"
                style={{
                  paddingLeft: `${POSITIONS.table.colPositions[1] - POSITIONS.table.colPositions[0] - 50}px`
                }}
              >
                {line.qty}
              </div>
              <div 
                className="col-span-2 text-center"
                style={{
                  paddingLeft: `${POSITIONS.table.colPositions[2] - POSITIONS.table.colPositions[1] - 50}px`
                }}
              >
                {currency(Number(line.unit_price))}
              </div>
              <div 
                className="col-span-2 text-center"
                style={{
                  paddingLeft: `${POSITIONS.table.colPositions[3] - POSITIONS.table.colPositions[2] - 50}px`
                }}
              >
                {currency(Number(line.amount))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Instructions */}
      {companySettings?.payment_note && (
        <div 
          className="mb-8"
          style={{
            marginBottom: `${SPACING.section}px`
          }}
        >
          <p 
            className="font-bold text-gray-800 mb-3"
            style={{
              fontSize: `${FONTS.medium}px`,
              marginBottom: `${SPACING.paragraph}px`
            }}
          >
            Payment Instructions
          </p>
          
          <p 
            className="text-gray-600"
            style={{
              fontSize: `${FONTS.base}px`,
              color: rgbToCSS(COLORS.text.secondary)
            }}
          >
            {companySettings.payment_note}
          </p>
        </div>
      )}

      {/* Totals Section */}
      <div 
        className="flex justify-end mb-8"
        style={{
          marginBottom: `${SPACING.section}px`
        }}
      >
        <div 
          style={{
            width: `${POSITIONS.totals.x}px`
          }}
        >
          <div className="space-y-2">
            <div 
              className="flex justify-between py-1"
              style={{
                fontSize: `${FONTS.medium}px`
              }}
            >
              <span>Subtotal</span>
              <span>{currency(Number(invoice?.subtotal || 0))}</span>
            </div>
            
            {!invoice?.use_igst && Number(invoice?.cgst || 0) > 0 && (
              <div 
                className="flex justify-between py-1"
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                <span>CGST ({invoice?.cgst_pct || 9}%)</span>
                <span>{currency(Number(invoice.cgst))}</span>
              </div>
            )}
            
            {!invoice?.use_igst && Number(invoice?.sgst || 0) > 0 && (
              <div 
                className="flex justify-between py-1"
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                <span>SGST ({invoice?.sgst_pct || 9}%)</span>
                <span>{currency(Number(invoice.sgst))}</span>
              </div>
            )}
            
            {invoice?.use_igst && Number(invoice?.igst || 0) > 0 && (
              <div 
                className="flex justify-between py-1"
                style={{
                  fontSize: `${FONTS.medium}px`
                }}
              >
                <span>IGST ({invoice?.igst_pct || 18}%)</span>
                <span>{currency(Number(invoice.igst))}</span>
              </div>
            )}
            
            <div 
              className="flex justify-between py-1"
              style={{
                fontSize: `${FONTS.medium}px`
              }}
            >
              <span>Total</span>
              <span>{currency(Number(invoice?.total || 0))}</span>
            </div>
            
            <div 
              className="flex justify-between py-3 px-3 -mx-3 font-bold"
              style={{
                backgroundColor: grayToCSS(COLORS.background.dark),
                fontSize: `${FONTS.large}px`
              }}
            >
              <span>GRAND TOTAL</span>
              <span>{currency(Number(invoice?.total || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        style={{
          marginTop: '60px',
          position: 'absolute',
          bottom: `${PAGE.margin * 2}px`,
          left: `${PAGE.margin}px`
        }}
      >
        <p 
          className="mb-2"
          style={{
            fontSize: `${FONTS.medium}px`,
            marginBottom: `${SPACING.paragraph}px`
          }}
        >
          Thank you for your business!
        </p>
        
        <p 
          className="font-bold"
          style={{
            fontSize: `${FONTS.medium}px`
          }}
        >
          {currentCompany?.name || 'Square Blue Media'}
        </p>
        
        {/* Signature Section */}
        {invoice?.show_my_signature && (
          <div 
            style={{
              marginTop: `${SPACING.section}px`
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
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.secondary)
              }}
            >
              {new Date(invoice.issue_date).toLocaleDateString('en-GB')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
