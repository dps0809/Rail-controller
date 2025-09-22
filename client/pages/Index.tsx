import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPinned, Rocket, RotateCcw } from "lucide-react";
import NetworkGraph from "@/components/rail/NetworkGraph";
import KPISparkline from "@/components/rail/KPISparkline";
import { nodes as puneNodes, edges as puneEdges } from "@/lib/pune-baramati-graph";

export default function Index() {
  const [timeWindow, setTimeWindow] = useState<number[]>([30]);
  const [weights, setWeights] = useState({ express: 1, passenger: 1, freight: 1 });

  const stations = useMemo(() => puneNodes, []);
  const edges = useMemo(() => puneEdges, []);

  return (
    <div className="mx-auto max-w-[1400px] p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_320px]">
        {/* Controls */}
        <aside className="space-y-4">
          <div className="rounded-md border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Section</label>
                <Select defaultValue="demo">
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="east">East Line</SelectItem>
                    <SelectItem value="west">West Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Time window (min)</span>
                  <span className="font-medium text-foreground">{timeWindow[0]}</span>
                </div>
                <Slider value={timeWindow} onValueChange={setTimeWindow} min={5} max={120} step={5} />
              </div>
              <div className="space-y-3">
                {([
                  ["Express", "express"],
                  ["Passenger", "passenger"],
                  ["Freight", "freight"],
                ] as const).map(([label, key]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Priority – {label}</span>
                      <span className="font-medium text-foreground">{weights[key as keyof typeof weights].toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[weights[key as keyof typeof weights]]}
                      onValueChange={([v]) => setWeights((w) => ({ ...w, [key]: Number(v.toFixed(1)) }))}
                      min={0}
                      max={2}
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Scenario</label>
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
                <Button className="flex-1 gap-1">
                  <Rocket className="h-4 w-4" /> Get Recommendation
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Run Simulation
                </Button>
                <Button variant="ghost" className="flex-1 gap-1">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4">
          <div className="rounded-md border bg-card">
            <div className="flex items-center justify-between gap-2 border-b p-4">
              <h2 className="text-sm font-semibold">Rail Network Graph</h2>
              <Button variant="outline" size="sm" className="gap-1">
                <MapPinned className="h-4 w-4" /> Open Google Map
              </Button>
            </div>
            <div className="p-4">
              <NetworkGraph stations={stations} edges={edges} backgroundColor="wheat" height={1000} />
            </div>
          </div>

          <div className="rounded-md border bg-card">
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
                        <Button size="sm" variant="outline">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="rounded-md border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">AI Recommendation</h2>
              <span className="text-xs text-muted-foreground">Demo</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              No plan yet. Click “Get Recommendation”.
            </p>
          </div>

          <div className="rounded-md border bg-card p-4">
            <h2 className="text-sm font-semibold">KPI Dashboard</h2>
            <div className="mt-2">
              <KPISparkline />
            </div>
          </div>

          <div className="rounded-md border bg-card p-4">
            <details open>
              <summary className="cursor-pointer text-sm font-semibold">Audit Log</summary>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>14:20 — Section updated to Demo</li>
                <li>14:05 — Operator logged in</li>
              </ul>
            </details>
          </div>
        </aside>
      </div>
    </div>
  );
}
