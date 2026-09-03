import { createFileRoute, Link } from "@tanstack/react-router";
import { FoxPortfolioArt } from "../components/FoxVisual";
import {
  FearGreedGauge,
  GlobalStatsBar,
  Movers,
  PriceGrid,
  PriceTicker,
} from "../components/PriceBoard";
import { CoinIcon } from "../components/CoinIcon";
import { Sparkline } from "../components/Sparkline";
import { ConnectButton } from "../components/site";
import {
  formatCompact,
  formatPct,
  formatUsd,
  useChainTvl,
  useGlobalStats,
  useMarkets,
} from "../lib/markets";
import { useWallet } from "../lib/wallet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoxFi — Connect an EVM Wallet to View Your DeFi Positions" },
      {
        name: "description",
        content:
          "FoxFi is the all-in-one DeFi den: connect an EVM wallet to track positions, swap tokens, follow live BTC, ETH and SOL prices, set alerts and size trades.",
      },
      { property: "og:title", content: "FoxFi — The #1 DeFi Command Center" },
      {
        property: "og:description",
        content:
          "The #1 all-in-one DeFi den. Nothing else comes close: a pro trading desk better than anything out there, live charts, instant swaps, portfolio positions, yields, TVL, price alerts and watchlists for BTC, ETH, SOL and 18 majors — fully non-custodial.",
      },
      { property: "og:url", content: "https://foxfi.trade/" },
      {
        property: "og:image",
        content: "https://foxfi.trade/og-foxfi.jpg",
      },
      {
        name: "twitter:image",
        content: "https://foxfi.trade/og-foxfi.jpg",
      },
      { name: "twitter:title", content: "FoxFi — The #1 DeFi Command Center" },
      {
        name: "twitter:description",
        content:
          "A trading desk better than anything else, instant swaps, live charts, positions, yields, alerts and watchlists. Connect any EVM wallet — nothing else comes close.",
      },
    ],
    links: [{ rel: "canonical", href: "https://foxfi.trade/" }],
  }),
  component: Index,
});

const ACTIONS = [
  {
    to: "/positions",
    title: "Positions",
    copy: "Every LP, lend, stake and vault position across your EVM wallet, valued live.",
    tag: "Portfolio",
  },
  {
    to: "/swap",
    title: "Swap crypto",
    copy: "Route USDC into SOL or ETH into BTC at the best price across 40+ liquidity sources.",
    tag: "Trade",
  },
  {
    to: "/markets",
    title: "Markets & charts",
    copy: "Sortable market table with real coin logos, 1h/24h/7d moves and 7-day trend lines.",
    tag: "Research",
  },
  {
    to: "/watchlist",
    title: "Watchlist & alerts",
    copy: "Star coins and arm above/below price alerts stored on your own device.",
    tag: "Signals",
  },
  {
    to: "/tools",
    title: "Trader tools",
    copy: "Pair converter, risk-based position sizer, APY compounder and impermanent-loss model.",
    tag: "Toolbelt",
  },
  {
    to: "/trade",
    title: "Trading floor",
    copy: "Perps, limit orders and fox-fast execution on our new pro surface.",
    tag: "Pro",
  },
  {
    to: "/withdraw",
    title: "Withdraw",
    copy: "Pull funds back to your wallet or an external address in a two-tap flow.",
    tag: "Cash out",
  },
] as const;

const YIELDS = [
  { protocol: "Aave v3", asset: "USDC", chain: "Base", apy: 6.42, tvl: 1_240_000_000, risk: "Low" },
  { protocol: "Lido", asset: "ETH", chain: "Ethereum", apy: 3.14, tvl: 24_800_000_000, risk: "Low" },
  { protocol: "Pendle", asset: "USDT", chain: "Arbitrum", apy: 11.9, tvl: 640_000_000, risk: "Medium" },
  { protocol: "Jito", asset: "SOL", chain: "Solana", apy: 8.71, tvl: 2_900_000_000, risk: "Medium" },
  { protocol: "Uniswap v3", asset: "ETH/USDC", chain: "Ethereum", apy: 18.2, tvl: 410_000_000, risk: "High" },
  { protocol: "GMX v2", asset: "LINK", chain: "Arbitrum", apy: 14.3, tvl: 190_000_000, risk: "High" },
];

const EDGE = [
  {
    title: "Read-only by default",
    copy: "FoxFi asks for an address, never a transfer signature. Approvals stay in your wallet.",
  },
  {
    title: "9 chains, one den",
    copy: "Ethereum, Base, Arbitrum, Optimism, Polygon, BNB, Avalanche, Solana and Scroll.",
  },
  {
    title: "Sub-2s sync",
    copy: "Positions, balances and prices refresh together so nothing on screen is stale.",
  },
  {
    title: "No account, no email",
    copy: "Watchlists and alerts live in your browser. Nothing is uploaded, nothing is sold.",
  },
];

