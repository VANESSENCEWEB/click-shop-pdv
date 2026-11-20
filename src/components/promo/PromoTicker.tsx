import { useEffect, useState, type ReactNode } from 'react';

interface Promo {
  icon: ReactNode;
  title: string;
  detail: string;
}

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'h-5 w-5',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  'aria-hidden': true,
} as const;

/** Mensagens para quem está comprando acompanhar na tela do caixa. */
const PROMOS: Promo[] = [
  {
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M2.5 10h19M6.5 15h4" strokeLinecap="round" />
      </svg>
    ),
    title: 'Parcele sua compra em até 10x',
    detail: 'sem juros no cartão de crédito',
  },
  {
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l9 9-9 9-9-9z" strokeLinejoin="round" />
        <path d="M12 8.5v7M9.5 12h5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Pague à vista ou no Pix e ganhe 5% de desconto',
    detail: 'pergunte ao operador do caixa',
  },
  {
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
    ),
    title: 'Entre no nosso site e confira todas as promoções exclusivas',
    detail: 'clickshop.com.br/ofertas',
  },
];

const INTERVAL_MS = 4500;

/** Faixa de promoções que gira sozinha (pausa quando o mouse está em cima). */
export function PromoTicker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % PROMOS.length), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [index, paused]);

  const promo = PROMOS[index];

  return (
    <aside
      aria-label="Promoções"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(110deg,#0071e3_0%,#5e5ce6_55%,#bf5af2_100%)] px-5 py-4 text-white shadow-[0_18px_40px_-18px_rgba(94,92,230,0.7)]"
    >
      {/* Brilho que atravessa a faixa */}
      <div
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-[shine_4.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-4">
        <span
          key={`icon-${index}`}
          className="grid h-10 w-10 shrink-0 animate-scale-in place-items-center rounded-full bg-white/20 ring-1 ring-white/30"
        >
          {promo.icon}
        </span>

        <div key={index} className="min-w-0 flex-1 animate-fade-up" aria-live="polite">
          <p className="text-[15px] font-semibold leading-snug tracking-tight sm:truncate sm:text-[16px]">{promo.title}</p>
          <p className="text-[13px] text-white/75 sm:truncate">{promo.detail}</p>
        </div>

        <div className="flex shrink-0 gap-1.5" role="tablist" aria-label="Escolher promoção">
          {PROMOS.map((item, i) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.title}
              onClick={() => setIndex(i)}
              className="relative h-1.5 w-6 overflow-hidden rounded-full bg-white/30"
            >
              {i === index && (
                <span
                  key={`${index}-${paused}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={
                    paused
                      ? { width: '100%' }
                      : { animation: `progress ${INTERVAL_MS}ms linear both` }
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
