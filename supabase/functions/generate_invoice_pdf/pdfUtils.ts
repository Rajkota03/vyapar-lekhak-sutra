
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import fontkit from 'https://esm.sh/@pdf-lib/fontkit@1.1.1'
import { COLORS, FONTS, SPACING } from './layout.ts'
import type { PDFContext, DrawTextOptions } from './types.ts'

export async function createPDFContext(): Promise<{ pdfDoc: any; context: PDFContext }> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  
  // Load fonts with proper Unicode support
  let unicodeFont
  let fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  try {
    const fontUrl = 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf'
    const fontResponse = await fetch(fontUrl)
    if (fontResponse.ok) {
      const fontBytes = await fontResponse.arrayBuffer()
      unicodeFont = await pdfDoc.embedFont(new Uint8Array(fontBytes))
      console.log('Unicode font loaded successfully')
    }
  } catch (fontError) {
    console.warn('Failed to load Unicode font, using fallback:', fontError)
    unicodeFont = null
  }

  const context: PDFContext = {
    page: null, // Will be set when page is created
    unicodeFont,
    fallbackFont,
    boldFont
  }

  return { pdfDoc, context }
}

export function createDrawTextFunction(context: PDFContext) {
  return (text: string, x: number, y: number, options: DrawTextOptions = {}) => {
    const useUnicodeFont = context.unicodeFont && text.includes('₹')
    const font = useUnicodeFont ? context.unicodeFont : (options.bold ? context.boldFont : context.fallbackFont)
    const displayText = useUnicodeFont ? text : text.replace(/₹/g, 'Rs.')
    
    context.page.drawText(displayText, {
      x,
      y,
      size: options.size || FONTS.base,
      font,
      color: options.color || rgb(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]),
      lineHeight: options.lineHeight || SPACING.lineHeight,
      ...options
    })
  }
}

export function drawRoundedRect(page: any, x: number, y: number, width: number, height: number, color: number[], radius = 4) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(color[0], color[1], color[2]),
  })
}

export async function embedImage(pdfDoc: any, imageUrl: string): Promise<{ image: any; width: number; height: number } | null> {
  try {
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.log('Failed to fetch image, HTTP status:', imageResponse.status)
      return null
    }

    const imageBytes = await imageResponse.arrayBuffer()
    let image

    const contentType = imageResponse.headers.get('content-type') || ''
    if (contentType.includes('png') || imageUrl.toLowerCase().includes('.png')) {
      image = await pdfDoc.embedPng(new Uint8Array(imageBytes))
    } else {
      image = await pdfDoc.embedJpg(new Uint8Array(imageBytes))
    }

    const originalDims = image.size()
    return {
      image,
      width: originalDims.width,
      height: originalDims.height
    }
  } catch (error) {
    console.warn('Failed to embed image:', error)
    return null
  }
}
