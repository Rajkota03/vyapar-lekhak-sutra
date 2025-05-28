
export interface InvoiceData {
  id: string;
  invoice_code: string;
  issue_date: string;
  subtotal: number;
  total: number;
  use_igst: boolean;
  cgst_pct?: number;
  cgst?: number;
  sgst_pct?: number;
  sgst?: number;
  igst_pct?: number;
  igst?: number;
  show_my_signature?: boolean;
  require_client_signature?: boolean;
  company_id: string;
  companies?: CompanyData;
  clients?: ClientData;
}

export interface CompanyData {
  id: string;
  name: string;
  gstin?: string;
  logo_url?: string;
}

export interface ClientData {
  id: string;
  name: string;
  gstin?: string;
  billing_address?: string;
}

export interface CompanySettings {
  logo_url?: string;
  logo_scale?: string;
  signature_url?: string;
  payment_note?: string;
  sac_code?: string;
  updated_at?: string;
}

export interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
  amount: number;
}

export interface PDFContext {
  page: any;
  unicodeFont: any;
  fallbackFont: any;
  boldFont: any;
}

export interface DrawTextOptions {
  size?: number;
  bold?: boolean;
  color?: any;
  lineHeight?: number;
  textAlign?: string;
}
