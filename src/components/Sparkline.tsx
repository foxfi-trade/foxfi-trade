export function Sparkline({
  points,
  up,
  width = 120,
  height = 36,
  fill = true,
}: {
  points: number[];
  up: boolean;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  if (!points || points.length < 2) {
    return <div style={{ width, height }} className="rounded bg-secondary/40" />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / span) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = `M${coords.join(" L")}`;
  const area = `${line} L${width},${height} L0,${height} Z`;
  const stroke = up ? "var(--success)" : "var(--destructive)";
  const gid = `spark-${up ? "up" : "down"}-${points.length}-${Math.round(min)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function AreaChart({
  points,
  height = 220,
  up = true,
}: {
  points: number[];
  height?: number;
  up?: boolean;
}) {
  const width = 720;
  if (!points || points.length < 2) {
    return <div style={{ height }} className="rounded-xl bg-secondary/30" />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / span) * (height - 24) - 12;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = `M${coords.join(" L")}`;
  const stroke = up ? "var(--success)" : "var(--destructive)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ height }}
      className="w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="chart-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1="0"
          x2={width}
          y1={height * t}
          y2={height * t}
          stroke="var(--border)"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
      ))}
      <path d={`${line} L${width},${height} L0,${height} Z`} fill="url(#chart-fade)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
