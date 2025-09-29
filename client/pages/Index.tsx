import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPinned, Rocket, RotateCcw, Wheat } from "lucide-react";
import NetworkGraph from "@/components/rail/NetworkGraph";
import RailwayMap from "@/components/rail/RailwayMap";
import SimpleMap from "@/components/rail/SimpleMap";
import IframeMap from "@/components/rail/IframeMap";
import MumbaiPuneMap from "@/components/rail/MumbaiPuneMap";
import KPISparkline from "@/components/rail/KPISparkline";
import {
  nodes as puneNodes,
  edges as puneEdges,
} from "@/lib/pune-baramati-graph";
import { toast } from "sonner";

export default function Index() {
  console.log("Index component rendering - What-if should be visible");
  const [timeWindow, setTimeWindow] = useState<number[]>([30]);
  const [weights, setWeights] = useState({
    express: 1,
    passenger: 1,
    freight: 1,
  });

  // What-if scenario form state
  const [whatIf, setWhatIf] = useState({
    delayType: "Default" as "Default" | "T001 → T002 → T003" | "T001 → T003 → T002" | "T002 → T001 → T003" | "T002 → T003 → T001" | "T003 → T001 → T002" | "T003 → T002 → T001",
    delayMinutes: 5,
    closureStationId: "",
    weather: "normal" as "normal" | "rain" | "fog" | "storm",
    planMode: "ai" as "ai" | "manual",
    prompt: "",
  });
  const [whatIfKpi, setWhatIfKpi] = useState<null | {
    throughput: number; // trains/hour
    avgDelay: number; // minutes
    onTimePct: number; // percent
    utilization: number; // percent
    energyEfficiency?: number; // optional index
  }>(null);
  const [whatIfCompare, setWhatIfCompare] = useState<{
    ai: null | {
      throughput: number;
      avgDelay: number;
      onTimePct: number;
      utilization: number;
      energyEfficiency?: number;
    };
    manual: null | {
      throughput: number;
      avgDelay: number;
      onTimePct: number;
      utilization: number;
      energyEfficiency?: number;
    };
  }>({ ai: null, manual: null });

  const stations = useMemo(() => puneNodes, []);
  const baseEdges = useMemo(() => puneEdges, []);

  const [planEdges, setPlanEdges] = useState<typeof baseEdges>([]);
  const [activeStationId, setActiveStationId] = useState<
    number | string | null
  >(null);
  const [audit, setAudit] = useState<string[]>(["Ready."]);
  const [timeline, setTimeline] = useState<{ t: string; event: string }[]>([]);
  const [plan, setPlan] = useState<null | {
    id: string;
    throughputDelta: number;
    avgDelayDelta: number;
    confidence: number;
    steps: string[];
  }>(null);
  const simTimer = useRef<number | null>(null);
  const routeSequence = useRef<number[]>([
    27, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  ]);

  const edges = useMemo(
    () => [...baseEdges, ...planEdges],
    [baseEdges, planEdges],
  );

  const nowTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const addLog = (msg: string) => setAudit((a) => [msg, ...a].slice(0, 200));
  const addTimeline = (event: string) =>
    setTimeline((s) => [...s, { t: nowTime(), event }]);

  const buildRecommendation = () => {
    const blue = "#2563eb";
    const thick = 4;
    const pairs = routeSequence.current
      .map((id, i, arr) => (i < arr.length - 1 ? [arr[i], arr[i + 1]] : null))
      .filter(Boolean) as [number, number][];
    const pathEdges = pairs.map(([from, to]) => ({
      from,
      to,
      color: blue,
      width: thick,
    }));
    setPlanEdges(pathEdges);
    setPlan({
      id: "plan-001",
      throughputDelta: 13,
      avgDelayDelta: 3.2,
      confidence: 0.86,
      steps: [
        "T003 → allow 3:45:00 pm",
        "T002 → hold 5m",
        "T001 → allow 3:37:00 pm",
      ],
    });
    addLog("operator:a4j1 · view_recommendation · plan-001");
    toast.success("Recommendation ready", {
      description: "Blue path shown on graph",
    });
  };

  const simulateComparison = () => {
    // run manual
    const originalMode = whatIf.planMode;
    setWhatIf((s) => ({ ...s, planMode: "manual" }));
    const run = (mode: "manual" | "ai") => {
      let tmp = { ...whatIf, planMode: mode };
      // reuse calculation inline (mirrors simulateWhatIf)
      const baseThroughput = 10 + Math.round(timeWindow[0] / 15);
      let throughput = baseThroughput;
      let avgDelay = 3.5;
      let onTimePct = 90;
      let utilization = 65 + Math.round(
        (weights.express + weights.passenger + weights.freight) * 5,
      );
      const delayMap = { none: 0, minor: 4, moderate: 9, severe: 15 } as const;
      const weatherPenalty = { normal: 0, rain: 2, fog: 3, storm: 5 } as const;
      const addedDelay = delayMap[tmp.delayType] + weatherPenalty[tmp.weather];
      avgDelay += addedDelay;
      throughput = Math.max(4, throughput - Math.round(addedDelay / 3));
      onTimePct = Math.max(40, Math.round(onTimePct - addedDelay * 2));
      if (tmp.closureStationId) {
        throughput = Math.max(3, throughput - 2);
        onTimePct = Math.max(30, onTimePct - 6);
        avgDelay += 3;
      }
      if (mode === "ai") {
        avgDelay = Math.max(0, Number((avgDelay * 0.9).toFixed(1)));
        throughput += 1;
        onTimePct = Math.min(100, onTimePct + 3);
      }
      const energyEfficiency = Math.max(
        50,
        Math.min(100, 100 - avgDelay * 2 + (mode === "ai" ? 3 : -2)),
      );
      return {
        throughput,
        avgDelay: Number(avgDelay.toFixed(1)),
        onTimePct,
        utilization: Math.min(95, utilization),
        energyEfficiency,
      };
    };
    const manual = run("manual");
    const ai = run("ai");
    setWhatIfCompare({ ai, manual });
    setWhatIfKpi(null);
    addLog(
      `operator:a4j1 · what_if_compare · delay=${whatIf.delayType} · weather=${whatIf.weather} · closure=${whatIf.closureStationId || "none"}`,
    );
    setWhatIf((s) => ({ ...s, planMode: originalMode }));
  };

  // Simple what-if simulator to project KPIs (placeholder logic)
  const simulateWhatIf = () => {
    // Base metrics derived from current UI sliders
    const baseThroughput = 10 + Math.round(timeWindow[0] / 15); // crude function
    let throughput = baseThroughput;
    let avgDelay = 3.5;
    let onTimePct = 90;
    let utilization = 65 + Math.round(
      (weights.express + weights.passenger + weights.freight) * 5,
    );

    // Apply scenario impacts
    const delayMap = { Default: 0, order1: 4, order2: 9, order3: 15, order4: 10, order5: 7, order6: 2 } as const;
    const weatherPenalty = { normal: 0, rain: 2, fog: 3, storm: 5 } as const;

    const addedDelay = delayMap[whatIf.delayType] + weatherPenalty[whatIf.weather];
    avgDelay += addedDelay;
    throughput = Math.max(4, throughput - Math.round(addedDelay / 3));
    onTimePct = Math.max(40, Math.round(onTimePct - addedDelay * 2));
    if (whatIf.closureStationId) {
      throughput = Math.max(3, throughput - 2);
      onTimePct = Math.max(30, onTimePct - 6);
      avgDelay += 3;
    }

    // Manual vs AI: treat AI as slightly better recovery
    if (whatIf.planMode === "ai") {
      avgDelay = Math.max(0, Number((avgDelay * 0.9).toFixed(1)));
      throughput += 1;
      onTimePct = Math.min(100, onTimePct + 3);
    }

    const energyEfficiency = Math.max(
      50,
      Math.min(100, 100 - avgDelay * 2 + (whatIf.planMode === "ai" ? 3 : -2)),
    );

    setWhatIfKpi({
      throughput,
      avgDelay: Number(avgDelay.toFixed(1)),
      onTimePct,
      utilization: Math.min(95, utilization),
      energyEfficiency,
    });

    addLog(
      `operator:a4j1 · what_if · ${whatIf.planMode} · delay=${whatIf.delayType} · weather=${whatIf.weather} · closure=${whatIf.closureStationId || "none"}`,
    );
  };

  const runSimulation = () => {
    if (!planEdges.length) buildRecommendation();
    const seq = routeSequence.current;
    let i = 0;
    clearSimulation();
    addTimeline("Simulation started");
    simTimer.current = window.setInterval(() => {
      setActiveStationId(seq[i]);
      const name =
        stations.find((s) => String(s.id) === String(seq[i]))?.label ??
        String(seq[i]);
      addLog(`operator:a4j1 · simulate · plan-001 · ${name}`);
      addTimeline(`Reached ${name}`);
      i += 1;
      if (i >= seq.length) {
        clearSimulation();
        toast.success("Simulation complete");
        addTimeline("Simulation complete");
      }
    }, 900);
  };

  const clearSimulation = () => {
    if (simTimer.current) {
      window.clearInterval(simTimer.current);
      simTimer.current = null;
    }
  };

  useEffect(() => () => clearSimulation(), []);

  const handleReset = () => {
    clearSimulation();
    setPlanEdges([]);
    setActiveStationId(null);
    setAudit(["Reset."]);
    setTimeline([]);
    setPlan(null);
    setTimeWindow([30]);
    setWeights({ express: 1, passenger: 1, freight: 1 });
  };

  const openMap = () => {
    window.open(
      "https://www.google.com/maps/dir/Pune+Junction,+Pune,+Maharashtra/Baramati+Railway+Station,+Maharashtra",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const exportPlanCSV = () => {
    if (!plan) return;
    const rows = [["Step"], ...plan.steps.map((s) => [s])];
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan.id}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPlanPDF = () => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win || !plan) return;
    win.document.write(
      `<html><head><title>${plan.id}</title></head><body><h1>Recommendation ${plan.id}</h1><ul>${plan.steps.map((s) => `<li>${s}</li>`).join("")}</ul><p>Throughput Δ: ${plan.throughputDelta}, Avg Delay Δ: ${plan.avgDelayDelta}, Confidence: ${Math.round(plan.confidence * 100)}%</p></body></html>`,
    );
    win.document.close();
    win.focus();
    win.print();
  };

  const snapshotGraph = async () => {
    // Since we're now using a Leaflet map instead of SVG, let's capture the map container
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (!mapContainer) {
      toast.error("Map not found", {
        description: "Cannot capture snapshot - map not available",
      });
      return;
    }
    
    // For Leaflet maps, we'll use html2canvas approach (would need to install html2canvas)
    // For now, just show a message that snapshot feature needs to be updated
    toast.info("Snapshot feature", {
      description: "Map snapshot feature needs to be updated for Leaflet maps",
    });
    return;
    
    // Legacy SVG code (keeping for reference)
    const element = document.getElementById("rail-graph-svg");
    if (!element || !(element instanceof SVGSVGElement)) {
      return;
    }
    const svg = element;
    const s = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([s], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(800, svg.clientWidth || 800);
      canvas.height = Math.max(500, svg.clientHeight || 500);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#f5deb3"; // wheat background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `${plan?.id ?? "snapshot"}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="mx-auto max-w-[1400px] p-4 bg-blue-50 min-h-screen">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_320px]">
        {/* Controls */}
        <aside className="space-y-4">
          <div className="rounded-md border-2 border-blue-300 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Controls
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Section
                </label>
                <Select defaultValue="default">
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="east">East Line</SelectItem>
                    <SelectItem value="west">West Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Time window (min)</span>
                  <span className="font-medium text-foreground">
                    {timeWindow[0]}
                  </span>
                </div>
                <Slider
                  value={timeWindow}
                  onValueChange={setTimeWindow}
                  min={5}
                  max={120}
                  step={5}
                />
              </div>
              <div className="space-y-3">
                {(
                  [
                    ["Express", "express"],
                    ["Passenger", "passenger"],
                    ["Freight", "freight"],
                  ] as const
                ).map(([label, key]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Priority – {label}</span>
                      <span className="font-medium text-foreground">
                        {weights[key as keyof typeof weights].toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[weights[key as keyof typeof weights]]}
                      onValueChange={([v]) =>
                        setWeights((w) => ({
                          ...w,
                          [key]: Number(v.toFixed(1)),
                        }))
                      }
                      min={0}
                      max={2}
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Scenario
                </label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue placeholder="Scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="congested">Congested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button className="flex-1 gap-1" onClick={buildRecommendation}>
                  <Rocket className="h-4 w-4" /> Get Recommendation
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={runSimulation}
                >
                  Run Simulation
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 gap-1"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </div>

          {/* What-if Scenarios */}
          <div className="rounded-md border-2 border-blue-300 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              What‑if Scenarios
            </h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Scenarios</label>
                  <select
                    value={whatIf.delayType}
                    onChange={(e) => setWhatIf((s) => ({ ...s, delayType: e.target.value as any }))}
                    className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                  >
                    <option value="default">Default</option>
                    <option value="order1">T001 → T002 → T003</option>
                    <option value="order2">T001 → T003 → T002</option>
                    <option value="order3">T002 → T001 → T003</option>
                    <option value="order4">T002 → T003 → T001</option>
                    <option value="order5">T003 → T001 → T002</option>
                    <option value="order6">T003 → T002 → T001</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Weather</label>
                  <select
                    value={whatIf.weather}
                    onChange={(e) => setWhatIf((s) => ({ ...s, weather: e.target.value as any }))}
                    className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                  >
                    <option value="normal">Normal</option>
                    <option value="rain">Rain</option>
                    <option value="fog">Fog</option>
                    <option value="storm">Storm</option>
                  </select>
                </div>
              </div>


              {/* leafmap */}

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Temporary closure (station)</label>
                <select
                  value={whatIf.closureStationId}
                  onChange={(e) => setWhatIf((s) => ({ ...s, closureStationId: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                >
                  <option value="">Default</option>
                  {stations.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

{/* {
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Plan mode</label>
                  <select
                    value={whatIf.planMode}
                    onChange={(e) => setWhatIf((s) => ({ ...s, planMode: e.target.value as any }))}
                    className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                  >
                    <option value="ai">AI plan</option>
                    <option value="manual">Manual plan</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Extra delay (min)</label>
                  <input
                    type="number"
                    value={whatIf.delayMinutes}
                    onChange={(e) =>
                      setWhatIf((s) => ({ ...s, delayMinutes: Number(e.target.value || 0) }))
                    }
                    min={0}
                    className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                  />
                </div>
              </div> } */}

              {/* <div>
                <label className="mb-1 block text-xs text-muted-foreground">Controller prompt (test/sample case)</label>
                <textarea
                  value={whatIf.prompt}
                  onChange={(e) => setWhatIf((s) => ({ ...s, prompt: e.target.value }))}
                  rows={3}
                  placeholder="e.g., Block line between Station A-B for 20m; prioritize express; hold freight if needed"
                  className="w-full rounded-md border px-2 py-1 text-sm bg-background"
                />
              </div> */}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={simulateWhatIf}>Run What‑if</Button>
                <Button variant="outline" className="flex-1" onClick={simulateComparison}> AI vs Manual</Button>
              </div>

              {whatIfKpi && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground">Projected KPIs</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-md border p-2"><div className="text-muted-foreground">Throughput</div><div className="text-lg">{whatIfKpi.throughput} tph</div></div>
                    <div className="rounded-md border p-2"><div className="text-muted-foreground">Avg delay</div><div className="text-lg">{whatIfKpi.avgDelay} min</div></div>
                    <div className="rounded-md border p-2"><div className="text-muted-foreground">On‑time %</div><div className="text-lg">{whatIfKpi.onTimePct}%</div></div>
                    <div className="rounded-md border p-2"><div className="text-muted-foreground">Utilization</div><div className="text-lg">{whatIfKpi.utilization}%</div></div>
                    {whatIfKpi.energyEfficiency !== undefined && (
                      <div className="col-span-2 rounded-md border p-2"><div className="text-muted-foreground">Energy efficiency</div><div className="text-lg">{whatIfKpi.energyEfficiency}%</div></div>
                    )}
                  </div>
                </div>
              )



              }
                   <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => addLog("operator:a4j1 · accept · plan-001")}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addLog("operator:a4j1 · reject · plan-001")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addLog("operator:a4j1 · modify · plan-001")}
                  >
                    Modify
                  </Button>
                </div>

              {whatIfCompare.ai && whatIfCompare.manual && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground">Scenario comparison</h3>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="mb-1 font-semibold">AI plan</div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">Throughput</div><div className="text-lg">{whatIfCompare.ai.throughput} tph</div></div>
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">Avg delay</div><div className="text-lg">{whatIfCompare.ai.avgDelay} min</div></div>
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">On‑time</div><div className="text-lg">{whatIfCompare.ai.onTimePct}%</div></div>
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">Utilization</div><div className="text-lg">{whatIfCompare.ai.utilization}%</div></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold">Manual plan</div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">Throughput</div><div className="text-lg">{whatIfCompare.manual.throughput} tph</div></div>
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">Avg delay</div><div className="text-lg">{whatIfCompare.manual.avgDelay} min</div></div>
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">On‑time</div><div className="text-lg">{whatIfCompare.manual.onTimePct}%</div></div>
                        <div className="rounded-md border p-2"><div className="text-muted-foreground">Utilization</div><div className="text-lg">{whatIfCompare.manual.utilization}%</div></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Δ (AI − Manual): Throughput {whatIfCompare.ai.throughput - whatIfCompare.manual.throughput} tph, Avg delay {(whatIfCompare.ai.avgDelay - whatIfCompare.manual.avgDelay).toFixed(1)} min, On‑time {whatIfCompare.ai.onTimePct - whatIfCompare.manual.onTimePct}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>


        {/* schedule */}
        <main className="space-y-4">
            <div className="overflow-x-auto">
            <div className="rounded-md border-2 border-blue-300 bg-card">
                  <div className="flex items-center justify-between gap-2 border-b p-4">
                   <h2 className="text-sm font-semibold"> Train Schedule</h2>
            </div>
              <table className="min-w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-muted-foreground">
                  <tr>
                    {[
                      "Train ID",
                      "Type",
                      "ETA",
                      "Current",
                      "Next",
                      "Status",
                      "Speed",
                      "Priority",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "12951",
                      type: "Express",
                      eta: "14:22",
                      current: "Nira",
                      next: "Jejuri",
                      status: "On time",
                      speed: "74 km/h",
                      priority: "High",
                    },
                    {
                      id: "12001",
                      type: "Passenger",
                      eta: "14:35",
                      current: "Lonand",
                      next: "Nira",
                      status: "Boarding",
                      speed: "0 km/h",
                      priority: "Medium",
                    },
                    {
                      id: "12245",
                      type: "Freight",
                      eta: "15:10",
                      current: "Jejuri",
                      next: "Haveli",
                      status: "Delayed",
                      speed: "40 km/h",
                      priority: "Low",
                    },
                  ].map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{row.id}</td>
                      <td className="px-3 py-2">{row.type}</td>
                      <td className="px-3 py-2">{row.eta}</td>
                      <td className="px-3 py-2">{row.current}</td>
                      <td className="px-3 py-2">{row.next}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.speed}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {row.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
             <div className="flex items-center justify-between gap-2"></div>

             {/* <div className="flex gap-2"> */}
                  <Button variant="outline" 
                    onClick={() => addLog("operator:a4j1 · modify · Train Shedule")}
                  >
                    Modify
                  </Button>
                  {/* </div> */}

                </tbody>
              </table>
            </div>
          </div>

          {/* main */}

       
          <div className="rounded-md border-2 border-blue-300 bg-card">
            <div className="flex items-center justify-between gap-2 border-b p-4">
              <h2 className="text-sm font-semibold">Railway Network</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={openMap}
              >
                <MapPinned className="h-4 w-4" /> Open Google Map
              </Button>
            </div>
            
            <div className="p-4 pb-[65px] relative">
              <MumbaiPuneMap />
            </div>
          </div>


{/* 
          <div className="rounded-md border-2 border-blue-300 bg-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-muted-foreground">
                  <tr>
                    {[
                      "Train ID",
                      "Type",
                      "ETA",
                      "Current",
                      "Next",
                      "Status",
                      "Speed",
                      "Priority",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "12951",
                      type: "Express",
                      eta: "14:22",
                      current: "Nira",
                      next: "Jejuri",
                      status: "On time",
                      speed: "74 km/h",
                      priority: "High",
                    },
                    {
                      id: "12001",
                      type: "Passenger",
                      eta: "14:35",
                      current: "Lonand",
                      next: "Nira",
                      status: "Boarding",
                      speed: "0 km/h",
                      priority: "Medium",
                    },
                    {
                      id: "12245",
                      type: "Freight",
                      eta: "15:10",
                      current: "Jejuri",
                      next: "Haveli",
                      status: "Delayed",
                      speed: "40 km/h",
                      priority: "Low",
                    },
                  ].map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{row.id}</td>
                      <td className="px-3 py-2">{row.type}</td>
                      <td className="px-3 py-2">{row.eta}</td>
                      <td className="px-3 py-2">{row.current}</td>
                      <td className="px-3 py-2">{row.next}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.speed}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {row.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div> */}

          <div className="rounded-md border-2 border-blue-300 bg-card p-4">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold">Simulation Timeline</h3>
                <ul className="mt-2 h-24 overflow-auto text-sm text-muted-foreground">
                  {timeline.length === 0 ? (
                    <li>No events</li>
                  ) : (
                    timeline.map((e, i) => (
                      <li key={i}>
                        {e.t} — {e.event}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Throughput vs time</h3>
                <div className="mt-1">
                  <KPISparkline />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Delay distribution</h3>
                <svg viewBox="0 0 100 40" className="mt-1 h-24 w-full">
                  {[15, 28, 24, 20, 18, 26, 30].map((v, i) => (
                    <rect
                      key={i}
                      x={i * 14 + 6}
                      y={40 - v}
                      width={10}
                      height={v}
                      className="fill-green-600"
                    />
                  ))}
                </svg>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={exportPlanCSV}>
                Export CSV
              </Button>
              <Button variant="outline" onClick={downloadPlanPDF}>
                Download plan PDF
              </Button>
              <Button variant="outline" onClick={snapshotGraph}>
                Snapshot
              </Button>
            </div>
          </div>
        </main>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="rounded-md border-2 border-blue-300 bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">AI Recommendation</h2>
              <span className="text-xs text-muted-foreground">
                {plan?.id ?? "No plan"}
              </span>
            </div>
            {!plan ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No plan yet. Click “Get Recommendation”.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <ol className="list-decimal pl-5 text-sm">
                  {plan.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md border p-2">
                    <div className="font-semibold">Throughput Δ</div>
                    <div className="text-lg">{plan.throughputDelta}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="font-semibold">Avg Delay Δ</div>
                    <div className="text-lg">{plan.avgDelayDelta}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="font-semibold">Confidence</div>
                    <div className="text-lg">
                      {Math.round(plan.confidence * 100)}%
                    </div>
                  </div>
                </div>
                <details className="text-sm text-muted-foreground">
                  <summary className="cursor-pointer">Why this plan?</summary>
                  <p className="mt-1">
                    Prioritizing express and minimizing cascade delays under
                    mixed traffic.
                  </p>
                </details>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" onClick={runSimulation}>
                    Simulate this plan
                  </Button>
                  <Button
                    onClick={() =>
                      addLog("operator:a4j1 · apply_request · plan-001")
                    }
                  >
                    Apply (Request)
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => addLog("operator:a4j1 · accept · plan-001")}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addLog("operator:a4j1 · reject · plan-001")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => addLog("operator:a4j1 · modify · plan-001")}
                  >
                    Modify
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-md border-2 border-blue-300 bg-card p-4">
            <h2 className="text-sm font-semibold">KPI Dashboard</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center text-xs">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Throughput</div>
                <div className="text-xl">12 tph</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Avg Delay</div>
                <div className="text-xl">4.1 min</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Punctuality</div>
                <div className="text-xl">88%</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Utilization</div>
                <div className="text-xl">72%</div>
              </div>
            </div>
            {/* <div className="mt-2">
              <KPISparkline />
            </div> */}
          </div>



          <div className="rounded-md border-2 border-blue-300 bg-card p-4">
            <details open>
              <summary className="cursor-pointer text-sm font-semibold">
                Audit Log
              </summary>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {audit.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </details>
          </div>
        </aside>
      </div>
    </div>
  );
}
