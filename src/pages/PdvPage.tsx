import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useNow } from '../hooks/useNow';
import { Cart } from '../components/cart/Cart';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { Receipt } from '../components/checkout/Receipt';
import { PromoTicker } from '../components/promo/PromoTicker';
import { seedSampleProducts } from '../services/productsService';
import type { CartItem, Sale } from '../types';
import { addToCart, formatPrice } from '../utils/cartUtils';
import { productImage } from '../utils/productImage';

const ALL = 'Todos';

export function PdvPage() {
  const { products, loading, error } = useProducts();
  const { operatorCode } = useAuth();
  const now = useNow(60000);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState('');

  const term = search.toLowerCase().trim();

  const categories = [ALL, ...new Set(products.map((p) => p.category).filter((c): c is string => !!c))];

  const filteredProducts = products
    .filter((product) => category === ALL || product.category === category)
    .filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.code?.toLowerCase().includes(term)
    )
    .sort((a, b) => (a.code ?? a.name).localeCompare(b.code ?? b.name));

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

  const todayRaw = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center text-muted" role="status">
        <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden="true" />
        Carregando produtos…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="rounded-3xl bg-white p-6 text-center text-danger shadow-sm" role="alert">
          Não foi possível carregar os produtos. Verifique a conexão e tente recarregar a página.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-labelledby="pdv-title" className="min-w-0">
        <div className="flex animate-fade-up items-end justify-between gap-4">
          <div>
            <p className="text-[15px] font-medium text-muted">{today}</p>
            <h1 id="pdv-title" className="mt-1 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              Ponto de Venda.
            </h1>
          </div>
          <p className="hidden text-[13px] text-muted sm:block">
            <span className="font-semibold text-ink">{filteredProducts.length}</span> de {products.length} produtos
          </p>
        </div>

        <div className="mt-6 animate-fade-up [animation-delay:40ms]">
          <PromoTicker />
        </div>

        <div className="relative mt-5 animate-fade-up [animation-delay:60ms]">
          <label htmlFor="product-search" className="sr-only">
            Buscar produto
          </label>
          <svg
            className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            id="product-search"
            type="search"
            placeholder="Buscar por código ou nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-black/[0.05] py-3.5 pl-13 pr-4 text-[17px] outline-none transition placeholder:text-muted focus:bg-white focus:ring-4 focus:ring-brand/20"
          />
        </div>

        {categories.length > 1 && (
          <div
            className="mt-4 inline-flex max-w-full animate-fade-up gap-0.5 overflow-x-auto rounded-xl bg-black/[0.05] p-1 [animation-delay:120ms]"
            role="group"
            aria-label="Filtrar por categoria"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300 ${
                  category === item
                    ? 'bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          {products.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="font-medium">Nenhum produto cadastrado ainda.</p>
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="mt-4 rounded-full bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-[#0077ed] active:scale-95 disabled:opacity-60"
              >
                {seeding ? 'Cadastrando…' : 'Cadastrar produtos de exemplo'}
              </button>
              {seedError && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {seedError}
                </p>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="rounded-3xl bg-white p-8 text-center text-muted shadow-sm">Nenhum produto encontrado.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => {
                const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0;
                const available = product.stock - inCart;
                // Disponível = estoque do banco menos o que já está no cupom.
                // O banco só baixa de verdade quando a venda é finalizada.
                const lowStock = available > 0 && available <= 5;
                const image = productImage(product);
                return (
                  <li
                    key={product.id}
                    style={{ animationDelay: `${160 + index * 40}ms` }}
                    className={`group relative flex animate-fade-up flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_24px_48px_-16px_rgba(0,0,0,0.18)] ${
                      inCart > 0 ? 'ring-2 ring-brand' : 'ring-1 ring-black/[0.04]'
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-paper">
                      {image && (
                        <img
                          src={image}
                          alt=""
                          loading="lazy"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                          className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105 ${
                            product.stock === 0 ? 'grayscale' : ''
                          }`}
                        />
                      )}
                      <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                        {product.category ?? 'Geral'}
                      </span>
                      {product.code && (
                        <span className="glass tabular absolute right-3 top-3 rounded-full px-2 py-1 text-[11px] font-medium text-muted">
                          {product.code}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 pt-4">
                    <h3 className="text-[17px] font-semibold leading-snug tracking-tight">{product.name}</h3>

                    <div className="mt-auto flex items-end justify-between pt-5">
                      <div>
                        <p className="tabular font-display text-2xl font-bold tracking-tight">
                          {formatPrice(Number(product.price))}
                        </p>
                        <p
                          key={available}
                          className={`mt-0.5 animate-pop text-[12px] ${
                            available === 0 ? 'font-semibold text-danger' : lowStock ? 'font-semibold text-[#ff9500]' : 'text-muted'
                          }`}
                        >
                          {product.stock === 0
                            ? 'Esgotado'
                            : available === 0
                              ? 'Todas as unidades no cupom'
                              : lowStock
                                ? `Últimas ${available} unidades`
                                : `${available} disponíveis`}
                          {inCart > 0 && available > 0 && (
                            <span className="ml-1 font-semibold text-brand">· {inCart} no cupom</span>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={available <= 0}
                        aria-label={
                          product.stock === 0
                            ? `${product.name}: sem estoque`
                            : available <= 0
                              ? `${product.name}: limite no carrinho`
                              : `Adicionar ${product.name}`
                        }
                        className="relative grid h-10 w-10 place-items-center rounded-full bg-brand text-white shadow-md shadow-brand/30 transition hover:scale-105 hover:bg-[#0077ed] active:scale-90 disabled:cursor-not-allowed disabled:bg-black/[0.06] disabled:text-muted/60 disabled:shadow-none"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                        {inCart > 0 && (
                          <span
                            key={inCart}
                            className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-white ring-2 ring-white"
                          >
                            {inCart}
                          </span>
                        )}
                      </button>
                    </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <aside className="animate-fade-up [animation-delay:120ms] lg:sticky lg:top-24 lg:self-start" aria-label="Carrinho">
        <Cart
          items={cart}
          operator={operatorCode ?? ''}
          onUpdateCart={setCart}
          onCheckout={() => setCheckoutOpen(true)}
        />
      </aside>

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
