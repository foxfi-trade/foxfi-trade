import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import foxLogo from "../assets/fox-logo.png";
import { useWallet } from "../lib/wallet";

const NAV = [
  { to: "/", label: "Portfolio" },
  { to: "/markets", label: "Markets" },
  { to: "/positions", label: "Positions" },
  { to: "/swap", label: "Swap" },
  { to: "/trade", label: "Trade" },
  { to: "/tools", label: "Tools" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/withdraw", label: "Withdraw" },
] as const;

export function ConnectButton({
  size = "md",
  label = "Connect Wallet",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const { address, short, connecting, connect, chain } = useWallet();
  const pad =
    size === "lg" ? "px-8 py-4 text-base" : size === "sm" ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm";

  if (address) {
    return (
      <button
        type="button"
        // noir.js can target this to reopen your modal / show wallet details.
        className={`connect-wallet noir-connect noir-evm is-connected btn-base btn-outline ${pad} ${className}`}
        onClick={connect}
        title="Wallet details"
      >
        <span className="size-2 rounded-full bg-success" />
        {short}
        <span className="text-muted-foreground">· {chain}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      // Your own modal hooks onto these classes (.connect-wallet / .noir-connect / .noir-evm).
      className={`connect-wallet noir-connect noir-evm btn-base btn-ember ${pad} ${className}`}
      onClick={connect}
      disabled={connecting}
    >
      {connecting ? "Sniffing for wallet…" : label}
    </button>
  );
}


export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={foxLogo} alt="FoxFi fox logo" width={36} height={36} className="size-9" />
          <span className="font-display text-lg font-bold tracking-tight">
            Fox<span className="ember-text">Fi</span>
          </span>
        </Link>
        <nav className="ml-3 hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <ConnectButton />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 xl:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-muted-foreground"
            activeProps={{ className: "bg-accent text-primary" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={foxLogo} alt="" width={28} height={28} className="size-7" loading="lazy" />
          <p className="text-sm text-muted-foreground">
            FoxFi · den of the clever DeFi trader. Non-custodial, always.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="night-bg">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

export function CoinBadge({ symbol }: { symbol: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-[11px] font-bold text-primary">
      {symbol.slice(0, 4)}
    </span>
  );
}

export function WalletGate({
  heading,
  copy,
  children,
}: {
  heading: string;
  copy: string;
  children: ReactNode;
}) {
  const { address } = useWallet();
  if (address) return <>{children}</>;
  return (
    <div className="surface-card ember-ring flex flex-col items-center gap-4 px-6 py-14 text-center">
      <img src={foxLogo} alt="" width={72} height={72} className="size-16" loading="lazy" />
      <h2 className="text-2xl font-bold">{heading}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{copy}</p>
      <ConnectButton size="lg" />
    </div>
  );
}
