import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CoinIcon } from "../components/CoinIcon";
import { GlobalStatsBar } from "../components/PriceBoard";
import { PageShell } from "../components/site";
import { COINS, formatAmount, formatUsd, useMarkets } from "../lib/markets";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Crypto Trader Tools — Converter, Risk & Yield Calculators | FoxFi" },
      {
        name: "description",
        content:
          "Convert any coin pair at live rates, size positions by risk, model compounding APY, estimate impermanent loss and read gas costs — all in the FoxFi den.",
      },
      { property: "og:title", content: "FoxFi Trader Tools" },
      {
        property: "og:description",
        content: "Converter, position sizer, APY compounder, impermanent-loss model and gas guide.",
      },
    ],
  }),
  component: Tools,
});

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string | undefined;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 focus-within:border-primary">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className="w-full bg-transparent text-sm outline-none"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </span>
    </label>
  );
}

function Converter() {
  const { byId } = useMarkets();
  const [from, setFrom] = useState("ethereum");
  const [to, setTo] = useState("solana");
  const [amount, setAmount] = useState("1");

  const fromCoin = byId[from];
  const toCoin = byId[to];
  const out =
    fromCoin && toCoin && Number(amount) > 0
      ? (Number(amount) * fromCoin.price) / toCoin.price
      : 0;

  return (
    <div className="surface-card px-5 py-6">
      <h2 className="font-display text-lg font-semibold">Live pair converter</h2>
      <p className="mt-1 text-sm text-muted-foreground">Any coin into any coin at market rate.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted-foreground">From</span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} · {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">To</span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} · {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <Field label="Amount" value={amount} onChange={setAmount} suffix={fromCoin?.symbol} />
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-accent/30 px-4 py-4">
        {toCoin && <CoinIcon id={toCoin.id} symbol={toCoin.symbol} image={toCoin.image} />}
        <div>
          <p className="font-display text-2xl font-bold ember-text">
            {formatAmount(out)} {toCoin?.symbol}
          </p>
          <p className="text-xs text-muted-foreground">
            ≈ {formatUsd(Number(amount || 0) * (fromCoin?.price ?? 0))} · 1 {fromCoin?.symbol} ={" "}
            {formatAmount((fromCoin?.price ?? 0) / (toCoin?.price ?? 1))} {toCoin?.symbol}
          </p>
        </div>
      </div>
    </div>
  );
}

function PositionSizer() {
  const [equity, setEquity] = useState("10000");
  const [risk, setRisk] = useState("1.5");
  const [entry, setEntry] = useState("3400");
  const [stop, setStop] = useState("3200");
  const [leverage, setLeverage] = useState("3");

  const e = Number(equity) || 0;
  const r = Number(risk) || 0;
  const entryP = Number(entry) || 0;
  const stopP = Number(stop) || 0;
  const lev = Number(leverage) || 1;

  const riskUsd = (e * r) / 100;
  const perUnit = Math.abs(entryP - stopP);
  const units = perUnit > 0 ? riskUsd / perUnit : 0;
  const notional = units * entryP;
  const marginNeeded = lev > 0 ? notional / lev : 0;
  const liq = entryP > 0 ? entryP * (1 - 1 / lev) : 0;

  return (
    <div className="surface-card px-5 py-6">
      <h2 className="font-display text-lg font-semibold">Position sizer &amp; risk</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Never guess size again — size from the stop, not from the vibe.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Account equity" value={equity} onChange={setEquity} suffix="USD" />
        <Field label="Risk per trade" value={risk} onChange={setRisk} suffix="%" />
        <Field label="Entry price" value={entry} onChange={setEntry} suffix="USD" />
        <Field label="Stop price" value={stop} onChange={setStop} suffix="USD" />
        <Field label="Leverage" value={leverage} onChange={setLeverage} suffix="x" />
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Risked capital", value: formatUsd(riskUsd) },
          { label: "Position size", value: `${formatAmount(units)} units` },
          { label: "Notional exposure", value: formatUsd(notional) },
          { label: "Margin required", value: formatUsd(marginNeeded) },
          { label: "Est. liquidation (long)", value: formatUsd(liq) },
          {
            label: "R multiple at 2:1",
            value: formatUsd(riskUsd * 2),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border px-4 py-3">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-0.5 font-display text-lg font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function YieldCalculator() {
  const [principal, setPrincipal] = useState("5000");
  const [apy, setApy] = useState("12");
  const [months, setMonths] = useState("12");

  const p = Number(principal) || 0;
  const a = (Number(apy) || 0) / 100;
  const m = Number(months) || 0;

  const rows = useMemo(() => {
    const compoundsPerYear = [
      { label: "Daily compounding", n: 365 },
      { label: "Weekly compounding", n: 52 },
      { label: "Monthly compounding", n: 12 },
      { label: "Simple (no compounding)", n: 0 },
    ];
    return compoundsPerYear.map((c) => {
      const years = m / 12;
      const value = c.n === 0 ? p * (1 + a * years) : p * (1 + a / c.n) ** (c.n * years);
      return { label: c.label, value, gain: value - p };
    });
  }, [p, a, m]);

  return (
    <div className="surface-card px-5 py-6">
      <h2 className="font-display text-lg font-semibold">Yield &amp; compounding</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        See what an APY actually pays over your holding period.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Field label="Deposit" value={principal} onChange={setPrincipal} suffix="USD" />
        <Field label="APY" value={apy} onChange={setApy} suffix="%" />
        <Field label="Duration" value={months} onChange={setMonths} suffix="months" />
      </div>
      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-display font-semibold">{formatUsd(row.value)}</span>
            <span className="text-success">+{formatUsd(row.gain)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImpermanentLoss() {
  const [change, setChange] = useState("50");
  const ratio = 1 + (Number(change) || 0) / 100;
  const il = ratio > 0 ? (2 * Math.sqrt(ratio)) / (1 + ratio) - 1 : 0;
  const pct = Math.abs(il * 100);

  return (
    <div className="surface-card px-5 py-6">
      <h2 className="font-display text-lg font-semibold">Impermanent loss model</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        For a 50/50 pool: how far LPing trails simply holding when one side moves.
      </p>
      <div className="mt-5">
        <Field label="Price change of asset A vs B" value={change} onChange={setChange} suffix="%" />
      </div>
      <div className="mt-5 rounded-xl border border-border bg-accent/30 px-4 py-4">
        <p className="font-display text-3xl font-bold ember-text">{pct.toFixed(2)}%</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Value lost versus holding. Fees and incentives above this rate keep the pool profitable.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
        {[25, 50, 100, 300].map((v) => {
          const r = 1 + v / 100;
          const loss = Math.abs(((2 * Math.sqrt(r)) / (1 + r) - 1) * 100);
          return (
            <div key={v} className="rounded-lg border border-border px-3 py-2">
              <p className="font-display text-foreground">+{v}%</p>
              <p>{loss.toFixed(2)}% IL</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tools() {
  return (
    <>
      <GlobalStatsBar />
      <PageShell
        eyebrow="Trader tools"
        title={
          <>
            The whole <span className="ember-text">toolbelt</span>
          </>
        }
        subtitle="Everything a crypto trader keeps in five browser tabs — converter, risk sizing, yield math and LP modelling — in one den, priced off the live feed."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Converter />
          <PositionSizer />
          <YieldCalculator />
          <ImpermanentLoss />
        </div>
      </PageShell>
    </>
  );
}
