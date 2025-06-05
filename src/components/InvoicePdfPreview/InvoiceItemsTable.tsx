
import React from 'react';
import { TABLE, FONTS, COLORS, SPACING, getBandPositions, PAGE } from '@/lib/pdf/layout';
import { rgbToCSS, getAbsoluteStyles } from './invoicePreviewUtils';

interface InvoiceItemsTableProps {
  lines: any[];
  invoice: any;
  companySettings: any;
}

// Enhanced text clipping utility that matches PDF behavior
const clipText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Calculate text width approximation (matching PDF font metrics)
const getTextWidth = (text: string, fontSize: number, isBold: boolean = false): number => {
  const avgCharWidth = isBold ? fontSize * 0.62 : fontSize * 0.58;
  const spaceWidth = fontSize * 0.28;
  
  const charCount = text.replace(/\s/g, '').length;
  const spaceCount = (text.match(/\s/g) || []).length;
  
  return (charCount * avgCharWidth) + (spaceCount * spaceWidth);
};

// Clip text to fit within pixel width (matching PDF clipping logic)
const clipTextToWidth = (text: string, maxWidth: number, fontSize: number, isBold: boolean = false): string => {
  const textWidth = getTextWidth(text, fontSize, isBold);
  
  if (textWidth <= maxWidth) {
    return text;
  }
  
  const ellipsis = '...';
  const ellipsisWidth = getTextWidth(ellipsis, fontSize, isBold);
  const availableWidth = maxWidth - ellipsisWidth;
  
  if (availableWidth <= 0) {
    return ellipsis;
  }
  
  // Binary search for optimal length
  let left = 0;
  let right = text.length;
  let result = text;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid);
    const truncatedWidth = getTextWidth(truncated, fontSize, isBold);
    
    if (truncatedWidth <= availableWidth) {
      result = truncated + ellipsis;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
};

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ lines, invoice, companySettings }) => {
  const positions = getBandPositions();

  // Match exact column proportions from PDF generation
  const fractions = [0.07, 0.48, 0.15, 0.15, 0.15]; // S.NO, Equipment, Days, Rate, Amount
  const colWidths = fractions.map(f => f * PAGE.inner);
  
  // Calculate column positions
  const colX = [0];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i-1] + colWidths[i-1]);
  }

  // Calculate totals from line items
  const subtotal = lines?.reduce((sum, line) => {
    const qty = Number(line.qty) || 1;
    const unitPrice = Number(line.unit_price) || 0;
    return sum + (qty * unitPrice);
  }, 0) || 0;
  
  // Calculate taxes
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

  console.log('InvoiceItemsTable rendering:', {
    linesCount: lines?.length,
    subtotal,
    grandTotal,
    topOfItems: positions.topOfItems,
    bottomOfTable: positions.bottomOfTable
  });

  // Calculate the table height needed
  const headerHeight = TABLE.headerH;
  const rowHeight = TABLE.rowH;
  const totalRowsHeight = (lines?.length || 0) * rowHeight;
  const totalsHeight = 150; // Estimated height for totals section
  const totalTableHeight = headerHeight + totalRowsHeight + totalsHeight;

  // Position the table properly
  const tableTop = positions.topOfItems - 50; // Start 50px below bill section
  const tableBottom = tableTop - totalTableHeight;

  return (
    <div 
      className="absolute bg-white"
      style={{
        top: `${tableTop}px`,
        left: `${PAGE.margin}px`,
        width: `${PAGE.inner}px`,
        height: `${totalTableHeight}px`,
        border: '1px solid black',
        overflow: 'visible',
        zIndex: 10
      }}
    >
      {/* Debug indicator */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        left: 0,
        fontSize: '10px',
        color: 'blue',
        background: 'cyan'
      }}>
        Table positioned at top: {tableTop}px
      </div>

      <div style={{ width: '100%', position: 'relative', height: '100%' }}>
        {/* Grid Header */}
        <div 
          className="py-2 mb-0"
          style={{
            height: `${TABLE.headerH}px`,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            borderBottom: '1px solid black',
            backgroundColor: rgbToCSS(COLORS.background.accent)
          }}
        >
          {/* Vertical column separators */}
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
          
          {/* Header columns with proper text clipping */}
          <div style={{ 
            position: 'absolute',
            left: `${colX[0]}px`,
            width: `${colWidths[0]}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.medium}px`,
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
          }}>
            S.NO
          </div>
          
          <div style={{ 
            position: 'absolute',
            left: `${colX[1] + TABLE.padding}px`,
            width: `${colWidths[1] - TABLE.padding * 2}px`,
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.medium}px`,
            fontWeight: 'bold',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}>
            EQUIPMENT
          </div>
          
          <div style={{ 
            position: 'absolute',
            left: `${colX[2]}px`,
            width: `${colWidths[2]}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.medium}px`,
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
          }}>
            DAYS
          </div>
          
          <div style={{ 
            position: 'absolute',
            left: `${colX[3]}px`,
            width: `${colWidths[3] - TABLE.padding}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.medium}px`,
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
          }}>
            RATE
          </div>
          
          <div style={{ 
            position: 'absolute',
            left: `${colX[4]}px`,
            width: `${colWidths[4] - TABLE.padding}px`,
            textAlign: 'center',
            color: rgbToCSS(COLORS.text.primary), 
            fontSize: `${FONTS.medium}px`,
            fontWeight: 'bold',
            padding: '0 2px',
            overflow: 'hidden'
          }}>
            AMOUNT
          </div>
        </div>

        {/* Grid Body - Item rows with enhanced text clipping */}
        <div style={{ position: 'relative', marginTop: 0 }}>
          {lines?.map((line, i) => {
            const qty = Number(line.qty) || 1;
            const unitPrice = Number(line.unit_price) || 0;
            const calculatedAmount = qty * unitPrice;
            
            // Calculate available width for equipment column and clip text accordingly
            const equipmentMaxWidth = colWidths[1] - TABLE.padding * 2;
            const clippedDescription = clipTextToWidth(line.description, equipmentMaxWidth, FONTS.base, false);
            
            return (
              <div 
                key={i} 
                style={{
                  height: `${TABLE.rowH}px`,
                  position: 'relative',
                  borderBottom: i < lines.length - 1 ? '0.5px solid #b3b3b3' : 'none',
                  backgroundColor: i % 2 === 1 ? rgbToCSS(COLORS.background.light) : 'transparent'
                }}
              >
                {/* Vertical column separators */}
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
                  top: '8px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  {i + 1}
                </div>
                
                {/* Equipment - with enhanced text clipping */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[1] + TABLE.padding}px`,
                  width: `${colWidths[1] - TABLE.padding * 2}px`,
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '8px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {clippedDescription}
                </div>
                
                {/* Days */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[2]}px`,
                  width: `${colWidths[2]}px`,
                  textAlign: 'center',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '8px',
                  overflow: 'hidden',
                  padding: '0 2px'
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
                  fontSize: `${FONTS.base}px`,
                  top: '8px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
                
                {/* Amount */}
                <div style={{ 
                  position: 'absolute',
                  left: `${colX[4]}px`,
                  width: `${colWidths[4] - TABLE.padding}px`,
                  textAlign: 'right',
                  color: rgbToCSS(COLORS.text.primary), 
                  fontSize: `${FONTS.base}px`,
                  top: '8px',
                  overflow: 'hidden',
                  padding: '0 2px'
                }}>
                  ₹{calculatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Section */}
        <div style={{ 
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: `${PAGE.inner * 0.4}px`,
          backgroundColor: rgbToCSS(COLORS.background.light),
          border: '1px solid ' + rgbToCSS(COLORS.lines.medium),
          padding: '15px'
        }}>
          {/* Subtotal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: `${FONTS.base}px` }}>Subtotal</span>
            <span style={{ fontSize: `${FONTS.base}px` }}>
              ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          </div>
          
          {/* Tax rows */}
          {(!invoice?.use_igst && Number(invoice?.cgst_pct || 9) > 0) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: `${FONTS.base}px` }}>CGST ({invoice?.cgst_pct || 9}%)</span>
              <span style={{ fontSize: `${FONTS.base}px` }}>
                ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}
          
          {(!invoice?.use_igst && Number(invoice?.sgst_pct || 9) > 0) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: `${FONTS.base}px` }}>SGST ({invoice?.sgst_pct || 9}%)</span>
              <span style={{ fontSize: `${FONTS.base}px` }}>
                ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}
          
          {(invoice?.use_igst && Number(invoice?.igst_pct || 18) > 0) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: `${FONTS.base}px` }}>IGST ({invoice?.igst_pct || 18}%)</span>
              <span style={{ fontSize: `${FONTS.base}px` }}>
                ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}
          
          {/* Grand Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid ' + rgbToCSS(COLORS.lines.medium),
            fontWeight: 'bold'
          }}>
            <span style={{ fontSize: `${FONTS.medium}px` }}>GRAND TOTAL</span>
            <span style={{ fontSize: `${FONTS.medium}px` }}>
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
