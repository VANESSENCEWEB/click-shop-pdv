import type { CartItem } from '../../types';
import {
  formatPrice,
  getCartTotal,
  getSubtotal,
  removeFromCart,
  updateQuantity,
} from '../../utils/cartUtils';

interface CartProps {
  items: CartItem[];
  onUpdateCart: (newCart: CartItem[]) => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateCart, onCheckout }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Carrinho</h2>
        <p className="text-gray-500">Carrinho vazio</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Carrinho</h2>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border-b pb-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price)} cada
                </p>
              </div>

              <button
                onClick={() => onUpdateCart(removeFromCart(items, item.id))}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  onClick={() =>
                    onUpdateCart(
                      updateQuantity(items, item.id, item.quantity - 1)
                    )
                  }
                  className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                >
                  -
                </button>

                <span className="w-8 text-center">{item.quantity}</span>

                <button
                  type="button"
                  aria-label={`Aumentar quantidade de ${item.name}`}
                  onClick={() =>
                    onUpdateCart(
                      updateQuantity(items, item.id, item.quantity + 1)
                    )
                  }
                  disabled={item.quantity >= item.stock}
                  className="w-8 h-8 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <span className="font-semibold text-blue-600">
                {formatPrice(getSubtotal(item))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t mt-4 pt-4 flex justify-between items-center">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-lg font-bold text-blue-600">
          {formatPrice(getCartTotal(items))}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-4 w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
      >
        Finalizar venda
      </button>
    </div>
  );
}