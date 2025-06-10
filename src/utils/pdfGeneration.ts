import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice, LineItem } from '@/components/invoice/types/InvoiceTypes';
import { Client } from '@/hooks/useInvoiceData';
import { supabase } from '@/integrations/supabase/client';

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
  console.log('Show my signature:', invoiceData.show_my_signature);
  
  // Get company settings for logo and signature
  const companySettings = await getCompanySettings(invoiceData.company_id);
  let logoBase64: string | null = null;
  let signatureBase64: string | null = null;
  let logoScale = 0.3;

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

  // Process signature if enabled
  if (invoiceData.show_my_signature && companySettings?.signature_url) {
    console.log('=== SIGNATURE PROCESSING ===');
    console.log('Company has signature URL:', companySettings.signature_url);
    signatureBase64 = await getImageAsBase64(companySettings.signature_url);
    console.log('Signature base64 result:', signatureBase64 ? 'SUCCESS' : 'FAILED');
  } else {
    console.log('Signature not enabled or no signature URL found');
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
  const baseLogo = { width: 80, height: 80 };
  const logoWidth = baseLogo.width * logoScale;
  const logoHeight = baseLogo.height * logoScale;
  
  console.log('=== LOGO DIMENSIONS ===');
  console.log('Base dimensions:', baseLogo);
  console.log('Scale factor:', logoScale);
  console.log('Final dimensions:', { width: logoWidth, height: logoHeight });

  // Create header content with improved layout matching the reference image
  const headerContent = [];
  
  if (logoBase64) {
    console.log('=== CREATING HEADER WITH LOGO ===');
    // Header with logo on left and company details on right
    headerContent.push({
      columns: [
        {
          width: 120,
          stack: [
            {
              image: logoBase64,
              width: logoWidth,
              height: logoHeight,
              margin: [0, 0, 0, 0]
            }
          ]
        },
        {
          width: '*',
          text: '' // spacer
        },
        {
          width: 200,
          stack: [
            {
              text: 'Invoice',
              style: 'invoiceTitle',
              alignment: 'right',
              margin: [0, 0, 0, 15]
            },
            {
              text: companyData.name,
              style: 'companyName',
              alignment: 'right',
              margin: [0, 0, 0, 8]
            },
            {
              text: companyData.address || '',
              style: 'companyAddress',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            },
            {
              text: companyData.gstin ? `GSTIN: ${companyData.gstin}` : '',
              style: 'companyGstin',
              alignment: 'right',
              margin: [0, 0, 0, 10]
            },
            {
              text: `Invoice #: ${invoiceData.number}`,
              style: 'invoiceNumber',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            },
            {
              text: `Date: ${new Date(invoiceData.issue_date).toLocaleDateString('en-GB')}`,
              style: 'invoiceDate',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 0, 0, 30]
    });
  } else {
    console.log('=== CREATING HEADER WITHOUT LOGO ===');
    // Header without logo but maintaining the layout structure
    headerContent.push({
      columns: [
        {
          width: '60%',
          stack: [
            {
              text: companyData.name,
              style: 'companyName',
              margin: [0, 0, 0, 5]
            },
            {
              text: companyData.address || '',
              style: 'companyAddress',
              margin: [0, 0, 0, 5]
            },
            {
              text: companyData.gstin ? `GSTIN: ${companyData.gstin}` : '',
              style: 'companyGstin'
            }
          ]
        },
        {
          width: '40%',
          stack: [
            {
              text: 'Invoice',
              style: 'invoiceTitle',
              alignment: 'right',
              margin: [0, 0, 0, 10]
            },
            {
              text: `Invoice #: ${invoiceData.number}`,
              style: 'invoiceNumber',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            },
            {
              text: `Date: ${new Date(invoiceData.issue_date).toLocaleDateString('en-GB')}`,
              style: 'invoiceDate',
              alignment: 'right'
            }
          ]
        }
      ],
      margin: [0, 0, 0, 30]
    });
  }

  // Create signature section for bottom of page
  const signatureSection = [];
  if (signatureBase64) {
    console.log('=== ADDING SIGNATURE SECTION ===');
    signatureSection.push(
      // Add some space before signature
      {
        text: '',
        margin: [0, 40, 0, 0]
      },
      // Signature section
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                image: signatureBase64,
                width: 120,
                height: 60,
                margin: [0, 0, 0, 10]
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
            text: '' // Empty space on right
          }
        ],
        margin: [0, 20, 0, 0]
      }
    );
  }

  // Create document definition
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header Section
      ...headerContent,

      // Bill To Section
      {
        text: 'BILL TO',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      {
        stack: [
          {
            text: clientData.name,
            style: 'clientName',
            margin: [0, 0, 0, 5]
          },
          {
            text: clientData.billing_address || '',
            style: 'clientAddress',
            margin: [0, 0, 0, 5]
          },
          {
            text: clientData.gstin ? `GSTIN: ${clientData.gstin}` : '',
            style: 'clientGstin'
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Items Table
      {
        table: {
          headerRows: 1,
          widths: ['*', 60, 80, 80],
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
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 0, 0, 30]
      },

      // Totals Section
      {
        columns: [
          {
            width: '60%',
            text: ''
          },
          {
            width: '40%',
            table: {
              widths: ['*', 80],
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
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 6,
              paddingBottom: () => 6
            }
          }
        ],
        margin: [0, 0, 0, 40]
      },

      // Grand Total Section
      {
        columns: [
          {
            width: '60%',
            text: ''
          },
          {
            width: '40%',
            table: {
              widths: ['*', 80],
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
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 10,
              paddingBottom: () => 10
            }
          }
        ],
        margin: [0, 0, 0, 50]
      },

      // Footer
      {
        text: 'Thank you for your business!',
        style: 'footer',
        alignment: 'center',
        margin: [0, 30, 0, 0]
      },
      {
        text: companyData.name,
        style: 'footerCompany',
        alignment: 'center',
        margin: [0, 5, 0, 0]
      },

      // Signature Section (if enabled)
      ...signatureSection
    ],
    styles: {
      companyName: {
        fontSize: 16,
        bold: true,
        color: '#333333'
      },
      companyAddress: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.3
      },
      companyGstin: {
        fontSize: 10,
        color: '#666666'
      },
      invoiceTitle: {
        fontSize: 28,
        bold: true,
        color: '#333333'
      },
      invoiceNumber: {
        fontSize: 11,
        color: '#666666'
      },
      invoiceDate: {
        fontSize: 11,
        color: '#666666'
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      clientName: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      clientAddress: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.2
      },
      clientGstin: {
        fontSize: 10,
        color: '#666666'
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#333333',
        fillColor: '#f5f5f5'
      },
      tableCell: {
        fontSize: 10,
        color: '#333333',
        margin: [0, 2, 0, 2]
      },
      totalLabel: {
        fontSize: 10,
        color: '#666666'
      },
      totalValue: {
        fontSize: 10,
        color: '#333333'
      },
      grandTotalLabel: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      grandTotalValue: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      finalTotalLabel: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      finalTotalValue: {
        fontSize: 16,
        bold: true,
        color: '#333333'
      },
      footer: {
        fontSize: 12,
        color: '#666666'
      },
      footerCompany: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      signatureLabel: {
        fontSize: 10,
        color: '#333333',
        bold: true
      }
    }
  };

  console.log('=== PDF GENERATION COMPLETE ===');
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
