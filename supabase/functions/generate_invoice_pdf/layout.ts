
/**
 * PDF layout constants for invoice generation
 * This file contains the same constants as src/lib/pdf/layout.ts
 * but is duplicated here because Edge Functions cannot import from src/
 */

export const PAGE = {
  width: 595.28,          // A4 portrait (pt)
  height: 841.89,
  margin: 40,
  inner: 595.28 - 40 * 2, // Inner content width
};

export const BANDS = {
  header: 120,            // Logo + company block
  bill: 90,               // Bill-to + invoice meta grey bar
  totals: 120,            // Payment note + totals table
  footer: 100,            // Thank-you + signature
};

export const TABLE = {
  rowH: 16,               // Height per table row
  headerH: 20,            // Table header height
  cols: [0.48, 0.12, 0.20, 0.20], // Description, Qty, Rate, Amount percentages
  borderColor: 0.9,       // Border color for table cells
};

export const FONTS = {
  base: 9,
  small: 8,
  medium: 10,
  large: 11,
  h1: 14,
  h2: 12,
  boldInc: 1,
};

export const COLORS = {
  text: {
    primary: [0, 0, 0],       // Black
    secondary: [0.3, 0.3, 0.3], // Dark gray
    muted: [0.4, 0.4, 0.4],   // Medium gray
  },
  background: {
    light: [0.94, 0.94, 0.94], // Very light gray for bill bar
    medium: [0.95, 0.95, 0.95], // Light gray
    dark: [0.9, 0.9, 0.9],     // Medium gray
  }
};

export const SIGNATURE = {
  width: 120,
  height: 40,
  scale: 0.3,
  lineWidth: 100,
};

export const SPACING = {
  paragraph: 15,
  section: 30,
  lineHeight: 12,
};

// Calculate band positions
export const getBandPositions = () => {
  const topOfHeader = PAGE.height - PAGE.margin - BANDS.header;
  const topOfBill = topOfHeader - 10 - BANDS.bill;
  const bottomOfTable = PAGE.margin + BANDS.totals + BANDS.footer + 20;
  const yTotals = PAGE.margin + BANDS.footer + BANDS.totals - 18;
  const footerRuleY = PAGE.margin + BANDS.footer + 90;
  
  return {
    topOfHeader,
    topOfBill,
    bottomOfTable,
    yTotals,
    footerRuleY,
  };
};
