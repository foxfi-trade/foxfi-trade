import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { FoxTradeArt } from "../components/FoxVisual";
import { ConnectButton } from "../components/site";
import { useWallet } from "../lib/wallet";

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [
      { title: "Start Trading with FoxFi | Pro Trading Floor" },
      {
        name: "description",
        content:
          "Want to start trading with FoxFi? Connect your wallet and step onto our new trading floor — perps, limit orders and fox-fast execution.",
      },
      { property: "og:title", content: "Start Trading with FoxFi" },
      {
        property: "og:description",
        content: "Connect your wallet and check out the new FoxFi trading page.",
      },
    ],
  }),
  component: Trade,
});

function Trade() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const wasConnected = useRef(!!address);

  useEffect(() => {
    if (address && !wasConnected.current) {
      const t = setTimeout(() => navigate({ to: "/" }), 1400);
      return () => clearTimeout(t);
    }
    wasConnected.current = !!address;
    return;
  }, [address, navigate]);

  return (
    <div className="night-bg">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <div className="ember-ring overflow-hidden rounded-3xl border border-border">
          <FoxTradeArt />
        </div>
        <h1 className="mt-10 text-4xl font-bold sm:text-5xl">
          Want to start trading with <span className="ember-text">FoxFi</span>?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Connect your wallet and check out our new trading page — perps, limit orders, and
          execution routed by the sharpest fox in DeFi.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <ConnectButton size="lg" label="Connect Wallet to Enter" />
          {address && (
            <p className="text-sm text-success">
              Wallet connected — taking you back to your portfolio…
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
          {[
            { t: "Up to 50×", d: "Leverage on majors" },
            { t: "0.02%", d: "Maker fee" },
            { t: "9 chains", d: "Unified margin" },
          ].map((s) => (
            <div key={s.t} className="surface-card px-5 py-5">
              <p className="font-display text-2xl font-bold ember-text">{s.t}</p>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
