import { PAGE, TABLE, FONTS, COLORS, SPACING, TEXT_HANDLING, getBandPositions, formatCurrency } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import { truncateText, wrapLines, createWrappedDrawText } from './textUtils.ts'
import type { LineItem, DrawTextOptions } from './types.ts'

export function renderItemsTable(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions, extraOptions?: any) => void,
  lineItems: LineItem[]
) {
  const positions = getBandPositions()
  let tableY = positions.topOfItems
  
  // Calculate column widths based on proportions - adjusted for better alignment
  const colWidths = TABLE.cols.map(ratio => PAGE.inner * ratio)
  
  // Calculate total table height including potential wrapped text
  let totalTableHeight = TABLE.headerH;
  const wrappedDrawText = createWrappedDrawText(page, drawText);
  
  // Pre-calculate row heights based on content
  const rowHeights = lineItems.map(item => {
    // Check if description needs wrapping
    const descMaxWidth = colWidths[1] - (TABLE.padding * 2);
    const lines = wrapLines(item.description, descMaxWidth, FONTS.base);
    const contentHeight = Math.max(lines.length * SPACING.lineHeight, TABLE.rowH);
    return contentHeight;
  });
  
  totalTableHeight += rowHeights.reduce((sum, height) => sum + height, 0);
  
  // Draw table border with thicker lines for better visibility
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - totalTableHeight,
    PAGE.inner,
    totalTableHeight,
    [1, 1, 1], // Pure white background
    COLORS.lines.dark, // Dark border
    2 // Thicker border
  )
  
  // Table header with proper border and background
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - TABLE.headerH,
    PAGE.inner,
    TABLE.headerH,
    COLORS.background.accent,
    COLORS.lines.dark,
    2 // Thicker border
  )
  
  // Header text with improved positioning
  const headerY = tableY - TABLE.headerH/2 + 4  // Better vertical centering
  let colX = PAGE.margin
  
  // S.NO column - centered in its column
  const snoColCenter = colX + (colWidths[0] / 2)
  drawText('S.NO', snoColCenter, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  colX += colWidths[0]
  
  // EQUIPMENT column - left aligned with padding
  drawText('EQUIPMENT', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  })
  colX += colWidths[1]
  
  // DAYS column - centered in its column
  const daysColCenter = colX + (colWidths[2] / 2)
  drawText('DAYS', daysColCenter, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  colX += colWidths[2]
  
  // RATE column - centered in its column
  const rateColCenter = colX + (colWidths[3] / 2)
  drawText('RATE', rateColCenter, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  colX += colWidths[3]
  
  // AMOUNT column - centered in its column
  const amountColCenter = colX + (colWidths[4] / 2)
  drawText('AMOUNT', amountColCenter, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  
  tableY -= TABLE.headerH
  
  // Draw vertical lines for columns with thicker lines
  for (let i = 1; i < TABLE.cols.length; i++) {
    let xPos = PAGE.margin
    for (let j = 0; j < i; j++) {
      xPos += colWidths[j]
    }
    
    page.drawLine({
      start: { x: xPos, y: positions.topOfItems },
      end: { x: xPos, y: positions.topOfItems - totalTableHeight },
      thickness: 1.5, // Slightly thicker for better visibility
      color: rgb(COLORS.lines.dark[0], COLORS.lines.dark[1], COLORS.lines.dark[2]),
    })
  }
  
  // Table rows with proper alignment, borders and alternating backgrounds
  lineItems.forEach((item, rowIndex) => {
    const rowHeight = rowHeights[rowIndex];
    
    // Alternate row background with more contrast
    if (rowIndex % 2 === 1) {
      drawRoundedRect(
        page,
        PAGE.margin,
        tableY - rowHeight,
        PAGE.inner,
        rowHeight,
        COLORS.background.light,
        null, // No border
        0 // No border thickness
      )
    }
    
    const rowY = tableY - (rowHeight / 2) + 4  // Better vertical centering for text
    colX = PAGE.margin
    
    // S.NO column (centered) - use the same center point as header
    const snoColCenter = colX + (colWidths[0] / 2)
    drawText((rowIndex + 1).toString(), snoColCenter, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'center' })
    colX += colWidths[0]
    
    // Equipment description with wrapping - left aligned with consistent padding
    const descMaxWidth = colWidths[1] - (TABLE.padding * 2);
    const descY = tableY - SPACING.lineHeight; // Start at top of cell
    
    // Use wrapped text drawing for description
    wrappedDrawText(
      item.description,
      colX + TABLE.padding,
      descY,
      descMaxWidth,
      SPACING.lineHeight,
      { 
        size: FONTS.base,
        color: COLORS.text.primary
      }
    );
    
    colX += colWidths[1]
    
    // Days/Quantity (centered) - use the same center point as header
    const daysColCenter = colX + (colWidths[2] / 2)
    drawText(item.qty.toString(), daysColCenter, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'center' })
    colX += colWidths[2]
    
    // Rate (right-aligned) - consistent padding from right edge
    const rateText = formatCurrency(Number(item.unit_price))
    const rateRightEdge = colX + colWidths[3] - TABLE.padding
    drawText(rateText, rateRightEdge, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'right' })
    colX += colWidths[3]
    
    // Amount (right-aligned) - consistent padding from right edge
    const amountText = formatCurrency(Number(item.amount))
    const amountRightEdge = colX + colWidths[4] - TABLE.padding
    drawText(amountText, amountRightEdge, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'right' })
    
    // Draw horizontal line after each row with consistent thickness
    if (rowIndex < lineItems.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: tableY - rowHeight },
        end: { x: PAGE.margin + PAGE.inner, y: tableY - rowHeight },
        thickness: 1, // Consistent thickness
        color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]), // Darker for better visibility
      })
    }
    
    tableY -= rowHeight
  })
  
  return tableY // Return the new Y position after the table
}
