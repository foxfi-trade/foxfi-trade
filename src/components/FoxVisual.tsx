/** Served from public/foxfi-mark.png so it works on any host (Netlify included). */
const foxMark = { url: "/foxfi-mark.png" };

/**
 * Hand-drawn geometric fox marks — no photography, no AI imagery.
 * Pure SVG built from the design tokens so it themes with the rest of the app.
 */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-ember`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--primary)" />
        <stop offset="100%" stopColor="var(--primary-glow)" />
      </linearGradient>
      <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
      </linearGradient>
      <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke="var(--border)" strokeWidth="1" />
      </pattern>
    </defs>
  );
}

/**
 * The FoxFi mark. Rendered as a real <img> layered over the SVG — SVG <image>
 * with a cross-origin CDN href is unreliable in production browsers.
 */
function FoxMarkLayer({ left, top, width }: { left: string; top: string; width: string }) {
  return (
    <img
      src={foxMark.url}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute select-none"
      style={{ left, top, width }}
    />
  );
}

const CANDLES = [
  [0.42, 0.62, 0.46, 0.58, 1],
  [0.36, 0.6, 0.56, 0.4, 0],
  [0.3, 0.52, 0.34, 0.48, 1],
  [0.26, 0.46, 0.44, 0.3, 0],
  [0.18, 0.4, 0.22, 0.36, 1],
  [0.12, 0.34, 0.16, 0.3, 1],
  [0.08, 0.28, 0.24, 0.12, 0],
  [0.04, 0.22, 0.08, 0.2, 1],
] as const;

/** Landing-page composition: fox mark over a market grid. */
export function FoxPortfolioArt() {
  const id = "fox-portfolio";
  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 480 420"
        role="img"
        aria-label="Geometric fox mark over an ascending market grid"
        className="h-full w-full"
      >
        <Defs id={id} />
        <rect width="480" height="420" fill="var(--card)" />
        <rect width="480" height="420" fill={`url(#${id}-grid)`} opacity="0.5" />
        <rect width="480" height="420" fill={`url(#${id}-fade)`} />

        {/* market path */}
        <path
          d="M20 340 L80 312 L130 328 L190 262 L250 280 L310 200 L370 214 L460 120"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.55"
        />
        {CANDLES.map(([high, low, open, close, up], i) => {
          const x = 46 + i * 54;
          const y = (v: number) => 400 - v * 340;
          return (
            <g key={i} opacity="0.5">
              <line
                x1={x}
                x2={x}
                y1={y(high)}
                y2={y(low)}
                stroke="var(--border)"
                strokeWidth="1.5"
              />
              <rect
                x={x - 6}
                y={Math.min(y(open), y(close))}
                width="12"
                height={Math.max(4, Math.abs(y(open) - y(close)))}
                fill={up ? "var(--success)" : "var(--destructive)"}
                opacity="0.75"
              />
            </g>
          );
        })}

        {/* clinical labels */}
        <g
          fill="var(--muted-foreground)"
          fontSize="9"
          fontFamily="var(--font-display)"
          letterSpacing="3"
        >
          <text x="20" y="30">
            FOXFI / DEN 01
          </text>
          <text x="460" y="30" textAnchor="end">
            NON-CUSTODIAL
          </text>
          <text x="20" y="404">
            EVM · 9 CHAINS
          </text>
        </g>
      </svg>
      <FoxMarkLayer left="29%" top="18%" width="42%" />
    </div>
  );
}

/** Trade-page composition: mirrored fox silhouettes framing an order book. */
export function FoxTradeArt() {
  const id = "fox-trade";
  const rows = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-label="Geometric fox mark flanked by an abstract order book"
        className="h-full w-full"
      >
        <Defs id={id} />
        <rect width="720" height="360" fill="var(--card)" />
        <rect width="720" height="360" fill={`url(#${id}-grid)`} opacity="0.45" />

        {/* order book: bids left, asks right */}
        {rows.map((r) => {
          const w = 70 + r * 14;
          const y = 70 + r * 26;
          return (
            <g key={r}>
              <rect
                x={180 - w}
                y={y}
                width={w}
                height="12"
                fill="var(--success)"
                opacity={0.1 + r * 0.045}
              />
              <rect
                x={540}
                y={y}
                width={w}
                height="12"
                fill="var(--destructive)"
                opacity={0.1 + r * 0.045}
              />
            </g>
          );
        })}

        <line
          x1="360"
          y1="24"
          x2="360"
          y2="336"
          stroke="var(--primary)"
          strokeWidth="1"
          opacity="0.25"
        />
        <g
          fill="var(--muted-foreground)"
          fontSize="10"
          fontFamily="var(--font-display)"
          letterSpacing="3"
        >
          <text x="24" y="34">
            BIDS
          </text>
          <text x="696" y="34" textAnchor="end">
            ASKS
          </text>
          <text x="360" y="348" textAnchor="middle">
            FOXFI TRADING FLOOR
          </text>
        </g>
      </svg>
      <FoxMarkLayer left="37.8%" top="20%" width="24.4%" />
    </div>
  );
}
