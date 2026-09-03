import { useMarkets } from "./markets";

export { COINS, formatUsd, formatCompact, formatAmount, formatPct, coinIconUrl } from "./markets";
export type { Coin, MarketCoin } from "./markets";

export type PriceEntry = { usd: number; change24h: number };
export type PriceMap = Record<string, PriceEntry>;

/** Thin compatibility layer over the richer market feed. */
export function usePrices() {
  const { coins, isLive, isLoading } = useMarkets();
  const prices: PriceMap = {};
  for (const coin of coins) prices[coin.id] = { usd: coin.price, change24h: coin.change24h };
  return { prices, isLive, isLoading };
}
