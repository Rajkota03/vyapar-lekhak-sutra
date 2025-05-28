
import React from 'react';
import { PAGE, BANDS, FONTS, COLORS, SPACING, formatCurrency, getBandPositions } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceTotalsSectionProps {
  invoice: any;
  companySettings: any;
}

export const InvoiceTotalsSection: React.FC<InvoiceTotalsSectionProps> = ({ 
  invoice, 
  companySettings 
}) => {
  const positions = getBandPositions();

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(positions.topOfBill - SPACING.sectionGap),
        bottom: `${positions.bottomOfTable}px`,
        left: '440px', // Position to the right of items table
        width: '220px' // Fixed width for totals
      }}
    >
      {/* Totals - Right Side */}
      <div className="mt-8"> {/* Add some top margin to align with items */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between py-1">
            <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              Subtotal
            </span>
            <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              {formatCurrency(Number(invoice?.subtotal || 214500))}
            </span>
          </div>
          
          {/* Tax rows */}
          {(!invoice?.use_igst && Number(invoice?.cgst_pct || 9) > 0) && (
            <div className="flex justify-between py-1">
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                CGST ({invoice?.cgst_pct || 9}%)
              </span>
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                {formatCurrency(Number(invoice?.cgst || 19305))}
              </span>
            </div>
          )}
          
          {(!invoice?.use_igst && Number(invoice?.sgst_pct || 9) > 0) && (
            <div className="flex justify-between py-1">
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                SGST ({invoice?.sgst_pct || 9}%)
              </span>
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                {formatCurrency(Number(invoice?.sgst || 19305))}
              </span>
            </div>
          )}
          
          {(invoice?.use_igst && Number(invoice?.igst_pct || 18) > 0) && (
            <div className="flex justify-between py-1">
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                IGST ({invoice?.igst_pct || 18}%)
              </span>
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                {formatCurrency(Number(invoice?.igst || 38610))}
              </span>
            </div>
          )}
          
          {/* Grand Total with light background */}
          <div 
            className="flex justify-between py-3 px-3 font-bold rounded mt-2"
            style={{
              backgroundColor: rgbToCSS(COLORS.background.light),
              fontSize: `${FONTS.medium}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            <span>GRAND TOTAL</span>
            <span>{formatCurrency(Number(invoice?.total || 253110))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
