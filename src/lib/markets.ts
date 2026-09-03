import { useQuery } from "@tanstack/react-query";
import {
  fetchChainsFn,
  fetchFearGreedFn,
  fetchGlobalFn,
  fetchMarketsFn,
} from "./market.functions";

export type Coin = { id: string; symbol: string; name: string };

export const COINS: Coin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "polygon-ecosystem-token", symbol: "POL", name: "Polygon" },
  { id: "sui", symbol: "SUI", name: "Sui" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum" },
  { id: "optimism", symbol: "OP", name: "Optimism" },
  { id: "aave", symbol: "AAVE", name: "Aave" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "lido-dao", symbol: "LDO", name: "Lido DAO" },
  { id: "pepe", symbol: "PEPE", name: "Pepe" },
];

const ICON_BASE = "https://assets.coingecko.com/coins/images";

/** Stable CDN logo URLs, used until the live market feed answers. */
const ICONS: Record<string, string> = {
  bitcoin: `${ICON_BASE}/1/large/bitcoin.png`,
  ethereum: `${ICON_BASE}/279/large/ethereum.png`,
  solana: `${ICON_BASE}/4128/large/solana.png`,
  "usd-coin": `${ICON_BASE}/6319/large/usdc.png`,
  tether: `${ICON_BASE}/325/large/Tether.png`,
  binancecoin: `${ICON_BASE}/825/large/bnb-icon2_2x.png`,
  ripple: `${ICON_BASE}/44/large/xrp-symbol-white-128.png`,
  cardano: `${ICON_BASE}/975/large/cardano.png`,
  dogecoin: `${ICON_BASE}/5/large/dogecoin.png`,
  "avalanche-2": `${ICON_BASE}/12559/large/Avalanche_Circle_RedWhite_Circle.png`,
  chainlink: `${ICON_BASE}/877/large/chainlink-new-logo.png`,
  "polygon-ecosystem-token": `${ICON_BASE}/32440/large/polygon.png`,
  sui: `${ICON_BASE}/26375/large/sui-ocean-square.png`,
  arbitrum: `${ICON_BASE}/16547/large/arb.jpg`,
  optimism: `${ICON_BASE}/25244/large/Optimism.png`,
  aave: `${ICON_BASE}/12645/large/aave-token-round.png`,
  uniswap: `${ICON_BASE}/12504/large/uniswap-logo.png`,
  "lido-dao": `${ICON_BASE}/13573/large/Lido_DAO.png`,
  pepe: `${ICON_BASE}/29850/large/pepe-token.jpeg`,
};

export function coinIconUrl(id: string) {
  return ICONS[id];
}

export type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChange: number;
  circulating: number;
  rank: number;
  sparkline: number[];
};

