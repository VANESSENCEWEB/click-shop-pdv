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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        className="receipt-print w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <p className="text-center text-sm font-medium text-green-700">Venda registrada ✓</p>
        <h2 id="receipt-title" className="mt-1 text-center text-xl font-bold">
          Comprovante
        </h2>
        <p className="text-center text-xs text-gray-500">
          Nº {sale.id.slice(0, 8).toUpperCase()} · {data} · Operador {sale.operator}
        </p>

        <ul className="mt-4 space-y-2 border-y border-dashed py-3 font-mono text-sm">
          {sale.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-3 space-y-1 font-mono text-sm">
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(sale.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Pagamento</dt>
            <dd>{NOME_PAGAMENTO[sale.paymentMethod]}</dd>
          </div>
          {sale.paymentMethod === 'dinheiro' && (
            <>
              <div className="flex justify-between">
                <dt>Recebido</dt>
                <dd>{formatPrice(sale.amountReceived)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Troco</dt>
                <dd>{formatPrice(sale.change)}</dd>
              </div>
            </>
          )}
        </dl>

        <p className="mt-4 text-center text-xs text-gray-400">Documento sem valor fiscal</p>

        <div className="mt-5 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-lg border py-3 font-medium hover:bg-gray-50"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
          >
            Nova venda
          </button>
        </div>
      </div>
    </div>
  );
}
