import { useEffect, useState } from 'react';

/** Data/hora atual, atualizada a cada `intervalMs` (padrão: 15 s, suficiente para um relógio de minutos). */
export function useNow(intervalMs = 15000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
