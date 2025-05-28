
import React, { useState } from 'react';
import { PAGE, BANDS, FONTS, COLORS } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceHeaderProps {
  company: any;
  companySettings: any;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ 
  company, 
  companySettings 
}) => {
  const [logoError, setLogoError] = useState<string | null>(null);
  
  const logoUrl = companySettings?.logo_url || company?.logo_url;
  const logoScale = Math.min(Number(companySettings?.logo_scale || 0.25), 1.0);
  const maxLogoSize = BANDS.header - 30;

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(PAGE.height - PAGE.margin - BANDS.header, BANDS.header),
      }}
    >
      <div className="flex justify-between items-start h-full">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center" style={{ height: `${BANDS.header}px` }}>
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
        <div className="text-right" style={{ width: '220px' }}>
          <h1 
            className="font-bold mb-3"
            style={{
              fontSize: `${FONTS.h1}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            INVOICE
          </h1>
          
          <h2 
            className="font-bold mb-2"
            style={{
              fontSize: `${FONTS.h2}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            {company?.name || 'Square Blue Media'}
          </h2>
          
          <div style={{ fontSize: `${FONTS.small}px`, color: rgbToCSS(COLORS.text.secondary), lineHeight: '14px' }}>
            <p className="mb-1">H.NO. 8-3-224/11C/17.E-96,</p>
            <p className="mb-1">MADHURA NAGAR,</p>
            <p className="mb-1">HYDERABAD TELANGANA 500038</p>
            <p className="mb-1">squarebluemedia@gmail.com</p>
            <p>GSTIN : {company?.gstin || '36FDBPK8518L1Z4'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
