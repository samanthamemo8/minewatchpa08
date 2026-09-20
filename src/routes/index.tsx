import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  ClipboardCheck,
  CloudRain,
  Code2,
  FileDown,
  HardHat,
  Landmark,
  Layers3,
  MapPin,
  Radio,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ZipCode = "18503" | "18702" | "18706";

type Profile = {
  zip: ZipCode;
  place: string;
  score: number;
  depth: number;
  depthNote: string;
  vein: string;
  soil: string;
  insurance: string;
  worst: string;
  trend: number[];
  protocol: string[];
};

const profiles: Record<ZipCode, Profile> = {
  "18503": {
    zip: "18503", place: "Scranton Downtown", score: 58, depth: 210,
    depthNote: "Mapped abandoned workings", vein: "Dunmore Vein #3", soil: "Active Monitoring",
    insurance: "Recommended", worst: "Mining Depth",
    trend: [1.6, 1.9, 1.8, 2.2, 2.4, 2.1, 2.6, 2.8, 2.7, 3.1, 3.4, 3.2],
    protocol: ["Request the Lackawanna County mine map review before renovations.", "Apply for MSI coverage while the property remains free of active subsidence damage."],
  },
  "18702": {
    zip: "18702", place: "Wilkes-Barre Center", score: 82, depth: 95,
    depthNote: "Very shallow historical workings", vein: "Baltimore Vein", soil: "Shifting",
    insurance: "Critical Priority", worst: "Soil stability + shallow depth",
    trend: [2.8, 3.2, 3, 3.7, 4.1, 4.5, 4.2, 5, 5.4, 5.1, 5.8, 6.2],
    protocol: ["Document cracks and depressions now; avoid altering the affected area.", "Contact the MSI office for priority eligibility review and submit an online application."],
  },
  "18706": {
    zip: "18706", place: "Hanover Township", score: 34, depth: 480,
    depthNote: "Deep, stable rock layers", vein: "Deep Anthracite Workings", soil: "Stable",
    insurance: "Optional / Peace of Mind", worst: "All metrics performing well",
    trend: [0.9, 1, 0.8, 1.1, 1, 1.2, 1.1, 1, 1.2, 1.3, 1.2, 1.1],
    protocol: ["Retain this baseline assessment with your property records.", "Review optional MSI coverage for long-term protection and transferability."],
  },
};

const reportSchema = z.object({
  type: z.enum(["Foundation Cracks", "Backyard Depressions", "Shifting Sidewalks"]),
  details: z.string().trim().min(8, "Add a brief description (at least 8 characters).").max(300, "Keep the description under 300 characters."),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MineWatch | PA-08 Subsidence Risk Dashboard" },
      { name: "description", content: "Analyze abandoned mine subsidence risk, insurance guidance, and reporting resources across Pennsylvania's 8th Congressional District." },
      { property: "og:title", content: "MineWatch | PA-08 Subsidence Risk Dashboard" },
      { property: "og:description", content: "Community infrastructure intelligence for abandoned mine subsidence risk in PA-08." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MineWatchDashboard,
});

function riskMeta(score: number) {
  if (score < 40) return { label: "Low", color: "text-risk-low", stroke: "var(--risk-low)", badge: "border-risk-low/40 bg-risk-low/10 text-risk-low" };
  if (score <= 70) return { label: "Moderate", color: "text-risk-moderate", stroke: "var(--risk-moderate)", badge: "border-risk-moderate/40 bg-risk-moderate/10 text-risk-moderate" };
  return { label: "Critical", color: "text-risk-critical", stroke: "var(--risk-critical)", badge: "border-risk-critical/40 bg-risk-critical/10 text-risk-critical" };
}

function ArchitectureBadge({ children }: { children: string }) {
  return <span className="absolute -top-3 left-4 z-20 rounded-sm border border-safety/50 bg-background px-2 py-0.5 font-mono text-[9px] text-safety shadow-lg">{children}</span>;
}

function SectionHeading({ icon: Icon, eyebrow, title }: { icon: typeof Layers3; eyebrow: string; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-secondary text-safety"><Icon className="size-4" /></div>
      <div className="min-w-0"><p className="font-mono text-[9px] uppercase text-muted-foreground">{eyebrow}</p><h2 className="truncate text-sm font-semibold text-foreground">{title}</h2></div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, accent, architecture }: { icon: typeof Layers3; label: string; value: string; detail: string; accent?: boolean; architecture: boolean }) {
  return (
    <Card className="mine-panel print-break-avoid relative overflow-visible rounded-lg border-border">
      {architecture && <ArchitectureBadge>{"<MetricCard />"}</ArchitectureBadge>}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("grid size-9 shrink-0 place-items-center rounded-md border border-border bg-secondary text-muted-foreground", accent && "border-safety/50 bg-safety/10 text-safety")}><Icon className="size-4" /></div>
          <span className="font-mono text-[9px] uppercase text-muted-foreground">Verified layer</span>
        </div>
        <p className="mt-5 text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
        <Badge variant="outline" className="mt-3 max-w-full border-safety/40 bg-safety/10 py-1 font-mono text-[9px] text-safety">{detail}</Badge>
      </CardContent>
    </Card>
  );
}

