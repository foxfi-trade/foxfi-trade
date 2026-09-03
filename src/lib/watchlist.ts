import { useCallback, useEffect, useState } from "react";

const WATCH_KEY = "foxfi.watchlist";
const ALERT_KEY = "foxfi.alerts";

export type PriceAlert = {
  id: string;
  coinId: string;
  symbol: string;
  direction: "above" | "below";
  target: number;
  createdAt: number;
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read<string[]>(WATCH_KEY, ["bitcoin", "ethereum", "solana"]));
    setReady(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      write(WATCH_KEY, next);
      return next;
    });
  }, []);

  return { ids, ready, toggle, isWatched: (id: string) => ids.includes(id) };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(read<PriceAlert[]>(ALERT_KEY, []));
  }, []);

  const add = useCallback((alert: Omit<PriceAlert, "id" | "createdAt">) => {
    setAlerts((current) => {
      const next = [
        ...current,
        { ...alert, id: Math.random().toString(36).slice(2), createdAt: Date.now() },
      ];
      write(ALERT_KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setAlerts((current) => {
      const next = current.filter((a) => a.id !== id);
      write(ALERT_KEY, next);
      return next;
    });
  }, []);

  return { alerts, add, remove };
}
