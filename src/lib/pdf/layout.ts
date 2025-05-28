
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
  header: 120,
  bill: 90,
  payment: 110,
  footer: 90,
};

export const TABLE = {
  rowH: 18,               // Increased row height for better readability
  headerH: 24,            // Increased header height
  cols: [0.45, 0.12, 0.20, 0.23], // Adjusted column proportions
  borderColor: 0.85,      // Slightly darker borders
  padding: 6,             // Cell padding
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
};

// Updated band positions with improved spacing
export const getBandPositions = () => {
  const topOfHeader = PAGE.height - PAGE.margin - BANDS.header;
  const topOfBill = topOfHeader - 10 - BANDS.bill;
  const topOfItems = topOfBill - 10;
  const topOfPayment = PAGE.margin + BANDS.footer + BANDS.payment;
  
  return {
    topOfHeader,
    topOfBill,
    topOfItems,
    topOfPayment,
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