function RiskDial({ score }: { score: number }) {
  const meta = riskMeta(score);
  const circumference = 2 * Math.PI * 92;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[270px]">
      <svg viewBox="0 0 220 220" className="size-full -rotate-90" role="img" aria-label={`Subsidence risk score ${score} out of 100, ${meta.label}`}>
        <circle cx="110" cy="110" r="92" fill="none" stroke="var(--border)" strokeWidth="13" />
        <circle cx="110" cy="110" r="92" fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="2 7" />
        <circle key={score} cx="110" cy="110" r="92" fill="none" stroke={meta.stroke} strokeWidth="13" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="dial-animate transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><p className="font-mono text-[9px] uppercase text-muted-foreground">Risk index</p><p className={cn("text-6xl font-semibold", meta.color)}>{score}</p><p className="text-xs text-muted-foreground">out of 100</p><Badge variant="outline" className={cn("mt-3", meta.badge)}>{meta.label} risk</Badge></div>
      </div>
    </div>
  );
}

function TrendChart({ values }: { values: number[] }) {
  const width = 420, height = 115, max = 7;
  const points = values.map((value, index) => `${(index / 11) * width},${height - (value / max) * height}`).join(" ");
  return (
    <div className="mt-4">
      <div className="flex items-end justify-between"><div><p className="text-xs font-semibold text-foreground">Geological micro-shifts detected</p><p className="font-mono text-[9px] uppercase text-muted-foreground">Millimeters · 12 months</p></div><p className="font-mono text-sm text-safety">{values.at(-1)?.toFixed(1)} mm</p></div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-28 w-full overflow-visible" aria-label="Twelve month geological micro-shift trend">
        {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={line * 38} y2={line * 38} stroke="var(--border)" strokeWidth="1" />)}
        <polyline points={points} fill="none" stroke="var(--safety)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => <circle key={index} cx={(index / 11) * width} cy={height - (value / max) * height} r="3" fill="var(--background)" stroke="var(--safety)" strokeWidth="2" />)}
      </svg>
      <div className="flex justify-between font-mono text-[8px] uppercase text-muted-foreground"><span>Oct 25</span><span>Jan 26</span><span>Apr 26</span><span>Sep 26</span></div>
    </div>
  );
}

