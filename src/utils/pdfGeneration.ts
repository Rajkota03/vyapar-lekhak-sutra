import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice, LineItem } from '@/components/invoice/types/InvoiceTypes';
import { Client } from '@/hooks/useInvoiceData';
import { supabase } from "@/integrations/supabase/client";

// Initialize pdfMake with fonts - correct way
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

interface CompanyData {
  name: string;
  address?: string;
  gstin?: string;
  logo_url?: string;
}

// Function to convert image URL to base64
const getImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    console.log('=== IMAGE FETCH DEBUG ===');
    console.log('Attempting to fetch image from URL:', url);
    
    const response = await fetch(url);
    console.log('Fetch response status:', response.status);
    console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return null;
    }
    
    const blob = await response.blob();
    console.log('Blob details:', { size: blob.size, type: blob.type });
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        console.log('Successfully converted image to base64');
        console.log('Base64 length:', base64.length);
        console.log('Base64 prefix:', base64.substring(0, 50));
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('Error reading image as base64:', error);
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

// Function to get company settings including logo and signature
const getCompanySettings = async (companyId: string) => {
  try {
    console.log('=== COMPANY SETTINGS DEBUG ===');
    console.log('Fetching company settings for ID:', companyId);
    
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company settings:', error);
      return null;
    }

    console.log('Company settings retrieved:', data);
    return data;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
};