function Index() {
  const { address, isDemo, chain, short } = useWallet();
  const { coins, byId, isLive } = useMarkets();
  const { stats } = useGlobalStats();
  const { total: tvlTotal, chains } = useChainTvl();

  const btc = byId["bitcoin"];
  const eth = byId["ethereum"];

  const heroStats = [
    { label: "Crypto market cap", value: formatCompact(stats.marketCap), delta: stats.marketCapChange24h },
    { label: "DeFi TVL tracked", value: formatCompact(tvlTotal) },
    { label: "BTC dominance", value: `${stats.btcDominance.toFixed(1)}%` },
    { label: "24h spot volume", value: formatCompact(stats.volume) },
  ];

  return (
    <div>
      <GlobalStatsBar />

      <section className="night-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary">
              The clever money moves first
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Connect an EVM wallet to view your{" "}
              <span className="ember-text">DeFi positions</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              FoxFi sniffs out every token, vault and farm your wallet touches, prices it live,
              charts it, alerts you and lets you swap, size and trade — without ever handing over
              your keys.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ConnectButton size="lg" label="Connect EVM Wallet" />
              <Link to="/markets" className="btn-base btn-outline px-6 py-4 text-base">
                Explore live markets
              </Link>
            </div>
            {address ? (
              <div className="surface-card mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-sm">
                <span className="text-success">Wallet connected</span>
                <span className="font-display">{short}</span>
                <span className="text-muted-foreground">{chain}</span>
                {isDemo && (
                  <span className="text-muted-foreground">
                    · demo session (no injected wallet found)
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                Non-custodial. Read-only access. We never request a transfer signature.
              </p>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[btc, eth].map(
                (coin) =>
                  coin && (
                    <Link
                      key={coin.id}
                      to="/markets/$id"
                      params={{ id: coin.id }}
                      className="surface-card flex items-center gap-3 px-4 py-3"
                    >
                      <CoinIcon id={coin.id} symbol={coin.symbol} image={coin.image} />
                      <div>
                        <p className="font-display text-sm font-semibold">
                          {formatUsd(coin.price)}
                        </p>
                        <p
                          className={`text-xs ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {coin.symbol} {formatPct(coin.change24h)}
                        </p>
                      </div>
                      <span className="ml-auto">
                        <Sparkline points={coin.sparkline} up={coin.change7d >= 0} width={84} height={30} />
                      </span>
                    </Link>
                  ),
              )}
            </div>
          </div>
          <div className="relative">
            <div className="ember-ring overflow-hidden rounded-3xl border border-border">
              <FoxPortfolioArt />
            </div>
          </div>
        </div>
      </section>

      <PriceTicker />

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((s) => (
            <div key={s.label} className="surface-card px-5 py-6">
              <p className="font-display text-3xl font-bold ember-text">{s.value}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                {s.label}
                {s.delta !== undefined && (
                  <span className={s.delta >= 0 ? "text-success" : "text-destructive"}>
                    {formatPct(s.delta)}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isLive
            ? `Live market data · ${coins.length} assets · refreshed every 45s`
            : "Cached market data — live feed temporarily rate-limited"}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Movers />
          <FearGreedGauge />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14">
        <h2 className="text-3xl font-bold">Everything in the den</h2>
        <p className="mt-2 text-muted-foreground">
          Seven tunnels, one wallet. Every action stays non-custodial.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="surface-card group flex flex-col px-6 py-7 transition-transform hover:-translate-y-1"
            >
              <span className="text-xs uppercase tracking-[0.25em] text-primary">{a.tag}</span>
              <h3 className="mt-3 font-display text-xl font-semibold group-hover:text-primary">
                {a.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.copy}</p>
              <span className="mt-6 text-sm text-primary">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-semibold">Top yields right now</h2>
              <Link to="/positions" className="text-sm text-primary">
                Open positions →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Protocol</th>
                    <th className="px-5 py-3 font-medium">Asset</th>
                    <th className="px-5 py-3 font-medium">Chain</th>
                    <th className="px-5 py-3 text-right font-medium">TVL</th>
                    <th className="px-5 py-3 text-right font-medium">APY</th>
                  </tr>
                </thead>
                <tbody>
                  {YIELDS.map((row) => (
                    <tr key={row.protocol} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 font-display">{row.protocol}</td>
                      <td className="px-5 py-3">{row.asset}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.chain}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        {formatCompact(row.tvl)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-display text-success">{row.apy.toFixed(2)}%</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">{row.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface-card px-5 py-6">
            <h2 className="font-display text-lg font-semibold">Liquidity by chain</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Where the capital actually sits, straight from DefiLlama.
            </p>
            <ul className="mt-5 space-y-3">
              {chains.slice(0, 6).map((c) => (
                <li key={c.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-display">{c.name}</span>
                    <span className="text-muted-foreground">{formatCompact(c.tvl)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (c.tvl / (chains[0]?.tvl || 1)) * 100)}%`,
                        background: "var(--gradient-ember)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14">
        <h2 className="text-3xl font-bold">Popular coin prices</h2>
        <p className="mt-2 text-muted-foreground">
          Bitcoin, Ethereum, Solana, USDC and friends — real logos, real numbers, live from the
          market.
        </p>
        <div className="mt-8">
          <PriceGrid limit={6} />
        </div>
        <div className="mt-6">
          <Link to="/markets" className="btn-base btn-outline px-6 py-3 text-sm">
            See all {coins.length} markets
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EDGE.map((item) => (
            <div key={item.title} className="surface-card px-5 py-6">
              <h3 className="font-display text-base font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
        <div className="surface-card mt-8 flex flex-wrap items-center gap-5 px-6 py-8">
          <div>
            <h2 className="text-2xl font-bold">Ready to open the den?</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Connect once and FoxFi lights up positions, swaps, alerts and the trading floor.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <ConnectButton size="lg" />
            <Link to="/tools" className="btn-base btn-outline px-6 py-4 text-base">
              Try the tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
