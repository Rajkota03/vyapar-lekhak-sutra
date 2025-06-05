/**
 * Text utilities for PDF generation
 * Handles text measurement, wrapping, and truncation
 */

import { FONTS, TEXT_HANDLING } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';

// Improved text width calculation with font-specific adjustments
export function measureText(text: string, fontSize: number): number {
  // More accurate character width calculation
  // Different characters have different widths, so we use a weighted approach
  if (!text) return 0;
  
  // Character width multipliers by category
  const charWidths = {
    narrow: 0.4, // i, l, I, !, etc.
    normal: 0.6, // most characters
    wide: 0.85,  // m, w, W, etc.
    extraWide: 1.0 // @, M, etc.
  };
  
  // Categorize characters
  const narrowChars = 'ijl!|.,:;\'`()-[]{}';
  const wideChars = 'mwWQAMNO%#@&';
  
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (narrowChars.includes(char)) {
      totalWidth += fontSize * charWidths.narrow;
    } else if (wideChars.includes(char)) {
      totalWidth += fontSize * charWidths.wide;
    } else {
      totalWidth += fontSize * charWidths.normal;
    }
  }
  
  // Add a small buffer for accuracy
  return totalWidth * 1.05;
}

// Enhanced truncate text with ellipsis if it exceeds maxWidth
export function truncateText(text: string, maxWidth: number, fontSize: number): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  const ellipsis = TEXT_HANDLING.ellipsis;
  const ellipsisWidth = measureText(ellipsis, fontSize);
  const availableWidth = maxWidth - ellipsisWidth;
  
  // Binary search for the optimal truncation point
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
  
  // Ensure we don't return just the ellipsis unless absolutely necessary
  if (bestFit.length === 0 && text.length > 0) {
    bestFit = text.substring(0, 1);
  }
  
  return bestFit + ellipsis;
}

// Improved wrap text into multiple lines based on maxWidth
export function wrapLines(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text) return [''];
  
  // Enforce maximum lines per cell
  const maxLines = TEXT_HANDLING.maxLinesPerCell || 3;
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Handle very long words by breaking them if necessary
    if (measureText(word, fontSize) > maxWidth) {
      // If current line is not empty, push it first
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
        
        // Check if we've reached the maximum number of lines
        if (lines.length >= maxLines - 1) {
          // Add the truncated word as the last line
          const lastLine = truncateText(word, maxWidth, fontSize);
          lines.push(lastLine);
          return lines;
        }
      }
      
      // Break the long word into chunks that fit
      let remainingWord = word;
      while (remainingWord.length > 0) {
        let i = 1;
        while (i <= remainingWord.length && 
               measureText(remainingWord.substring(0, i), fontSize) <= maxWidth) {
          i++;
        }
        i--; // Step back to last fitting position
        
        // Add hyphen if breaking in the middle of the word
        const chunk = i < remainingWord.length ? 
                      remainingWord.substring(0, i) + '-' : 
                      remainingWord.substring(0, i);
        
        lines.push(chunk);
        remainingWord = remainingWord.substring(i);
        
        // Check if we've reached the maximum number of lines
        if (lines.length >= maxLines) {
          // If there's still remaining text, replace the last character with ellipsis
          if (remainingWord.length > 0) {
            const lastLine = lines[lines.length - 1];
            lines[lines.length - 1] = lastLine.substring(0, lastLine.length - 1) + TEXT_HANDLING.ellipsis;
          }
          return lines;
        }
      }
      continue;
    }
    
    // Normal word handling
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureText(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
      
      // Check if we've reached the maximum number of lines
      if (lines.length >= maxLines - 1) {
        // If there are more words, add ellipsis to the current word
        if (i < words.length - 1) {
          currentLine = truncateText(currentLine + ' ' + words.slice(i + 1).join(' '), maxWidth, fontSize);
        }
        break;
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // If we have more lines than allowed, truncate the last line
  if (lines.length > maxLines) {
    lines.splice(maxLines);
    const lastLine = lines[lines.length - 1];
    if (lastLine.length > 3 && !lastLine.endsWith(TEXT_HANDLING.ellipsis)) {
      lines[lines.length - 1] = lastLine.substring(0, lastLine.length - 3) + TEXT_HANDLING.ellipsis;
    }
  }
  
  return lines;
}

// Enhanced clip text to fit within maxWidth
export function clipText(text: string, maxWidth: number, fontSize: number, addEllipsis = true): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  if (addEllipsis) {
    return truncateText(text, maxWidth, fontSize);
  }
  
  // Binary search for the optimal clipping point
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

// Create a function that draws text with proper wrapping and clipping
export function createWrappedDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, maxWidth: number, lineHeight: number, options: any = {}) => {
    const fontSize = options.size || FONTS.base;
    const lines = wrapLines(text, maxWidth, fontSize);
    
    lines.forEach((line, index) => {
      drawText(line, x, y - (index * lineHeight), options);
    });
    
    return lines.length; // Return number of lines drawn
  };
}

// Create a function that draws text with clipping
export function createClippedDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, maxWidth: number, options: any = {}) => {
    const fontSize = options.size || FONTS.base;
    const clippedText = clipText(text, maxWidth, fontSize);
    drawText(clippedText, x, y, options);
  };
}

// New function to handle numeric values with proper formatting and overflow prevention
export function formatNumericValue(value: string | number, maxWidth: number, fontSize: number): string {
  if (value === null || value === undefined) return '';
  
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('en-IN', { minimumFractionDigits: 2 })
    : value.toString();
  
  const textWidth = measureText(formattedValue, fontSize);
  if (textWidth <= maxWidth) return formattedValue;
  
  // For numeric values, try scientific notation if it doesn't fit
  if (typeof value === 'number' && value > 9999) {
    const scientific = value.toExponential(2);
    const scientificWidth = measureText(scientific, fontSize);
    
    if (scientificWidth <= maxWidth) return scientific;
  }
  
  // If still too long, truncate with ellipsis
  return truncateText(formattedValue, maxWidth, fontSize);
}
