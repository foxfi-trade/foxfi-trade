import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { COINS, formatUsd, usePrices } from "../lib/prices";
import { PageShell, WalletGate } from "../components/site";
import { CoinIcon } from "../components/CoinIcon";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw Funds to Your Wallet | FoxFi" },
      {
        name: "description",
        content:
          "Withdraw USDC, ETH, SOL and other assets from your DeFi positions back to your wallet or an external address.",
      },
      { property: "og:title", content: "FoxFi Withdraw — Funds Out in Two Taps" },
      {
        property: "og:description",
        content: "Move assets out of your DeFi positions to any address, non-custodially.",
      },
    ],
  }),
  component: Withdraw,
});

const BALANCES: Record<string, number> = {
  "usd-coin": 12480,
  ethereum: 8.52,
  solana: 96.5,
  tether: 7300,
  bitcoin: 0.184,
};

function Withdraw() {
  const { prices } = usePrices();
  const [asset, setAsset] = useState("usd-coin");
  const [amount, setAmount] = useState("");
  const [dest, setDest] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const coin = COINS.find((c) => c.id === asset);
  const balance = BALANCES[asset] ?? 0;
  const parsed = Number(amount) || 0;
  const usd = parsed * (prices[asset]?.usd ?? 0);
  const tooMuch = parsed > balance;

  return (
    <PageShell
      eyebrow="Withdraw"
      title={<>Take it back to <span className="ember-text">your den</span></>}
      subtitle="Unwind a position and send the funds to your connected wallet or any address you trust."
    >
      <WalletGate
        heading="Connect your wallet to withdraw"
        copy="Withdrawals are signed by you and settle straight to the address you choose. FoxFi never holds your assets."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="surface-card space-y-4 px-6 py-7">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Asset</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.keys(BALANCES).map((id) => {
                  const c = COINS.find((x) => x.id === id);
                  const active = id === asset;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setAsset(id);
                        setDone(null);
                      }}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        active ? "border-primary bg-accent/50" : "border-border bg-background/50"
                      }`}
                    >
                      <CoinIcon id={c?.id ?? ""} symbol={c?.symbol ?? "?"} />
                      <span>
                        <span className="block font-display text-sm font-semibold">{c?.symbol}</span>
                        <span className="block text-xs text-muted-foreground">
                          {(BALANCES[id] ?? 0).toLocaleString("en-US")} available
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Amount ({coin?.symbol})
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={amount}
                  inputMode="decimal"
                  placeholder="0.00"
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                    setDone(null);
                  }}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 font-display text-xl font-bold outline-none focus:border-primary"
                />
                <button
                  onClick={() => setAmount(String(balance))}
                  className="btn-base btn-outline px-4 py-2 text-xs"
                >
                  Max
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">≈ {formatUsd(usd)}</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Destination address
              </label>
              <input
                value={dest}
                placeholder="0x… (leave empty to use connected wallet)"
                onChange={(e) => setDest(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              disabled={parsed <= 0 || tooMuch}
              onClick={() =>
                setDone(
                  `Withdrawal of ${parsed} ${coin?.symbol} queued to ${dest || "your connected wallet"} — settles in ~30s.`,
                )
              }
              className="btn-base btn-ember w-full px-6 py-4 text-base"
            >
              {tooMuch ? "Amount exceeds balance" : `Withdraw ${coin?.symbol}`}
            </button>

            {done && (
              <p className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-success">
                {done}
              </p>
            )}
          </div>

          <div className="surface-card px-5 py-6 text-sm text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Good to know</h2>
            <ul className="mt-4 space-y-3">
              <li>Withdrawals require one signature from your wallet.</li>
              <li>Positions unwind automatically before funds move.</li>
              <li>Network fee is estimated live and shown before signing.</li>
              <li>Double-check the destination — chain transfers are final.</li>
            </ul>
          </div>
        </div>
      </WalletGate>
    </PageShell>
  );
}
