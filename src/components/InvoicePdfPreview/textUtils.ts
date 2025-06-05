
/**
 * Client-side text utilities that mirror the server-side PDF text handling
 * Ensures consistent text measurement and truncation between preview and PDF
 */

// Helvetica character width metrics (same as server-side)
const HELVETICA_METRICS = {
  charWidths: {
    // Narrow characters
    'i': 0.278, 'j': 0.278, 'l': 0.278, 't': 0.278, 'f': 0.278,
    'I': 0.278, '!': 0.278, '|': 0.278, '.': 0.278, ',': 0.278,
    ':': 0.278, ';': 0.278, "'": 0.278, '`': 0.278, '(': 0.333,
    ')': 0.333, '[': 0.278, ']': 0.278, '{': 0.334, '}': 0.334,
    // Regular characters
    'a': 0.556, 'b': 0.556, 'c': 0.500, 'd': 0.556, 'e': 0.556,
    'g': 0.556, 'h': 0.556, 'k': 0.500, 'n': 0.556, 'o': 0.556,
    'p': 0.556, 'q': 0.556, 'r': 0.333, 's': 0.500, 'u': 0.556,
    'v': 0.500, 'x': 0.500, 'y': 0.500, 'z': 0.500,
    'A': 0.667, 'B': 0.667, 'C': 0.722, 'D': 0.722, 'E': 0.667,
    'F': 0.611, 'G': 0.778, 'H': 0.722, 'J': 0.500, 'K': 0.667,
    'L': 0.556, 'N': 0.722, 'O': 0.778, 'P': 0.667, 'Q': 0.778,
    'R': 0.722, 'S': 0.667, 'T': 0.611, 'U': 0.722, 'V': 0.667,
    'X': 0.667, 'Y': 0.667, 'Z': 0.611,
    // Numbers
    '0': 0.556, '1': 0.556, '2': 0.556, '3': 0.556, '4': 0.556,
    '5': 0.556, '6': 0.556, '7': 0.556, '8': 0.556, '9': 0.556,
    // Wide characters
    'm': 0.833, 'w': 0.722, 'W': 0.944, 'M': 0.833,
    // Special characters
    ' ': 0.278, '-': 0.333, '_': 0.556, '=': 0.584,
    '+': 0.584, '*': 0.389, '/': 0.278, '\\': 0.278,
    '@': 1.015, '#': 0.556, '$': 0.556, '%': 0.889,
    '^': 0.469, '&': 0.667, '~': 0.584,
    '₹': 0.556, // Rupee symbol
    'Rs': 0.889, // Rs. abbreviation width
  },
  defaultWidth: 0.556,
  spaceWidth: 0.278,
};

// Precise text width calculation (matches server-side)
export function measureText(text: string, fontSize: number): number {
  if (!text) return 0;
  
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = HELVETICA_METRICS.charWidths[char] || HELVETICA_METRICS.defaultWidth;
    totalWidth += charWidth * fontSize;
  }
  
  return totalWidth;
}

// Truncate text with ellipsis (matches server-side)
export function truncateText(text: string, maxWidth: number, fontSize: number): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  const ellipsis = '...';
  const ellipsisWidth = measureText(ellipsis, fontSize);
  const availableWidth = maxWidth - ellipsisWidth;
  
  if (availableWidth <= 0) return ellipsis;
  
  // Binary search for optimal truncation point
  let low = 0;
  let high = text.length;
  let bestFit = '';
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testText = text.substring(0, mid);
    const testWidth = measureText(testText, fontSize);
    
    if (testWidth <= availableWidth) {
      bestFit = testText;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return bestFit.length > 0 ? bestFit + ellipsis : ellipsis;
}

// Format numeric values with overflow handling (matches server-side)
export function formatNumericValue(value: string | number, maxWidth: number, fontSize: number): string {
  if (value === null || value === undefined) return '';
  
  let formattedValue: string;
  
  if (typeof value === 'number') {
    formattedValue = value.toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else {
    formattedValue = value.toString();
  }
  
  const textWidth = measureText(formattedValue, fontSize);
  if (textWidth <= maxWidth) return formattedValue;
  
  // Try shorter formats for numbers
  if (typeof value === 'number') {
    // Try without decimals
    const shortFormat = Math.round(value).toLocaleString('en-IN');
    if (measureText(shortFormat, fontSize) <= maxWidth) return shortFormat;
    
    // Try K format for thousands
    if (value >= 1000) {
      const kValue = (value / 1000).toFixed(1) + 'K';
      if (measureText(kValue, fontSize) <= maxWidth) return kValue;
    }
    
    // Try scientific notation
    if (value >= 10000) {
      const scientific = value.toExponential(1);
      if (measureText(scientific, fontSize) <= maxWidth) return scientific;
    }
  }
  
  // Final fallback: truncate with ellipsis
  return truncateText(formattedValue, maxWidth, fontSize);
}
