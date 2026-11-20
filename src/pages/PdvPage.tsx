import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { Cart } from '../components/cart/Cart';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { Receipt } from '../components/checkout/Receipt';
import { seedSampleProducts } from '../services/productsService';
import type { CartItem, Sale } from '../types';
import { addToCart, formatPrice } from '../utils/cartUtils';

export function PdvPage() {
  const { products, loading, error } = useProducts();
  const { operatorCode } = useAuth();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState('');

  const term = search.toLowerCase().trim();

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.code?.toLowerCase().includes(term)
  );

  function handleAddToCart(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCart((currentCart) => addToCart(currentCart, product));
  }

  function handleSaleSuccess(sale: Sale) {
    setCheckoutOpen(false);
    setCart([]);
    setLastSale(sale);
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedError('');
    try {
      await seedSampleProducts();
    } catch (err) {
      console.error('Erro ao cadastrar produtos de exemplo:', err);
      setSeedError('Não foi possível cadastrar os produtos. Confira as regras do Firestore.');
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Carregando produtos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600" role="alert">
        Não foi possível carregar os produtos. Verifique a conexão e tente recarregar a página.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ponto de Venda</h1>

      <label htmlFor="product-search" className="sr-only">
        Buscar produto
      </label>
      <input
        id="product-search"
        type="search"
        placeholder="Buscar por código ou nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 border rounded-xl mb-6 text-lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Produtos ({filteredProducts.length})
          </h2>

          {products.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
              <p>Nenhum produto cadastrado ainda.</p>
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="mt-3 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white hover:bg-yellow-700 disabled:opacity-60"
              >
                {seeding ? 'Cadastrando…' : 'Cadastrar produtos de exemplo'}
              </button>
              {seedError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {seedError}
                </p>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0;
                const available = product.stock - inCart;
                return (
                  <div
                    key={product.id}
                    className="bg-white border rounded-xl p-4 shadow-sm"
                  >
                    <h3 className="font-semibold text-lg">{product.name}</h3>

                    {product.code && (
                      <p className="text-sm text-gray-500">
                        Código: {product.code}
                      </p>
                    )}

                    <p className="text-blue-600 font-bold mt-2">
                      {formatPrice(Number(product.price))}
                    </p>

                    <p className={`text-sm ${product.stock <= 5 ? 'text-orange-600' : 'text-gray-600'}`}>
                      Estoque: {product.stock}
                      {product.stock > 0 && product.stock <= 5 ? ' · últimas unidades' : ''}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={available <= 0}
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {product.stock === 0 ? 'Sem estoque' : available <= 0 ? 'Limite no carrinho' : 'Adicionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Cart items={cart} onUpdateCart={setCart} onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {checkoutOpen && cart.length > 0 && (
        <CheckoutModal
          cart={cart}
          operator={operatorCode ?? ''}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={handleSaleSuccess}
        />
      )}

      {lastSale && <Receipt sale={lastSale} onClose={() => setLastSale(null)} />}
    </div>
  );
}
