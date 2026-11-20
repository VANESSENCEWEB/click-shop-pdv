interface LogoProps {
  /** Tamanho do ícone em px. */
  size?: number;
  showWordmark?: boolean;
}

/** Marca do Click Shop: cursor de clique dentro de um quadrado arredondado. */
export function Logo({ size = 30, showWordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3a3c" />
            <stop offset="1" stopColor="#1d1d1f" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#logo-bg)" />
        <path
          d="M11 8.5v14.2l3.9-3.7 2.6 5.8 2.6-1.2-2.6-5.7 5.4-.3z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="font-display text-[19px] font-semibold tracking-tight text-ink">Click Shop</span>
      )}
    </span>
  );
}
