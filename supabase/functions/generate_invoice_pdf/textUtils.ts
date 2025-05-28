
/**
 * Utility functions for text handling in PDF generation
 */

export interface TextMeasurement {
  width: number;
  height: number;
}

/**
 * Measure text width using a simple character-based approximation
 * This is a fallback when we don't have access to font metrics
 */
export function measureText(text: string, fontSize: number): TextMeasurement {
  // Approximate character width as 60% of font size for most fonts
  const avgCharWidth = fontSize * 0.6;
  const width = text.length * avgCharWidth;
  
  return {
    width,
    height: fontSize
  };
}

/**
 * Wrap text to fit within a maximum width
 * Returns an array of lines that fit within the specified width
 */
export function wrapLines(text: string, maxWidth: number, fontSize: number): string[] {
  console.log('wrapLines called with:', { text, maxWidth, fontSize })
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const { width } = measureText(testLine, fontSize);
    
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Handle single word that's too long - force it on its own line
        lines.push(word);
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  console.log('wrapLines result:', lines)
  return lines;
}

/**
 * Truncate text with ellipsis if it exceeds maximum width
 */
export function truncateText(text: string, maxWidth: number, fontSize: number): string {
  console.log('truncateText called with:', { text, maxWidth, fontSize })
  
  const { width } = measureText(text, fontSize);
  
  if (width <= maxWidth) {
    return text;
  }
  
  // Binary search for the right length
  let left = 0;
  let right = text.length;
  let result = text;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid) + '...';
    const { width: truncatedWidth } = measureText(truncated, fontSize);
    
    if (truncatedWidth <= maxWidth) {
      result = truncated;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  console.log('truncateText result:', result)
  return result;
}
