
/**
 * Text utilities for PDF generation
 * Handles text measurement, wrapping, and truncation with improved accuracy
 */

import { FONTS, TEXT_HANDLING } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';

// Font metrics for Helvetica (standard PDF font)
const HELVETICA_METRICS = {
  // Character width ratios relative to font size
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
  defaultWidth: 0.556, // Default for unmapped characters
  spaceWidth: 0.278,
  lineHeight: 1.2,
};

// Precise text width calculation using Helvetica metrics
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

// Truncate text to fit within exact pixel width with ellipsis
export function truncateText(text: string, maxWidth: number, fontSize: number): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  const ellipsis = TEXT_HANDLING.ellipsis;
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

// Simplified text wrapping with exact width constraints
export function wrapLines(text: string, maxWidth: number, fontSize: number, maxLines: number = 3): string[] {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureText(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      // Current line is full, start new line
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
        
        // Check if we've reached max lines
        if (lines.length >= maxLines) {
          // Truncate the remaining text
          const remainingWords = words.slice(words.indexOf(word));
          const remainingText = remainingWords.join(' ');
          currentLine = truncateText(remainingText, maxWidth, fontSize);
          break;
        }
      } else {
        // Single word is too long, truncate it
        currentLine = truncateText(word, maxWidth, fontSize);
        break;
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Ensure we don't exceed max lines
  return lines.slice(0, maxLines);
}

// Create clipped text drawing function with exact boundaries
export function createClippedDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, maxWidth: number, options: any = {}) => {
    const fontSize = options.size || FONTS.base;
    
    // Save graphics state
    page.pushOperators(page.drawText('', x, y, { ...options, size: 0 }));
    
    // Set clipping rectangle
    page.pushOperators(
      page.pushGraphicsState(),
      page.moveTo(x, y - fontSize),
      page.lineTo(x + maxWidth, y - fontSize),
      page.lineTo(x + maxWidth, y + fontSize),
      page.lineTo(x, y + fontSize),
      page.closePath(),
      page.clip(),
      page.endPath()
    );
    
    // Draw the text (will be clipped)
    const clippedText = truncateText(text, maxWidth, fontSize);
    drawText(clippedText, x, y, options);
    
    // Restore graphics state
    page.pushOperators(page.popGraphicsState());
  };
}

// Enhanced wrapped text drawing with proper line height and clipping
export function createWrappedDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, maxWidth: number, lineHeight: number, options: any = {}, maxLines: number = 3) => {
    const fontSize = options.size || FONTS.base;
    const lines = wrapLines(text, maxWidth, fontSize, maxLines);
    
    lines.forEach((line, index) => {
      const lineY = y - (index * lineHeight);
      const clippedLine = truncateText(line, maxWidth, fontSize);
      drawText(clippedLine, x, lineY, options);
    });
    
    return lines.length;
  };
}

// Format numeric values with proper overflow handling
export function formatNumericValue(value: string | number, maxWidth: number, fontSize: number): string {
  if (value === null || value === undefined) return '';
  
  let formattedValue: string;
  
  if (typeof value === 'number') {
    // Format as currency without symbol first
    formattedValue = value.toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else {
    formattedValue = value.toString();
  }
  
  // Check if it fits
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

// Clip text to exact width without ellipsis
export function clipText(text: string, maxWidth: number, fontSize: number): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  // Binary search for exact fit
  let low = 0;
  let high = text.length;
  let bestFit = '';
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testText = text.substring(0, mid);
    const testWidth = measureText(testText, fontSize);
    
    if (testWidth <= maxWidth) {
      bestFit = testText;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return bestFit;
}
