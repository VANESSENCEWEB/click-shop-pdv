import { useEffect, useRef, useState } from 'react';
import type { CartItem } from '../../types';
import { useNow } from '../../hooks/useNow';
import {
  formatPrice,
  getCartTotal,
  getSubtotal,
  removeFromCart,
  updateQuantity,
} from '../../utils/cartUtils';

interface CartProps {
  items: CartItem[];
  operator: string;
  onUpdateCart: (newCart: CartItem[]) => void;
  onCheckout: () => void;
}

/** Valor sem o "R$", para as colunas do cupom (ex.: 18,90). */
function plain(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Carrinho em forma de cupom: cada item adicionado "sai da impressora"
 * e a lista rola sozinha até a última linha.
 */
export function Cart({ items, operator, onUpdateCart, onCheckout }: CartProps) {
  const total = getCartTotal(items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const now = useNow();
  const listRef = useRef<HTMLDivElement>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Se o carrinho esvaziar, some a pergunta de cancelamento.
  useEffect(() => {
    if (items.length === 0) setConfirmCancel(false);
  }, [items.length]);

  // Rola até o fim quando entra um item novo.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [items.length]);

  const stamp = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.03),0_30px_60px_-24px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <h2 className="font-display text-[22px] font-bold tracking-tight">Cupom</h2>
          <p className="text-[12px] text-muted">
            {items.length === 0 ? 'Aguardando o primeiro item' : 'Venda em andamento'}
          </p>
        </div>
        <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[12px] font-semibold text-muted">
          {count} {count === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Papel da bobina */}
      <div className="mx-4 mt-4 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.12)]">
        <div className="receipt-edge rounded-t-xl bg-[#fbfbf8] pb-7 font-mono text-[12px] leading-relaxed text-ink">
          <div className="border-b border-dashed border-black/20 px-4 pb-3 pt-4 text-center">
            <p className="font-sans text-[13px] font-bold tracking-[0.18em]">CLICK SHOP</p>
            <p className="text-[11px] text-muted">
              {stamp} · Op. {operator}
            </p>
          </div>

          <div ref={listRef} className="max-h-[38vh] overflow-y-auto px-4" aria-live="polite">
            {items.length === 0 ? (
              <p className="py-8 text-center text-[11px] text-muted">
                — nenhum item registrado —
                <br />
                toque em + num produto
              </p>
            ) : (
              <ol className="divide-y divide-dashed divide-black/10">
                {items.map((item, index) => (
                  <li key={item.id} className="group animate-print py-2.5">
                    <div className="flex justify-between gap-2">
                      <span className="min-w-0 truncate">
                        <span className="text-muted">{String(index + 1).padStart(3, '0')} </span>
                        {item.name.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateCart(removeFromCart(items, item.id))}
                        aria-label={`Remover ${item.name}`}
                        className="shrink-0 font-sans text-[11px] font-semibold text-danger opacity-60 transition hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        Remover
                      </button>
                    </div>

                    <div
                      key={item.quantity}
                      className="mt-1 flex animate-flash items-center justify-between rounded-md"
                    >
                      <span className="flex items-center gap-1.5 text-muted">
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${item.name}`}
                          onClick={() => onUpdateCart(updateQuantity(items, item.id, item.quantity - 1))}
                          className="grid h-5 w-5 place-items-center rounded-full bg-black/[0.06] font-sans text-[13px] leading-none text-ink transition hover:bg-black/[0.12] active:scale-90"
                        >
                          −
                        </button>
                        <span className="tabular min-w-[1.5ch] text-center font-bold text-ink">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${item.name}`}
                          onClick={() => onUpdateCart(updateQuantity(items, item.id, item.quantity + 1))}
                          disabled={item.quantity >= item.stock}
                          className="grid h-5 w-5 place-items-center rounded-full bg-black/[0.06] font-sans text-[13px] leading-none text-ink transition hover:bg-black/[0.12] active:scale-90 disabled:opacity-30"
                        >
                          +
                        </button>
                        <span className="tabular">× {plain(item.price)}</span>
                        {item.code && <span className="hidden text-muted/60 sm:inline">#{item.code}</span>}
                      </span>
                      <span className="tabular font-bold">{plain(getSubtotal(item))}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mx-4 flex justify-between border-t border-dashed border-black/20 pt-3 font-bold">
            <span>SUBTOTAL</span>
            <span className="tabular">{plain(total)}</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-medium text-muted">Total</span>
          <span
            key={total}
            className="tabular animate-pop font-display text-[40px] font-bold leading-none tracking-[-0.03em]"
          >
            {formatPrice(total)}
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={items.length === 0}
          className="mt-5 w-full rounded-full bg-brand py-4 text-[17px] font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-[#0077ed] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/[0.06] disabled:text-muted/60 disabled:shadow-none"
        >
          Finalizar venda
        </button>

        {items.length > 0 &&
          (confirmCancel ? (
            <div role="alertdialog" aria-labelledby="cancel-title" className="mt-3 animate-scale-in rounded-2xl bg-danger/[0.07] p-4">
              <p id="cancel-title" className="text-[14px] font-semibold text-ink">
                Cancelar esta venda?
              </p>
              <p className="mt-0.5 text-[13px] text-muted">
                {count} {count === 1 ? 'item será removido' : 'itens serão removidos'} do cupom.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  autoFocus
                  className="flex-1 rounded-full bg-white py-2.5 text-[14px] font-semibold shadow-sm transition active:scale-[0.98]"
                >
                  Manter
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateCart([])}
                  className="flex-1 rounded-full bg-danger py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
                >
                  Sim, cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="mt-2 w-full rounded-full py-3 text-[15px] font-semibold text-danger transition hover:bg-danger/[0.07] active:scale-[0.98]"
            >
              Cancelar venda
            </button>
          ))}
      </div>
    </div>
  );
}
