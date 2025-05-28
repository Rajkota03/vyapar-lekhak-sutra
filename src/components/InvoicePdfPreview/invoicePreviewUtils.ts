
import { PAGE, COLORS } from '@/lib/pdf/layout';

// Convert RGB array to CSS color
export const rgbToCSS = (rgb: number[]) => `rgb(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)})`;

// Get common style props for positioning
export const getAbsoluteStyles = (top: number, height?: number) => ({
  position: 'absolute' as const,
  top: `${top}px`,
  left: `${PAGE.margin}px`,
  right: `${PAGE.margin}px`,
  ...(height && { height: `${height}px` }),
});

// Convert RGB array to PDF color format (ensuring proper bounds)
export const rgbToPdf = (rgb: number[]) => {
  return [
    Math.max(0, Math.min(1, rgb[0])),
    Math.max(0, Math.min(1, rgb[1])),
    Math.max(0, Math.min(1, rgb[2]))
  ];
};
