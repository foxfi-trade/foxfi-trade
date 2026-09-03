import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  formatCompact,
  formatPct,
  formatUsd,
  useFearGreed,
  useGlobalStats,
  useMarkets,
  type MarketCoin,
} from "../lib/markets";
import { useWatchlist } from "../lib/watchlist";
import { CoinIcon } from "./CoinIcon";
import { Sparkline } from "./Sparkline";

function Delta({ value, className = "" }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span className={`${up ? "text-success" : "text-destructive"} ${className}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export function PriceTicker() {
  const { coins } = useMarkets();
  const row = [...coins, ...coins];
  return (
    <div className="group overflow-hidden border-y border-border bg-card/50 py-2.5">
      <div className="flex w-max gap-7 whitespace-nowrap [animation:foxfi-marquee_48s_linear_infinite] group-hover:[animation-play-state:paused]">
        {row.map((coin, i) => (
          <Link
            key={`${coin.id}-${i}`}
            to="/markets/$id"
            params={{ id: coin.id }}
            className="flex items-center gap-2 text-sm hover:opacity-80"
          >
            <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} size="sm" />
            <span className="font-display font-semibold">{coin.symbol}</span>
            <span className="text-muted-foreground">{formatUsd(coin.price)}</span>
            <Delta value={coin.change24h} className="text-xs" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function GlobalStatsBar() {
  const { stats, isLive } = useGlobalStats();
  const { fg } = useFearGreed();
  const items = [
    { label: "Global market cap", value: formatCompact(stats.marketCap), delta: stats.marketCapChange24h },
    { label: "24h volume", value: formatCompact(stats.volume) },
    { label: "BTC dominance", value: `${stats.btcDominance.toFixed(1)}%` },
    { label: "ETH dominance", value: `${stats.ethDominance.toFixed(1)}%` },
    { label: "Tracked assets", value: stats.activeCoins.toLocaleString("en-US") },
    { label: `Fear & greed · ${fg.label}`, value: `${fg.value}/100` },
  ];
  return (
    <div className="border-b border-border bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-7 gap-y-2 px-5 py-2.5 text-xs">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-display font-semibold">{item.value}</span>
            {item.delta !== undefined && <Delta value={item.delta} />}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
          <span className={`size-1.5 rounded-full ${isLive ? "bg-success" : "bg-primary"}`} />
          {isLive ? "Live feed" : "Cached feed"}
        </span>
      </div>
    </div>
  );
}

export function WatchStar({ id }: { id: string }) {
  const { isWatched, toggle } = useWatchlist();
  const on = isWatched(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={on ? "Remove from watchlist" : "Add to watchlist"}
      className={`rounded-full px-1.5 text-base leading-none transition-colors ${
        on ? "text-primary" : "text-muted-foreground hover:text-primary"
      }`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

export function CoinCard({ coin }: { coin: MarketCoin }) {
  const up = coin.change24h >= 0;
  return (
    <Link
      to="/markets/$id"
      params={{ id: coin.id }}
      className="surface-card hover-lift glow-border flex flex-col gap-3 px-4 py-4"
    >
      <div className="flex items-center gap-3">
        <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} />
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">{coin.symbol}</p>
          <p className="truncate text-xs text-muted-foreground">{coin.name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-display text-sm font-semibold">{formatUsd(coin.price)}</p>
          <p className={`text-xs ${up ? "text-success" : "text-destructive"}`}>
            {formatPct(coin.change24h)} 24h
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-[11px] text-muted-foreground">
          <p>Cap {formatCompact(coin.marketCap)}</p>
          <p>Vol {formatCompact(coin.volume)}</p>
        </div>
        <Sparkline points={coin.sparkline} up={coin.change7d >= 0} />
      </div>
    </Link>
  );
}

export function PriceGrid({ limit }: { limit?: number }) {
  const { coins, isLive } = useMarkets();
  const list = limit ? coins.slice(0, limit) : coins;
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {isLive
          ? "Live prices via CoinGecko, refreshed every 45s."
          : "Showing cached reference prices — live feed rate-limited."}
      </p>
    </div>
  );
}

type SortKey = "rank" | "price" | "change24h" | "change7d" | "marketCap" | "volume";

export function MarketTable({ coins }: { coins: MarketCoin[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("marketCap");
  const [desc, setDesc] = useState(true);

  const rows = useMemo(() => {
    const filtered = coins.filter((c) =>
      `${c.name} ${c.symbol}`.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const sorted = [...filtered].sort((a, b) => {
      const av = sort === "rank" ? -a.rank : a[sort];
      const bv = sort === "rank" ? -b.rank : b[sort];
      return desc ? bv - av : av - bv;
    });
    return sorted;
  }, [coins, query, sort, desc]);

  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: "price", label: "Price" },
    { key: "change24h", label: "24h" },
    { key: "change7d", label: "7d" },
    { key: "marketCap", label: "Market cap", className: "hidden md:table-cell" },
    { key: "volume", label: "Volume 24h", className: "hidden lg:table-cell" },
  ];

  function apply(key: SortKey) {
    if (key === sort) setDesc((d) => !d);
    else {
      setSort(key);
      setDesc(true);
    }
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coins…"
          className="w-full max-w-xs rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary sm:w-64"
        />
        <button onClick={() => apply("rank")} className="btn-base btn-outline px-4 py-2 text-xs">
          Sort by rank
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} assets</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Asset</th>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-right font-medium ${col.className ?? ""}`}>
                  <button onClick={() => apply(col.key)} className="hover:text-primary">
                    {col.label} {sort === col.key ? (desc ? "↓" : "↑") : ""}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">7d trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((coin) => (
              <tr key={coin.id} className="row-hover border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <WatchStar id={coin.id} />
                    {coin.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to="/markets/$id" params={{ id: coin.id }} className="flex items-center gap-3">
                    <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} size="sm" />
                    <span>
                      <span className="font-display font-semibold">{coin.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{coin.symbol}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-display">{formatUsd(coin.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Delta value={coin.change24h} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Delta value={coin.change7d} />
                </td>
                <td className="hidden px-4 py-3 text-right text-muted-foreground md:table-cell">
                  {formatCompact(coin.marketCap)}
                </td>
                <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">
                  {formatCompact(coin.volume)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Sparkline points={coin.sparkline} up={coin.change7d >= 0} width={104} height={32} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Movers() {
  const { coins } = useMarkets();
  const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
  const gainers = sorted.slice(0, 4);
  const losers = sorted.slice(-4).reverse();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        { title: "Top gainers · 24h", list: gainers },
        { title: "Weakest · 24h", list: losers },
      ].map((group) => (
        <div key={group.title} className="surface-card px-5 py-5">
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            {group.title}
          </h3>
          <ul className="mt-4 space-y-3">
            {group.list.map((coin) => (
              <li key={coin.id}>
                <Link
                  to="/markets/$id"
                  params={{ id: coin.id }}
                  className="flex items-center gap-3 text-sm hover:text-primary"
                >
                  <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} size="sm" />
                  <span className="font-display font-semibold">{coin.symbol}</span>
                  <span className="truncate text-xs text-muted-foreground">{coin.name}</span>
                  <span className="ml-auto font-display">{formatUsd(coin.price)}</span>
                  <Delta value={coin.change24h} className="w-20 text-right text-xs" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function FearGreedGauge() {
  const { fg } = useFearGreed();
  const angle = (fg.value / 100) * 180 - 90;
  return (
    <div className="surface-card flex flex-col items-center px-5 py-6">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
        Fear &amp; greed index
      </h3>
      <svg viewBox="0 0 200 110" className="mt-4 w-44" aria-hidden="true">
        <defs>
          <linearGradient id="fg-arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--destructive)" />
            <stop offset="50%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--success)" />
          </linearGradient>
        </defs>
        <path
          d="M12 100 A88 88 0 0 1 188 100"
          fill="none"
          stroke="url(#fg-arc)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="28" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="6" fill="var(--foreground)" />
      </svg>
      <p className="mt-2 font-display text-3xl font-bold ember-text">{fg.value}</p>
      <p className="text-sm text-muted-foreground">{fg.label}</p>
    </div>
  );
}
