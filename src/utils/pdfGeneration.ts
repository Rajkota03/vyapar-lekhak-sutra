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

// DEBUG FLAG - Set to false for production
const DEBUG_ALIGNMENT = false;

// Currency formatting function with proper alignment
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Function to determine document type from invoice number or other indicators
const getDocumentTypeFromInvoice = (invoiceData: Invoice): 'invoice' | 'proforma' | 'quote' => {
  const number = invoiceData.number || invoiceData.invoice_code || '';
  
  if (number.startsWith('QUO-') || number.startsWith('QUOT-')) {
    return 'quote';
  } else if (number.startsWith('PF-') || number.startsWith('PRO-')) {
    return 'proforma';
  } else {
    return 'invoice';
  }
};

// Function to get document title based on type and company settings
const getDocumentTitle = (documentType: 'invoice' | 'proforma' | 'quote', companySettings: any): string => {
  switch (documentType) {
    case 'quote':
      return companySettings?.quote_title || 'Quotation';
    case 'proforma':
      return companySettings?.proforma_title || 'Pro Forma Invoice';
    case 'invoice':
    default:
      return companySettings?.invoice_title || 'Invoice';
  }
};

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

// Function to format complete company address from settings
const formatCompanyAddress = (companyData: CompanyData, companySettings: any): string[] => {
  const addressLines: string[] = [];
  
  // Add basic address if available
  if (companyData.address) {
    addressLines.push(companyData.address);
  }
  
  // Build address from company_settings fields
  const addressComponents: string[] = [];
  
  if (companySettings?.city) {
    addressComponents.push(companySettings.city);
  }
  
  if (companySettings?.state) {
    addressComponents.push(companySettings.state);
  }
  
  if (companySettings?.zip_code) {
    addressComponents.push(companySettings.zip_code);
  }
  
  if (addressComponents.length > 0) {
    addressLines.push(addressComponents.join(', '));
  }
  
  if (companySettings?.country && companySettings.country !== 'India') {
    addressLines.push(companySettings.country);
  }
  
  return addressLines.filter(line => line && line.trim() !== '');
};

// Function to format company contact info
const formatCompanyContact = (companySettings: any): string[] => {
  const contactLines: string[] = [];
  
  if (companySettings?.email) {
    contactLines.push(`Email: ${companySettings.email}`);
  }
  
  if (companySettings?.phone) {
    contactLines.push(`Phone: ${companySettings.phone}`);
  }
  
  return contactLines;
};

