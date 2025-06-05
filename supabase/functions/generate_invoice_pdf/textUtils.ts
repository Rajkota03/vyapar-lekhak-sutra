/**
 * Text utilities for PDF generation
 * Handles text measurement, wrapping, and truncation
 */

import { FONTS, TEXT_HANDLING } from './layout.ts';
import { rgb } from 'https://esm.sh/pdf-lib@1.17.1';

// Approximate text width calculation
export function measureText(text: string, fontSize: number): number {
  // Average character width as a fraction of font size
  const avgCharWidth = 0.6;
  return text.length * fontSize * avgCharWidth;
}

// Truncate text with ellipsis if it exceeds maxWidth
export function truncateText(text: string, maxWidth: number, fontSize: number): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  const ellipsis = TEXT_HANDLING.ellipsis;
  const ellipsisWidth = measureText(ellipsis, fontSize);
  const availableWidth = maxWidth - ellipsisWidth;
  
  // Calculate how many characters we can fit
  const avgCharWidth = 0.6 * fontSize;
  const maxChars = Math.floor(availableWidth / avgCharWidth);
  
  // Ensure we don't go negative
  if (maxChars <= 0) return ellipsis;
  
  return text.substring(0, maxChars) + ellipsis;
}

// Wrap text into multiple lines based on maxWidth
export function wrapLines(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureText(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Clip text to fit within maxWidth
export function clipText(text: string, maxWidth: number, fontSize: number, addEllipsis = true): string {
  if (!text) return '';
  
  const textWidth = measureText(text, fontSize);
  if (textWidth <= maxWidth) return text;
  
  // Calculate how many characters we can fit
  const avgCharWidth = 0.6 * fontSize;
  const maxChars = Math.floor(maxWidth / avgCharWidth);
  
  // Ensure we don't go negative
  if (maxChars <= 0) return '';
  
  if (addEllipsis) {
    const ellipsis = '...';
    const ellipsisWidth = measureText(ellipsis, fontSize);
    const availableWidth = maxWidth - ellipsisWidth;
    const availableChars = Math.floor(availableWidth / avgCharWidth);
    
    if (availableChars <= 0) return ellipsis;
    return text.substring(0, availableChars) + ellipsis;
  }
  
  return text.substring(0, maxChars);
}

// Create a function that draws text with clipping
export function createClippedDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, maxWidth: number, options: any = {}) => {
    const fontSize = options.size || FONTS.base;
    const clippedText = clipText(text, maxWidth, fontSize);
    drawText(clippedText, x, y, options);
  };
}
