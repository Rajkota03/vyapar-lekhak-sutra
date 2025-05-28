
import React from 'react';
import { TABLE, FONTS, COLORS, SPACING, getBandPositions, formatCurrency } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceItemsTableProps {
  lines: any[];
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ lines }) => {
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
      {/* Items Table - Left Side */}
      <div 
        className="float-left"
        style={{ width: '420px' }} // Fixed width for items table
      >
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
          maxHeight: `${positions.topOfBill - SPACING.sectionGap - TABLE.headerH - positions.bottomOfTable}px`, 
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
      </div>
    </div>
  );
};
