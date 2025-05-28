import React from 'react';
import { BANDS, FONTS, COLORS, SPACING, BILL_BAR, TEXT_HANDLING, getBandPositions, formatDate } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceBillBarProps {
  client: any;
  invoice: any;
  companySettings: any;
}

export const InvoiceBillBar: React.FC<InvoiceBillBarProps> = ({ 
  client, 
  invoice, 
  companySettings 
}) => {
  const positions = getBandPositions();

  // Helper function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return TEXT_HANDLING.truncateWithEllipsis(text, maxLength);
  };

  return (
    <div 
      className="absolute rounded"
      style={{
        ...getAbsoluteStyles(positions.topOfBill, BANDS.bill),
        backgroundColor: rgbToCSS(COLORS.background.light),
        padding: '25px'
      }}
    >
      <div className="flex justify-between h-full">
        <div>
          <p 
            className="font-bold uppercase tracking-wide mb-3"
            style={{
              fontSize: `${FONTS.medium}px`,
              color: rgbToCSS(COLORS.text.muted)
            }}
          >
            BILL TO
          </p>
          
          <h3 
            className="font-bold mb-2"
            style={{
              fontSize: `${FONTS.large}px`,
              color: rgbToCSS(COLORS.text.primary),
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {truncateText(client?.name || 'SURESH PRODUCTIONS PVT LTD', TEXT_HANDLING.maxClientNameLength)}
          </h3>
          
          <div style={{ fontSize: `${FONTS.base}px`, color: rgbToCSS(COLORS.text.secondary), lineHeight: `${SPACING.lineHeight}px` }}>
            <p className="mb-1" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              C/O RAMANAIDU STUDIOS, FILM NAGAR
            </p>
            <p className="mb-2" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              HYDERABAD TELANGANA 500096
            </p>
            <p style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              GSTIN : {client?.gstin || '36AADCS0841F1ZN'}
            </p>
          </div>
          
          {/* Project section */}
          <div className="mt-4">
            <p 
              className="font-bold uppercase tracking-wide mb-1"
              style={{
                fontSize: `${FONTS.base}px`,
                color: rgbToCSS(COLORS.text.muted)
              }}
            >
              PROJECT
            </p>
            <p style={{ 
              fontSize: `${FONTS.base}px`, 
              color: rgbToCSS(COLORS.text.primary),
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              CHEEKATLO
            </p>
          </div>
        </div>
        
        <div 
          className="rounded px-4 py-3"
          style={{
            backgroundColor: rgbToCSS(COLORS.background.medium),
            width: '160px'
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span 
                className="font-bold" 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  width: `${BILL_BAR.detailsLabelWidth}px`,
                  textAlign: 'left'
                }}
              >
                Invoice #
              </span>
              <span 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  width: `${BILL_BAR.detailsValueWidth}px`,
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {truncateText(invoice?.invoice_code || invoice?.number || '25-26/02', TEXT_HANDLING.maxInvoiceCodeLength)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span 
                className="font-bold" 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  width: `${BILL_BAR.detailsLabelWidth}px`,
                  textAlign: 'left'
                }}
              >
                Date
              </span>
              <span 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  width: `${BILL_BAR.detailsValueWidth}px`,
                  textAlign: 'right'
                }}
              >
                {formatDate(invoice?.issue_date) || '23 Apr 2025'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span 
                className="font-bold" 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  width: `${BILL_BAR.detailsLabelWidth}px`,
                  textAlign: 'left'
                }}
              >
                SAC/HSN
              </span>
              <span 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  width: `${BILL_BAR.detailsValueWidth}px`,
                  textAlign: 'right'
                }}
              >
                {companySettings?.sac_code || '998387'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
