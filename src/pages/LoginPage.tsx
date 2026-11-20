import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/brand/Logo';

// Código do operador: 3 a 20 letras ou números (ex.: 001, CAIXA2).
const CODIGO_VALIDO = /^[A-Za-z0-9]{3,20}$/;

const DESTAQUES = ['Busca instantânea', 'Dinheiro, cartão ou Pix', 'Estoque em tempo real'];

export function LoginPage() {
  const [operatorCode, setOperatorCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = operatorCode.trim().toUpperCase();

    if (!CODIGO_VALIDO.test(code)) {
      setError('Use de 3 a 20 letras ou números, sem espaços.');
      return;
    }

    login(code);
    navigate('/pdv', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-16">
      {/* Gradiente suave ao fundo, no estilo dos papéis de parede do macOS */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-[#0071e3]/20 blur-[130px]" />
        <div className="absolute -right-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[#bf5af2]/18 blur-[130px]" />
        <div className="absolute -bottom-48 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#64d2ff]/25 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <div className="flex animate-fade-up justify-center">
          <Logo size={44} showWordmark={false} />
        </div>

        <h1 className="mt-8 animate-fade-up font-display text-5xl font-bold tracking-[-0.035em] [animation-delay:80ms] sm:text-6xl">
          Venda rápida.
          <br />
          <span className="text-gradient">Estoque certo.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm animate-fade-up text-[17px] leading-relaxed text-muted [animation-delay:160ms]">
          O ponto de venda do Click Shop. Entre com o seu código de operador para abrir o caixa.
        </p>

        <form
          onSubmit={handleLogin}
          className="glass mt-10 animate-fade-up rounded-[28px] p-6 text-left shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.05] [animation-delay:240ms]"
          noValidate
        >
          <label htmlFor="operator-code" className="mb-2 block text-[13px] font-medium text-muted">
            Código do operador
          </label>
          <input
            id="operator-code"
            type="text"
            value={operatorCode}
            onChange={(e) => {
              setOperatorCode(e.target.value);
              setError('');
            }}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[17px] tracking-wide outline-none transition placeholder:text-muted/50 focus:border-brand focus:ring-4 focus:ring-brand/15"
            placeholder="Ex.: 001"
            autoComplete="username"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'operator-code-error' : undefined}
            required
          />
          {error && (
            <p id="operator-code-error" role="alert" className="mt-2 text-[13px] text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-brand py-3.5 text-[17px] font-semibold text-white transition hover:bg-[#0077ed] active:scale-[0.98]"
          >
            Abrir caixa
          </button>
        </form>

        <ul className="mt-8 flex animate-fade-up flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-muted [animation-delay:320ms]">
          {DESTAQUES.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
