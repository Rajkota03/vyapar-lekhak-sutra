import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice, LineItem } from '@/components/invoice/types/InvoiceTypes';
import { Client } from '@/hooks/useInvoiceData';

// Initialize pdfMake with fonts - correct way
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

interface CompanyData {
  name: string;
  address?: string;
  gstin?: string;
  logo_url?: string;
}

export const generateInvoicePDF = async (
  invoiceData: Invoice,
  clientData: Client,
  companyData: CompanyData,
  lineItems: LineItem[]
) => {
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

  // Create document definition
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header Section
      {
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
      },

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
      }
    ],
    styles: {
      companyName: {
        fontSize: 20,
        bold: true,
        color: '#333333'
      },
      companyAddress: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.2
      },
      companyGstin: {
        fontSize: 10,
        color: '#666666'
      },
      invoiceTitle: {
        fontSize: 24,
        bold: true,
        color: '#333333'
      },
      invoiceNumber: {
        fontSize: 12,
        color: '#666666'
      },
      invoiceDate: {
        fontSize: 12,
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
      }
    }
  };

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
