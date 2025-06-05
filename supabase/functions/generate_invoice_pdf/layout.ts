/**
 * PDF layout constants for invoice generation
 * This file contains the same constants as src/lib/pdf/layout.ts
 * but is duplicated here because Edge Functions cannot import from src/
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
  rowH: 22,               // Increased row height for better readability
  headerH: 28,            // Increased header height
  cols: [0.45, 0.12, 0.20, 0.23], // Adjusted column proportions
  borderColor: 0.4,       // Darker borders for better visibility
  padding: 8,             // Increased cell padding
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
    light: [0.8, 0.8, 0.8],    // Darker light borders for better visibility
    medium: [0.6, 0.6, 0.6],   // Darker medium borders
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
};

// Text handling constants for overflow and truncation
export const TEXT_HANDLING = {
  maxInvoiceCodeWidth: 120,
  maxClientNameWidth: 200,
  maxDescriptionWidth: 180,
  ellipsis: '...',
  truncateThreshold: 0.9,   // When to start truncating (90% of max width)
};

// Updated band positions with improved spacing
export const getBandPositions = () => {
  const topOfHeader = PAGE.height - PAGE.margin - BANDS.header;
  const topOfBill = topOfHeader - 20 - BANDS.bill; // Increased gap between header and bill
  const topOfItems = topOfBill - 20; // Increased gap between bill and items
  const topOfPayment = PAGE.margin + BANDS.footer + BANDS.payment;
  const bottomOfTable = PAGE.margin + BANDS.footer + 140; // Increased space for totals
  
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
