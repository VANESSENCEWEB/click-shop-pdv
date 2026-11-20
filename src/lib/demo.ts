/** Código do operador usado pelo link de demonstração. */
export const DEMO_OPERATOR = 'DEMO';

/**
 * Link de demonstração: abrir o app com "?demo" na URL já entra no caixa
 * como operador DEMO, sem passar pelo login. Serve para quem chega pelo
 * portfólio ver a tela de venda com um clique.
 * Não libera nada novo: o login aceita qualquer código de 3 a 20 caracteres.
 */
export function enterDemoModeFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('demo')) return;

  localStorage.setItem('operatorCode', DEMO_OPERATOR);

  // Tira o "?demo" da barra de endereço (sem recarregar a página).
  url.searchParams.delete('demo');
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}
