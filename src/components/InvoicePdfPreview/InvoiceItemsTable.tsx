
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

  // Calculate 5-column spreadsheet grid
  const fractions = [0.05, 0.50, 0.10, 0.15, 0.20]; // S.NO, Equipment, Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);
  const colX = colWidths.reduce((acc, w, i) => 
    i === 0 ? [0] : [...acc, acc[i-1] + w], [] as number[]); // Start at 0, relative to container

  // Calculate totals from actual line items - this was the main issue!
  const subtotal = lines?.reduce((sum, line) => sum + (Number(line.amount) || 0), 0) || 0;
  
  // Use the tax configuration from the invoice to calculate taxes
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  if (invoice?.use_igst) {
    igstAmount = subtotal * ((Number(invoice?.igst_pct) || 18) / 100);
  } else {
    cgstAmount = subtotal * ((Number(invoice?.cgst_pct) || 9) / 100);
    sgstAmount = subtotal * ((Number(invoice?.sgst_pct) || 9) / 100);
  }
  
  const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(positions.topOfBill - SPACING.sectionGap - 30), // Added 30px spacing
        bottom: `${positions.bottomOfTable}px`,
        left: `${PAGE.margin + 25}px`, // Align with Bill To content
        width: `${PAGE.inner}px`,
        overflow: 'hidden'
      }}
    >
      {/* Items Grid */}
      <div style={{ width: '100%', position: 'relative' }}>
        {/* Grid Header */}
        <div 
          className="py-2 mb-2"
          style={{
            height: `${TABLE.headerH}px`,
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* S.NO Column */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[0]}px`,
            width: `${colWidths[0]}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.base}px`,
            fontWeight: 'bold'
          }}>
            S.NO
          </div>
          
          {/* Equipment Column */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[1] + TABLE.padding}px`,
            width: `${colWidths[1] - TABLE.padding * 2}px`,
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.base}px`,
            fontWeight: 'bold'
          }}>
            EQUIPMENT
          </div>
          
          {/* Days Column */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[2]}px`,
            width: `${colWidths[2]}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.base}px`,
            fontWeight: 'bold'
          }}>
            DAYS
          </div>
          
          {/* Rate Column */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[3]}px`,
            width: `${colWidths[3] - TABLE.padding}px`,
            textAlign: 'right',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.base}px`,
            fontWeight: 'bold'
          }}>
            RATE
          </div>
          
          {/* Amount Column */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[4]}px`,
            width: `${colWidths[4] - TABLE.padding}px`,
            textAlign: 'right',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.base}px`,
            fontWeight: 'bold'
          }}>
            AMOUNT
          </div>
        </div>

        {/* Grid Body - Item rows */}
        <div style={{ marginBottom: '20px' }}>
          {lines?.map((line, i) => (
            <div 
              key={i} 
              style={{
                minHeight: `${TABLE.rowH}px`,
                position: 'relative',
                marginBottom: '4px'
              }}
            >
              {/* S.NO */}
              <div style={{ 
                position: 'absolute',
                left: `${colX[0]}px`,
                width: `${colWidths[0]}px`,
                textAlign: 'center',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {i + 1}
              </div>
              
              {/* Equipment */}
              <div style={{ 
                position: 'absolute',
                left: `${colX[1] + TABLE.padding}px`,
                width: `${colWidths[1] - TABLE.padding * 2}px`,
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {line.description}
              </div>
              
              {/* Days */}
              <div style={{ 
                position: 'absolute',
                left: `${colX[2]}px`,
                width: `${colWidths[2]}px`,
                textAlign: 'center',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {line.qty || 1}
              </div>
              
              {/* Rate */}
              <div style={{ 
                position: 'absolute',
                left: `${colX[3]}px`,
                width: `${colWidths[3] - TABLE.padding}px`,
                textAlign: 'right',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {formatCurrency(Number(line.unit_price || 0))}
              </div>
              
              {/* Amount */}
              <div style={{ 
                position: 'absolute',
                left: `${colX[4]}px`,
                width: `${colWidths[4] - TABLE.padding}px`,
                textAlign: 'right',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {formatCurrency(Number(line.amount))}
              </div>
            </div>
          ))}
        </div>

        {/* Separator line before totals */}
        <div style={{
          height: '0.5px',
          backgroundColor: rgbToCSS(COLORS.lines.light),
          marginBottom: '12px'
        }} />

        {/* Totals Section as additional grid rows */}
        <div style={{ marginTop: '20px' }}>
          {/* Subtotal */}
          <div style={{
            minHeight: `${TABLE.rowH}px`,
            position: 'relative',
            marginBottom: '4px'
          }}>
            <div style={{ 
              position: 'absolute',
              left: `${colX[2] + TABLE.padding}px`,
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.base}px`
            }}>
              Subtotal
            </div>
            <div style={{ 
              position: 'absolute',
              left: `${colX[4]}px`,
              width: `${colWidths[4] - TABLE.padding}px`,
              textAlign: 'right',
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.base}px`
            }}>
              {formatCurrency(subtotal)}
            </div>
          </div>
          
          {/* Tax rows */}
          {(!invoice?.use_igst && Number(invoice?.cgst_pct || 9) > 0) && (
            <div style={{
              minHeight: `${TABLE.rowH}px`,
              position: 'relative',
              marginBottom: '4px'
            }}>
              <div style={{ 
                position: 'absolute',
                left: `${colX[2] + TABLE.padding}px`,
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                CGST ({invoice?.cgst_pct || 9}%)
              </div>
              <div style={{ 
                position: 'absolute',
                left: `${colX[4]}px`,
                width: `${colWidths[4] - TABLE.padding}px`,
                textAlign: 'right',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {formatCurrency(cgstAmount)}
              </div>
            </div>
          )}
          
          {(!invoice?.use_igst && Number(invoice?.sgst_pct || 9) > 0) && (
            <div style={{
              minHeight: `${TABLE.rowH}px`,
              position: 'relative',
              marginBottom: '4px'
            }}>
              <div style={{ 
                position: 'absolute',
                left: `${colX[2] + TABLE.padding}px`,
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                SGST ({invoice?.sgst_pct || 9}%)
              </div>
              <div style={{ 
                position: 'absolute',
                left: `${colX[4]}px`,
                width: `${colWidths[4] - TABLE.padding}px`,
                textAlign: 'right',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {formatCurrency(sgstAmount)}
              </div>
            </div>
          )}
          
          {(invoice?.use_igst && Number(invoice?.igst_pct || 18) > 0) && (
            <div style={{
              minHeight: `${TABLE.rowH}px`,
              position: 'relative',
              marginBottom: '4px'
            }}>
              <div style={{ 
                position: 'absolute',
                left: `${colX[2] + TABLE.padding}px`,
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                IGST ({invoice?.igst_pct || 18}%)
              </div>
              <div style={{ 
                position: 'absolute',
                left: `${colX[4]}px`,
                width: `${colWidths[4] - TABLE.padding}px`,
                textAlign: 'right',
                color: rgbToCSS(COLORS.text.primary), 
                fontSize: `${FONTS.base}px`
              }}>
                {formatCurrency(igstAmount)}
              </div>
            </div>
          )}
          
          {/* Grand Total */}
          <div style={{
            minHeight: `${TABLE.rowH}px`,
            position: 'relative',
            marginTop: '8px'
          }}>
            <div style={{ 
              position: 'absolute',
              left: `${colX[2] + TABLE.padding}px`,
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.medium}px`,
              fontWeight: 'bold'
            }}>
              GRAND TOTAL
            </div>
            <div style={{ 
              position: 'absolute',
              left: `${colX[4]}px`,
              width: `${colWidths[4] - TABLE.padding}px`,
              textAlign: 'right',
              color: rgbToCSS(COLORS.text.primary), 
              fontSize: `${FONTS.medium}px`,
              fontWeight: 'bold'
            }}>
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
