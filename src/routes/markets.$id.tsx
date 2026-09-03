import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CoinIcon } from "../components/CoinIcon";
import { AreaChart } from "../components/Sparkline";
import { GlobalStatsBar, WatchStar } from "../components/PriceBoard";
import { ConnectButton } from "../components/site";
import { fetchChartFn } from "../lib/market.functions";
import { formatAmount, formatCompact, formatPct, formatUsd, useMarkets } from "../lib/markets";

export const Route = createFileRoute("/markets/$id")({
  head: ({ params }) => {
    const name = params.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${name} Price, Chart & Stats | FoxFi` },
        {
          name: "description",
          content: `Live ${name} price with 24h range, market cap, volume, all-time high and 1D–1Y charts. Swap or set an alert from the FoxFi den.`,
        },
        { property: "og:title", content: `${name} — Live Price & Chart | FoxFi` },
        {
          property: "og:description",
          content: `Track ${name} with live pricing, supply data and interactive charts.`,
        },
      ],
    };
  },
  component: CoinDetail,
});

const RANGES = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
] as const;

function CoinDetail() {
  const { id } = Route.useParams();
  const { byId, coins } = useMarkets();
  const coin = byId[id];
  const [days, setDays] = useState<number>(7);

  const chart = useQuery({
    queryKey: ["chart", id, days],
    queryFn: async () => {
      const json = await fetchChartFn({ data: { id, days } });
      return json?.prices?.length ? json.prices.map((p) => p[1]) : [];
    },
    retry: 1,
    staleTime: 120_000,
  });

  if (!coin) {
    return (
      <div className="night-bg">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-bold">This asset isn't in the den yet</h1>
          <p className="mt-3 text-muted-foreground">
            FoxFi tracks {coins.length} majors right now. Head back to markets to browse them.
          </p>
          <Link to="/markets" className="btn-base btn-ember mt-8 px-6 py-3 text-sm">
            Back to markets
          </Link>
        </div>
      </div>
    );
  }

  const points = chart.data?.length ? chart.data : coin.sparkline;
  const up = points.length > 1 ? points[points.length - 1]! >= points[0]! : coin.change24h >= 0;
  const rangePct =
    coin.high24h > coin.low24h
      ? ((coin.price - coin.low24h) / (coin.high24h - coin.low24h)) * 100
      : 50;

  const stats = [
    { label: "Market cap", value: formatCompact(coin.marketCap) },
    { label: "24h volume", value: formatCompact(coin.volume) },
    { label: "Circulating supply", value: `${formatAmount(coin.circulating)} ${coin.symbol}` },
    { label: "All-time high", value: formatUsd(coin.ath) },
    { label: "From ATH", value: formatPct(coin.athChange) },
    { label: "Market rank", value: `#${coin.rank}` },
  ];

  return (
    <>
      <GlobalStatsBar />
      <div className="night-bg">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <Link to="/markets" className="text-sm text-muted-foreground hover:text-primary">
            ← All markets
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} size="lg" />
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                {coin.name} <span className="text-muted-foreground">{coin.symbol}</span>
              </h1>
              <p className="mt-1 flex items-center gap-3 text-sm">
                <span className="font-display text-2xl font-bold">{formatUsd(coin.price)}</span>
                <span className={coin.change24h >= 0 ? "text-success" : "text-destructive"}>
                  {formatPct(coin.change24h)} 24h
                </span>
                <span className={coin.change7d >= 0 ? "text-success" : "text-destructive"}>
                  {formatPct(coin.change7d)} 7d
                </span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="surface-card flex items-center gap-2 px-3 py-2 text-sm">
                Watch <WatchStar id={coin.id} />
              </span>
              <Link to="/swap" className="btn-base btn-ember px-5 py-2.5 text-sm">
                Swap {coin.symbol}
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="surface-card px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setDays(r.days)}
                    className={`btn-base px-4 py-1.5 text-xs ${
                      days === r.days ? "btn-ember" : "btn-outline"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  {chart.data?.length ? "Live chart" : "Reference trend"}
                </span>
              </div>
              <div className="mt-4">
                <AreaChart points={points} up={up} />
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>24h low {formatUsd(coin.low24h)}</span>
                  <span>24h high {formatUsd(coin.high24h)}</span>
                </div>
                <div className="relative mt-2 h-1.5 rounded-full bg-secondary">
                  <div
                    className="absolute -top-1 size-3.5 rounded-full border-2 border-background"
                    style={{
                      left: `calc(${Math.min(98, Math.max(0, rangePct))}% - 7px)`,
                      background: "var(--gradient-ember)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {stats.map((s) => (
                <div key={s.label} className="surface-card px-4 py-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card mt-6 flex flex-wrap items-center gap-4 px-5 py-5">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to trade {coin.symbol}, open a position or set an on-device price
              alert.
            </p>
            <div className="ml-auto flex gap-2">
              <ConnectButton />
              <Link to="/watchlist" className="btn-base btn-outline px-5 py-2.5 text-sm">
                Set alert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
