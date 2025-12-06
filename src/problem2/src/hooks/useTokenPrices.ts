import { useEffect, useMemo, useState } from 'react';

export type TokenPrice = {
  symbol: string;
  price: number;
  date: string;
};

type RawPrice = {
  currency: string;
  date: string;
  price: number;
};

type UseTokenPricesResult = {
  tokens: TokenPrice[];
  loading: boolean;
  error: string | null;
};

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

function normalizePrices(raw: RawPrice[]): TokenPrice[] {
  const latestBySymbol = new Map<string, RawPrice>();

  for (const item of raw) {
    if (typeof item.price !== 'number' || item.price <= 0) continue;

    const existing = latestBySymbol.get(item.currency);
    if (!existing) {
      latestBySymbol.set(item.currency, item);
      continue;
    }
    if (new Date(item.date).getTime() > new Date(existing.date).getTime()) {
      latestBySymbol.set(item.currency, item);
    }
  }

  return Array.from(latestBySymbol.values())
    .map((p) => ({
      symbol: p.currency,
      price: p.price,
      date: p.date,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function useTokenPrices(): UseTokenPricesResult {
  const [raw, setRaw] = useState<RawPrice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(PRICES_URL);
        if (!res.ok) {
          throw new Error(`Failed to fetch prices: ${res.status}`);
        }
        const data = (await res.json()) as RawPrice[];
        if (isMounted) {
          setRaw(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const tokens = useMemo(() => (raw ? normalizePrices(raw) : []), [raw]);

  return { tokens, loading, error };
}
