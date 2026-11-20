export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
  code?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'dinheiro' | 'cartao' | 'pix';

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
  operator: string;
  /** Data local do comprovante (no Firestore fica o horário do servidor). */
  date: string;
}
