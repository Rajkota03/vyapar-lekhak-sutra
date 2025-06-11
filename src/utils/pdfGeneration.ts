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
  
  // ENHANCED NOTES DEBUG LOGGING
  console.log('=== NOTES DEBUG IN PDF GENERATION ===');
  console.log('Invoice notes value:', invoiceData.notes);
  console.log('Notes type:', typeof invoiceData.notes);
  console.log('Notes length:', invoiceData.notes?.length);
  console.log('Notes trimmed length:', invoiceData.notes?.trim?.()?.length);
  console.log('Notes is truthy:', !!invoiceData.notes);
  console.log('Notes after trim is truthy:', !!(invoiceData.notes?.trim?.()));
  
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
  const baseLogo = { width: 60, height: 60 };
  const logoWidth = baseLogo.width * logoScale;
  const logoHeight = baseLogo.height * logoScale;
  
  console.log('=== LOGO DIMENSIONS ===');
  console.log('Base dimensions:', baseLogo);
  console.log('Scale factor:', logoScale);
  console.log('Final dimensions:', { width: logoWidth, height: logoHeight });

  // Calculate signature dimensions based on scale
  const baseSignature = { width: 120, height: 50 };
  const signatureWidth = baseSignature.width * signatureScale;
  const signatureHeight = baseSignature.height * signatureScale;
  
  console.log('=== SIGNATURE DIMENSIONS ===');
  console.log('Base dimensions:', baseSignature);
  console.log('Scale factor:', signatureScale);
  console.log('Final dimensions:', { width: signatureWidth, height: signatureHeight });

  // Get payment instructions or use fallback
  const paymentInstructions = companySettings?.payment_note || 'Payment Instructions\nBank Name: [Bank Name]\nAccount No: [Account Number]\nIFSC: [IFSC Code]\nBranch: [Branch Name]';

  // ENHANCED NOTES PROCESSING WITH DEBUG
  const hasNotes = invoiceData.notes && invoiceData.notes.trim() !== '';
  console.log('=== NOTES PROCESSING DECISION ===');
  console.log('Has notes (final decision):', hasNotes);
  console.log('Notes content that will be used:', hasNotes ? invoiceData.notes : 'No notes');

  // Create the main content array
  const mainContent: any[] = [
    // SECTION MARKER 1 - HEADER
    {
      text: '🔴 SECTION 1: HEADER (Logo on left, company details on right)',
      style: 'sectionMarker',
      margin: [0, 0, 0, 5]
    },

    // SECTION 1: HEADER - Logo on left, company details on right
    {
      columns: [
        {
          width: logoBase64 ? 'auto' : 1,
          stack: logoBase64 ? [
            {
              image: logoBase64,
              width: logoWidth,
              height: logoHeight,
              margin: [0, 0, 10, 0]
            }
          ] : []
        },
        {
          width: '*',
          stack: [
            {
              text: companyData.name,
              style: 'companyName',
              alignment: 'right',
              margin: [0, 0, 0, 2]
            },
            {
              text: companyData.address || '',
              style: 'companyAddress',
              alignment: 'right',
              margin: [0, 0, 0, 1]
            },
            {
              text: companyData.gstin ? `GSTIN: ${companyData.gstin}` : '',
              style: 'companyGstin',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 5, 0, 20]
    },

    // SECTION MARKER 2 - BILL TO + INVOICE DETAILS
    {
      text: '🟡 SECTION 2: BILL TO + INVOICE DETAILS (Bill to on left, invoice details on right)',
      style: 'sectionMarker',
      margin: [0, 10, 0, 5]
    },

    // SECTION 2: BILL TO + INVOICE DETAILS
    {
      columns: [
        {
          width: '50%',
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
          width: '50%',
          stack: [
            {
              text: 'INVOICE DETAILS',
              style: 'sectionHeader',
              alignment: 'right',
              margin: [0, 0, 0, 3]
            },
            {
              text: `Invoice #: ${invoiceData.number}`,
              style: 'invoiceDetails',
              alignment: 'right',
              margin: [0, 0, 0, 2]
            },
            {
              text: `Date: ${new Date(invoiceData.issue_date).toLocaleDateString('en-GB')}`,
              style: 'invoiceDetails',
              alignment: 'right',
              margin: [0, 0, 0, 2]
            },
            {
              text: `HSN Code: ${invoiceData.invoice_code || invoiceData.number}`,
              style: 'invoiceDetails',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 5, 0, 20]
    },

    // SECTION MARKER 3 - ITEMS TABLE WITH TOTALS (SEAMLESS)
    {
      text: '🟢 SECTION 3: ITEMS TABLE WITH SEAMLESS TOTALS (Combined as one table)',
      style: 'sectionMarker',
      margin: [0, 10, 0, 5]
    },

    // SECTION 3: COMBINED ITEMS AND TOTALS TABLE (NO GAP)
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
          // Item rows
          ...lineItems.map(item => [
            { text: item.description, style: 'tableCell' },
            { text: item.qty.toString(), style: 'tableCell', alignment: 'center' },
            { text: formatCurrency(item.unit_price), style: 'tableCell', alignment: 'right' },
            { text: formatCurrency(item.amount), style: 'tableCell', alignment: 'right' }
          ]),
          // Spacer row for visual separation
          [
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] }
          ],
          // Totals rows (seamlessly connected)
          [
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: 'Subtotal', style: 'totalLabel', alignment: 'right', border: [false, false, false, false] },
            { text: formatCurrency(subtotal), style: 'totalValue', alignment: 'right', border: [false, false, false, false] }
          ],
          // Tax rows
          ...(invoiceData.use_igst ? [
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: `IGST (${invoiceData.igst_pct}%)`, style: 'totalLabel', alignment: 'right', border: [false, false, false, false] },
              { text: formatCurrency(igstAmount), style: 'totalValue', alignment: 'right', border: [false, false, false, false] }
            ]
          ] : [
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: `CGST (${invoiceData.cgst_pct}%)`, style: 'totalLabel', alignment: 'right', border: [false, false, false, false] },
              { text: formatCurrency(cgstAmount), style: 'totalValue', alignment: 'right', border: [false, false, false, false] }
            ],
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: `SGST (${invoiceData.sgst_pct}%)`, style: 'totalLabel', alignment: 'right', border: [false, false, false, false] },
              { text: formatCurrency(sgstAmount), style: 'totalValue', alignment: 'right', border: [false, false, false, false] }
            ]
          ]),
          // Total row with line
          [
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: 'Total', style: 'grandTotalLabel', alignment: 'right', border: [false, true, false, false] },
            { text: formatCurrency(grandTotal), style: 'grandTotalValue', alignment: 'right', border: [false, true, false, false] }
          ],
          // GRAND TOTAL row (highlighted)
          [
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: 'GRAND TOTAL', style: 'finalTotalLabel', alignment: 'right', fillColor: '#f5f5f5', border: [false, false, false, false] },
            { text: formatCurrency(grandTotal), style: 'finalTotalValueCompact', alignment: 'right', fillColor: '#f5f5f5', border: [false, false, false, false] }
          ]
        ]
      },
      layout: {
        hLineWidth: (i: number, node: any) => {
          // Only show borders for the header row and the items section
          if (i === 0 || i === 1) return 1; // Header border
          if (i === lineItems.length + 1) return 1; // Bottom of items
          return 0; // No other borders
        },
        vLineWidth: () => 0,
        hLineColor: (i: number, node: any) => {
          return i === 0 || i === 1 ? '#000000' : '#cccccc';
        },
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 5, 0, 15]
    },

    // SECTION MARKER 4 - PAYMENT DETAILS BESIDE TOTALS RECAP
    {
      text: '🔵 SECTION 4: PAYMENT DETAILS (Left side, beside totals recap)',
      style: 'sectionMarker',
      margin: [0, 10, 0, 5]
    },

    // SECTION 4: PAYMENT DETAILS (Left side, totals recap on right)
    {
      columns: [
        {
          width: '60%',
          stack: [
            {
              text: 'Payment Details',
              style: 'sectionHeader',
              margin: [0, 0, 0, 5]
            },
            {
              text: paymentInstructions,
              style: 'paymentDetails',
              margin: [0, 0, 0, 0]
            }
          ]
        },
        {
          width: '40%',
          stack: [
            {
              text: 'Amount Summary',
              style: 'sectionHeader',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            },
            {
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Subtotal:', style: 'totalLabelSmall', alignment: 'right', border: [false, false, false, false] },
                    { text: formatCurrency(subtotal), style: 'totalValueSmall', alignment: 'right', border: [false, false, false, false] }
                  ],
                  ...(invoiceData.use_igst ? [
                    [
                      { text: `IGST (${invoiceData.igst_pct}%):`, style: 'totalLabelSmall', alignment: 'right', border: [false, false, false, false] },
                      { text: formatCurrency(igstAmount), style: 'totalValueSmall', alignment: 'right', border: [false, false, false, false] }
                    ]
                  ] : [
                    [
                      { text: `CGST (${invoiceData.cgst_pct}%):`, style: 'totalLabelSmall', alignment: 'right', border: [false, false, false, false] },
                      { text: formatCurrency(cgstAmount), style: 'totalValueSmall', alignment: 'right', border: [false, false, false, false] }
                    ],
                    [
                      { text: `SGST (${invoiceData.sgst_pct}%):`, style: 'totalLabelSmall', alignment: 'right', border: [false, false, false, false] },
                      { text: formatCurrency(sgstAmount), style: 'totalValueSmall', alignment: 'right', border: [false, false, false, false] }
                    ]
                  ]),
                  [
                    { text: 'TOTAL:', style: 'finalTotalLabelSmall', alignment: 'right', border: [false, true, false, false] },
                    { text: formatCurrency(grandTotal), style: 'finalTotalValueSmall', alignment: 'right', border: [false, true, false, false] }
                  ]
                ]
              },
              layout: {
                hLineWidth: (i: number, node: any) => {
                  // Only show line above the total
                  return i === node.table.body.length - 1 ? 1 : 0;
                },
                vLineWidth: () => 0,
                hLineColor: () => '#333333',
                paddingLeft: () => 8,
                paddingRight: () => 0,
                paddingTop: () => 2,
                paddingBottom: () => 2
              }
            }
          ]
        }
      ],
      margin: [0, 5, 0, 20]
    },

    // SECTION MARKER 5 - NOTES SECTION (SEPARATE)
    {
      text: '🟣 SECTION 5: NOTES SECTION (Separate section, full width)',
      style: 'sectionMarker',
      margin: [0, 10, 0, 5]
    },

    // SECTION 5: NOTES SECTION (Only if notes exist)
    ...(hasNotes ? [
      {
        stack: [
          {
            text: 'Notes',
            style: 'sectionHeader',
            margin: [0, 0, 0, 5]
          },
          {
            text: invoiceData.notes,
            style: 'notesContent',
            margin: [0, 0, 0, 15]
          }
        ],
        margin: [0, 5, 0, 15]
      }
    ] : []),

    // SECTION MARKER 6 - FOOTER WITH SIGNATURE
    {
      text: '🟢 SECTION 6: FOOTER WITH SIGNATURE (Thank you message, company name, signature, then date)',
      style: 'sectionMarker',
      margin: [0, 10, 0, 5]
    },

    // SECTION 6: COMBINED FOOTER WITH SIGNATURE (with 45px left positioning)
    {
      stack: [
        {
          text: 'Thank you for your business!',
          style: 'footer',
          alignment: 'left',
          margin: [45, 8, 0, 8]
        },
        // Signature section (only if both URL exists AND setting is enabled)
        ...(signatureBase64 && invoiceData.show_my_signature ? [
          {
            stack: [
              {
                image: signatureBase64,
                width: signatureWidth,
                height: signatureHeight,
                alignment: 'left',
                margin: [45, 0, 0, 5]
              }
            ]
          }
        ] : []),
        {
          text: companyData.name,
          style: 'footerCompany',
          alignment: 'left',
          margin: [45, 0, 0, 10]
        },
        // Date section (only if signature is shown)
        ...(signatureBase64 && invoiceData.show_my_signature ? [
          {
            text: new Date(invoiceData.issue_date).toLocaleDateString('en-GB'),
            style: 'signatureDate',
            alignment: 'left',
            margin: [45, 0, 0, 10]
          }
        ] : [])
      ],
      margin: [0, 5, 0, 0]
    }
  ];

  // Create document definition with optimized margins
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 35, 30, 35],
    content: mainContent,
    styles: {
      sectionMarker: {
        fontSize: 12,
        bold: true,
        color: '#FF0000',
        background: '#FFFF00'
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
      invoiceDetails: {
        fontSize: 10,
        color: '#333333'
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
      paymentDetails: {
        fontSize: 8,
        color: '#666666',
        lineHeight: 1.3
      },
      notesContent: {
        fontSize: 8,
        color: '#666666',
        lineHeight: 1.3
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
      totalLabelSmall: {
        fontSize: 8,
        color: '#666666'
      },
      totalValueSmall: {
        fontSize: 8,
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
        fontSize: 11,
        bold: true,
        color: '#333333'
      },
      finalTotalValueCompact: {
        fontSize: 11,
        bold: true,
        color: '#333333'
      },
      finalTotalLabelSmall: {
        fontSize: 9,
        bold: true,
        color: '#333333'
      },
      finalTotalValueSmall: {
        fontSize: 9,
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
      },
      signatureDate: {
        fontSize: 9,
        color: '#333333'
      }
    }
  };

  console.log('=== PDF GENERATION COMPLETE ===');
  console.log('Signature included:', !!(signatureBase64 && invoiceData.show_my_signature));
  console.log('Notes included:', hasNotes);
  console.log('Notes content in final PDF:', hasNotes ? invoiceData.notes : 'No notes');
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