function MineWatchDashboard() {
  const [zip, setZip] = useState<ZipCode>("18503");
  const [rainfall, setRainfall] = useState(false);
  const [architecture, setArchitecture] = useState(false);
  const [observation, setObservation] = useState("Foundation Cracks");
  const [details, setDetails] = useState("");
  const [formError, setFormError] = useState("");
  const [displayScore, setDisplayScore] = useState(profiles[zip].score);
  const detailsId = useId();
  const profile = profiles[zip];
  const targetScore = Math.min(profile.score + (rainfall ? 12 : 0), 100);
  const meta = riskMeta(targetScore);

  useEffect(() => {
    const start = displayScore;
    const delta = targetScore - start;
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplayScore(Math.round(start + delta * Math.min(frame / 12, 1)));
      if (frame >= 12) window.clearInterval(timer);
    }, 30);
    return () => window.clearInterval(timer);
  }, [targetScore]);

  const submitReport = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = reportSchema.safeParse({ type: observation, details });
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Check the report details."); return; }
    setFormError(""); setDetails("");
    toast.success("Report Synced to PA DEP Database", { description: `Observation reference MW-${zip}-${Date.now().toString().slice(-5)}` });
  };

  return (
    <main className="min-h-screen text-foreground">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="print-only hidden border-b border-border pb-4">
          <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Mine<span className="text-safety">Watch</span></h1><p className="font-mono text-[9px] uppercase text-muted-foreground">Homeowner Subsidence Risk Briefing · PA-08</p></div><HardHat className="size-8 text-safety" /></div>
        </div>
        <header className="no-print mine-panel relative rounded-lg border border-border p-4 sm:p-5">
          {architecture && <ArchitectureBadge>{"<StateProvider />"}</ArchitectureBadge>}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid size-11 shrink-0 place-items-center rounded-md border border-safety/50 bg-safety/10 text-safety"><HardHat className="size-6" /><ShieldCheck className="absolute -bottom-1 -right-1 size-4 fill-background" /></div>
              <div className="min-w-0"><h1 className="truncate text-2xl font-bold">Mine<span className="text-safety">Watch</span></h1><p className="truncate font-mono text-[9px] uppercase text-muted-foreground">PA-08 District Infrastructure Pilot</p></div>
            </div>
            <div className="hidden items-center gap-2 sm:flex"><span className="font-mono text-[9px] uppercase text-muted-foreground">Developer Architecture View</span><Switch aria-label="Developer Architecture View" checked={architecture} onCheckedChange={setArchitecture} /></div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl"><label className="mb-2 block text-xs font-semibold text-ink-soft">Select PA-08 Zip Code to Check Subsidence Risk</label><Select value={zip} onValueChange={(value) => setZip(value as ZipCode)}><SelectTrigger className="h-12 border-border bg-secondary/60 text-base"><SelectValue /></SelectTrigger><SelectContent>{Object.values(profiles).map((item) => <SelectItem key={item.zip} value={item.zip}>{item.zip} — {item.place}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center justify-between gap-4 sm:hidden"><span className="font-mono text-[9px] uppercase text-muted-foreground">Developer Architecture View</span><Switch aria-label="Developer Architecture View" checked={architecture} onCheckedChange={setArchitecture} /></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Radio className="signal-pulse size-3 text-risk-low" /><span>District sensor network online</span><span className="font-mono text-safety">12:04:28</span></div>
          </div>
        </header>

        <section className="mt-5 flex items-center justify-between border-y border-border py-3">
          <div className="flex min-w-0 items-center gap-2"><MapPin className="size-4 shrink-0 text-safety" /><p className="truncate text-sm font-semibold">{profile.place}, Pennsylvania <span className="font-normal text-muted-foreground">· ZIP {zip}</span></p></div>
          <Badge variant="outline" className={cn("shrink-0", meta.badge)}>{meta.label.toUpperCase()}</Badge>
        </section>

        <div className="minewatch-grid mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.35fr_0.9fr]">
          <aside className="space-y-4">
            <div className="flex items-center justify-between"><SectionHeading icon={Layers3} eyebrow="Property profile" title="Subsurface Summary" /><span className="font-mono text-[9px] text-muted-foreground">3 LAYERS</span></div>
            <MetricCard architecture={architecture} icon={Layers3} label="Historical mining depth" value={`${profile.depth} feet`} detail={profile.vein} accent={profile.worst.includes("Depth")} />
            <MetricCard architecture={architecture} icon={CircleGauge} label="Soil stability rating" value={profile.soil} detail="Ground movement index" accent={profile.soil === "Shifting"} />
            <MetricCard architecture={architecture} icon={ShieldCheck} label="MSI insurance eligibility" value={profile.insurance} detail="PA DEP program eligible" accent />
          </aside>

          <section className="space-y-4">
            <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
              {architecture && <ArchitectureBadge>{"<RiskDial />"}</ArchitectureBadge>}
              <CardHeader className="flex-row items-center justify-between p-4 pb-0"><SectionHeading icon={CircleGauge} eyebrow="Live assessment" title="Subsidence Risk Level Score" /><span className="font-mono text-[9px] text-muted-foreground">MODEL v2.4</span></CardHeader>
              <CardContent className="p-5"><RiskDial score={displayScore} /><div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-3 rounded-md border border-border bg-secondary/45 px-4 py-3"><div className="h-px flex-1 bg-border" /><p className="text-center text-xs text-muted-foreground">Primary concern: <strong className="text-foreground">{profile.worst}</strong></p><div className="h-px flex-1 bg-border" /></div></CardContent>
            </Card>

            <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
              {architecture && <ArchitectureBadge>{"<SimulationControl />"}</ArchitectureBadge>}
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-secondary text-safety"><CloudRain className="size-4" /></div><div className="min-w-0"><p className="text-sm font-semibold">Simulate Heavy Groundwater Impact</p><p className="text-xs text-muted-foreground">Model saturated soil conditions</p></div></div><Switch aria-label="Simulate Heavy Groundwater Impact" checked={rainfall} onCheckedChange={setRainfall} /></div>
                {rainfall && <div className="mt-4 flex gap-3 rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-3 text-xs text-risk-moderate animate-in fade-in"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><p><strong>+12 risk points:</strong> Saturation can shift loose soil into abandoned anthracite mine voids, increasing surface settlement.</p></div>}
                <TrendChart values={profile.trend.map((value) => rainfall ? value + 0.7 : value)} />
              </CardContent>
            </Card>
          </section>

          <aside>
            <Card className="mine-panel relative h-full rounded-lg border-border">
              {architecture && <ArchitectureBadge>{"<CitizenReportForm />"}</ArchitectureBadge>}
              <CardHeader className="p-5"><SectionHeading icon={ClipboardCheck} eyebrow="Citizen intelligence" title="Report Local Subsidence Signs" /><p className="pt-3 text-xs leading-5 text-muted-foreground">Submit visible changes for municipal screening. For immediate danger, contact 911 and leave the area.</p></CardHeader>
              <CardContent className="p-5 pt-0"><form onSubmit={submitReport} className="space-y-5"><div><label className="mb-2 block text-xs font-semibold">Observation Type</label><Select value={observation} onValueChange={setObservation}><SelectTrigger className="h-11 border-border bg-secondary/60"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Foundation Cracks">Foundation Cracks</SelectItem><SelectItem value="Backyard Depressions">Backyard Depressions</SelectItem><SelectItem value="Shifting Sidewalks">Shifting Sidewalks</SelectItem></SelectContent></Select></div><div><label htmlFor={detailsId} className="mb-2 block text-xs font-semibold">What did you notice?</label><textarea id={detailsId} value={details} onChange={(event) => { setDetails(event.target.value.slice(0, 300)); setFormError(""); }} maxLength={300} rows={7} placeholder="Location, size, when first observed, and whether it is changing…" className="w-full resize-none rounded-md border border-input bg-secondary/60 p-3 text-sm text-foreground outline-none transition focus:border-safety focus:ring-1 focus:ring-safety" /><div className="mt-1 flex justify-between font-mono text-[9px]"><span className="text-risk-critical">{formError}</span><span className="text-muted-foreground">{details.length}/300</span></div></div><Button type="submit" className="h-11 w-full bg-safety text-safety-foreground hover:bg-safety/90"><Send /> Submit Report</Button></form>
                <div className="mt-6 border-t border-border pt-5"><p className="font-mono text-[9px] uppercase text-muted-foreground">Routing sequence</p>{["Local municipal review", "District engineering triage", "PA DEP incident screening"].map((step, index) => <div key={step} className="mt-3 flex items-center gap-3 text-xs"><span className="grid size-5 place-items-center rounded-sm border border-border font-mono text-[9px] text-safety">0{index + 1}</span><span className="text-ink-soft">{step}</span></div>)}</div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
            {architecture && <ArchitectureBadge>{"<ActionProtocol />"}</ArchitectureBadge>}
            <CardHeader className="border-b border-border p-5"><SectionHeading icon={Landmark} eyebrow="Government resources" title="Congressional & State Action Protocol" /></CardHeader>
            <CardContent className="grid gap-5 p-5 md:grid-cols-2"><div><p className="font-mono text-[9px] uppercase text-safety">Recommended sequence · {zip}</p><ol className="mt-3 space-y-3">{profile.protocol.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-5 text-ink-soft"><span className="grid size-6 shrink-0 place-items-center rounded-sm bg-safety font-mono text-[10px] font-bold text-safety-foreground">{index + 1}</span>{step}</li>)}</ol></div><div className="space-y-2"><a className="group flex items-center justify-between rounded-md border border-border bg-secondary/50 p-3 text-sm transition hover:border-safety" href="https://www.pa.gov/agencies/dep/programs-and-services/mining/abandoned-mine-reclamation/mine-subsidence-insurance.html" target="_blank" rel="noreferrer"><span><strong className="block">Apply for PA DEP MSI</strong><span className="text-xs text-muted-foreground">Online eligibility and application</span></span><ArrowUpRight className="size-4 text-safety" /></a><a className="group flex items-center justify-between rounded-md border border-border bg-secondary/50 p-3 text-sm transition hover:border-safety" href="tel:8883572674"><span><strong className="block">Mine Subsidence Assistance</strong><span className="text-xs text-muted-foreground">Call 1-888-357-2674</span></span><ArrowUpRight className="size-4 text-safety" /></a></div></CardContent>
          </Card>

          <Card className="mine-panel no-print relative rounded-lg border-border">
            {architecture && <ArchitectureBadge>{"<LegislativeFeed />"}</ArchitectureBadge>}
            <CardHeader className="border-b border-border p-5"><SectionHeading icon={Building2} eyebrow="Policy signal" title="PA-08 Legislative Corner" /></CardHeader>
            <CardContent className="p-5"><div className="space-y-5"><div className="relative border-l border-safety pl-4"><span className="absolute -left-1 top-0 size-2 rounded-full bg-safety" /><p className="font-mono text-[9px] uppercase text-muted-foreground">Federal update</p><p className="mt-1 text-sm font-medium">Abandoned Mine Land funding continues remediation support for Pennsylvania communities.</p></div><div className="relative border-l border-border pl-4"><span className="absolute -left-1 top-0 size-2 rounded-full bg-muted-foreground" /><p className="font-mono text-[9px] uppercase text-muted-foreground">District watch</p><p className="mt-1 text-sm font-medium">Local infrastructure monitoring priorities include stormwater and legacy mine mapping.</p></div></div></CardContent>
          </Card>
        </section>

        <footer className="mt-5 grid gap-4 border-t border-border py-5 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs text-muted-foreground">MineWatch is a screening tool, not a geological inspection or coverage determination.</p><p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">Data model snapshot · September 2026 · PA-08 civic pilot</p></div><Button onClick={() => window.print()} className="no-print h-11 bg-safety px-5 text-safety-foreground hover:bg-safety/90"><FileDown /> Export Homeowner Briefing PDF</Button></footer>
        <div className="print-only hidden border-t border-border pt-4 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-risk-low" />Prepared from the MineWatch PA-08 infrastructure screening dashboard.</p></div>
      </div>
    </main>
  );
}