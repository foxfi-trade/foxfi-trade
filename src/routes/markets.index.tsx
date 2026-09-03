import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FearGreedGauge,
  GlobalStatsBar,
  MarketTable,
  Movers,
  PriceTicker,
} from "../components/PriceBoard";
import { PageShell } from "../components/site";
import { formatCompact, useChainTvl, useMarkets } from "../lib/markets";

export const Route = createFileRoute("/markets/")({
  head: () => ({
    meta: [
      { title: "Live Crypto Prices, Market Caps & Charts | FoxFi" },
      {
        name: "description",
        content:
          "Live prices, 24h and 7d moves, market caps, volume and 7-day charts for Bitcoin, Ethereum, Solana, USDC and 14 more majors, plus fear & greed and chain TVL.",
      },
      { property: "og:title", content: "FoxFi Markets — Live Crypto Prices & Charts" },
      {
        property: "og:description",
        content: "Sortable market table with real coin logos, sparklines, dominance and DeFi TVL.",
      },
    ],
  }),
  component: Markets,
});

function Markets() {
  const { coins, isLive } = useMarkets();
  const { chains, total } = useChainTvl();

  return (
    <>
      <GlobalStatsBar />
      <PriceTicker />
      <PageShell
        eyebrow="Markets"
        title={
          <>
            Exact prices, <span className="ember-text">fox-fast</span>
          </>
        }
        subtitle="Every major asset with live USD price, 1h/24h/7d moves, market cap, volume and a 7-day trend line. Star anything to pin it to your watchlist."
      >
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Movers />
          <FearGreedGauge />
        </div>

        <div className="mt-8">
          <MarketTable coins={coins} />
          <p className="mt-3 text-xs text-muted-foreground">
            {isLive ? "Live via CoinGecko · refreshes every 45s" : "Cached reference feed active"}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="surface-card px-5 py-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">DeFi TVL by chain</h3>
              <span className="text-sm text-muted-foreground">{formatCompact(total)} tracked</span>
            </div>
            <ul className="mt-5 space-y-3">
              {chains.map((chain) => (
                <li key={chain.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-display">{chain.name}</span>
                    <span className="text-muted-foreground">{formatCompact(chain.tvl)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(3, (chain.tvl / (chains[0]?.tvl || 1)) * 100)}%`,
                        background: "var(--gradient-ember)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card flex flex-col px-5 py-6">
            <h3 className="font-display text-lg font-semibold">Act on what you see</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Prices are free to browse. Swapping, withdrawing and trading need your wallet — FoxFi
              never custodies funds.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { to: "/swap", label: "Swap crypto" },
                { to: "/watchlist", label: "Watchlist & alerts" },
                { to: "/tools", label: "Trader tools" },
                { to: "/trade", label: "Trading floor" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="btn-base btn-outline px-4 py-3 text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    </>
  );
}
