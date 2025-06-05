
// Table Renderer with Fixed Text Overflow - VERSION: 2025-06-05-FIX-2

import { PAGE, TABLE, FONTS, COLORS, SPACING, TEXT_HANDLING, getBandPositions, formatCurrency } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import { truncateText, formatNumericValue, measureText, clipText, createWrappedDrawText } from './textUtils.ts'
import type { LineItem, DrawTextOptions } from './types.ts'

// Add version marker for tracking fixes
export function addVersionMarker(page: any, drawText: Function) {
  const versionText = "Table Fix v2025-06-05-2";
  drawText(versionText, PAGE.margin, PAGE.margin / 2, {
    size: FONTS.tiny,
    color: COLORS.text.muted
  });
}

// Create a clipped drawing function for table cells
function createTableCellDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, width: number, options: DrawTextOptions = {}, extraOptions: any = {}) => {
    const fontSize = options.size || FONTS.base;
    
    // For right-aligned text, calculate the actual x position
    let actualX = x;
    if (extraOptions.textAlign === 'right') {
      const textWidth = measureText(text, fontSize);
      actualX = x - textWidth;
    } else if (extraOptions.textAlign === 'center') {
      const textWidth = measureText(text, fontSize);
      actualX = x - (textWidth / 2);
    }
    
    // Always truncate text to fit within the specified width
    const clippedText = truncateText(text, width, fontSize);
    
    // Draw the clipped text
    drawText(clippedText, actualX, y, options, extraOptions);
  };
}

export function renderItemsTable(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions, extraOptions?: any) => void,
  lineItems: LineItem[]
) {
  // Add version marker
  addVersionMarker(page, drawText);
  
  const positions = getBandPositions()
  let tableY = positions.topOfItems
  
  // Calculate column widths and positions
  const colWidths = TABLE.cols.map(ratio => PAGE.inner * ratio)
  const colPositions = [PAGE.margin]
  for (let i = 0; i < colWidths.length - 1; i++) {
    colPositions.push(colPositions[colPositions.length - 1] + colWidths[i])
  }
  
  // Create clipped text drawing function
  const cellDrawText = createTableCellDrawText(page, drawText);
  
  // Calculate row heights with proper text measurement
  const rowHeights = lineItems.map(item => {
    const descMaxWidth = colWidths[1] - (TABLE.padding * 2);
    const fontSize = FONTS.base;
    
    // Calculate how many lines the description will need
    const words = item.description.split(' ');
    let currentLine = '';
    let lineCount = 1;
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureText(testLine, fontSize);
      
      if (testWidth > descMaxWidth && currentLine) {
        lineCount++;
        currentLine = word;
        if (lineCount >= TEXT_HANDLING.maxLinesPerCell) break;
      } else {
        currentLine = testLine;
      }
    }
    
    return Math.max(lineCount * SPACING.lineHeight + TABLE.padding, TABLE.rowH);
  });
  
  const totalTableHeight = TABLE.headerH + rowHeights.reduce((sum, height) => sum + height, 0);
  
  // Draw table background and border
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - totalTableHeight,
    PAGE.inner,
    totalTableHeight,
    [1, 1, 1], // White background
    COLORS.lines.dark,
    2
  )
  
  // Draw table header
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - TABLE.headerH,
    PAGE.inner,
    TABLE.headerH,
    COLORS.background.accent,
    COLORS.lines.dark,
    2
  )
  
  // Header text with precise positioning and clipping
  const headerY = tableY - TABLE.headerH/2 + 3;
  const headerLabels = ['S.NO', 'EQUIPMENT', 'DAYS', 'RATE', 'AMOUNT'];
  const headerAlignments = ['center', 'left', 'center', 'center', 'center'];
  
  headerLabels.forEach((label, index) => {
    const colX = colPositions[index];
    const colWidth = colWidths[index];
    const cellPadding = TABLE.padding;
    
    let textX = colX + cellPadding;
    let availableWidth = colWidth - (cellPadding * 2);
    
    if (headerAlignments[index] === 'center') {
      textX = colX + (colWidth / 2);
    } else if (headerAlignments[index] === 'right') {
      textX = colX + colWidth - cellPadding;
    }
    
    cellDrawText(label, textX, headerY, availableWidth, {
      size: FONTS.medium,
      bold: true,
      color: COLORS.text.primary
    }, { textAlign: headerAlignments[index] });
  });
  
  tableY -= TABLE.headerH;
  
  // Draw vertical column separators
  for (let i = 1; i < colPositions.length; i++) {
    page.drawLine({
      start: { x: colPositions[i], y: positions.topOfItems },
      end: { x: colPositions[i], y: positions.topOfItems - totalTableHeight },
      thickness: 1.5,
      color: rgb(COLORS.lines.dark[0], COLORS.lines.dark[1], COLORS.lines.dark[2]),
    });
  }
  
  // Render table rows with precise text clipping
  lineItems.forEach((item, rowIndex) => {
    const rowHeight = rowHeights[rowIndex];
    
    // Alternate row backgrounds
    if (rowIndex % 2 === 1) {
      drawRoundedRect(
        page,
        PAGE.margin,
        tableY - rowHeight,
        PAGE.inner,
        rowHeight,
        COLORS.background.light,
        null,
        0
      );
    }
    
    const rowY = tableY - (rowHeight / 2) + 2; // Vertical center
    
    // Column data and alignments
    const columnData = [
      { text: (rowIndex + 1).toString(), align: 'center' },
      { text: item.description, align: 'left', multiline: true },
      { text: formatNumericValue(item.qty, colWidths[2] - TABLE.padding * 2, FONTS.base), align: 'center' },
      { text: formatNumericValue(Number(item.unit_price), colWidths[3] - TABLE.padding * 2, FONTS.base), align: 'right' },
      { text: formatNumericValue(Number(item.amount), colWidths[4] - TABLE.padding * 2, FONTS.base), align: 'right' }
    ];
    
    columnData.forEach((col, colIndex) => {
      const colX = colPositions[colIndex];
      const colWidth = colWidths[colIndex];
      const cellPadding = TABLE.padding;
      const availableWidth = colWidth - (cellPadding * 2);
      
      let textX = colX + cellPadding;
      if (col.align === 'center') {
        textX = colX + (colWidth / 2);
      } else if (col.align === 'right') {
        textX = colX + colWidth - cellPadding;
      }
      
      if (col.multiline && colIndex === 1) {
        // Handle multi-line description with proper wrapping
        const wrappedDrawText = createWrappedDrawText(page, drawText);
        wrappedDrawText(
          col.text,
          colX + cellPadding,
          tableY - SPACING.lineHeight,
          availableWidth,
          SPACING.lineHeight,
          { size: FONTS.base, color: COLORS.text.primary },
          TEXT_HANDLING.maxLinesPerCell
        );
      } else {
        // Single line text with clipping
        cellDrawText(col.text, textX, rowY, availableWidth, {
          size: FONTS.base,
          color: COLORS.text.primary
        }, { textAlign: col.align });
      }
    });
    
    // Draw horizontal separator after each row
    if (rowIndex < lineItems.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: tableY - rowHeight },
        end: { x: PAGE.margin + PAGE.inner, y: tableY - rowHeight },
        thickness: 1,
        color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
      });
    }
    
    tableY -= rowHeight;
  });
  
  return tableY;
}
