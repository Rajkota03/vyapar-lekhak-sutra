import React from 'react';
import { TABLE, FONTS, COLORS, SPACING, TEXT_HANDLING, getBandPositions, formatCurrency } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceItemsTableProps {
  lines: any[];
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ lines }) => {
  const positions = getBandPositions();

  // Helper function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return TEXT_HANDLING.truncateWithEllipsis(text, maxLength);
  };

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
          backgroundColor: 'white',
          height: `${TABLE.headerH}px`,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${rgbToCSS(COLORS.lines.light)}`,
          paddingBottom: `${TABLE.lineSpacing}px`
        }}
      >
        <div className="grid grid-cols-12 gap-2 font-bold w-full">
          <div 
            className="col-span-5" 
            style={{ 
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.medium}px`,
              paddingLeft: `${SPACING.itemSpacing}px`
            }}
          >
            EQUIPMENT
          </div>
          <div 
            className="col-span-1 text-center" 
            style={{ 
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.medium}px` 
            }}
          >
            PKG
          </div>
          <div 
            className="col-span-3 text-right" 
            style={{ 
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.medium}px` 
            }}
          >
            Rate
          </div>
          <div 
            className="col-span-3 text-right" 
            style={{ 
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.medium}px`,
              paddingRight: `${SPACING.itemSpacing}px`
            }}
          >
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
              borderBottom: i < lines.length - 1 ? `0.5px solid ${rgbToCSS(COLORS.lines.light)}` : 'none',
              padding: `${TABLE.lineSpacing}px 0`
            }}
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <div 
                  style={{ 
                    color: rgbToCSS(COLORS.text.primary), 
                    fontSize: `${FONTS.base}px`,
                    paddingLeft: `${SPACING.itemSpacing}px`,
                    maxWidth: `${POSITIONS.table.colWidths[0]}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {truncateText(line.description, TEXT_HANDLING.maxItemDescLength)}
                </div>
                {line.description.includes('ALEXA') && (
                  <div 
                    style={{ 
                      color: rgbToCSS(COLORS.text.secondary), 
                      fontSize: `${FONTS.small}px`,
                      paddingLeft: `${SPACING.itemSpacing}px`,
                      marginTop: '2px'
                    }}
                  >
                    Dates : 17/04/25,19/04/25, 22/04/25
                  </div>
                )}
              </div>
              <div 
                className="col-span-1 text-center" 
                style={{ 
                  fontSize: `${FONTS.base}px` 
                }}
              >
                {line.qty}
              </div>
              <div 
                className="col-span-3 text-right" 
                style={{ 
                  fontSize: `${FONTS.base}px` 
                }}
              >
                {formatCurrency(Number(line.unit_price))}
              </div>
              <div 
                className="col-span-3 text-right" 
                style={{ 
                  fontSize: `${FONTS.base}px`,
                  paddingRight: `${SPACING.itemSpacing}px`
                }}
              >
                {formatCurrency(Number(line.amount))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