const SEED: Record<string, { price: number; c1: number; c24: number; c7: number; cap: number; vol: number; ath: number; supply: number }> = {
  bitcoin: { price: 96420, c1: 0.18, c24: 1.24, c7: 4.8, cap: 1_910_000_000_000, vol: 42_100_000_000, ath: 108_780, supply: 19_800_000 },
  ethereum: { price: 3412, c1: 0.32, c24: 2.06, c7: 6.4, cap: 411_000_000_000, vol: 21_400_000_000, ath: 4878, supply: 120_400_000 },
  solana: { price: 189.4, c1: -0.11, c24: -0.87, c7: 3.2, cap: 91_200_000_000, vol: 4_100_000_000, ath: 293, supply: 481_000_000 },
  "usd-coin": { price: 1, c1: 0, c24: 0.01, c7: 0, cap: 43_800_000_000, vol: 8_900_000_000, ath: 1.17, supply: 43_800_000_000 },
  tether: { price: 1, c1: 0, c24: -0.02, c7: 0.01, cap: 139_000_000_000, vol: 61_000_000_000, ath: 1.32, supply: 139_000_000_000 },
  binancecoin: { price: 682.1, c1: 0.09, c24: 0.64, c7: 1.9, cap: 98_400_000_000, vol: 1_700_000_000, ath: 788, supply: 144_000_000 },
  ripple: { price: 2.31, c1: 0.44, c24: 3.11, c7: -2.4, cap: 132_000_000_000, vol: 5_600_000_000, ath: 3.4, supply: 57_200_000_000 },
  cardano: { price: 0.92, c1: -0.2, c24: -1.42, c7: -4.1, cap: 32_600_000_000, vol: 1_100_000_000, ath: 3.09, supply: 35_400_000_000 },
  dogecoin: { price: 0.34, c1: 0.8, c24: 4.28, c7: 9.6, cap: 50_100_000_000, vol: 3_400_000_000, ath: 0.73, supply: 147_000_000_000 },
  "avalanche-2": { price: 41.7, c1: -0.35, c24: -2.13, c7: 1.1, cap: 17_100_000_000, vol: 620_000_000, ath: 144, supply: 410_000_000 },
  chainlink: { price: 22.85, c1: 0.21, c24: 1.77, c7: 7.3, cap: 14_300_000_000, vol: 780_000_000, ath: 52.7, supply: 626_000_000 },
  "polygon-ecosystem-token": { price: 0.58, c1: -0.07, c24: -0.44, c7: -1.8, cap: 5_800_000_000, vol: 310_000_000, ath: 2.92, supply: 9_900_000_000 },
  sui: { price: 3.42, c1: 0.28, c24: 2.9, c7: 8.1, cap: 10_600_000_000, vol: 1_200_000_000, ath: 5.35, supply: 3_100_000_000 },
  arbitrum: { price: 0.81, c1: 0.12, c24: 2.4, c7: 5.2, cap: 3_900_000_000, vol: 260_000_000, ath: 2.4, supply: 4_800_000_000 },
  optimism: { price: 1.72, c1: -0.14, c24: -1.1, c7: 2.6, cap: 2_700_000_000, vol: 180_000_000, ath: 4.85, supply: 1_570_000_000 },
  aave: { price: 312.4, c1: 0.4, c24: 3.6, c7: 12.1, cap: 4_700_000_000, vol: 340_000_000, ath: 661, supply: 15_100_000 },
  uniswap: { price: 13.9, c1: 0.16, c24: 1.05, c7: 4.4, cap: 8_300_000_000, vol: 420_000_000, ath: 44.9, supply: 600_000_000 },
  "lido-dao": { price: 1.64, c1: -0.25, c24: -2.6, c7: -5.4, cap: 1_460_000_000, vol: 96_000_000, ath: 7.3, supply: 890_000_000 },
  pepe: { price: 0.0000182, c1: 1.2, c24: 6.9, c7: 18.4, cap: 7_600_000_000, vol: 1_900_000_000, ath: 0.0000284, supply: 420_690_000_000_000 },
};

function synthSparkline(price: number, change7d: number, seed: number) {
  const points: number[] = [];
  const start = price / (1 + change7d / 100);
  for (let i = 0; i < 40; i++) {
    const t = i / 39;
    const wobble = Math.sin(seed + i * 0.7) * 0.012 + Math.sin(seed * 2 + i * 0.23) * 0.008;
    points.push(start + (price - start) * t + price * wobble);
  }
  points[points.length - 1] = price;
  return points;
}

export const FALLBACK_MARKETS: MarketCoin[] = COINS.map((coin, idx) => {
  const s = SEED[coin.id]!;
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: ICONS[coin.id] ?? "",
    price: s.price,
    change1h: s.c1,
    change24h: s.c24,
    change7d: s.c7,
    marketCap: s.cap,
    volume: s.vol,
    high24h: s.price * 1.021,
    low24h: s.price * 0.977,
    ath: s.ath,
    athChange: ((s.price - s.ath) / s.ath) * 100,
    circulating: s.supply,
    rank: idx + 1,
    sparkline: synthSparkline(s.price, s.c7, idx + 1),
  };
})
  .slice()
  .sort((a, b) => b.marketCap - a.marketCap)
  .map((c, i) => ({ ...c, rank: i + 1 }));

async function fetchMarkets(): Promise<MarketCoin[]> {
  const raw = await fetchMarketsFn();
  if (!raw?.length) return FALLBACK_MARKETS;
  return raw.map((r, i) => ({
    id: r.id,
    symbol: r.symbol.toUpperCase(),
    name: r.name,
    image: r.image || ICONS[r.id] || "",
    price: r.current_price,
    change1h: r.price_change_percentage_1h_in_currency ?? 0,
    change24h: r.price_change_percentage_24h_in_currency ?? 0,
    change7d: r.price_change_percentage_7d_in_currency ?? 0,
    marketCap: r.market_cap,
    volume: r.total_volume,
    high24h: r.high_24h ?? r.current_price,
    low24h: r.low_24h ?? r.current_price,
    ath: r.ath,
    athChange: r.ath_change_percentage,
    circulating: r.circulating_supply,
    rank: r.market_cap_rank ?? i + 1,
    sparkline: r.sparkline_in_7d?.price?.slice(-48) ?? [],
  }));
}

