import { useEffect, useRef, useState } from 'react';
import type { CartItem, PaymentMethod, Sale } from '../../types';
import { formatPrice, getCartTotal } from '../../utils/cartUtils';
import { finalizeSale, SaleError, toCents } from '../../services/salesService';

interface CheckoutModalProps {
  cart: CartItem[];
  operator: string;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

const METODOS: { id: PaymentMethod; label: string }[] = [
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'pix', label: 'Pix' },
];

/** "50", "50,00" ou "1.234,56" → número. Devolve NaN se não for um valor válido. */
function parseMoney(text: string): number {
  const normalized = text.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function CheckoutModal({ cart, operator, onClose, onSuccess }: CheckoutModalProps) {
  const total = toCents(getCartTotal(cart));
  const [method, setMethod] = useState<PaymentMethod>('dinheiro');
  const [received, setReceived] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const receivedRef = useRef<HTMLInputElement>(null);

  const receivedValue = parseMoney(received);
  const change = method === 'dinheiro' && !Number.isNaN(receivedValue) ? toCents(receivedValue - total) : 0;
  const cashInvalid = method === 'dinheiro' && (Number.isNaN(receivedValue) || receivedValue < total);

  useEffect(() => {
    if (method === 'dinheiro') receivedRef.current?.focus();
  }, [method]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    if (cashInvalid) {
      setError('Informe um valor recebido igual ou maior que o total.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const sale = await finalizeSale({
        cart,
        paymentMethod: method,
        amountReceived: method === 'dinheiro' ? receivedValue : total,
        operator,
      });
      onSuccess(sale);
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      setError(
        err instanceof SaleError
          ? err.message
          : 'Não foi possível registrar a venda. Verifique a conexão e tente de novo.'
      );
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onSubmit={handleConfirm}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="checkout-title" className="text-2xl font-bold">Finalizar venda</h2>
        <p className="mt-1 text-gray-600">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} itens ·{' '}
          <strong className="text-blue-600">{formatPrice(total)}</strong>
        </p>

        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-medium">Forma de pagamento</legend>
          <div className="grid grid-cols-3 gap-2">
            {METODOS.map((item) => (
              <label
                key={item.id}
                className={`cursor-pointer rounded-lg border p-3 text-center font-medium ${
                  method === item.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={item.id}
                  checked={method === item.id}
                  onChange={() => {
                    setMethod(item.id);
                    setError('');
                  }}
                  className="sr-only"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        {method === 'dinheiro' && (
          <div className="mt-5">
            <label htmlFor="amount-received" className="mb-1 block text-sm font-medium">
              Valor recebido (R$)
            </label>
            <input
              id="amount-received"
              ref={receivedRef}
              inputMode="decimal"
              autoComplete="off"
              value={received}
              onChange={(e) => {
                setReceived(e.target.value.replace(/[^\d,.]/g, ''));
                setError('');
              }}
              placeholder={formatPrice(total).replace('R$', '').trim()}
              className="w-full rounded-lg border p-3 text-lg"
            />
            <p className="mt-2 text-sm text-gray-600" aria-live="polite">
              Troco:{' '}
              <strong className={change > 0 ? 'text-green-700' : ''}>
                {formatPrice(Math.max(change, 0))}
              </strong>
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg border py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={saving || cashInvalid}
            className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? 'Registrando…' : 'Confirmar'}
          </button>
        </div>
      </form>
    </div>
  );
}
