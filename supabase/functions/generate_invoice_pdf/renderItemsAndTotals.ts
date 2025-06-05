import { PAGE, FONTS, COLORS, getBandPositions, TABLE, SPACING, formatCurrency } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { truncateText } from './textUtils.ts';
import { drawRoundedRect } from './pdfUtils.ts';
import type { InvoiceData, LineItem, DrawTextOptions } from './types.ts';

export function renderItemsAndTotals(
  page: any,
  drawText: (
    t: string, x: number, y: number,
    o?: DrawTextOptions,
    eo?: any
  ) => void,
  inv: InvoiceData,
  items: LineItem[],
) {
  const pos = getBandPositions();
  let cursor = pos.topOfItems - 30;

  /* Calculations for Totals */
  const subtotal = items.reduce((sum, item) => sum + ((item.qty || 1) * (item.unit_price || 0)), 0);
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  if (inv.use_igst) {
    igstAmount = subtotal * ((Number(inv.igst_pct) || 18) / 100);
  } else {
    cgstAmount = subtotal * ((Number(inv.cgst_pct) || 9) / 100);
    sgstAmount = subtotal * ((Number(inv.sgst_pct) || 9) / 100);
  }
  const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

  console.log('Totals calculation:', { subtotal, cgstAmount, sgstAmount, igstAmount, grandTotal });

  /* Totals Section with proper alignment and visual grouping */
  const totalsWidth = PAGE.inner * 0.4; // 40% of inner width
  const totalsX = PAGE.width - PAGE.margin - totalsWidth;
  let totalsY = cursor - 30; // Position below the table with some spacing
  
  // Draw totals section with light background
  drawRoundedRect(
    page,
    totalsX,
    totalsY - 120, // Height to accommodate all rows plus padding
    totalsWidth,
    120,
    COLORS.background.light,
    COLORS.lines.medium
  );
  
  // Totals section layout
  const labelX = totalsX + 15;
  const valueX = totalsX + totalsWidth - 15;
  totalsY -= 20; // Start position inside the box
  
  // Subtotal row
  drawText('Subtotal', labelX, totalsY, { 
    size: FONTS.base, 
    color: COLORS.text.primary 
  });
  drawText(formatCurrency(subtotal), valueX, totalsY, { 
    size: FONTS.base, 
    color: COLORS.text.primary 
  }, { textAlign: 'right' });
  totalsY -= 20;
  
  // Tax rows
  if (inv.use_igst) {
    if (igstAmount > 0) {
      drawText(`IGST (${inv.igst_pct || 18}%)`, labelX, totalsY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary 
      });
      drawText(formatCurrency(igstAmount), valueX, totalsY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary 
      }, { textAlign: 'right' });
      totalsY -= 20;
    }
  } else {
    if (cgstAmount > 0) {
      drawText(`CGST (${inv.cgst_pct || 9}%)`, labelX, totalsY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary 
      });
      drawText(formatCurrency(cgstAmount), valueX, totalsY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary 
      }, { textAlign: 'right' });
      totalsY -= 20;
    }
    
    if (sgstAmount > 0) {
      drawText(`SGST (${inv.sgst_pct || 9}%)`, labelX, totalsY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary 
      });
      drawText(formatCurrency(sgstAmount), valueX, totalsY, { 
        size: FONTS.base, 
        color: COLORS.text.secondary 
      }, { textAlign: 'right' });
      totalsY -= 20;
    }
  }
  
  // Separator line before grand total
  page.drawLine({
    start: { x: totalsX + 10, y: totalsY + 5 },
    end: { x: totalsX + totalsWidth - 10, y: totalsY + 5 },
    thickness: 1,
    color: rgb(COLORS.lines.medium[0], COLORS.lines.medium[1], COLORS.lines.medium[2]),
  });
  totalsY -= 15;
  
  // Grand total with emphasis
  const grandTotalBoxHeight = 30;
  drawRoundedRect(
    page,
    totalsX + 10,
    totalsY - grandTotalBoxHeight + 5,
    totalsWidth - 20,
    grandTotalBoxHeight,
    COLORS.background.medium,
    COLORS.lines.dark
  );
  
  drawText('GRAND TOTAL', labelX + 5, totalsY - grandTotalBoxHeight/2 + 5, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary 
  });
  
  drawText(formatCurrency(grandTotal), valueX - 5, totalsY - grandTotalBoxHeight/2 + 5, { 
    size: FONTS.medium, 
    bold: true,
    color: COLORS.text.primary 
  }, { textAlign: 'right' });
  
  return totalsY - grandTotalBoxHeight - 20; // Return the new Y position after totals section
}
