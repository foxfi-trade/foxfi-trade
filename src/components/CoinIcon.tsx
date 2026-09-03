import { useState } from "react";
import { coinIconUrl } from "../lib/markets";

const SIZES = { sm: 24, md: 32, lg: 44 } as const;

export function CoinIcon({
  id,
  symbol,
  image,
  size = "md",
  className = "",
}: {
  id: string;
  symbol: string;
  image?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const px = SIZES[size];
  const src = image || coinIconUrl(id);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        style={{ width: px, height: px }}
        className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-display text-[10px] font-bold text-primary ${className}`}
      >
        {symbol.slice(0, 4)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${symbol} logo`}
      width={px}
      height={px}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: px, height: px }}
      className={`shrink-0 rounded-full bg-secondary object-contain ring-1 ring-border ${className}`}
    />
  );
}
