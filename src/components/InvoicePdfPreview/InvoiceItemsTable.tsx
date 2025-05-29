
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

  // Match the exact column proportions from PDF generation - aligned with grey bar padding
  const fractions = [0.08, 0.45, 0.14, 0.16, 0.17]; // S.NO (increased), Equipment (reduced), Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);
  
  // Calculate column positions - START AT 25px (relative to container to align with "BILL TO" text)
  const colX = [25]; // Start first column at 25px relative to container to align with "BILL TO" text
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i-1] + colWidths[i-1]);
  }

  console.log('React column positions:', colX);
  console.log('React column widths:', colWidths);

  // Calculate subtotal from calculated line item amounts (not stored amounts)
  const subtotal = lines?.reduce((sum, line) => {
    const qty = Number(line.qty) || 1;
    const unitPrice = Number(line.unit_price) || 0;
    return sum + (qty * unitPrice);
  }, 0) || 0;
  
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

  console.log('React totals calculation:', { subtotal, cgstAmount, sgstAmount, igstAmount, grandTotal });

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(positions.topOfBill - SPACING.sectionGap - 30), // Added 30px spacing
        bottom: `${positions.bottomOfTable}px`,
        left: `${PAGE.margin}px`, // Align with page margin to match grey bar
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
          {lines?.map((line, i) => {
            // Calculate amount properly: Days/Qty * Rate
            const qty = Number(line.qty) || 1;
            const unitPrice = Number(line.unit_price) || 0;
            const calculatedAmount = qty * unitPrice;
            
            return (
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
                
                {/* Equipment - with text wrapping */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[1] + TABLE.padding}px`,
                  width: `${colWidths[1] - TABLE.padding * 2}px`,
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  wordWrap: 'break-word',
                  overflow: 'hidden'
                }}>
                  {line.description}
                </div>
                
                {/* Days - ensure it's never empty */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[2]}px`,
                  width: `${colWidths[2]}px`,
                  textAlign: 'center',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`
                }}>
                  {qty}
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
                  {formatCurrency(unitPrice)}
                </div>
                
                {/* Amount - Use calculated amount */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[4]}px`,
                  width: `${colWidths[4] - TABLE.padding}px`,
                  textAlign: 'right',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`
                }}>
                  {formatCurrency(calculatedAmount)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Separator line before totals */}
        <div style={{
          height: '0.5px',
          backgroundColor: rgbToCSS(COLORS.lines.light),
          marginBottom: '12px',
          marginLeft: '25px' // Align with column start
        }} />

        {/* Totals Section - Updated positioning to align with new column layout */}
        <div style={{ marginTop: '20px' }}>
          {/* Subtotal */}
          <div style={{
            minHeight: `${TABLE.rowH}px`,
            position: 'relative',
            marginBottom: '4px'
          }}>
            <div style={{ 
              position: 'absolute',
              left: `${colX[2] + TABLE.padding}px`, // Start of Days column
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
