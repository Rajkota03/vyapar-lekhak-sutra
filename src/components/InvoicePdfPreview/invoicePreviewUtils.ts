
import { PAGE, COLORS } from '@/lib/pdf/layout';

// Convert RGB array to CSS color
export const rgbToCSS = (rgb: number[]) => `rgb(${rgb[0] * 255}, ${rgb[1] * 255}, ${rgb[2] * 255})`;

// Get common style props for positioning
export const getAbsoluteStyles = (top: number, height?: number) => ({
  position: 'absolute' as const,
  top: `${top}px`,
  left: `${PAGE.margin}px`,
  right: `${PAGE.margin}px`,
  ...(height && { height: `${height}px` }),
});
