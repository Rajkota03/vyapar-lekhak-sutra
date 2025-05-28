
import { PAGE, TABLE, FONTS, COLORS, SPACING, getBandPositions, formatCurrency } from './layout.ts'
import { drawRoundedRect } from './pdfUtils.ts'
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import type { LineItem, DrawTextOptions } from './types.ts'

export function renderItemsTable(
  page: any,
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions) => void,
  lineItems: LineItem[]
) {
  const positions = getBandPositions()
  let tableY = positions.topOfBill - SPACING.sectionGap
  
  // Enhanced table headers with better spacing
  const colWidths = TABLE.cols.map(ratio => PAGE.inner * ratio)
  let colX = PAGE.margin
  
  // Table header background
  drawRoundedRect(
    page,
    PAGE.margin,
    tableY - TABLE.headerH + 5,
    PAGE.inner,
    TABLE.headerH,
    COLORS.background.accent
  )
  
  // Header text with improved positioning
  const headerY = tableY - 12  // Better vertical centering
  drawText('EQUIPMENT', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  colX += colWidths[0]
  
  drawText('PKG', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  colX += colWidths[1]
  
  drawText('Rate', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  colX += colWidths[2]
  
  drawText('Amount', colX + TABLE.padding, headerY, { 
    size: FONTS.medium, 
    bold: true,
    color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
  })
  
  tableY -= TABLE.headerH + SPACING.itemSpacing
  
  // Table rows with proper alignment and spacing
  let rowIndex = 0
  
  while (tableY - TABLE.rowH > positions.bottomOfTable && rowIndex < (lineItems?.length || 0)) {
    const item = lineItems![rowIndex]
    const rowY = tableY - TABLE.rowH + 8  // Better vertical centering for text
    
    // Alternate row background
    if (rowIndex % 2 === 1) {
      drawRoundedRect(
        page,
        PAGE.margin,
        tableY - TABLE.rowH + 2,
        PAGE.inner,
        TABLE.rowH,
        [0.98, 0.98, 0.98]
      )
    }
    
    colX = PAGE.margin
    
    // Equipment description
    drawText(item.description, colX + TABLE.padding, rowY, { 
      size: FONTS.base,
      color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
    })
    colX += colWidths[0]
    
    // Package quantity (centered)
    const qtyX = colX + (colWidths[1] / 2) - 5  // Better centering
    drawText(item.qty.toString(), qtyX, rowY, { 
      size: FONTS.base,
      color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
    })
    colX += colWidths[1]
    
    // Rate (right-aligned)
    const rateText = formatCurrency(Number(item.unit_price))
    const rateX = colX + colWidths[2] - TABLE.padding - 50  // Better right alignment
    drawText(rateText, rateX, rowY, { 
      size: FONTS.base,
      color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
    })
    colX += colWidths[2]
    
    // Amount (right-aligned)
    const amountText = formatCurrency(Number(item.amount))
    const amountX = colX + colWidths[3] - TABLE.padding - 50  // Better right alignment
    drawText(amountText, amountX, rowY, { 
      size: FONTS.base,
      color: { r: COLORS.text.primary[0], g: COLORS.text.primary[1], b: COLORS.text.primary[2] }
    })
    
    // Only draw separator line if not the last row and with proper spacing
    if (rowIndex < (lineItems?.length || 0) - 1) {
      page.drawLine({
        start: { x: PAGE.margin + 10, y: tableY - TABLE.rowH },
        end: { x: PAGE.width - PAGE.margin - 10, y: tableY - TABLE.rowH },
        thickness: 0.5,
        color: rgb(COLORS.lines.light[0], COLORS.lines.light[1], COLORS.lines.light[2]),
      })
    }
    
    tableY -= TABLE.rowH
    rowIndex++
  }
}
