import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Cart } from '../components/cart/Cart';
import type { CartItem } from '../types';
import { addToCart, formatPrice } from '../utils/cartUtils';

export function PdvPage() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

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

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Carregando produtos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Erro ao carregar produtos: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ponto de Venda</h1>

      <input
        type="text"
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
              Nenhum produto cadastrado no Firebase.
              <br />
              Cadastre na coleção <strong>products</strong> no Firestore.
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
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

                  <p className="text-sm text-gray-600">
                    Estoque: {product.stock}
                  </p>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Cart items={cart} onUpdateCart={setCart} />
        </div>
      </div>
    </div>
  );
}