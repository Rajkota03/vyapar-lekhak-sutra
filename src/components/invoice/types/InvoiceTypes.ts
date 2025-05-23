
export type Item = {
  id: string;
  name: string;
  code?: string;
  default_price?: number;
  default_cgst?: number;
  default_sgst?: number;
  photo_url?: string;
  company_id: string;
};

export type LineItem = {
  id?: string;
  item_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  cgst: number;
  sgst: number;
  amount: number;
};
