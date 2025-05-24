
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    fontSize: 11, 
    padding: 30, 
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF'
  },
  row: { 
    flexDirection: 'row' 
  },
  cell: { 
    borderRight: '1pt solid #d9d9d9', 
    padding: 4,
    borderBottom: '1pt solid #d9d9d9'
  },
  header: { 
    fontSize: 18, 
    marginBottom: 20,
    fontWeight: 'bold'
  },
  tableHeader: { 
    backgroundColor: '#f5f5f5', 
    fontWeight: 'bold',
    borderTop: '1pt solid #d9d9d9'
  },
  companyHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  billTo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9'
  },
  totalsSection: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: 250
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTop: '2pt solid #000',
    marginTop: 4,
    fontWeight: 'bold'
  }
});

interface InvoicePdfDocumentProps {
  invoice: any;
  company: any;
  client: any;
  lines: any[];
}

export const InvoicePdfDocument: React.FC<InvoicePdfDocumentProps> = ({ 
  invoice, 
  company, 
  client, 
  lines 
}) => {
  const currency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={{ ...styles.row, justifyContent: 'space-between', marginBottom: 30 }}>
          <View>
            {company?.logo_url && (
              <Image src={company.logo_url} style={{ width: 80, height: 60, marginBottom: 10 }} />
            )}
            <Text style={styles.companyHeader}>{company?.name || 'Company Name'}</Text>
            {company?.address && (
              <Text style={{ fontSize: 9, color: '#666' }}>{company.address}</Text>
            )}
            {company?.gstin && (
              <Text style={{ fontSize: 9, color: '#666' }}>GSTIN: {company.gstin}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.header}>INVOICE</Text>
            <Text style={{ fontSize: 10, marginBottom: 2 }}>Invoice # {invoice?.invoice_code || invoice?.number}</Text>
            <Text style={{ fontSize: 10, marginBottom: 2 }}>Date: {new Date(invoice?.issue_date).toLocaleDateString('en-IN')}</Text>
            {invoice?.due_date && (
              <Text style={{ fontSize: 10, color: '#666' }}>Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}</Text>
            )}
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.billTo}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Bill To:</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{client?.name || 'Client Name'}</Text>
          {client?.billing_address && (
            <Text style={{ fontSize: 10, marginTop: 4 }}>{client.billing_address}</Text>
          )}
          {client?.phone && (
            <Text style={{ fontSize: 10, marginTop: 2 }}>Phone: {client.phone}</Text>
          )}
          {client?.email && (
            <Text style={{ fontSize: 10, marginTop: 2 }}>Email: {client.email}</Text>
          )}
          {client?.gstin && (
            <Text style={{ fontSize: 10, marginTop: 2 }}>GSTIN: {client.gstin}</Text>
          )}
        </View>

        {/* Items Table Header */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={{ ...styles.cell, flex: 4, fontWeight: 'bold' }}>Item Description</Text>
          <Text style={{ ...styles.cell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>Price</Text>
          <Text style={{ ...styles.cell, flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Qty</Text>
          <Text style={{ flex: 1, textAlign: 'right', padding: 4, borderBottom: '1pt solid #d9d9d9', fontWeight: 'bold' }}>Total</Text>
        </View>

        {/* Items Table Body */}
        {lines?.map((line, i) => (
          <View key={i} style={styles.row}>
            <Text style={{ ...styles.cell, flex: 4 }}>{line.description}</Text>
            <Text style={{ ...styles.cell, flex: 1, textAlign: 'right' }}>{currency(Number(line.unit_price))}</Text>
            <Text style={{ ...styles.cell, flex: 1, textAlign: 'center' }}>{line.qty}</Text>
            <Text style={{ flex: 1, textAlign: 'right', padding: 4, borderBottom: '1pt solid #d9d9d9' }}>{currency(Number(line.amount))}</Text>
          </View>
        ))}

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{currency(Number(invoice?.subtotal || 0))}</Text>
          </View>
          
          {!invoice?.use_igst && Number(invoice?.cgst || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text>CGST ({invoice?.cgst_pct || 9}%)</Text>
              <Text>{currency(Number(invoice.cgst))}</Text>
            </View>
          )}
          
          {!invoice?.use_igst && Number(invoice?.sgst || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text>SGST ({invoice?.sgst_pct || 9}%)</Text>
              <Text>{currency(Number(invoice.sgst))}</Text>
            </View>
          )}
          
          {invoice?.use_igst && Number(invoice?.igst || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text>IGST ({invoice?.igst_pct || 18}%)</Text>
              <Text>{currency(Number(invoice.igst))}</Text>
            </View>
          )}
          
          <View style={styles.grandTotalRow}>
            <Text>Grand Total</Text>
            <Text>{currency(Number(invoice?.total || 0))}</Text>
          </View>
        </View>

        {/* Payment Terms */}
        {company?.payment_note && (
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Payment Terms:</Text>
            <Text style={{ fontSize: 10 }}>{company.payment_note}</Text>
          </View>
        )}

        {/* Signature Section */}
        {(invoice?.show_my_signature || invoice?.require_client_signature) && (
          <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
            {invoice?.show_my_signature && (
              <View>
                <Text style={{ fontSize: 10, marginBottom: 20 }}>Authorized Signature:</Text>
                {company?.signature_url && (
                  <Image src={company.signature_url} style={{ width: 120, height: 40 }} />
                )}
                <Text style={{ borderTop: '1pt solid #000', width: 150, marginTop: 10 }}></Text>
              </View>
            )}
            
            {invoice?.require_client_signature && (
              <View>
                <Text style={{ fontSize: 10, marginBottom: 20 }}>Client Signature:</Text>
                <Text style={{ borderTop: '1pt solid #000', width: 150, marginTop: 50 }}></Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

interface InvoicePdfPreviewProps {
  invoice: any;
  company: any;
  client: any;
  lines: any[];
}

export const InvoicePdfPreview: React.FC<InvoicePdfPreviewProps> = (props) => {
  return (
    <div className="w-full h-full">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <InvoicePdfDocument {...props} />
      </PDFViewer>
    </div>
  );
};
