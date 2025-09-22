import { cn } from "@/lib/utils";

export type Station = {
  id: string;
  label: string;
  x: number; // 0..100 relative coords
  y: number; // 0..100 relative coords
};

export type Edge = {
  from: string;
  to: string;
  label?: string;
};

export interface NetworkGraphProps {
  className?: string;
  stations: Station[];
  edges: Edge[];
}

export function NetworkGraph({ className, stations, edges }: NetworkGraphProps) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-md border bg-card", className)}>
      <svg viewBox="0 0 100 100" className="h-[340px] w-full">
        <defs>
          <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
            <circle cx="5" cy="5" r="3" className="fill-primary" />
          </marker>
        </defs>
        <g stroke="hsl(var(--border))" strokeWidth="1.5">
          {edges.map((e, idx) => {
            const a = stations.find((s) => s.id === e.from)!;
            const b = stations.find((s) => s.id === e.to)!;
            const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            return (
              <g key={idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-muted-foreground/40" />
                {e.label ? (
                  <text x={midX} y={midY - 1} className="fill-muted-foreground text-[2.8px]" textAnchor="middle">
                    {e.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
        {stations.map((s) => (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={3.2} className="fill-background stroke-primary" strokeWidth={1.2} />
            <text x={s.x} y={s.y - 5} className="fill-foreground text-[2.8px]" textAnchor="middle">
              {s.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default NetworkGraph;
