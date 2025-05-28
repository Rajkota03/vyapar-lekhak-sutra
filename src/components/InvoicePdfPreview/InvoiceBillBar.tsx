
import React from 'react';
import { BANDS, FONTS, COLORS, SPACING, getBandPositions, formatDate } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceBillBarProps {
  client: any;
  invoice: any;
  companySettings: any;
}

// Utility function to wrap text for React preview (matching the Edge Function)
const wrapLines = (text: string, maxWidth: number, fontSize: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // Approximate character width as 60% of font size
  const avgCharWidth = fontSize * 0.6;
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * avgCharWidth;
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Utility function to truncate text with ellipsis
const truncateText = (text: string, maxWidth: number, fontSize: number): string => {
  const avgCharWidth = fontSize * 0.6;
  const textWidth = text.length * avgCharWidth;
  
  if (textWidth <= maxWidth) {
    return text;
  }
  
  const maxChars = Math.floor(maxWidth / avgCharWidth) - 3; // Account for ellipsis
  return text.substring(0, Math.max(0, maxChars)) + '...';
};

export const InvoiceBillBar: React.FC<InvoiceBillBarProps> = ({ 
  client, 
  invoice, 
  companySettings 
}) => {
  const positions = getBandPositions();

  // Calculate available width for values in the details box (matching Edge Function logic)
  const detailsBoxWidth = 160; // Matching the Edge Function width
  const labelWidth = 45;
  const valueWidth = detailsBoxWidth - 20 - labelWidth; // Available width for values

  const invoiceDetails = [
    { label: 'Invoice #', value: invoice?.invoice_code || invoice?.number || '25-26/02' },
    { label: 'Date', value: formatDate(invoice?.issue_date) || '23 Apr 2025' },
    { label: 'SAC/HSN', value: companySettings?.sac_code || '998387' }
  ];

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
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            {client?.name || 'SURESH PRODUCTIONS PVT LTD'}
          </h3>
          
          <div style={{ fontSize: `${FONTS.base}px`, color: rgbToCSS(COLORS.text.secondary), lineHeight: `${SPACING.lineHeight}px` }}>
            <p className="mb-1">C/O RAMANAIDU STUDIOS, FILM NAGAR</p>
            <p className="mb-2">HYDERABAD TELANGANA 500096</p>
            <p>GSTIN : {client?.gstin || '36AADCS0841F1ZN'}</p>
          </div>
        </div>
        
        <div 
          className="rounded px-4 py-3"
          style={{
            backgroundColor: rgbToCSS(COLORS.background.medium),
            width: `${detailsBoxWidth}px`
          }}
        >
          <div className="space-y-3">
            {invoiceDetails.map((detail, index) => {
              // Apply text wrapping/truncation logic
              const wrappedLines = wrapLines(detail.value, valueWidth, FONTS.base);
              const displayValue = wrappedLines.length === 1 
                ? wrappedLines[0] 
                : truncateText(detail.value, valueWidth, FONTS.base);

              return (
                <div key={index} className="flex justify-between">
                  <span className="font-bold" style={{ fontSize: `${FONTS.base}px` }}>
                    {detail.label}
                  </span>
                  <span 
                    style={{ fontSize: `${FONTS.base}px` }}
                    title={detail.value} // Show full text on hover if truncated
                  >
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
