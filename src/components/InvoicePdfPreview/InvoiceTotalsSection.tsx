import React from 'react';
import { PAGE, BANDS, FONTS, COLORS, SPACING, POSITIONS, formatCurrency } from '@/lib/pdf/layout';
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
        ...getAbsoluteStyles(PAGE.margin + BANDS.footer, BANDS.totals),
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
              lineHeight: `${POSITIONS.payment.lineHeight}px`,
              maxWidth: `${POSITIONS.payment.maxWidth}px`,
              whiteSpace: 'pre-line'
            }}
          >
            {companySettings?.payment_note ? (
              companySettings.payment_note
            ) : (
              "SQUARE BLUE MEDIA, A/C NO. 50200048938831, HDFC BANK,\nBRANCH: KALYAN NAGAR, HYDERABAD, IFSC: HDFC0004348,\nPAN NO.FDBPK8518L"
            )}
          </div>
        </div>

        {/* Totals */}
        <div>
          <div 
            className="rounded p-3 space-y-3"
            style={{
              backgroundColor: rgbToCSS(COLORS.background.light)
            }}
          >
            <div 
              className="flex justify-between py-1"
              style={{
                borderBottom: `1px solid ${rgbToCSS(COLORS.lines.light)}`,
                paddingTop: `${SPACING.beforeLine}px`,
                paddingBottom: `${SPACING.afterLine}px`
              }}
            >
              <span 
                style={{ 
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  width: `${POSITIONS.totals.width}px`
                }}
              >
                Subtotal
              </span>
              <span 
                style={{ 
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  textAlign: 'right',
                  width: `${POSITIONS.totals.valueWidth}px`
                }}
              >
                {formatCurrency(Number(invoice?.subtotal || 214500))}
              </span>
            </div>
            
            {(!invoice?.use_igst && Number(invoice?.cgst_pct || 9) > 0) && (
              <div 
                className="flex justify-between py-1"
                style={{
                  borderBottom: `1px solid ${rgbToCSS(COLORS.lines.light)}`,
                  paddingTop: `${SPACING.beforeLine}px`,
                  paddingBottom: `${SPACING.afterLine}px`
                }}
              >
                <span 
                  style={{ 
                    color: rgbToCSS(COLORS.text.secondary), 
                    fontSize: `${FONTS.base}px`,
                    width: `${POSITIONS.totals.width}px`
                  }}
                >
                  CGST ({invoice?.cgst_pct || 9}%)
                </span>
                <span 
                  style={{ 
                    color: rgbToCSS(COLORS.text.secondary), 
                    fontSize: `${FONTS.base}px`,
                    textAlign: 'right',
                    width: `${POSITIONS.totals.valueWidth}px`
                  }}
                >
                  {formatCurrency(Number(invoice?.cgst || 19305))}
                </span>
              </div>
            )}
            
            {(!invoice?.use_igst && Number(invoice?.sgst_pct || 9) > 0) && (
              <div 
                className="flex justify-between py-1"
                style={{
                  borderBottom: `1px solid ${rgbToCSS(COLORS.lines.light)}`,
                  paddingTop: `${SPACING.beforeLine}px`,
                  paddingBottom: `${SPACING.afterLine}px`
                }}
              >
                <span 
                  style={{ 
                    color: rgbToCSS(COLORS.text.secondary), 
                    fontSize: `${FONTS.base}px`,
                    width: `${POSITIONS.totals.width}px`
                  }}
                >
                  SGST ({invoice?.sgst_pct || 9}%)
                </span>
                <span 
                  style={{ 
                    color: rgbToCSS(COLORS.text.secondary), 
                    fontSize: `${FONTS.base}px`,
                    textAlign: 'right',
                    width: `${POSITIONS.totals.valueWidth}px`
                  }}
                >
                  {formatCurrency(Number(invoice?.sgst || 19305))}
                </span>
              </div>
            )}
            
            {(invoice?.use_igst && Number(invoice?.igst_pct || 18) > 0) && (
              <div 
                className="flex justify-between py-1"
                style={{
                  borderBottom: `1px solid ${rgbToCSS(COLORS.lines.light)}`,
                  paddingTop: `${SPACING.beforeLine}px`,
                  paddingBottom: `${SPACING.afterLine}px`
                }}
              >
                <span 
                  style={{ 
                    color: rgbToCSS(COLORS.text.secondary), 
                    fontSize: `${FONTS.base}px`,
                    width: `${POSITIONS.totals.width}px`
                  }}
                >
                  IGST ({invoice?.igst_pct || 18}%)
                </span>
                <span 
                  style={{ 
                    color: rgbToCSS(COLORS.text.secondary), 
                    fontSize: `${FONTS.base}px`,
                    textAlign: 'right',
                    width: `${POSITIONS.totals.valueWidth}px`
                  }}
                >
                  {formatCurrency(Number(invoice?.igst || 38610))}
                </span>
              </div>
            )}
            
            <div 
              className="flex justify-between py-1"
              style={{
                paddingTop: `${SPACING.beforeLine}px`,
                paddingBottom: `${SPACING.afterLine}px`
              }}
            >
              <span 
                style={{ 
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  width: `${POSITIONS.totals.width}px`,
                  fontWeight: 'bold'
                }}
              >
                Total
              </span>
              <span 
                style={{ 
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  textAlign: 'right',
                  width: `${POSITIONS.totals.valueWidth}px`,
                  fontWeight: 'bold'
                }}
              >
                {formatCurrency(Number(invoice?.total || 253110))}
              </span>
            </div>
            
            <div 
              className="flex justify-between py-3 px-3 font-bold rounded"
              style={{
                backgroundColor: rgbToCSS(COLORS.background.medium),
                fontSize: `${FONTS.large}px`,
                color: rgbToCSS(COLORS.text.primary),
                padding: `${POSITIONS.grandTotal.padding}px`
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
