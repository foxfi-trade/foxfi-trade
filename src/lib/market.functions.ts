import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Small in-process cache so upstream feeds are not hammered per visitor. */
const cache = new Map<string, { at: number; data: unknown }>();

/**
 * Never throws: upstream feeds rate-limit (429) or reject (400) unpredictably.
 * Returns stale cached data when available, otherwise null so the client
 * falls back to its own dataset instead of surfacing an error.
 */
async function cachedJson<T>(key: string, url: string, ttlMs: number): Promise<T | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      console.warn(`market feed ${key}: upstream ${res.status}`);
      // Back off briefly so a rate-limited feed is not retried on every request.
      if (hit) cache.set(key, { at: Date.now() - Math.max(0, ttlMs - 30_000), data: hit.data });
      return (hit?.data as T) ?? null;
    }
    const data = (await res.json()) as T;
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (error) {
    console.warn(`market feed ${key} failed`, error);
    return (hit?.data as T) ?? null;
  }
}

const COIN_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "usd-coin",
  "tether",
  "binancecoin",
  "ripple",
  "cardano",
  "dogecoin",
  "avalanche-2",
  "chainlink",
  "polygon-ecosystem-token",
  "sui",
  "arbitrum",
  "optimism",
  "aave",
  "uniswap",
  "lido-dao",
  "pepe",
].join(",");

export type RawMarketRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  ath: number;
  ath_change_percentage: number;
  circulating_supply: number;
  market_cap_rank: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  sparkline_in_7d?: { price: number[] };
};

export type RawGlobal = {
  data: {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
  };
};

export type RawFng = { data: { value: string; value_classification: string }[] };

export type RawChain = { name: string; tvl: number; tokenSymbol: string | null };

export const fetchMarketsFn = createServerFn({ method: "GET" }).handler(async () =>
  cachedJson<RawMarketRow[]>(
    "markets",
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`,
    45_000,
  ),
);

export const fetchGlobalFn = createServerFn({ method: "GET" }).handler(async () =>
  cachedJson<RawGlobal>("global", "https://api.coingecko.com/api/v3/global", 120_000),
);

export const fetchFearGreedFn = createServerFn({ method: "GET" }).handler(async () =>
  cachedJson<RawFng>("fng", "https://api.alternative.me/fng/?limit=1", 600_000),
);

export const fetchChainsFn = createServerFn({ method: "GET" }).handler(async () =>
  cachedJson<RawChain[]>("chains", "https://api.llama.fi/v2/chains", 600_000),
);

export const fetchChartFn = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ id: z.string().min(1).max(60), days: z.number().int().min(1).max(365) }).parse(data),
  )
  .handler(async ({ data }) =>
    cachedJson<{ prices: [number, number][] }>(
      `chart:${data.id}:${data.days}`,
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(data.id)}/market_chart?vs_currency=usd&days=${data.days}`,
      120_000,
    ),
  );
