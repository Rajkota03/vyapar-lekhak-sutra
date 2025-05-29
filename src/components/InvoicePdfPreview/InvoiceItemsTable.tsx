
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

  // Match the exact column proportions from PDF generation - adjusted to squeeze equipment column more
  const fractions = [0.08, 0.35, 0.12, 0.22, 0.23]; // S.NO, Equipment (more squeezed), Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);
  
  // Calculate column positions - START AT 0px since container is positioned at PAGE.margin from left
  const colX = [0]; // Start first column at 0px relative to container (container itself is offset PAGE.margin)
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

  // Helper function to truncate text that's too long
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <div 
      className="absolute"
      style={{
        ...getAbsoluteStyles(positions.topOfBill - SPACING.sectionGap - 30), // Added 30px spacing
        bottom: `${positions.bottomOfTable}px`,
        left: `${PAGE.margin}px`, // Position container at proper page margin (60px) from left edge of page
        width: `${PAGE.inner}px`,
        overflow: 'hidden',
        border: '1px solid black', // Outer table border
      }}
    >
      {/* Items Grid */}
      <div style={{ width: '100%', position: 'relative' }}>
        {/* Grid Header */}
        <div 
          className="py-2 mb-0"
          style={{
            height: `${TABLE.headerH}px`,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            borderBottom: '1px solid black', // Header separator line
          }}
        >
          {/* Vertical column separators for header */}
          {colX.slice(1).map((x, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: 'black',
              }}
            />
          ))}
          
          {/* S.NO Column */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[0]}px`,
            width: `${colWidths[0]}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.base}px`,
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
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
            fontWeight: 'bold',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
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
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
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
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
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
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
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
                  height: `${TABLE.rowH}px`,
                  position: 'relative',
                  marginBottom: '0px',
                  borderBottom: i < lines.length - 1 ? '0.5px solid #b3b3b3' : 'none', // Row separators (light gray)
                }}
              >
                {/* Vertical column separators for data rows */}
                {colX.slice(1).map((x, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: 'black',
                    }}
                  />
                ))}
                
                {/* S.NO */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[0]}px`,
                  width: `${colWidths[0]}px`,
                  textAlign: 'center',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '2px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  {i + 1}
                </div>
                
                {/* Equipment - with text constraints */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[1] + TABLE.padding}px`,
                  width: `${colWidths[1] - TABLE.padding * 2}px`,
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '2px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
                  {truncateText(line.description, 17)}
                </div>
                
                {/* Days - ensure it's never empty */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[2]}px`,
                  width: `${colWidths[2]}px`,
                  textAlign: 'center',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '2px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  {qty}
                </div>
                
                {/* Rate with rupee symbol and right alignment */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[3]}px`,
                  width: `${colWidths[3] - TABLE.padding}px`,
                  textAlign: 'right',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '2px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
                
                {/* Amount with rupee symbol and right alignment for units consistency */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[4]}px`,
                  width: `${colWidths[4] - TABLE.padding}px`,
                  textAlign: 'right',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '2px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  ₹{calculatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
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
          marginLeft: '0px' // No margin since container is already positioned correctly
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
              fontSize: `${FONTS.base}px`,
              padding: '0 2px'
            }}>
              ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
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
                fontSize: `${FONTS.base}px`,
                padding: '0 2px'
              }}>
                ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
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
                fontSize: `${FONTS.base}px`,
                padding: '0 2px'
              }}>
                ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
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
                fontSize: `${FONTS.base}px`,
                padding: '0 2px'
              }}>
                ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
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
              fontWeight: 'bold',
              padding: '0 2px'
            }}>
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
