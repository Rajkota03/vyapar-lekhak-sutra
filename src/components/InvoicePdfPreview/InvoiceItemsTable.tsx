
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
      {/* Table Header */}
      <div 
        className="rounded px-2 py-2 mb-2"
        style={{
          backgroundColor: rgbToCSS(COLORS.background.accent),
          height: `${TABLE.headerH}px`,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="grid grid-cols-12 gap-2 font-bold w-full">
          <div className="col-span-5" style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.medium}px` }}>
            EQUIPMENT
          </div>
          <div className="col-span-1 text-center" style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.medium}px` }}>
            PKG
          </div>
          <div className="col-span-3 text-right" style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.medium}px` }}>
            Rate
          </div>
          <div className="col-span-3 text-right" style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.medium}px` }}>
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
            className={`py-2 px-2 ${i % 2 === 1 ? 'rounded' : ''}`}
            style={{
              backgroundColor: i % 2 === 1 ? rgbToCSS([0.98, 0.98, 0.98]) : 'transparent',
              minHeight: `${TABLE.rowH}px`,
              borderBottom: i < lines.length - 1 ? `0.5px solid ${rgbToCSS(COLORS.lines.light)}` : 'none'
            }}
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <div style={{ color: rgbToCSS(COLORS.text.primary), fontSize: `${FONTS.base}px` }}>
                  {line.description}
                </div>
              </div>
              <div className="col-span-1 text-center" style={{ fontSize: `${FONTS.base}px` }}>
                {line.qty}
              </div>
              <div className="col-span-3 text-right" style={{ fontSize: `${FONTS.base}px` }}>
                {formatCurrency(Number(line.unit_price))}
              </div>
              <div className="col-span-3 text-right" style={{ fontSize: `${FONTS.base}px` }}>
                {formatCurrency(Number(line.amount))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
