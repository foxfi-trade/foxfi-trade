import { createFileRoute } from "@tanstack/react-router";
import { formatUsd, usePrices } from "../lib/prices";
import { PageShell, WalletGate } from "../components/site";
import { CoinIcon } from "../components/CoinIcon";
import { useWallet } from "../lib/wallet";

export const Route = createFileRoute("/positions")({
  head: () => ({
    meta: [
      { title: "DeFi Positions Dashboard | FoxFi" },
      {
        name: "description",
        content:
          "Connect your EVM wallet and see every DeFi position — lending, liquidity, staking and vaults — valued live in one fox den.",
      },
      { property: "og:title", content: "FoxFi Positions — Your Whole DeFi Portfolio" },
      {
        property: "og:description",
        content: "Lending, LP, staking and vault positions across 9 EVM chains, priced live.",
      },
    ],
  }),
  component: Positions,
});

const POSITIONS = [
  { protocol: "Aave v3", kind: "Lending", asset: "USDC", coin: "usd-coin", amount: 12480, apy: 6.4, chain: "Base" },
  { protocol: "Uniswap v3", kind: "Liquidity", asset: "ETH", coin: "ethereum", amount: 3.42, apy: 18.2, chain: "Ethereum" },
  { protocol: "Lido", kind: "Staking", asset: "ETH", coin: "ethereum", amount: 5.1, apy: 3.1, chain: "Ethereum" },
  { protocol: "Jito", kind: "Staking", asset: "SOL", coin: "solana", amount: 96.5, apy: 8.7, chain: "Solana" },
  { protocol: "Pendle", kind: "Yield", asset: "USDT", coin: "tether", amount: 7300, apy: 11.9, chain: "Arbitrum" },
  { protocol: "GMX", kind: "Perps LP", asset: "LINK", coin: "chainlink", amount: 410, apy: 14.3, chain: "Arbitrum" },
];

function Positions() {
  const { prices } = usePrices();
  const { chain, short } = useWallet();

  const rows = POSITIONS.map((p) => ({
    ...p,
    value: p.amount * (prices[p.coin]?.usd ?? 0),
  }));
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const weightedApy =
    total > 0 ? rows.reduce((sum, r) => sum + r.apy * r.value, 0) / total : 0;

  return (
    <PageShell
      eyebrow="Positions"
      title={<>Your <span className="ember-text">DeFi den</span></>}
      subtitle="Everything your EVM wallet is earning on, valued at live market prices."
    >
      <WalletGate
        heading="Connect your wallet to view positions"
        copy="FoxFi reads your balances on-chain. Nothing is moved, nothing is custodied — connect and the den fills up."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-card px-5 py-6">
            <p className="text-sm text-muted-foreground">Portfolio value</p>
            <p className="font-display text-3xl font-bold ember-text">{formatUsd(total)}</p>
          </div>
          <div className="surface-card px-5 py-6">
            <p className="text-sm text-muted-foreground">Blended APY</p>
            <p className="font-display text-3xl font-bold text-success">
              {weightedApy.toFixed(2)}%
            </p>
          </div>
          <div className="surface-card px-5 py-6">
            <p className="text-sm text-muted-foreground">Wallet</p>
            <p className="font-display text-lg font-bold">{short}</p>
            <p className="text-xs text-muted-foreground">Primary chain · {chain}</p>
          </div>
        </div>

        <div className="surface-card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4">Protocol</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Chain</th>
                <th className="px-5 py-4 text-right">Amount</th>
                <th className="px-5 py-4 text-right">APY</th>
                <th className="px-5 py-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.protocol}-${r.asset}`} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <CoinIcon id={r.coin} symbol={r.asset} />
                      <span className="font-display font-semibold">{r.protocol}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{r.kind}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.chain}</td>
                  <td className="px-5 py-4 text-right">
                    {r.amount.toLocaleString("en-US")} {r.asset}
                  </td>
                  <td className="px-5 py-4 text-right text-success">{r.apy.toFixed(1)}%</td>
                  <td className="px-5 py-4 text-right font-display font-semibold">
                    {formatUsd(r.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WalletGate>
    </PageShell>
  );
}
