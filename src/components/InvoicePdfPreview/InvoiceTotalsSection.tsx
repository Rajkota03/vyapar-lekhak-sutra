
import React from 'react';
import { PAGE, BANDS, FONTS, COLORS, SPACING, formatCurrency } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceTotalsSectionProps {
  invoice: any;
  companySettings: any;
}

export const InvoiceTotalsSection: React.FC<InvoiceTotalsSectionProps> = ({ 
  invoice, 
  companySettings 
}) => {
  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(PAGE.margin + BANDS.footer, 110),
        bottom: `${PAGE.margin + BANDS.footer}px`,
      }}
    >
      <div className="grid grid-cols-2 gap-8 h-full">
        {/* Payment Instructions */}
        <div>
          <p 
            className="font-bold mb-4"
            style={{
              fontSize: `${FONTS.large}px`,
              color: rgbToCSS(COLORS.text.primary)
            }}
          >
            Payment Instructions
          </p>
          
          <div 
            style={{
              fontSize: `${FONTS.small}px`,
              color: rgbToCSS(COLORS.text.secondary),
              lineHeight: `${SPACING.lineHeight}px`
            }}
          >
            {companySettings?.payment_note ? (
              companySettings.payment_note.split('\n').slice(0, 6).map((line: string, i: number) => (
                <p key={i} className="mb-1">{line.trim()}</p>
              ))
            ) : (
              <>
                <p className="mb-1">SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,</p>
                <p className="mb-1">BRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,</p>
                <p className="mb-1">PAN NO.FDBPK8518L</p>
              </>
            )}
          </div>
        </div>

        {/* Totals - Clean Design */}
        <div>
          <div className="space-y-3" style={{ width: '220px' }}>
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
            
            {/* Total */}
            <div className="flex justify-between py-1">
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                Total
              </span>
              <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                {formatCurrency(Number(invoice?.total || 253110))}
              </span>
            </div>
            
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
    </div>
  );
};
