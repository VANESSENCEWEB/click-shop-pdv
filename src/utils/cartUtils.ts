import type { CartItem, Product } from '../types';

export function getSubtotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + getSubtotal(item), 0);
}

export function addToCart(cart: CartItem[], product: Product): CartItem[] {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      return cart;
    }

    return cart.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }

  if (product.stock <= 0) {
    return cart;
  }

  return [...cart, { ...product, quantity: 1 }];
}

export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.id !== productId);
}

export function updateQuantity(
  cart: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(cart, productId);
  }

  return cart.map((item) => {
    if (item.id !== productId) return item;

    const safeQuantity = Math.min(quantity, item.stock);
    return { ...item, quantity: safeQuantity };
  });
}

export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}