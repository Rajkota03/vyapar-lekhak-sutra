
export interface LineItem {
  id?: string;
  item_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  cgst?: number;
  sgst?: number;
  amount: number;
  discount_amount?: number;
  note?: string;
  item?: {
    id: string;
    name: string;
    code?: string;
    default_price?: number;
    default_cgst?: number;
    default_sgst?: number;
    photo_url?: string;
  };
}

export interface Item {
  id: string;
  name: string;
  code?: string;
  default_price?: number;
  default_cgst?: number;
  default_sgst?: number;
  photo_url?: string;
}

export interface Invoice {
  id?: string;
  number: string;
  invoice_code?: string;
  company_id: string;
  client_id: string;
  issue_date: string;
  due_date?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
  use_igst?: boolean;
  cgst_pct?: number;
  sgst_pct?: number;
  igst_pct?: number;
  show_my_signature?: boolean;
  require_client_signature?: boolean;
  notes?: string | null;
}
