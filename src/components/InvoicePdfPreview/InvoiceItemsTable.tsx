
import React from 'react';
import { TABLE, FONTS, COLORS, SPACING, getBandPositions, formatCurrency, PAGE } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceItemsTableProps {
  lines: any[];
  invoice: any;
  companySettings: any;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ lines, invoice, companySettings }) => {
  const positions = getBandPositions();

  // Limit items to match Bill To section height
  const maxRows = 3;
  const displayLines = lines?.slice(0, maxRows) || [];

  // Calculate column positions to match the PDF layout
  const billToContentInset = 25; // Match the 25px inset from Bill To section
  const availableWidth = PAGE.inner - billToContentInset;
  const grid = [0.45, 0.15, 0.15, 0.25]; // equipment / pkg / qty / amount
  const colX = grid.reduce<number[]>((arr, f, i) => {
    arr.push(billToContentInset + availableWidth * grid.slice(0, i).reduce((a, b) => a + b, 0));
    return arr;
  }, []);
  const colW = grid.map(f => f * availableWidth);

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(positions.topOfBill - SPACING.sectionGap - 30), // Added 30px spacing
        bottom: `${positions.bottomOfTable}px`,
        left: `${PAGE.margin + 25}px`, // Align with Bill To content (25px inset)
        width: `${PAGE.inner - 25}px`, // Adjust width to account for left inset
        overflow: 'hidden'
      }}
    >
      {/* Items Table */}
      <div style={{ width: '100%' }}>
        {/* Table Header - with capitalized column names */}
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
              QTY
            </div>
            <div style={{ width: '23%', textAlign: 'right', color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
              AMOUNT
            </div>
          </div>
        </div>

        {/* Table Body - limited rows to match Bill To height */}
        <div style={{ 
          maxHeight: `${60}px`, // Fixed height to match Bill To section
          overflow: 'hidden' 
        }}>
          {displayLines.map((line, i) => (
            <div 
              key={i} 
              className="py-2 px-2"
              style={{
                minHeight: `${TABLE.rowH}px`,
                borderBottom: i < displayLines.length - 1 ? `0.25px solid ${rgbToCSS(COLORS.lines.light)}` : 'none'
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
                  {line.qty}
                </div>
                <div style={{ width: '23%', textAlign: 'right', fontSize: `${FONTS.base}px` }}>
                  {formatCurrency(Number(line.amount))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Section - Positioned exactly within the Amount column boundaries */}
        <div style={{ 
          marginTop: '20px',
          position: 'relative',
          width: '100%'
        }}>
          {/* Container positioned to align exactly with Amount column */}
          <div style={{
            position: 'absolute',
            left: `${colX[3] - billToContentInset}px`, // Start at Amount column position
            width: `${colW[3]}px`, // Exact width of Amount column
            paddingLeft: '8px',
            paddingRight: '8px'
          }}>
            <div className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between py-1">
                <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                  subtotal
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
              
              {/* Grand Total with separator line and proper styling */}
              <div style={{ marginTop: '8px' }}>
                {/* Separator line */}
                <div style={{
                  height: '0.5px',
                  backgroundColor: rgbToCSS(COLORS.lines.medium),
                  marginBottom: '12px'
                }} />
                
                {/* Grand Total */}
                <div className="flex justify-between py-1 font-bold">
                  <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.medium}px` }}>
                    GRAND TOTAL
                  </span>
                  <span style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.medium}px` }}>
                    {formatCurrency(Number(invoice?.total || 253110))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
