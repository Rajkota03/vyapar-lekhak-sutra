
/**
 * Enhanced text utilities for PDF generation with proper font metrics and clipping
 */

export interface TextMeasurement {
  width: number;
  height: number;
}

export interface FontMetrics {
  avgCharWidth: number;
  spaceWidth: number;
  lineHeight: number;
}

/**
 * Get font metrics for different font types
 * These are approximate values based on common font characteristics
 */
export function getFontMetrics(fontSize: number, isBold: boolean = false): FontMetrics {
  // Helvetica character width approximations
  const baseCharWidth = isBold ? fontSize * 0.62 : fontSize * 0.58;
  const spaceWidth = fontSize * 0.28;
  
  return {
    avgCharWidth: baseCharWidth,
    spaceWidth,
    lineHeight: fontSize * 1.2
  };
}

/**
 * Measure text width with improved accuracy using font metrics
 */
export function measureText(text: string, fontSize: number, isBold: boolean = false): TextMeasurement {
  const metrics = getFontMetrics(fontSize, isBold);
  
  // Count characters and spaces for more accurate measurement
  const charCount = text.replace(/\s/g, '').length;
  const spaceCount = (text.match(/\s/g) || []).length;
  
  const width = (charCount * metrics.avgCharWidth) + (spaceCount * metrics.spaceWidth);
  
  return {
    width,
    height: fontSize
  };
}

/**
 * Clip text to fit within a maximum width with proper ellipsis handling
 */
export function clipText(text: string, maxWidth: number, fontSize: number, isBold: boolean = false): string {
  console.log('clipText called with:', { text, maxWidth, fontSize, isBold });
  
  const { width } = measureText(text, fontSize, isBold);
  
  if (width <= maxWidth) {
    console.log('clipText: text fits, returning original:', text);
    return text;
  }
  
  // Binary search for the optimal length with ellipsis
  const ellipsis = '...';
  const ellipsisWidth = measureText(ellipsis, fontSize, isBold).width;
  const availableWidth = maxWidth - ellipsisWidth;
  
  if (availableWidth <= 0) {
    console.log('clipText: no space for ellipsis, returning ellipsis only');
    return ellipsis;
  }
  
  let left = 0;
  let right = text.length;
  let result = text;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid);
    const truncatedWidth = measureText(truncated, fontSize, isBold).width;
    
    if (truncatedWidth <= availableWidth) {
      result = truncated + ellipsis;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  console.log('clipText result:', result);
  return result;
}

/**
 * Wrap text to fit within a maximum width (legacy function, kept for compatibility)
 */
export function wrapLines(text: string, maxWidth: number, fontSize: number, isBold: boolean = false): string[] {
  console.log('wrapLines called with:', { text, maxWidth, fontSize, isBold });
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const { width } = measureText(testLine, fontSize, isBold);
    
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word too long - clip it
        lines.push(clipText(word, maxWidth, fontSize, isBold));
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  console.log('wrapLines result:', lines);
  return lines;
}

/**
 * Create a clipped text drawing function for PDF
 */
export function createClippedDrawText(page: any, drawText: Function) {
  return (text: string, x: number, y: number, maxWidth: number, options: any = {}, extraOptions: any = {}) => {
    const clippedText = clipText(text, maxWidth, options.size || 9, options.bold || false);
    drawText(clippedText, x, y, options, extraOptions);
  };
}