export const generateInvoicePDF = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[]
) => {
  console.log('=== PDF GENERATION START ===');
  console.log('Invoice data:', invoiceData);
  console.log('Company data:', companyData);
  console.log('Show my signature setting:', invoiceData.show_my_signature);
  
  // Get company settings for logo and signature
  const companySettings = await getCompanySettings(invoiceData.company_id);
  let logoBase64: string | null = null;
  let signatureBase64: string | null = null;
  let logoScale = 0.3;
  let signatureScale = 1.0;

  if (companySettings?.logo_url) {
    console.log('=== LOGO PROCESSING ===');
    console.log('Company has logo URL:', companySettings.logo_url);
    logoBase64 = await getImageAsBase64(companySettings.logo_url);
    logoScale = Number(companySettings.logo_scale || 0.3);
    console.log('Logo scale:', logoScale);
    console.log('Logo base64 result:', logoBase64 ? 'SUCCESS' : 'FAILED');
  } else {
    console.log('No logo URL found in company settings');
  }

  // UPDATED SIGNATURE LOGIC - Show signature only if both URL exists AND setting is enabled
  console.log('=== SIGNATURE PROCESSING DEBUG ===');
  console.log('Invoice show_my_signature setting:', invoiceData.show_my_signature);
  console.log('Company settings signature_url:', companySettings?.signature_url);
  
  // Show signature only if BOTH conditions are met:
  // 1. There's a signature URL in settings
  // 2. The invoice has show_my_signature enabled
  if (companySettings?.signature_url && invoiceData.show_my_signature) {
    console.log('=== SIGNATURE PROCESSING ENABLED ===');
    console.log('Both signature URL exists and show_my_signature is enabled');
    console.log('Fetching signature from URL:', companySettings.signature_url);
    signatureBase64 = await getImageAsBase64(companySettings.signature_url);
    signatureScale = Number(companySettings.signature_scale || 1.0);
    console.log('Signature scale:', signatureScale);
    console.log('Signature base64 result:', signatureBase64 ? 'SUCCESS' : 'FAILED');
    if (signatureBase64) {
      console.log('✅ Signature will be added to PDF');
    } else {
      console.log('❌ Failed to process signature image');
    }
  } else {
    if (!companySettings?.signature_url) {
      console.log('❌ No signature URL found in company settings');
    }
    if (!invoiceData.show_my_signature) {
      console.log('❌ Invoice show_my_signature setting is disabled');
    }
    console.log('❌ Signature will NOT be added to PDF');
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = invoiceData.cgst || 0;
  const sgstAmount = invoiceData.sgst || 0;
  const igstAmount = invoiceData.igst || 0;
  const grandTotal = invoiceData.total;

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate logo dimensions based on scale
  const baseLogo = { width: 60, height: 60 }; // Reduced from 80x80
  const logoWidth = baseLogo.width * logoScale;
  const logoHeight = baseLogo.height * logoScale;
  
  console.log('=== LOGO DIMENSIONS ===');
  console.log('Base dimensions:', baseLogo);
  console.log('Scale factor:', logoScale);
  console.log('Final dimensions:', { width: logoWidth, height: logoHeight });

  // Calculate signature dimensions based on scale
  const baseSignature = { width: 120, height: 50 }; // Reduced from 150x60
  const signatureWidth = baseSignature.width * signatureScale;
  const signatureHeight = baseSignature.height * signatureScale;
  
  console.log('=== SIGNATURE DIMENSIONS ===');
  console.log('Base dimensions:', baseSignature);
  console.log('Scale factor:', signatureScale);
  console.log('Final dimensions:', { width: signatureWidth, height: signatureHeight });

  // Get payment instructions or use fallback
  const paymentInstructions = companySettings?.payment_note || 'Payment Instructions\nBank Name: [Bank Name]\nAccount No: [Account Number]\nIFSC: [IFSC Code]\nBranch: [Branch Name]';

  // Section height calculations (approximate)
  const sectionHeights = {
    HEADER: 60,           // Company info + invoice title
    BILL_TO_PAYMENT: 80,  // Bill to + payment instructions
    ITEMS_TABLE: 100 + (lineItems.length * 18), // Header + rows
    TOTALS: 80,           // Tax calculations + grand total
    FOOTER: 30,           // Thank you message
    SIGNATURE: signatureBase64 && invoiceData.show_my_signature ? 60 : 0
  };

  const pageHeight = 841.89; // A4 height in points
  const pageMargins = 70; // Top + bottom margins
  const availableHeight = pageHeight - pageMargins;
  const usedHeight = Object.values(sectionHeights).reduce((sum, h) => sum + h, 0);
  const remainingHeight = availableHeight - usedHeight;

  // Helper function to create section marker
  const createSectionMarker = (sectionName: string, height: number, color: string = '#ff0000') => ({
    canvas: [
      // Top border
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 535, // Page width minus margins
        y2: 0,
        lineWidth: 1,
        lineColor: color,
        dash: { length: 3 }
      },
      // Left border
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: height,
        lineWidth: 1,
        lineColor: color,
        dash: { length: 3 }
      },
      // Right border
      {
        type: 'line',
        x1: 535,
        y1: 0,
        x2: 535,
        y2: height,
        lineWidth: 1,
        lineColor: color,
        dash: { length: 3 }
      }
    ],
    margin: [0, 0, 0, 0],
    absolutePosition: { x: 30, y: 'auto' }
  });

  // Helper function to create section label
  const createSectionLabel = (sectionName: string, height: number, available: number) => ({
    text: `${sectionName} | Used: ${height}pt | Available: +${available.toFixed(0)}pt`,
    style: 'sectionDebug',
    background: '#ffff00',
    margin: [2, 1, 2, 1]
  });

  // Create the main content array with debug markers
  const mainContent: any[] = [
    // DEBUG: Page info
    {
      text: `🔍 DEBUG MODE - Page: ${availableHeight}pt total | Used: ${usedHeight}pt | Free: ${remainingHeight.toFixed(0)}pt`,
      style: 'debugInfo',
      background: '#e0e0e0',
      margin: [0, 0, 0, 5]
    },

    // SECTION 1: HEADER
    createSectionLabel('HEADER', sectionHeights.HEADER, remainingHeight * 0.1),
    createSectionMarker('HEADER', sectionHeights.HEADER, '#ff0000'),
    {
      columns: [
        {
          width: logoBase64 ? 70 : 1,
          stack: logoBase64 ? [
            {
              image: logoBase64,
              width: logoWidth,
              height: logoHeight,
              margin: [0, 0, 0, 0]
            }
          ] : []
        },
        {
          width: '*',
          stack: [
            {
              text: companyData.name,
              style: 'companyName',
              margin: [0, 0, 0, 2]
            },
            {
              text: companyData.address || '',
              style: 'companyAddress',
              margin: [0, 0, 0, 1]
            },
            {
              text: companyData.gstin ? `GSTIN: ${companyData.gstin}` : '',
              style: 'companyGstin'
            }
          ]
        },
        {
          width: 120,
          stack: [
            {
              text: 'Invoice',
              style: 'invoiceTitle',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            },
            {
              text: `#${invoiceData.number}`,
              style: 'invoiceNumber',
              alignment: 'right',
              margin: [0, 0, 0, 2]
            },
            {
              text: new Date(invoiceData.issue_date).toLocaleDateString('en-GB'),
              style: 'invoiceDate',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 5, 0, 12]
    },

    // SECTION 2: BILL TO + PAYMENT
    createSectionLabel('BILL_TO_PAYMENT', sectionHeights.BILL_TO_PAYMENT, remainingHeight * 0.15),
    createSectionMarker('BILL_TO_PAYMENT', sectionHeights.BILL_TO_PAYMENT, '#00ff00'),
    {
      columns: [
        {
          width: '65%',
          stack: [
            {
              text: 'BILL TO',
              style: 'sectionHeader',
              margin: [0, 0, 0, 3]
            },
            {
              text: clientData.name,
              style: 'clientName',
              margin: [0, 0, 0, 2]
            },
            {
              text: clientData.billing_address || '',
              style: 'clientAddress',
              margin: [0, 0, 0, 2]
            },
            {
              text: clientData.gstin ? `GSTIN: ${clientData.gstin}` : '',
              style: 'clientGstin'
            }
          ]
        },
        {
          width: '35%',
          stack: [
            {
              text: 'Payment Instructions',
              style: 'sectionHeader',
              margin: [0, 0, 0, 3]
            },
            {
              text: paymentInstructions,
              style: 'paymentInstructions',
              margin: [0, 0, 0, 0]
            }
          ]
        }
      ],
      margin: [0, 5, 0, 15]
    },

    // SECTION 3: ITEMS TABLE
    createSectionLabel('ITEMS_TABLE', sectionHeights.ITEMS_TABLE, remainingHeight * 0.4),
    createSectionMarker('ITEMS_TABLE', sectionHeights.ITEMS_TABLE, '#0000ff'),
    {
      table: {
        headerRows: 1,
        widths: ['*', 50, 70, 70],
        body: [
          // Header row
          [
            { text: 'DESCRIPTION', style: 'tableHeader' },
            { text: 'QTY', style: 'tableHeader', alignment: 'center' },
            { text: 'RATE', style: 'tableHeader', alignment: 'right' },
            { text: 'AMOUNT', style: 'tableHeader', alignment: 'right' }
          ],
          // Data rows
          ...lineItems.map(item => [
            { text: item.description, style: 'tableCell' },
            { text: item.qty.toString(), style: 'tableCell', alignment: 'center' },
            { text: formatCurrency(item.unit_price), style: 'tableCell', alignment: 'right' },
            { text: formatCurrency(item.amount), style: 'tableCell', alignment: 'right' }
          ])
        ]
      },
      layout: {
        hLineWidth: (i: number, node: any) => {
          return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: () => 0,
        hLineColor: (i: number, node: any) => {
          return i === 0 || i === 1 || i === node.table.body.length ? '#000000' : '#cccccc';
        },
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 5, 0, 10]
    },

    // SECTION 4: TOTALS
    createSectionLabel('TOTALS', sectionHeights.TOTALS, remainingHeight * 0.2),
    createSectionMarker('TOTALS', sectionHeights.TOTALS, '#ff00ff'),
    {
      columns: [
        {
          width: '60%',
          text: ''
        },
        {
          width: '40%',
          table: {
            widths: ['*', 70],
            body: [
              [
                { text: 'Subtotal', style: 'totalLabel' },
                { text: formatCurrency(subtotal), style: 'totalValue', alignment: 'right' }
              ],
              ...(invoiceData.use_igst ? [
                [
                  { text: `IGST (${invoiceData.igst_pct}%)`, style: 'totalLabel' },
                  { text: formatCurrency(igstAmount), style: 'totalValue', alignment: 'right' }
                ]
              ] : [
                [
                  { text: `CGST (${invoiceData.cgst_pct}%)`, style: 'totalLabel' },
                  { text: formatCurrency(cgstAmount), style: 'totalValue', alignment: 'right' }
                ],
                [
                  { text: `SGST (${invoiceData.sgst_pct}%)`, style: 'totalLabel' },
                  { text: formatCurrency(sgstAmount), style: 'totalValue', alignment: 'right' }
                ]
              ]),
              [
                { text: 'Total', style: 'grandTotalLabel' },
                { text: formatCurrency(grandTotal), style: 'grandTotalValue', alignment: 'right' }
              ]
            ]
          },
          layout: {
            hLineWidth: (i: number, node: any) => {
              return i === node.table.body.length - 1 ? 1 : 0;
            },
            vLineWidth: () => 0,
            hLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 3,
            paddingBottom: () => 3
          }
        }
      ],
      margin: [0, 5, 0, 8]
    },

    // Final Grand Total Section
    {
      columns: [
        {
          width: '60%',
          text: ''
        },
        {
          width: '40%',
          table: {
            widths: ['*', 70],
            body: [
              [
                { text: 'GRAND TOTAL', style: 'finalTotalLabel' },
                { text: formatCurrency(grandTotal), style: 'finalTotalValue', alignment: 'right' }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            fillColor: '#f5f5f5',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 6,
            paddingBottom: () => 6
          }
        }
      ],
      margin: [0, 0, 0, 10]
    },

    // SECTION 5: FOOTER
    createSectionLabel('FOOTER', sectionHeights.FOOTER, remainingHeight * 0.1),
    createSectionMarker('FOOTER', sectionHeights.FOOTER, '#ffaa00'),
    {
      text: 'Thank you for your business!',
      style: 'footer',
      alignment: 'center',
      margin: [0, 8, 0, 2]
    },
    {
      text: companyData.name,
      style: 'footerCompany',
      alignment: 'center',
      margin: [0, 0, 0, 5]
    }
  ];

  // Add signature section if we have a signature AND the setting is enabled
  if (signatureBase64 && invoiceData.show_my_signature) {
    console.log('=== ADDING SIGNATURE SECTION TO PDF ===');
    mainContent.push(
      // SECTION 6: SIGNATURE
      createSectionLabel('SIGNATURE', sectionHeights.SIGNATURE, remainingHeight * 0.15),
      createSectionMarker('SIGNATURE', sectionHeights.SIGNATURE, '#00ffff'),
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: 'Authorized Signature',
                style: 'signatureTitle',
                margin: [0, 8, 0, 5]
              },
              {
                image: signatureBase64,
                width: signatureWidth,
                height: signatureHeight,
                margin: [0, 0, 0, 2]
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: signatureWidth,
                    y2: 0,
                    lineWidth: 1,
                    lineColor: '#000000'
                  }
                ],
                margin: [0, 0, 0, 2]
              },
              {
                text: companyData.name,
                style: 'signatureLabel',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          {
            width: '50%',
            text: ''
          }
        ],
        margin: [0, 5, 0, 0]
      }
    );
  }

  // Create document definition with optimized margins
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 35, 30, 35],
    content: mainContent,
    styles: {
      debugInfo: {
        fontSize: 8,
        bold: true,
        color: '#000000'
      },
      sectionDebug: {
        fontSize: 7,
        bold: true,
        color: '#000000'
      },
      companyName: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      companyAddress: {
        fontSize: 9,
        color: '#666666',
        lineHeight: 1.1
      },
      companyGstin: {
        fontSize: 9,
        color: '#666666'
      },
      invoiceTitle: {
        fontSize: 24,
        bold: true,
        color: '#333333'
      },
      invoiceNumber: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      invoiceDate: {
        fontSize: 10,
        color: '#666666'
      },
      sectionHeader: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      clientName: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      clientAddress: {
        fontSize: 9,
        color: '#666666',
        lineHeight: 1.1
      },
      clientGstin: {
        fontSize: 9,
        color: '#666666'
      },
      paymentInstructions: {
        fontSize: 8,
        color: '#666666',
        lineHeight: 1.2
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#333333',
        fillColor: '#f5f5f5'
      },
      tableCell: {
        fontSize: 9,
        color: '#333333',
        margin: [0, 1, 0, 1]
      },
      totalLabel: {
        fontSize: 9,
        color: '#666666'
      },
      totalValue: {
        fontSize: 9,
        color: '#333333'
      },
      grandTotalLabel: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      grandTotalValue: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      finalTotalLabel: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      finalTotalValue: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      footer: {
        fontSize: 10,
        color: '#666666'
      },
      footerCompany: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      signatureTitle: {
        fontSize: 9,
        color: '#666666',
        bold: true
      },
      signatureLabel: {
        fontSize: 9,
        color: '#333333',
        bold: true
      }
    }
  };

  console.log('=== PDF GENERATION COMPLETE ===');
  console.log('Signature included:', !!(signatureBase64 && invoiceData.show_my_signature));
  return docDefinition;
};

export const downloadInvoicePDF = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[]
) => {
  const docDefinition = await generateInvoicePDF(invoiceData, clientData, companyData, lineItems);
  const fileName = `invoice-${invoiceData.number}.pdf`;
  
  pdfMake.createPdf(docDefinition).download(fileName);
};

export const getInvoicePDFBlob = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[]
): Promise<Blob> => {
  const docDefinition = await generateInvoicePDF(invoiceData, clientData, companyData, lineItems);
  
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
      resolve(blob);
    });
  });
};
