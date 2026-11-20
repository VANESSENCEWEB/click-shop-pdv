import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNow } from '../../hooks/useNow';
import { Logo } from '../brand/Logo';

export function Header() {
  const { operatorCode, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const now = useNow();

  if (location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dateRaw = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  const date = dateRaw.charAt(0).toUpperCase() + dateRaw.slice(1);
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="glass sticky top-0 z-40 border-b border-black/[0.06]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {isAuthenticated && (
          <div className="flex items-center gap-2 sm:gap-3">
            <time
              dateTime={now.toISOString()}
              className="hidden items-center gap-2 text-[13px] text-muted md:inline-flex"
            >
              <span>{date}</span>
              <span className="tabular font-semibold text-ink">{time}</span>
            </time>

            <span className="hidden h-5 w-px bg-black/10 md:block" aria-hidden="true" />

            <span className="hidden items-center gap-2 text-[13px] text-muted sm:inline-flex">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
              </span>
              Operador <strong className="font-semibold text-ink">{operatorCode}</strong>
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-danger px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm shadow-danger/30 transition hover:brightness-110 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
