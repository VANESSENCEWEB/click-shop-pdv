import { useEffect } from 'react';
import type { PaymentMethod, Sale } from '../../types';
import { formatPrice } from '../../utils/cartUtils';

const NOME_PAGAMENTO: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'Pix',
};

interface ReceiptProps {
  sale: Sale;
  onClose: () => void;
}

/** Comprovante da venda (não fiscal), com opção de imprimir. */
export function Receipt({ sale, onClose }: ReceiptProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const data = new Date(sale.date).toLocaleString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/30 p-4 backdrop-blur-md">
      <div role="dialog" aria-modal="true" aria-labelledby="receipt-title" className="w-full max-w-sm animate-scale-in">
        <div className="receipt-print receipt-edge bg-white px-6 pb-10 pt-6 font-mono text-sm shadow-2xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34c759]/15 px-3 py-1 font-sans text-xs font-semibold text-ok">
              ✓ Venda registrada
            </span>
            <h2 id="receipt-title" className="mt-3 font-sans text-lg font-extrabold tracking-tight">
              CLICK SHOP
            </h2>
            <p className="text-xs text-muted">Comprovante de venda</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Nº {sale.id.slice(0, 8).toUpperCase()} · Op. {sale.operator}
              <br />
              {data}
            </p>
          </div>

          <ul className="mt-4 space-y-2 border-y border-dashed border-ink/25 py-3">
            {sale.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-muted">{item.quantity}×</span> {item.name}
                </span>
                <span className="tabular shrink-0">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 space-y-1">
            <div className="flex justify-between text-base font-bold">
              <dt>TOTAL</dt>
              <dd className="tabular">{formatPrice(sale.total)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Pagamento</dt>
              <dd>{NOME_PAGAMENTO[sale.paymentMethod]}</dd>
            </div>
            {sale.paymentMethod === 'dinheiro' && (
              <>
                <div className="flex justify-between text-muted">
                  <dt>Recebido</dt>
                  <dd className="tabular">{formatPrice(sale.amountReceived)}</dd>
                </div>
                <div className="flex justify-between font-bold">
                  <dt>Troco</dt>
                  <dd className="tabular">{formatPrice(sale.change)}</dd>
                </div>
              </>
            )}
          </dl>

          <p className="mt-5 text-center text-[11px] text-muted">*** Documento sem valor fiscal ***</p>
        </div>

        <div className="mt-4 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-full bg-white py-3.5 font-semibold text-brand shadow-sm transition hover:bg-white/90 active:scale-[0.98]"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex-1 rounded-full bg-brand py-3.5 font-semibold text-white transition hover:bg-[#0077ed] active:scale-[0.98]"
          >
            Próximo cliente
          </button>
        </div>
      </div>
    </div>
  );
}
