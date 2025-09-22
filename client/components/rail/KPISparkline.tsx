type Props = { points?: number[] };

export default function KPISparkline({ points = [5, 6, 5, 7, 9, 6, 8, 10, 7] }: Props) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = points.map((p) => (p - min) / (max - min || 1));
  const step = 100 / (points.length - 1);
  const d = norm.map((n, i) => `${i === 0 ? "M" : "L"}${i * step},${100 - n * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-full">
      <path d={d} className="stroke-primary fill-none" strokeWidth={2} />
      {norm.map((n, i) => (
        <circle key={i} cx={i * step} cy={100 - n * 100} r={2} className="fill-primary" />
      ))}
    </svg>
  );
}
