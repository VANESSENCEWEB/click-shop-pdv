import type { Product } from '../types';

/** Catálogo de exemplo para a demonstração (uma lojinha de conveniência). */
export const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  { code: '1001', name: 'Café torrado 500g', price: 18.9, stock: 24, category: 'Mercearia' },
  { code: '1002', name: 'Açúcar refinado 1kg', price: 5.49, stock: 40, category: 'Mercearia' },
  { code: '1003', name: 'Leite integral 1L', price: 5.99, stock: 36, category: 'Laticínios' },
  { code: '1004', name: 'Biscoito recheado 140g', price: 3.79, stock: 50, category: 'Snacks' },
  { code: '1005', name: 'Refrigerante lata 350ml', price: 4.5, stock: 60, category: 'Bebidas' },
  { code: '1006', name: 'Água mineral 500ml', price: 2.5, stock: 80, category: 'Bebidas' },
  { code: '1007', name: 'Sabonete 85g', price: 2.89, stock: 30, category: 'Higiene' },
  { code: '1008', name: 'Pão de forma 400g', price: 8.49, stock: 12, category: 'Padaria' },
  { code: '1009', name: 'Chocolate ao leite 90g', price: 6.99, stock: 3, category: 'Snacks' },
];