export const generateInvoicePDF = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[],
  documentType: 'invoice' | 'proforma' | 'quote' = 'invoice'
) => {
  console.log('=== PDF GENERATION START ===');
  console.log('Invoice data:', invoiceData);
  console.log('Company data:', companyData);
  console.log('Show my signature setting:', invoiceData.show_my_signature);
  console.log('Document type passed to PDF generation:', documentType);
  
  // NOTES DEBUG LOGGING
  console.log('=== NOTES DEBUG IN PDF GENERATION ===');
  console.log('Invoice notes value:', invoiceData.notes);
  console.log('Notes type:', typeof invoiceData.notes);
  console.log('Notes length:', invoiceData.notes?.length);
  console.log('Notes trimmed length:', invoiceData.notes?.trim?.()?.length);
  console.log('Notes is truthy:', !!invoiceData.notes);
  console.log('Notes after trim is truthy:', !!(invoiceData.notes?.trim?.()));
  
  // Get company settings for logo, signature, and document titles
  const companySettings = await getCompanySettings(invoiceData.company_id);
  let logoBase64: string | null = null;
  let signatureBase64: string | null = null;
  let logoScale = 0.3;
  let signatureScale = 1.0;

  // Get document title based on type and settings
  const documentTitle = getDocumentTitle(documentType, companySettings);
  console.log('=== DOCUMENT TITLE ===');
  console.log('Document title:', documentTitle);

  // LOGO PROCESSING - Always try to load logo if URL exists
  console.log('=== LOGO PROCESSING ===');
  const logoUrl = companySettings?.logo_url || companyData.logo_url;
  console.log('Logo URL from settings:', companySettings?.logo_url);
  console.log('Logo URL from company:', companyData.logo_url);
  console.log('Final logo URL used:', logoUrl);
  
  if (logoUrl) {
    console.log('Processing logo from URL:', logoUrl);
    logoBase64 = await getImageAsBase64(logoUrl);
    logoScale = Number(companySettings?.logo_scale || 0.3);
    console.log('Logo scale:', logoScale);
    console.log('Logo base64 result:', logoBase64 ? 'SUCCESS' : 'FAILED');
    if (logoBase64) {
      console.log('✅ Logo will be added to PDF');
    } else {
      console.log('❌ Failed to process logo image');
    }
  } else {
    console.log('❌ No logo URL found');
  }

  // Get custom quantity label from company settings
  const quantityLabel = companySettings?.quantity_column_label || 'QTY';
  console.log('=== QUANTITY LABEL DEBUG ===');
  console.log('Custom quantity label:', quantityLabel);

  // Get HSN code from company settings
  const hsnCode = companySettings?.hsn_code || invoiceData.invoice_code || invoiceData.number;
  console.log('=== HSN CODE DEBUG ===');
  console.log('HSN code from settings:', companySettings?.hsn_code);
  console.log('Final HSN code used:', hsnCode);

  // SIGNATURE LOGIC - Show signature only if both URL exists AND setting is enabled
  console.log('=== SIGNATURE PROCESSING DEBUG ===');
  console.log('Invoice show_my_signature setting:', invoiceData.show_my_signature);
  console.log('Company settings signature_url:', companySettings?.signature_url);
  
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

  // Format company address and contact info from settings
  const companyAddressLines = formatCompanyAddress(companyData, companySettings);
  const companyContactLines = formatCompanyContact(companySettings);
  
  console.log('=== COMPANY INFO FORMATTING ===');
  console.log('Company address lines:', companyAddressLines);
  console.log('Company contact lines:', companyContactLines);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = invoiceData.cgst || 0;
  const sgstAmount = invoiceData.sgst || 0;
  const igstAmount = invoiceData.igst || 0;
  const grandTotal = invoiceData.total;

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

  // NOTES PROCESSING
  const hasNotes = invoiceData.notes && invoiceData.notes.trim() !== '';
  console.log('=== NOTES PROCESSING DECISION ===');
  console.log('Has notes (final decision):', hasNotes);
  console.log('Notes content that will be used:', hasNotes ? invoiceData.notes : 'No notes');

  // Define consistent amount column width
  const AMOUNT_COLUMN_WIDTH = 80;

  // Create the main content array
  const mainContent: any[] = [
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
            // Company address from settings
            ...companyAddressLines.map(line => ({
              text: line,
              style: 'companyAddress',
              alignment: 'right',
              margin: [0, 0, 0, 1]
            })),
            // Company contact info from settings
            ...companyContactLines.map(line => ({
              text: line,
              style: 'companyContact',
              alignment: 'right',
              margin: [0, 0, 0, 1]
            })),
            // GSTIN
            {
              text: companyData.gstin ? `GSTIN: ${companyData.gstin}` : '',
              style: 'companyGstin',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 0, 0, 12]
    },

    // SECTION 1.5: DOCUMENT TITLE
    {
      text: documentTitle.toUpperCase(),
      style: 'documentTitle',
      alignment: 'center',
      margin: [0, 0, 0, 16]
    },

    // SECTION 2: BILL TO + DOCUMENT DETAILS
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
              text: `${documentTitle.toUpperCase()} DETAILS`,
              style: 'sectionHeader',
              alignment: 'right',
              margin: [0, 0, 0, 3]
            },
            {
              text: `${documentTitle} #: ${invoiceData.number}`,
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
              text: `HSN Code: ${hsnCode}`,
              style: 'invoiceDetails',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 0, 0, 10]
    },

    // SECTION 3: ITEMS TABLE
    {
      table: {
        headerRows: 1,
        widths: ['*', 50, 70, AMOUNT_COLUMN_WIDTH],
        body: [
          // Header row - using custom quantity label
          [
            { text: 'DESCRIPTION', style: 'tableHeader' },
            { text: quantityLabel.toUpperCase(), style: 'tableHeader', alignment: 'center' },
            { text: 'RATE', style: 'tableHeader', alignment: 'right' },
            { text: 'AMOUNT', style: 'tableHeader', alignment: 'right' }
          ],
          // Item rows
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
          if (i === 0 || i === 1) return 1; // Header
          if (i === lineItems.length + 1) return 1; // Bottom
          return 0;
        },
        vLineWidth: () => 0,
        hLineColor: () => '#000000',
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 0, 0, 8]
    },

    // SECTION 4: PAYMENT DETAILS AND TOTALS
    {
      columns: [
        {
          width: '60%',
          stack: [
            {
              text: 'Payment Details',
              style: 'paymentSectionHeader',
              margin: [0, 0, 0, 6]
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
            // Subtotal
            {
              columns: [
                { width: '*', text: 'Subtotal', style: 'totalLabel' },
                { width: AMOUNT_COLUMN_WIDTH, text: formatCurrency(subtotal), style: 'totalValue', alignment: 'right' }
              ],
              margin: [0, 0, 0, 2]
            },
            // Tax rows
            ...(invoiceData.use_igst ? [
              {
                columns: [
                  { width: '*', text: `IGST (${invoiceData.igst_pct}%)`, style: 'totalLabel' },
                  { width: AMOUNT_COLUMN_WIDTH, text: formatCurrency(igstAmount), style: 'totalValue', alignment: 'right' }
                ],
                margin: [0, 0, 0, 2]
              }
            ] : [
              {
                columns: [
                  { width: '*', text: `CGST (${invoiceData.cgst_pct}%)`, style: 'totalLabel' },
                  { width: AMOUNT_COLUMN_WIDTH, text: formatCurrency(cgstAmount), style: 'totalValue', alignment: 'right' }
                ],
                margin: [0, 0, 0, 2]
              },
              {
                columns: [
                  { width: '*', text: `SGST (${invoiceData.sgst_pct}%)`, style: 'totalLabel' },
                  { width: AMOUNT_COLUMN_WIDTH, text: formatCurrency(sgstAmount), style: 'totalValue', alignment: 'right' }
                ],
                margin: [0, 0, 0, 2]
              }
            ]),
            // Line separator
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 3,
                  x2: 180, y2: 3,
                  lineWidth: 1,
                  lineColor: '#cccccc'
                }
              ],
              margin: [0, 3, 0, 5]
            },
            // Grand Total
            {
              columns: [
                { width: '*', text: 'GRAND TOTAL', style: 'finalTotalLabel' },
                { width: AMOUNT_COLUMN_WIDTH, text: formatCurrency(grandTotal), style: 'finalTotalValue', alignment: 'right' }
              ],
              fillColor: '#f5f5f5',
              margin: [0, 0, 0, 0]
            }
          ]
        }
      ],
      columnGap: 20,
      margin: [0, 0, 0, 12]
    },

    // SECTION 5: NOTES (if any)
    ...(hasNotes ? [
      {
        stack: [
          {
            text: 'Notes',
            style: 'sectionHeader',
            margin: [0, 0, 0, 4]
          },
          {
            text: invoiceData.notes,
            style: 'notesContent',
            margin: [0, 0, 0, 8]
          }
        ],
        margin: [0, 0, 0, 8]
      }
    ] : []),

    // SECTION 6: FOOTER WITH SIGNATURE
    {
      stack: [
        {
          text: 'Thank you for your business!',
          style: 'footer',
          alignment: 'left',
          margin: [45, 5, 0, 5]
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
                margin: [45, 0, 0, 3]
              }
            ]
          }
        ] : []),
        {
          text: companyData.name,
          style: 'footerCompany',
          alignment: 'left',
          margin: [45, 0, 0, 5]
        },
        // Date section (only if signature is shown)
        ...(signatureBase64 && invoiceData.show_my_signature ? [
          {
            text: new Date(invoiceData.issue_date).toLocaleDateString('en-GB'),
            style: 'signatureDate',
            alignment: 'left',
            margin: [45, 0, 0, 0]
          }
        ] : [])
      ],
      margin: [0, 0, 0, 0]
    }
  ];

  // Create document definition with standard fonts only
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 35, 30, 35],
    content: mainContent,
    styles: {
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
      companyContact: {
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
      paymentSectionHeader: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      paymentDetails: {
        fontSize: 9,
        color: '#666666',
        lineHeight: 1.4
      },
      notesContent: {
        fontSize: 9,
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
      finalTotalLabel: {
        fontSize: 11,
        bold: true,
        color: '#333333'
      },
      finalTotalValue: {
        fontSize: 11,
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
      },
      documentTitle: {
        fontSize: 18,
        bold: true,
        color: '#333333'
      }
    }
  };

  console.log('=== PDF GENERATION COMPLETE ===');
  console.log('Document type:', documentType);
  console.log('Document title:', documentTitle);
  console.log('Logo included:', !!logoBase64);
  console.log('Signature included:', !!(signatureBase64 && invoiceData.show_my_signature));
  console.log('Notes included:', hasNotes);
  console.log('Custom quantity label used:', quantityLabel);
  console.log('HSN code used:', hsnCode);
  console.log('Company address lines included:', companyAddressLines.length);
  console.log('Company contact lines included:', companyContactLines.length);
  return docDefinition;
};

export const downloadInvoicePDF = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[],
  documentType: 'invoice' | 'proforma' | 'quote' = 'invoice'
) => {
  const docDefinition = await generateInvoicePDF(invoiceData, clientData, companyData, lineItems, documentType);
  const fileName = `${documentType}-${invoiceData.number}.pdf`;
  
  pdfMake.createPdf(docDefinition).download(fileName);
};

export const getInvoicePDFBlob = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[],
  documentType: 'invoice' | 'proforma' | 'quote' = 'invoice'
): Promise<Blob> => {
  const docDefinition = await generateInvoicePDF(invoiceData, clientData, companyData, lineItems, documentType);
  
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
      resolve(blob);
    });
  });
};
