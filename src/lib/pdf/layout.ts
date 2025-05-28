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
  inner: 595.28 - 40 * 2, // Inner content width
};

export const BANDS = {
  header: 140,            // Increased for better logo placement
  bill: 100,              // Increased for better spacing
  totals: 140,            // Increased for better payment note layout
  footer: 100,            // Footer space
};

export const COMPANY_BLOCK = {
  rightColumnWidth: 200,  // width reserved for meta in header
  logoMax: 120,           // px before scaling
  logoScale: 0.25,        // default scale for logo
  logoPosition: {
    x: 40,                // Left margin
    y: 40,                // Top margin from top of page
  },
  companyNamePosition: {
    x: 40,                // Left margin
    y: 180,               // Position below logo
  }
};

export const BILL_BAR = {
  height: 160,
  bgGray: 0.95,           // for pdf-lib rgb values (0-1) - slightly lighter gray
  padding: 20,
  detailsWidth: 120,      // Width for invoice details (number, date, etc.)
  detailsLabelWidth: 100, // Width for invoice detail labels
  detailsValueWidth: 100, // Width for invoice detail values
};

export const TABLE = {
  startY: 430,
  rowH: 18,               // Increased row height for better readability
  headerH: 24,            // Increased header height
  cols: [0.45, 0.12, 0.20, 0.23], // Adjusted column proportions
  headerBgColor: 1,       // White for header
  altRowBgColor: 0.98,    // Alternate row background color
  borderColor: 0.85,      // Slightly darker borders
  padding: 6,             // Cell padding
  lineSpacing: 5,         // Space between text and horizontal lines
};

export const FONTS = {
  tiny: 7,
  small: 8,
  base: 9,
  medium: 10,
  large: 12,
  h1: 16,                 // Increased header sizes
  h2: 13,
  h3: 11,
  boldInc: 1,
};

export const COLORS = {
  text: {
    primary: [0, 0, 0],       // Black
    secondary: [0.25, 0.25, 0.25], // Darker gray
    muted: [0.5, 0.5, 0.5],   // Medium gray
    light: [0.65, 0.65, 0.65], // Light gray
  },
  background: {
    light: [0.96, 0.96, 0.96], // Very light gray for bill bar
    medium: [0.92, 0.92, 0.92], // Light gray for totals
    accent: [0.88, 0.88, 0.88], // Accent gray
  },
  lines: {
    light: [0.9, 0.9, 0.9],    // Light borders
    medium: [0.7, 0.7, 0.7],   // Medium borders
    dark: [0.4, 0.4, 0.4],     // Dark borders
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
  lineHeight: 14,           // Increased line height
  itemSpacing: 8,           // Spacing between items
  sectionGap: 20,           // Gap between sections
  afterLine: 10,            // Space after horizontal lines
  beforeLine: 5,            // Space before horizontal lines
};

// Calculate band positions with improved spacing
export const getBandPositions = () => {
  const topOfHeader = PAGE.height - PAGE.margin - BANDS.header;
  const topOfBill = topOfHeader - SPACING.sectionGap - BANDS.bill;
  const bottomOfTable = PAGE.margin + BANDS.totals + BANDS.footer + SPACING.sectionGap;
  const yTotals = PAGE.margin + BANDS.footer + BANDS.totals - 25;
  const footerRuleY = PAGE.margin + BANDS.footer + 90;
  
  return {
    topOfHeader,
    topOfBill,
    bottomOfTable,
    yTotals,
    footerRuleY,
  };
};

// Positions for various sections
export const POSITIONS = {
  header: {
    startY: PAGE.height - PAGE.margin,
  },
  billTo: {
    x: PAGE.margin,
    y: PAGE.height - PAGE.margin - BANDS.header - SPACING.sectionGap - BILL_BAR.height,
    width: PAGE.width - (PAGE.margin * 2),
    labelY: 742,
    contentStartY: 732,
    lineSpacing: 12,
  },
  table: {
    headerY: TABLE.startY - 13,
    // Adjusted column positions for better alignment
    colPositions: [10, 320, 400, 480], // X positions for each column
    colWidths: [300, 60, 80, 80],      // Widths for each column
  },
  totals: {
    x: 200,
    lineSpacing: 15,
    width: 120,           // Width for totals labels
    valueWidth: 80,       // Width for totals values
    rightAlign: 20,       // Right margin for right-aligned text
  },
  footer: {
    startY: 120,
    linePosition: 70,     // Y position for signature line
    datePosition: 50,     // Y position for date under signature
  },
  grandTotal: {
    width: 200,
    height: 40,
    bgColor: [0.95, 0.95, 0.95], // Light gray
    padding: 10,          // Padding inside grand total box
  },
  payment: {
    lineHeight: 12,       // Line height for payment instructions
    maxWidth: 300,        // Maximum width for payment instruction lines
  }
};

// Helper functions for consistent formatting
export const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Text overflow handling
export const TEXT_HANDLING = {
  maxInvoiceCodeLength: 15,    // Maximum length for invoice code before truncating
  maxClientNameLength: 30,     // Maximum length for client name before truncating
  maxItemDescLength: 40,       // Maximum length for item description before truncating
  ellipsis: '...',             // Characters to use for truncation
  
  // Helper function to truncate text with ellipsis if needed
  truncateWithEllipsis: (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};
