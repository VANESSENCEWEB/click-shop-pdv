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
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/30 p-4 backdrop-blur-md">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onSubmit={handleConfirm}
        className="w-full max-w-md animate-scale-in rounded-[28px] bg-white p-7 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)]"
      >
        <p className="text-[13px] font-medium text-muted">
          {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
        </p>
        <h2 id="checkout-title" className="font-display text-[22px] font-bold tracking-tight">
          Finalizar venda
        </h2>
        <p className="tabular mt-3 font-display text-5xl font-bold tracking-[-0.035em]">{formatPrice(total)}</p>

        <fieldset className="mt-7">
          <legend className="mb-2 text-[13px] font-medium text-muted">Forma de pagamento</legend>
          <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-black/[0.05] p-1">
            {METODOS.map((item) => (
              <label
                key={item.id}
                className={`cursor-pointer rounded-lg py-2 text-center text-[14px] font-semibold transition-all duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                  method === item.id ? 'bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]' : 'text-muted hover:text-ink'
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
          <div className="mt-5 animate-fade-in">
            <label htmlFor="amount-received" className="mb-2 block text-[13px] font-medium text-muted">
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
              className="tabular w-full rounded-2xl bg-black/[0.05] px-4 py-3.5 text-[20px] font-semibold outline-none transition focus:bg-white focus:ring-4 focus:ring-brand/20"
            />
            <div className="mt-3 flex items-center justify-between px-1" aria-live="polite">
              <span className="text-[15px] text-muted">Troco</span>
              <strong className={`tabular text-[20px] font-bold ${change > 0 ? 'text-ok' : 'text-ink'}`}>
                {formatPrice(Math.max(change, 0))}
              </strong>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-danger/10 p-3 text-[13px] font-medium text-danger">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-full bg-black/[0.05] py-3.5 font-semibold transition hover:bg-black/[0.08] active:scale-[0.98] disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={saving || cashInvalid}
            className="flex-[1.4] rounded-full bg-brand py-3.5 font-semibold text-white transition hover:bg-[#0077ed] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/[0.06] disabled:text-muted/60"
          >
            {saving ? 'Registrando…' : 'Confirmar pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
