import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CartItem, PaymentMethod, Sale, SaleItem } from '../types';

/** Arredonda para centavos (evita 0.1 + 0.2 = 0.30000000000000004). */
export function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export class SaleError extends Error {}

interface FinalizeSaleInput {
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number;
  operator: string;
}

/**
 * Fecha a venda numa transação do Firestore:
 * 1. lê o estoque atual de cada produto;
 * 2. se algum não tiver estoque suficiente, cancela tudo;
 * 3. baixa o estoque e grava a venda de uma vez só.
 * Assim duas vendas ao mesmo tempo não deixam o estoque negativo.
 */
export async function finalizeSale({
  cart,
  paymentMethod,
  amountReceived,
  operator,
}: FinalizeSaleInput): Promise<Sale> {
  if (cart.length === 0) throw new SaleError('O carrinho está vazio.');

  const saleRef = doc(collection(db, 'sales'));

  const sale = await runTransaction(db, async (transaction) => {
    const productRefs = cart.map((item) => doc(db, 'products', item.id));
    const snapshots = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

    const items: SaleItem[] = cart.map((item, index) => {
      const snapshot = snapshots[index];
      if (!snapshot.exists()) {
        throw new SaleError(`O produto "${item.name}" não existe mais.`);
      }

      const data = snapshot.data();
      const stock = Number(data.stock);
      if (stock < item.quantity) {
        throw new SaleError(
          `Estoque insuficiente de "${data.name}": restam ${stock} e o carrinho tem ${item.quantity}.`
        );
      }

      // Preço e nome vêm do banco, não do carrinho.
      const price = Number(data.price);
      return {
        productId: item.id,
        name: String(data.name),
        price,
        quantity: item.quantity,
        subtotal: toCents(price * item.quantity),
      };
    });

    const total = toCents(items.reduce((sum, item) => sum + item.subtotal, 0));
    const received = paymentMethod === 'dinheiro' ? toCents(amountReceived) : total;

    if (received < total) {
      throw new SaleError('O valor recebido é menor que o total da venda.');
    }

    const change = toCents(received - total);

    items.forEach((item, index) => {
      const stock = Number(snapshots[index].data()!.stock);
      transaction.update(productRefs[index], { stock: stock - item.quantity });
    });

    transaction.set(saleRef, {
      items,
      total,
      paymentMethod,
      amountReceived: received,
      change,
      operator,
      createdAt: serverTimestamp(),
    });

    return { items, total, received, change };
  });

  return {
    id: saleRef.id,
    items: sale.items,
    total: sale.total,
    paymentMethod,
    amountReceived: sale.received,
    change: sale.change,
    operator,
    date: new Date().toISOString(),
  };
}
