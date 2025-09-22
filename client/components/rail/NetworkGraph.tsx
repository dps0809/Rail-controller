import { cn } from "@/lib/utils";

export type Station = {
  id: string | number;
  label: string;
  x: number; // arbitrary coords (will be normalized)
  y: number; // arbitrary coords (will be normalized)
  size?: number;
  image?: string;
};

export type Edge = {
  from: string | number;
  to: string | number;
  label?: string;
  color?: string;
  width?: number;
};

export interface NetworkGraphProps {
  className?: string;
  stations: Station[];
  edges: Edge[];
  height?: number; // px
  backgroundColor?: string; // e.g. 'wheat'
  activeStationId?: string | number;
  svgId?: string;
}

function normalize(points: Pick<Station, "x" | "y">[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 5;
  return (x: number, y: number) => {
    const nx = ((x - minX) / (maxX - minX || 1)) * (100 - pad * 2) + pad;
    const ny = ((y - minY) / (maxY - minY || 1)) * (100 - pad * 2) + pad;
    return { x: nx, y: 100 - ny };
  };
}

export function NetworkGraph({
  className,
  stations,
  edges,
  height = 340,
  backgroundColor,
  activeStationId,
  svgId,
}: NetworkGraphProps) {
  const map = normalize(stations);
  const mapped = stations.map((s) => ({ ...s, ...map(s.x, s.y) }));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border",
        className,
      )}
      style={backgroundColor ? { background: backgroundColor } : undefined}
    >
      <svg
        id={svgId}
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height }}
      >
        <g>
          {edges.map((e, idx) => {
            const a = mapped.find((s) => String(s.id) === String(e.from))!;
            const b = mapped.find((s) => String(s.id) === String(e.to))!;
            const x1 = a.x,
              y1 = a.y,
              x2 = b.x,
              y2 = b.y;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const stroke = e.color || "#9aa0a6";
            const sw = e.width ? Math.max(1, e.width * 0.4) : 1.5;
            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={sw}
                />
                {e.label ? (
                  <text
                    x={midX}
                    y={midY - 1}
                    fill="#000"
                    fontSize={2.8}
                    textAnchor="middle"
                    fontFamily="Arial, system-ui"
                  >
                    {e.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
        {mapped.map((s) => {
          const iconW = (s.size ?? 30) * 0.18;
          const iconH = iconW * 1.1;
          const x = s.x - iconW / 2;
          const y = s.y - iconH / 2;
          const isActive = String(s.id) === String(activeStationId ?? "");
          return (
            <g key={s.id}>
              {s.image ? (
                <image
                  href={s.image}
                  x={x}
                  y={y}
                  width={iconW}
                  height={iconH}
                />
              ) : (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={3}
                  className="fill-background stroke-primary"
                  strokeWidth={1.2}
                />
              )}
              {isActive ? (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={4.6}
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  fill="none"
                />
              ) : null}
              <text
                x={s.x}
                y={s.y - (iconH / 2 + 2)}
                fill="#000"
                fontSize={2.8}
                textAnchor="middle"
                fontFamily="Arial, system-ui"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default NetworkGraph;
