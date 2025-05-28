
import React from 'react';
import { TABLE, FONTS, COLORS, SPACING, getBandPositions, formatCurrency } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceItemsTableProps {
  lines: any[];
  invoice: any;
  companySettings: any;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ lines, invoice, companySettings }) => {
  const positions = getBandPositions();

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(positions.topOfBill - SPACING.sectionGap),
        bottom: `${positions.bottomOfTable}px`,
        overflow: 'hidden'
      }}
    >
      {/* Items Table */}
      <div style={{ width: '100%' }}>
        {/* Table Header */}
        <div 
          className="py-2 mb-2"
          style={{
            height: `${TABLE.headerH}px`,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${rgbToCSS(COLORS.lines.light)}`
          }}
        >
          <div className="flex w-full px-2 font-bold">
            <div style={{ width: '45%', color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              EQUIPMENT
            </div>
            <div style={{ width: '12%', textAlign: 'center', color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              PKG
            </div>
            <div style={{ width: '20%', textAlign: 'right', color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              Rate
            </div>
            <div style={{ width: '23%', textAlign: 'right', color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              Amount
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ 
          maxHeight: `${positions.topOfBill - SPACING.sectionGap - TABLE.headerH - positions.bottomOfTable - 150}px`, 
          overflow: 'hidden' 
        }}>
          {lines?.map((line, i) => (
            <div 
              key={i} 
              className="py-2 px-2"
              style={{
                minHeight: `${TABLE.rowH}px`,
                borderBottom: i < lines.length - 1 ? `0.25px solid ${rgbToCSS(COLORS.lines.light)}` : 'none'
              }}
            >
              <div className="flex items-center w-full">
                <div style={{ width: '45%' }}>
                  <div style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                    {line.description}
                  </div>
                </div>
                <div style={{ width: '12%', textAlign: 'center', fontSize: `${FONTS.base}px` }}>
                  {line.qty}
                </div>
                <div style={{ width: '20%', textAlign: 'right', fontSize: `${FONTS.base}px` }}>
                  {formatCurrency(Number(line.unit_price))}
                </div>
                <div style={{ width: '23%', textAlign: 'right', fontSize: `${FONTS.base}px` }}>
                  {formatCurrency(Number(line.amount))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Section - Positioned exactly under the Amount column */}
        <div style={{ 
          marginTop: '20px',
          position: 'relative',
          width: '100%'
        }}>
          {/* Container positioned to align with Amount column */}
          <div style={{
            position: 'absolute',
            right: '0px', // Align to the right edge like the Amount column
            width: '23%', // Same width as Amount column
            paddingRight: '8px' // Match the table padding
          }}>
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
      </div>
    </div>
  );
};
