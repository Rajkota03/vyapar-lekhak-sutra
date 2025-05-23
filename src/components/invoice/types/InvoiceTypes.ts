
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
  };
}

export interface Item {
  id: string;
  name: string;
  code?: string;
  default_price?: number;
  default_cgst?: number;
  default_sgst?: number;
}
