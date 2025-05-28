
import React from 'react';
import { PAGE, BANDS, FONTS, COLORS, SIGNATURE, formatDate } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceFooterProps {
  invoice: any;
  company: any;
  companySettings: any;
}

export const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ 
  invoice, 
  company, 
  companySettings 
}) => {
  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(PAGE.margin, BANDS.footer),
        bottom: `${PAGE.margin}px`,
        borderTop: `1px solid ${rgbToCSS(COLORS.lines.medium)}`,
        paddingTop: '20px'
      }}
    >
      <p 
        className="mb-2"
        style={{
          fontSize: `${FONTS.medium}px`,
          color: rgbToCSS(COLORS.text.primary)
        }}
      >
        Thank you for your business!
      </p>
      
      <p 
        className="font-bold mb-4"
        style={{
          fontSize: `${FONTS.medium}px`,
          color: rgbToCSS(COLORS.text.primary)
        }}
      >
        {company?.name || 'Square Blue Media'}
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
              borderTop: `1px solid ${rgbToCSS(COLORS.lines.dark)}`,
              width: `${SIGNATURE.lineWidth}px`,
              marginBottom: '8px'
            }}
          ></div>
          
          <p 
            style={{
              fontSize: `${FONTS.small}px`,
              color: rgbToCSS(COLORS.text.muted)
            }}
          >
            {formatDate(invoice?.issue_date) || '23 Apr 2025'}
          </p>
        </div>
      )}
    </div>
  );
};
