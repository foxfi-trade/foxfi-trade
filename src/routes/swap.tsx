import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { COINS, formatUsd, usePrices } from "../lib/prices";
import { ConnectButton, PageShell } from "../components/site";
import { CoinIcon } from "../components/CoinIcon";
import { useWallet } from "../lib/wallet";

export const Route = createFileRoute("/swap")({
  head: () => ({
    meta: [
      { title: "Swap Crypto — USDC to SOL, ETH and More | FoxFi" },
      {
        name: "description",
        content:
          "Swap USDC for SOL, ETH for BTC and any popular pair at live market rates. Connect your EVM wallet to route the trade.",
      },
      { property: "og:title", content: "FoxFi Swap — Best Route, Every Pair" },
      {
        property: "og:description",
        content: "Live-rate swaps between USDC, SOL, ETH, BTC and other popular coins.",
      },
    ],
  }),
  component: Swap,
});

function CoinSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const coin = COINS.find((c) => c.id === value);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
      <CoinIcon id={value} symbol={coin?.symbol ?? "?"} size="lg" />
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-display text-lg font-semibold outline-none"
        >
          {COINS.map((c) => (
            <option key={c.id} value={c.id} className="bg-card text-foreground">
              {c.symbol} · {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Swap() {
  const { prices } = usePrices();
  const { address } = useWallet();
  const [from, setFrom] = useState("usd-coin");
  const [to, setTo] = useState("solana");
  const [amount, setAmount] = useState("500");
  const [status, setStatus] = useState<string | null>(null);

  const fromCoin = COINS.find((c) => c.id === from);
  const toCoin = COINS.find((c) => c.id === to);
  const fromPrice = prices[from]?.usd ?? 0;
  const toPrice = prices[to]?.usd ?? 0;

  const parsed = Number(amount) || 0;
  const usdValue = parsed * fromPrice;
  const output = useMemo(() => (toPrice > 0 ? (usdValue * 0.997) / toPrice : 0), [usdValue, toPrice]);
  const rate = toPrice > 0 ? fromPrice / toPrice : 0;

  function flip() {
    setFrom(to);
    setTo(from);
    setStatus(null);
  }

  function submit() {
    setStatus("routing");
    setTimeout(
      () =>
        setStatus(
          `Route confirmed: ${parsed} ${fromCoin?.symbol} → ${output.toFixed(4)} ${toCoin?.symbol} via FoxFi Router`,
        ),
      1100,
    );
  }

  return (
    <PageShell
      eyebrow="Swap"
      title={<>Trade any pair, <span className="ember-text">clever routing</span></>}
      subtitle="Pick what you have and what you want. FoxFi splits the order across 40+ liquidity sources for the best fill."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card px-6 py-7">
          <div className="space-y-3">
            <CoinSelect value={from} onChange={setFrom} label="You pay" />
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Amount ({fromCoin?.symbol})
              </label>
              <input
                value={amount}
                inputMode="decimal"
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                  setStatus(null);
                }}
                className="mt-1 w-full rounded-xl border border-border bg-background/60 px-4 py-3 font-display text-2xl font-bold outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">≈ {formatUsd(usdValue)}</p>
            </div>
            <div className="flex justify-center">
              <button onClick={flip} className="btn-base btn-outline px-4 py-2 text-xs">
                ⇅ Flip pair
              </button>
            </div>
            <CoinSelect value={to} onChange={setTo} label="You receive" />
            <div className="rounded-xl border border-border bg-accent/40 px-4 py-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Estimated output
              </p>
              <p className="font-display text-3xl font-bold ember-text">
                {output.toLocaleString("en-US", { maximumFractionDigits: 6 })} {toCoin?.symbol}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {address ? (
              <button
                onClick={submit}
                disabled={status === "routing" || parsed <= 0}
                className="btn-base btn-ember w-full px-6 py-4 text-base"
              >
                {status === "routing" ? "Finding best route…" : `Swap ${fromCoin?.symbol} → ${toCoin?.symbol}`}
              </button>
            ) : (
              <div className="text-center">
                <p className="mb-3 text-sm text-muted-foreground">
                  Connect your wallet to execute this swap.
                </p>
                <ConnectButton size="lg" label="Connect Wallet to Swap" className="w-full" />
              </div>
            )}
            {status && status !== "routing" && (
              <p className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-success">
                {status}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card px-5 py-6 text-sm">
            <h2 className="font-display text-lg font-semibold">Route details</h2>
            <dl className="mt-4 space-y-3 text-muted-foreground">
              <div className="flex justify-between">
                <dt>Rate</dt>
                <dd className="text-foreground">
                  1 {fromCoin?.symbol} = {rate.toLocaleString("en-US", { maximumFractionDigits: 6 })}{" "}
                  {toCoin?.symbol}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>FoxFi fee</dt>
                <dd className="text-foreground">0.30%</dd>
              </div>
              <div className="flex justify-between">
                <dt>Slippage</dt>
                <dd className="text-foreground">0.5% auto</dd>
              </div>
              <div className="flex justify-between">
                <dt>Network</dt>
                <dd className="text-foreground">Base · gas ≈ $0.04</dd>
              </div>
            </dl>
          </div>
          <div className="surface-card px-5 py-6 text-sm text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Popular pairs</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["usd-coin", "solana"],
                ["ethereum", "bitcoin"],
                ["usd-coin", "ethereum"],
                ["solana", "usd-coin"],
              ].map(([a, b]) => (
                <button
                  key={`${a}-${b}`}
                  onClick={() => {
                    setFrom(a as string);
                    setTo(b as string);
                    setStatus(null);
                  }}
                  className="btn-base btn-outline px-3 py-1.5 text-xs"
                >
                  {COINS.find((c) => c.id === a)?.symbol} → {COINS.find((c) => c.id === b)?.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
