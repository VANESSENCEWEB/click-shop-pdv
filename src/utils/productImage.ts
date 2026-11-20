import type { Product } from '../types';

/**
 * Foto do produto: usa `image` do banco quando existir; senão, a foto local
 * em public/products/<código>.jpg (imagens CC0, créditos em public/products/CREDITOS.md).
 */
export function productImage(product: Pick<Product, 'image' | 'code'>): string | undefined {
  if (product.image) return product.image;
  if (product.code) return `${import.meta.env.BASE_URL}products/${product.code}.jpg`;
  return undefined;
}
