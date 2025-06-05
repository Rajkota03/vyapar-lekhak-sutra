
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
  margin: 60,             // Increased from 40 to 60 (reduces inner width by 40 points)
  inner: 595.28 - 60 * 2, // Inner content width (now 475.28 instead of 515.28)
};

export const BANDS = {
  header: 120,
  bill: 90,
  payment: 110,
  footer: 90,
};

export const TABLE = {
  rowH: 28,               // Standard row height
  headerH: 32,            // Header height
  cols: [0.07, 0.48, 0.15, 0.15, 0.15], // Column proportions optimized for content
  borderColor: 0.4,       // Border color intensity
  padding: 12,            // Cell padding for text containment
};

export const FONTS = {
  tiny: 7,
  small: 8,
  base: 9,
  medium: 10,
  large: 12,
  h1: 16,
  h2: 13,
  h3: 11,
  boldInc: 1,
};

export const COLORS = {
  text: {
    primary: [0, 0, 0],       // Black
    secondary: [0.25, 0.25, 0.25], // Dark gray
    muted: [0.5, 0.5, 0.5],   // Medium gray
    light: [0.65, 0.65, 0.65], // Light gray
  },
  background: {
    light: [0.96, 0.96, 0.96], // Very light gray
    medium: [0.92, 0.92, 0.92], // Light gray
    accent: [0.88, 0.88, 0.88], // Accent gray
  },
  lines: {
    light: [0.8, 0.8, 0.8],    // Light borders
    medium: [0.6, 0.6, 0.6],   // Medium borders
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
  lineHeight: 16,           // Line height for text wrapping
  itemSpacing: 10,          // Spacing between items
  sectionGap: 25,           // Gap between sections
};

// Text handling constants for precise overflow control
export const TEXT_HANDLING = {
  maxInvoiceCodeWidth: 140,  // Max width for invoice codes
  maxClientNameWidth: 220,   // Max width for client names
  maxDescriptionWidth: 200,  // Max width for descriptions
  ellipsis: '...',
  truncateThreshold: 0.9,    // When to start truncating (90% of max width)
  maxLineLength: 40,         // Maximum characters per line for wrapping
  maxLinesPerCell: 3,        // Maximum number of lines per table cell
};

// Updated band positions with improved spacing
export const getBandPositions = () => {
  const topOfHeader = PAGE.height - PAGE.margin - BANDS.header;
  const topOfBill = topOfHeader - 25 - BANDS.bill;
  const topOfItems = topOfBill - 25;
  const topOfPayment = PAGE.margin + BANDS.footer + BANDS.payment;
  const bottomOfTable = PAGE.margin + BANDS.footer + 150;
  
  return {
    topOfHeader,
    topOfBill,
    topOfItems,
    topOfPayment,
    bottomOfTable,
  };
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