export function useMarkets() {
  const query = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    refetchInterval: 45_000,
    retry: 1,
    staleTime: 30_000,
  });
  const coins = query.data?.length ? query.data : FALLBACK_MARKETS;
  const byId = Object.fromEntries(coins.map((c) => [c.id, c])) as Record<string, MarketCoin>;
  return { coins, byId, isLive: !!query.data?.length, isLoading: query.isLoading };
}

export type GlobalStats = {
  marketCap: number;
  volume: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCoins: number;
};

const FALLBACK_GLOBAL: GlobalStats = {
  marketCap: 3_340_000_000_000,
  volume: 148_000_000_000,
  btcDominance: 57.2,
  ethDominance: 12.3,
  marketCapChange24h: 1.42,
  activeCoins: 17_240,
};

export function useGlobalStats() {
  const query = useQuery({
    queryKey: ["global"],
    queryFn: async (): Promise<GlobalStats> => {
      const res = await fetchGlobalFn();
      if (!res?.data) return FALLBACK_GLOBAL;
      const { data } = res;
      return {
        marketCap: data.total_market_cap['usd'] ?? 0,
        volume: data.total_volume['usd'] ?? 0,
        btcDominance: data.market_cap_percentage['btc'] ?? 0,
        ethDominance: data.market_cap_percentage['eth'] ?? 0,
        marketCapChange24h: data.market_cap_change_percentage_24h_usd,
        activeCoins: data.active_cryptocurrencies,
      };
    },
    refetchInterval: 120_000,
    retry: 1,
  });
  return { stats: query.data ?? FALLBACK_GLOBAL, isLive: !!query.data };
}

export type FearGreed = { value: number; label: string };

export function useFearGreed() {
  const query = useQuery({
    queryKey: ["fear-greed"],
    queryFn: async (): Promise<FearGreed> => {
      const json = await fetchFearGreedFn();
      const entry = json?.data?.[0];
      if (!entry) return { value: 63, label: "Greed" };
      return { value: Number(entry.value), label: entry.value_classification };
    },
    refetchInterval: 600_000,
    retry: 1,
  });
  return { fg: query.data ?? { value: 63, label: "Greed" }, isLive: !!query.data };
}

export type ChainTvl = { name: string; tvl: number; symbol: string | null };

const FALLBACK_CHAINS: ChainTvl[] = [
  { name: "Ethereum", tvl: 68_400_000_000, symbol: "ETH" },
  { name: "Solana", tvl: 9_100_000_000, symbol: "SOL" },
  { name: "Base", tvl: 4_200_000_000, symbol: null },
  { name: "Arbitrum", tvl: 3_600_000_000, symbol: "ARB" },
  { name: "BSC", tvl: 5_400_000_000, symbol: "BNB" },
  { name: "Optimism", tvl: 1_100_000_000, symbol: "OP" },
];

export function useChainTvl() {
  const query = useQuery({
    queryKey: ["chain-tvl"],
    queryFn: async (): Promise<ChainTvl[]> => {
      const raw = await fetchChainsFn();
      if (!raw?.length) return FALLBACK_CHAINS;
      return raw
        .slice()
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, 8)
        .map((c) => ({ name: c.name, tvl: c.tvl, symbol: c.tokenSymbol }));
    },
    refetchInterval: 600_000,
    retry: 1,
  });
  const chains = query.data?.length ? query.data : FALLBACK_CHAINS;
  const total = chains.reduce((s, c) => s + c.tvl, 0);
  return { chains, total, isLive: !!query.data?.length };
}

export function formatUsd(value: number) {
  const digits = value >= 100 ? 2 : value >= 1 ? 3 : value >= 0.01 ? 5 : 8;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

export function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) return `$${(value / size).toFixed(2)}${suffix}`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatAmount(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: value >= 1 ? 2 : 6 });
}

export function formatPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
