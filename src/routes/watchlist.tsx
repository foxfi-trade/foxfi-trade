import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CoinIcon } from "../components/CoinIcon";
import { Sparkline } from "../components/Sparkline";
import { GlobalStatsBar, PriceTicker, WatchStar } from "../components/PriceBoard";
import { PageShell } from "../components/site";
import {
  COINS,
  formatCompact,
  formatPct,
  formatUsd,
  useMarkets,
  type MarketCoin,
} from "../lib/markets";
import { useAlerts, useWatchlist } from "../lib/watchlist";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Crypto Watchlist & Price Alerts | FoxFi" },
      {
        name: "description",
        content:
          "Pin the coins you care about and set on-device price alerts that fire the moment BTC, ETH or SOL crosses your level.",
      },
      { property: "og:title", content: "FoxFi Watchlist & Alerts" },
      {
        property: "og:description",
        content: "Your own coin shortlist plus above/below price alerts, stored locally on device.",
      },
    ],
  }),
  component: Watchlist,
});

function Watchlist() {
  const { coins, byId } = useMarkets();
  const { ids, ready } = useWatchlist();
  const { alerts, add, remove } = useAlerts();

  const [coinId, setCoinId] = useState("bitcoin");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");

  const watched = ids
    .map((id) => byId[id])
    .filter((c): c is MarketCoin => Boolean(c));

  function submit() {
    const value = Number(target);
    if (!Number.isFinite(value) || value <= 0) return;
    const coin = byId[coinId];
    if (!coin) return;
    add({ coinId, symbol: coin.symbol, direction, target: value });
    setTarget("");
  }

  return (
    <>
      <GlobalStatsBar />
      <PriceTicker />
      <PageShell
        eyebrow="Watchlist"
        title={
          <>
            Your <span className="ember-text">shortlist</span>, always warm
          </>
        }
        subtitle="Star coins anywhere in FoxFi and they land here. Alerts live on your device — no account, no email, no tracking."
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface-card px-5 py-6">
            <h2 className="font-display text-lg font-semibold">Watched assets</h2>
            {!ready ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading your list…</p>
            ) : watched.length === 0 ? (
              <div className="mt-5">
                <p className="text-sm text-muted-foreground">
                  Nothing starred yet. Open markets and tap a star.
                </p>
                <Link to="/markets" className="btn-base btn-ember mt-4 px-5 py-2.5 text-sm">
                  Browse markets
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {watched.map((coin) => (
                  <li key={coin.id} className="flex items-center gap-3 py-3">
                    <WatchStar id={coin.id} />
                    <Link
                      to="/markets/$id"
                      params={{ id: coin.id }}
                      className="flex min-w-0 flex-1 items-center gap-3 hover:text-primary"
                    >
                      <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} size="sm" />
                      <span className="min-w-0">
                        <span className="font-display text-sm font-semibold">{coin.symbol}</span>
                        <span className="ml-2 truncate text-xs text-muted-foreground">
                          {coin.name}
                        </span>
                      </span>
                    </Link>
                    <Sparkline points={coin.sparkline} up={coin.change7d >= 0} width={80} height={28} />
                    <div className="w-28 text-right">
                      <p className="font-display text-sm">{formatUsd(coin.price)}</p>
                      <p
                        className={`text-xs ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {formatPct(coin.change24h)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {watched.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                Combined tracked cap:{" "}
                {formatCompact(watched.reduce((sum, c) => sum + c.marketCap, 0))}
              </p>
            )}
          </div>

          <div className="surface-card px-5 py-6">
            <h2 className="font-display text-lg font-semibold">Price alerts</h2>
            <div className="mt-4 space-y-3">
              <select
                value={coinId}
                onChange={(e) => setCoinId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                {COINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                {(["above", "below"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    className={`btn-base flex-1 px-4 py-2.5 text-sm ${
                      direction === d ? "btn-ember" : "btn-outline"
                    }`}
                  >
                    {d === "above" ? "Rises above" : "Drops below"}
                  </button>
                ))}
              </div>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                inputMode="decimal"
                placeholder={`Target USD (now ${formatUsd(byId[coinId]?.price ?? 0)})`}
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button onClick={submit} className="btn-base btn-ember w-full px-5 py-3 text-sm">
                Create alert
              </button>
            </div>

            <ul className="mt-5 space-y-2">
              {alerts.length === 0 && (
                <li className="text-sm text-muted-foreground">No alerts armed yet.</li>
              )}
              {alerts.map((alert) => {
                const live = byId[alert.coinId]?.price ?? 0;
                const hit =
                  alert.direction === "above" ? live >= alert.target : live <= alert.target;
                return (
                  <li
                    key={alert.id}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm"
                  >
                    <span className={`size-2 rounded-full ${hit ? "bg-success" : "bg-primary"}`} />
                    <span className="font-display">{alert.symbol}</span>
                    <span className="text-muted-foreground">
                      {alert.direction} {formatUsd(alert.target)}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {hit ? "triggered" : "armed"}
                    </span>
                    <button
                      onClick={() => remove(alert.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      remove
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              {coins.length} assets available · alerts evaluate against the live feed each refresh.
            </p>
          </div>
        </div>
      </PageShell>
    </>
  );
}
