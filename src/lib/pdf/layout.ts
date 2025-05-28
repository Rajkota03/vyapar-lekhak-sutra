/**
 * Shared layout constants for invoice PDF generation
 * 
 * This file serves as a single source of truth for measurements used by both:
 * 1. The Edge Function (server-side PDF generation)
 * 2. The React preview component (client-side visualization)
 */

export const PAGE = {
  width: 595.28,          // A4 portrait (pt)
  height: 841.89,
  margin: 40,
};

export const COMPANY_BLOCK = {
  rightColumnWidth: 180,  // width reserved for meta in header
  logoMax: 100,           // px before scaling
};

export const BILL_BAR = {
  height: 58,
  bgGray: 0.94,           // for pdf-lib rgb values (0-1)
};

export const TABLE = {
  startY: 690,
  rowH: 20,
  cols: [0.48, 0.12, 0.20, 0.20], // Description, Qty, Rate, Amount
  headerBgColor: 0.95,    // Light gray for header (0-1)
  altRowBgColor: 0.98,    // Alternate row background color
  borderColor: 0.9,       // Border color for table cells
};

export const FONTS = {
  base: 9,
  small: 8,
  medium: 10,
  large: 12,
  h1: 14,
  h2: 20,
  boldInc: 1,
};

export const COLORS = {
  text: {
    primary: [0, 0, 0],       // Black
    secondary: [0.3, 0.3, 0.3], // Dark gray
    muted: [0.4, 0.4, 0.4],   // Medium gray
  },
  background: {
    light: [0.98, 0.98, 0.98], // Very light gray
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

// Positions for various sections
export const POSITIONS = {
  header: {
    startY: PAGE.height - PAGE.margin,
  },
  billTo: {
    labelY: 742,
    contentStartY: 732,
    lineSpacing: 12,
  },
  table: {
    headerY: TABLE.startY - 13,
    colPositions: [50, 320, 370, 480], // X positions for each column
  },
  totals: {
    x: PAGE.width - 200,
    lineSpacing: 15,
  },
  footer: {
    startY: 120,
  }
};
