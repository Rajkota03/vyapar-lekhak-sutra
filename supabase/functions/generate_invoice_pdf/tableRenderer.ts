import { PAGE, TABLE, FONTS, COLORS, SPACING, TEXT_HANDLING, getBandPositions, formatCurrency } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import { truncateText } from './textUtils.ts'
import type { LineItem, DrawTextOptions } from './types.ts'

export function renderItemsTable(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions, extraOptions?: any) => void,
  lineItems: LineItem[]
) {
  const positions = getBandPositions()
  let tableY = positions.topOfItems
  
  // Calculate column widths based on proportions
  const colWidths = TABLE.cols.map(ratio => PAGE.inner * ratio)
  
  // Draw table border
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - (lineItems.length * TABLE.rowH + TABLE.headerH),
    PAGE.inner,
    lineItems.length * TABLE.rowH + TABLE.headerH,
    [1, 1, 1], // White background
    COLORS.lines.dark // Dark border
  )
  
  // Table header with proper border and background
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - TABLE.headerH,
    PAGE.inner,
    TABLE.headerH,
    COLORS.background.accent,
    COLORS.lines.dark
  )
  
  // Header text with improved positioning
  const headerY = tableY - TABLE.headerH/2 + 4  // Better vertical centering
  let colX = PAGE.margin
  
  // S.NO column
  drawText('S.NO', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  })
  colX += colWidths[0]
  
  // EQUIPMENT column
  drawText('EQUIPMENT', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  })
  colX += colWidths[1]
  
  // DAYS column
  drawText('DAYS', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  colX += colWidths[2]
  
  // RATE column
  drawText('RATE', colX + colWidths[2]/2, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  colX += colWidths[2]
  
  // AMOUNT column
  drawText('AMOUNT', colX + colWidths[3]/2, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary
  }, { textAlign: 'center' })
  
  tableY -= TABLE.headerH
  
  // Draw vertical lines for columns
  for (let i = 1; i < TABLE.cols.length; i++) {
    let xPos = PAGE.margin
    for (let j = 0; j < i; j++) {
      xPos += colWidths[j]
    }
    
    page.drawLine({
      start: { x: xPos, y: positions.topOfItems },
      end: { x: xPos, y: positions.topOfItems - (lineItems.length * TABLE.rowH + TABLE.headerH) },
      thickness: 1,
      color: rgb(COLORS.lines.dark[0], COLORS.lines.dark[1], COLORS.lines.dark[2]),
    })
  }
  
  // Table rows with proper alignment, borders and alternating backgrounds
  lineItems.forEach((item, rowIndex) => {
    // Alternate row background
    if (rowIndex % 2 === 1) {
      drawRoundedRect(
        page,
        PAGE.margin,
        tableY - TABLE.rowH,
        PAGE.inner,
        TABLE.rowH,
        COLORS.background.light
      )
    }
    
    const rowY = tableY - TABLE.rowH/2 + 4  // Better vertical centering for text
    colX = PAGE.margin
    
    // S.NO column (centered)
    drawText((rowIndex + 1).toString(), colX + colWidths[0]/2, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'center' })
    colX += colWidths[0]
    
    // Equipment description with truncation
    const truncatedDesc = truncateText(
      item.description,
      colWidths[1] - TABLE.padding * 2,
      FONTS.base
    )
    
    drawText(truncatedDesc, colX + TABLE.padding, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    })
    colX += colWidths[1]
    
    // Days/Quantity (centered)
    drawText(item.qty.toString(), colX + colWidths[1]/2, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'center' })
    colX += colWidths[2]
    
    // Rate (right-aligned)
    const rateText = formatCurrency(Number(item.unit_price))
    drawText(rateText, colX + colWidths[2] - TABLE.padding, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'right' })
    colX += colWidths[2]
    
    // Amount (right-aligned)
    const amountText = formatCurrency(Number(item.amount))
    drawText(amountText, colX + colWidths[3] - TABLE.padding, rowY, { 
      size: FONTS.base,
      color: COLORS.text.primary
    }, { textAlign: 'right' })
    
    // Draw horizontal line after each row
    if (rowIndex < lineItems.length - 1) {
      page.drawLine({
        start: { x: PAGE.margin, y: tableY - TABLE.rowH },
        end: { x: PAGE.margin + PAGE.inner, y: tableY - TABLE.rowH },
        thickness: 1,
        color: rgb(COLORS.lines.light[0], COLORS.lines.light[1], COLORS.lines.light[2]),
      })
    }
    
    tableY -= TABLE.rowH
  })
  
  return tableY // Return the new Y position after the table
}
