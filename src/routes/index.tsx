import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
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
  FileDown,
  HardHat,
  History,
  Landmark,
  Layers3,
  MapPin,
  Moon,
  Phone,
  Sun,
  Radio,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ZipCode = "18503" | "18702" | "18706";
type Workspace = "dashboard" | "reporting" | "legislative";

type Profile = {
  zip: ZipCode;
  place: string;
  score: number;
  rainImpact: number;
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
    zip: "18503", place: "Scranton Downtown", score: 58, rainImpact: 9, depth: 210,
    depthNote: "Mapped abandoned workings", vein: "Dunmore Vein #3", soil: "Active Monitoring",
    insurance: "Recommended", worst: "Mining Depth",
    trend: [1.6, 2.1, 2.6, 2.2, 1.8, 2.3, 2.9, 2.5, 2.1, 2.6, 3.2, 2.7],
    protocol: ["Request the Lackawanna County mine map review before renovations.", "Apply for MSI coverage while the property remains free of active subsidence damage."],
  },
  "18702": {
    zip: "18702", place: "Wilkes-Barre Center", score: 82, rainImpact: 16, depth: 95,
    depthNote: "Very shallow historical workings", vein: "Baltimore Vein", soil: "Shifting",
    insurance: "Critical Priority", worst: "Soil stability + shallow depth",
    trend: [2.1, 5.8, 2.7, 6.2, 3.1, 5.6, 2.4, 6.0, 3.3, 6.1, 2.9, 6.2],
    protocol: ["Document cracks and depressions now; avoid altering the affected area.", "Contact the MSI office for priority eligibility review and submit an online application."],
  },
  "18706": {
    zip: "18706", place: "Hanover Township", score: 34, rainImpact: 2, depth: 480,
    depthNote: "Deep, stable rock layers", vein: "Deep Anthracite Workings", soil: "Stable",
    insurance: "Optional / Peace of Mind", worst: "All metrics performing well",
    trend: [0.9, 1, 0.8, 1.1, 1, 1.2, 1.1, 1, 1.2, 1.3, 1.2, 1.1],
    protocol: ["Retain this baseline assessment with your property records.", "Review optional MSI coverage for long-term protection and transferability."],
  },
};

const reportSchema = z.object({
  type: z.enum(["Foundation Cracks", "Backyard Depressions", "Shifting Sidewalks"]),
  address: z.string().trim().min(5, "Enter a valid street address.").max(100, "Keep the address under 100 characters."),
  details: z.string().trim().min(8, "Add a brief description (at least 8 characters).").max(300, "Keep the description under 300 characters."),
});

type Dispatch = { id: string; type: string; address: string; details: string; time: string; status: string };

const initialDispatches: Dispatch[] = [
  { id: "sample-scranton", details: "Hairline cracking observed along the front foundation after recent rainfall.", type: "Foundation cracks", address: "600 block of N Washington Ave", time: "18 minutes ago", status: "Municipal review" },
  { id: "sample-wilkes-barre", details: "A shallow depression has developed near the rear property drainage line.", type: "Backyard depression", address: "200 block of Carey Ave", time: "1 hour ago", status: "Engineering triage" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MineWatch | PA-08 Civic Infrastructure Console" },
      { name: "description", content: "Analyze mine subsidence risk, report local warning signs, and access Pennsylvania infrastructure resources for PA-08." },
      { property: "og:title", content: "MineWatch | PA-08 Civic Infrastructure Console" },
      { property: "og:description", content: "A community console for abandoned mine subsidence risk, reporting, and policy resources in PA-08." },
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

function SectionHeading({ icon: Icon, eyebrow, title, detail }: { icon: typeof Layers3; eyebrow: string; title: string; detail?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-secondary text-safety"><Icon className="size-4" /></div>
      <div className="min-w-0"><p className="font-mono text-[9px] uppercase text-muted-foreground">{eyebrow}</p><h2 className="text-sm font-semibold text-foreground">{title}</h2>{detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, accent, architecture }: { icon: typeof Layers3; label: string; value: string; detail: string; accent?: boolean; architecture: boolean }) {
  return (
    <Card className="mine-panel print-break-avoid relative overflow-visible rounded-lg border-border">
      {architecture && <ArchitectureBadge>{"<CardComponent />"}</ArchitectureBadge>}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary text-muted-foreground", accent && "border-safety/50 bg-safety/10 text-safety")}><Icon className="size-4" /></div>
          <span className="font-mono text-[9px] uppercase text-muted-foreground">Verified layer</span>
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
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
    <div className="relative mx-auto aspect-square w-full max-w-[290px]">
      <svg viewBox="0 0 220 220" className="size-full -rotate-90" role="img" aria-label={`Subsidence risk score ${score} out of 100, ${meta.label}`}>
        <circle cx="110" cy="110" r="92" fill="none" stroke="var(--border)" strokeWidth="13" />
        <circle cx="110" cy="110" r="92" fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="2 7" />
        <circle key={score} cx="110" cy="110" r="92" fill="none" stroke={meta.stroke} strokeWidth="13" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="dial-animate transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><p className="font-mono text-[9px] uppercase text-muted-foreground">Risk index</p><p className={cn("text-6xl font-semibold", meta.color)}>{score}</p><p className="text-xs text-muted-foreground">out of 100</p><Badge variant="outline" className={cn("mt-3", meta.badge)}>{meta.label} risk</Badge></div></div>
    </div>
  );
}

function TrendChart({ values }: { values: number[] }) {
  const [animatedValues, setAnimatedValues] = useState(values);
  const currentValues = useRef(values);
  const signature = values.join(",");
  useEffect(() => {
    const next = signature.split(",").map(Number);
    const start = currentValues.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentValues.current = next;
      setAnimatedValues(next);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 650, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const updated = next.map((value, index) => (start[index] ?? value) + (value - (start[index] ?? value)) * eased);
      currentValues.current = updated;
      setAnimatedValues(updated);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [signature]);
  const width = 520, height = 150, max = 7;
  const points = animatedValues.map((value, index) => `${(index / 11) * width},${height - (value / max) * height}`).join(" ");
  return (
    <div className="mt-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0"><p className="text-sm font-semibold text-foreground">Geological Micro-shifts Detected</p><p className="font-mono text-[9px] uppercase text-muted-foreground">Millimeters · trailing 12 months</p></div><p className="font-mono text-lg text-safety">{animatedValues.at(-1)?.toFixed(1)} mm</p></div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-5 h-40 w-full overflow-visible" aria-label="Twelve month geological micro-shift trend">
        {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={line * 50} y2={line * 50} stroke="var(--border)" strokeWidth="1" />)}
        <polyline points={points} fill="none" stroke="var(--safety)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {animatedValues.map((value, index) => <circle key={index} cx={(index / 11) * width} cy={height - (value / max) * height} r="3.5" fill="var(--background)" stroke="var(--safety)" strokeWidth="2" />)}
      </svg>
      <div className="flex justify-between font-mono text-[8px] uppercase text-muted-foreground"><span>Oct 25</span><span>Jan 26</span><span>Apr 26</span><span>Sep 26</span></div>
    </div>
  );
}

function DistrictSelector({ zip, onChange }: { zip: ZipCode; onChange: (zip: ZipCode) => void }) {
  return <div className="max-w-2xl"><Label className="mb-2 block text-xs text-ink-soft">Select PA-08 Zip Code to Check Subsidence Risk</Label><Select value={zip} onValueChange={(value) => onChange(value as ZipCode)}><SelectTrigger className="h-12 border-border bg-secondary/60 text-base"><SelectValue /></SelectTrigger><SelectContent>{Object.values(profiles).map((item) => <SelectItem key={item.zip} value={item.zip}>{item.zip} — {item.place}</SelectItem>)}</SelectContent></Select></div>;
}

function DistrictDashboardView({ profile, zip, setZip, rainfall, setRainfall, displayScore, architecture }: { profile: Profile; zip: ZipCode; setZip: (zip: ZipCode) => void; rainfall: boolean; setRainfall: (value: boolean) => void; displayScore: number; architecture: boolean }) {
  const meta = riskMeta(displayScore);
  return (
    <div className="view-enter space-y-5">
      <section className="mine-panel relative rounded-lg border border-border p-4 sm:p-5">
        {architecture && <ArchitectureBadge>{"<DistrictSelector />"}</ArchitectureBadge>}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><DistrictSelector zip={zip} onChange={setZip} /><div className="flex items-center gap-2 text-xs text-muted-foreground"><Radio className="signal-pulse size-3 text-risk-low" /><span>District sensor network online</span></div></div>
      </section>
      <PropertyVerification zip={zip} architecture={architecture} />
      <section className="flex items-center justify-between border-y border-border py-3">
        <div className="flex min-w-0 items-center gap-2"><MapPin className="size-4 shrink-0 text-safety" /><p className="truncate text-sm font-semibold">{profile.place}, Pennsylvania <span className="font-normal text-muted-foreground">· ZIP {zip}</span></p></div>
        <Badge variant="outline" className={cn("shrink-0", meta.badge)}>{meta.label.toUpperCase()}</Badge>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
          {architecture && <ArchitectureBadge>{"<RiskDial />"}</ArchitectureBadge>}
          <CardHeader className="p-5 pb-0"><SectionHeading icon={CircleGauge} eyebrow="Live assessment" title="Subsidence Risk Level Score" /></CardHeader>
          <CardContent className="p-5"><RiskDial score={displayScore} />{rainfall && <div role="alert" className="view-enter mt-4 flex gap-3 rounded-md border border-risk-critical/60 bg-risk-critical/10 p-4 text-sm leading-6 text-risk-critical"><AlertTriangle className="mt-1 size-5 shrink-0" /><p><strong>ALERT:</strong> Elevated moisture levels detected in the historical Baltimore Vein layer. Structural risk augmented.</p></div>}<div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-3 border-t border-border pt-4"><p className="text-center text-xs text-muted-foreground">Primary concern: <strong className="text-foreground">{profile.worst}</strong></p></div></CardContent>
        </Card>
        <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
          {architecture && <ArchitectureBadge>{"<TrendChart />"}</ArchitectureBadge>}
          <CardHeader className="border-b border-border p-5"><SectionHeading icon={Layers3} eyebrow="Instrument history" title="Ground Movement Analysis" detail="Monthly readings normalized across PA-08 monitoring stations" /></CardHeader>
          <CardContent className="p-5"><TrendChart values={profile.trend.map((value) => rainfall ? value + profile.rainImpact / 20 : value)} /></CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard architecture={architecture} icon={Layers3} label="Historical mining depth" value={`${profile.depth} feet`} detail={profile.vein} accent={profile.worst.includes("Depth")} />
        <MetricCard architecture={architecture} icon={CircleGauge} label="Soil stability rating" value={profile.soil} detail="Ground movement index" accent={profile.soil === "Shifting"} />
        <MetricCard architecture={architecture} icon={ShieldCheck} label="MSI insurance eligibility" value={profile.insurance} detail="PA DEP program eligible" accent />
      </section>
      <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<SimulationControl />"}</ArchitectureBadge>}
        <CardContent className="p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary text-safety"><CloudRain className="size-4" /></div><div className="min-w-0"><p className="text-sm font-semibold">Simulate Heavy Groundwater Impact</p><p className="text-xs text-muted-foreground">Depth model projects +{profile.rainImpact} risk points for {zip}</p></div></div><Switch aria-label="Simulate Heavy Groundwater Impact" checked={rainfall} onCheckedChange={setRainfall} /></div>
        {rainfall && <div className="mt-4 flex gap-3 rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-3 text-xs text-risk-moderate animate-in fade-in"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><p><strong>+{profile.rainImpact} depth-weighted risk points:</strong> Saturation can shift loose soil into abandoned anthracite mine voids. Shallow workings amplify surface settlement.</p></div>}</CardContent>
      </Card>
      <div className="flex justify-end border-t border-border pt-5"><Button onClick={() => window.print()} className="no-print h-11 bg-safety px-5 text-safety-foreground hover:bg-safety/90"><FileDown /> Export Homeowner Briefing PDF</Button></div>
    </div>
  );
}

function ReportingView({ zip, architecture, dispatches, onDispatch }: { zip: ZipCode; architecture: boolean; dispatches: Dispatch[]; onDispatch: (dispatch: Dispatch) => void }) {
  const [observation, setObservation] = useState("Foundation Cracks");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const addressId = useId(), detailsId = useId();
  const submitReport = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = reportSchema.safeParse({ type: observation, address, details });
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; }
    const id = `MW-${zip}-${Date.now()}`;
    onDispatch({ id, type: parsed.data.type, address: parsed.data.address, details: parsed.data.details, time: "Just now", status: "Municipal review" });
    setErrors({}); setObservation(""); setAddress(""); setDetails("");
    toast.success("Report Synced to PA DEP Database", { description: `Dispatch MW-${zip}-${Date.now().toString().slice(-5)} entered municipal review.` });
  };
  return (
    <div className="view-enter mx-auto grid max-w-4xl gap-5">
      <Card className="mine-panel relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<CitizenReportForm />"}</ArchitectureBadge>}
        <CardHeader className="border-b border-border p-5 sm:p-6"><SectionHeading icon={ClipboardCheck} eyebrow="Citizen intelligence · PA-08" title="Report Local Subsidence Signs" detail="Submit visible changes for municipal screening. For immediate danger, call 911 and leave the area." /></CardHeader>
        <CardContent className="p-5 sm:p-6"><form onSubmit={submitReport} className="space-y-5" noValidate>
          <div><Label className="mb-2 block" htmlFor="observation-type">Observation Type</Label><Select value={observation} onValueChange={setObservation}><SelectTrigger id="observation-type" className="h-11 border-border bg-secondary/60"><SelectValue placeholder="Select observation type" /></SelectTrigger><SelectContent><SelectItem value="Foundation Cracks">Foundation Cracks</SelectItem><SelectItem value="Backyard Depressions">Backyard Depressions</SelectItem><SelectItem value="Shifting Sidewalks">Shifting Sidewalks</SelectItem></SelectContent></Select></div>
          <div><Label className="mb-2 block" htmlFor={addressId}>Street Address</Label><Input id={addressId} value={address} onChange={(event) => { setAddress(event.target.value); setErrors((current) => ({ ...current, address: "" })); }} placeholder="Street number and name" className="h-11 border-border bg-secondary/60" aria-invalid={Boolean(errors["address"])} /><p className="mt-1 text-xs text-risk-critical">{errors["address"]}</p></div>
          <div><div className="mb-2 flex justify-between"><Label htmlFor={detailsId}>Description</Label><span className="font-mono text-[9px] text-muted-foreground">{details.length}/300</span></div><Textarea id={detailsId} value={details} onChange={(event) => { setDetails(event.target.value.slice(0, 300)); setErrors((current) => ({ ...current, details: "" })); }} maxLength={300} rows={7} placeholder="Describe the size, location, when you first noticed it, and whether it is changing…" className="resize-none border-border bg-secondary/60" aria-invalid={Boolean(errors["details"])} /><p className="mt-1 text-xs text-risk-critical">{errors["details"]}</p></div>
          <Button type="submit" className="h-11 w-full bg-safety text-safety-foreground hover:bg-safety/90"><Send /> Submit Report</Button>
        </form><div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">{["Local municipal review", "District engineering triage", "PA DEP incident screening"].map((step, index) => <div key={step} className="flex items-center gap-2 text-xs"><span className="grid size-6 shrink-0 place-items-center rounded-sm border border-border font-mono text-[9px] text-safety">0{index + 1}</span><span className="text-ink-soft">{step}</span></div>)}</div></CardContent>
      </Card>
      <Card className="mine-panel relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<DispatchLog />"}</ArchitectureBadge>}
        <CardHeader className="border-b border-border p-5"><SectionHeading icon={History} eyebrow="Neighborhood signal" title="Recent District Dispatches" detail="Local session reports · two sample dispatches" /></CardHeader>
        <CardContent className="p-5"><div aria-live="polite" aria-relevant="additions" className="space-y-4">{dispatches.map((item, index) => <article key={item.id} className="view-enter border-l border-safety pl-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{item.type}</p><span className="font-mono text-[9px] text-muted-foreground">#{index + 1}</span></div><p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="size-3 text-safety" />{item.address}</p><p className="mt-2 text-sm leading-6 text-ink-soft">{item.details}</p><div className="mt-3 flex items-center justify-between gap-3"><Badge variant="outline" className="border-border bg-secondary text-[9px] text-ink-soft">{item.status}</Badge><span className="text-[10px] text-muted-foreground">{item.time}</span></div></article>)}</div><div className="mt-6 flex items-center gap-2 border-t border-border pt-4 font-mono text-[9px] uppercase text-muted-foreground"><Radio className="signal-pulse size-3 text-risk-low" />Live district intake active</div></CardContent>
      </Card>
    </div>
  );
}

function LegislativeView({ profile, architecture }: { profile: Profile; architecture: boolean }) {
  return (
    <div className="view-enter grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <Card className="mine-panel relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<LegislativeFeed />"}</ArchitectureBadge>}
        <CardHeader className="border-b border-border p-5"><SectionHeading icon={Building2} eyebrow="Policy signal" title="Legislative Corner" detail="Federal and district infrastructure activity affecting PA-08" /></CardHeader>
        <CardContent className="p-5"><div className="space-y-6"><div className="relative border-l border-safety pl-5"><span className="absolute -left-1 top-0 size-2 rounded-full bg-safety" /><p className="font-mono text-[9px] uppercase text-safety">Federal update · Active</p><p className="mt-2 text-sm font-semibold">Abandoned Mine Land funding continues remediation support for Pennsylvania communities.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Federal reclamation allocations support mine mapping, emergency response, and restoration of unstable legacy sites.</p></div><div className="relative border-l border-border pl-5"><span className="absolute -left-1 top-0 size-2 rounded-full bg-muted-foreground" /><p className="font-mono text-[9px] uppercase text-muted-foreground">District infrastructure watch</p><p className="mt-2 text-sm font-semibold">PA-08 monitoring priorities include stormwater and legacy mine mapping.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Municipal engineering teams are coordinating surface drainage reviews around known anthracite workings.</p></div></div></CardContent>
      </Card>
      <Card className="mine-panel relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<ActionProtocol />"}</ArchitectureBadge>}
        <CardHeader className="border-b border-border p-5"><SectionHeading icon={Landmark} eyebrow={`Government resources · ZIP ${profile.zip}`} title="Congressional & State Action Protocol" detail={`Tailored guidance for ${profile.place} · ${riskMeta(profile.score).label} baseline risk`} /></CardHeader>
        <CardContent className="grid gap-6 p-5 md:grid-cols-[1fr_0.9fr]"><div><p className="font-mono text-[9px] uppercase text-safety">Recommended sequence</p><ol className="mt-4 space-y-4">{profile.protocol.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-ink-soft"><span className="grid size-7 shrink-0 place-items-center rounded-sm bg-safety font-mono text-[10px] font-bold text-safety-foreground">{index + 1}</span>{step}</li>)}</ol><div className="mt-5 rounded-md border border-border bg-secondary/45 p-4"><p className="text-xs font-semibold text-foreground">About PA DEP Mine Subsidence Insurance</p><p className="mt-2 text-xs leading-5 text-muted-foreground">MSI provides coverage for eligible structures damaged by underground coal or clay mine movement. Apply before damage occurs; eligibility and coverage are determined by PA DEP.</p></div></div><div className="space-y-3"><a className="group flex items-center justify-between rounded-md border border-border bg-secondary/50 p-4 text-sm transition hover:border-safety" href="https://www.pa.gov/agencies/dep/programs-and-services/mining/abandoned-mine-reclamation/mine-subsidence-insurance.html" target="_blank" rel="noreferrer"><span><strong className="block">Apply for PA DEP MSI</strong><span className="mt-1 block text-xs text-muted-foreground">Eligibility, coverage, and online application</span></span><ArrowUpRight className="size-4 shrink-0 text-safety" /></a><a className="group flex items-center justify-between rounded-md border border-border bg-secondary/50 p-4 text-sm transition hover:border-safety" href="tel:8883572674"><span><strong className="block">Mine Subsidence Assistance</strong><span className="mt-1 block text-xs text-muted-foreground">Call 1-888-357-2674</span></span><ArrowUpRight className="size-4 shrink-0 text-safety" /></a><Button asChild variant="outline" className="h-auto w-full justify-start whitespace-normal border-safety/50 py-3 text-left text-safety"><a href="tel:18002887647"><Phone className="size-4 shrink-0" />Call PA DEP MSI Hotline (1-800-288-7647)</a></Button><div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground"><CheckCircle2 className="size-4 text-risk-low" />Official Pennsylvania resources</div></div></CardContent>
      </Card>
    </div>
  );
}

function MineWatchDashboard() {
  const [zip, setZip] = useState<ZipCode>("18503");
  const [rainfall, setRainfall] = useState(false);
  const [architecture, setArchitecture] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [dispatches, setDispatches] = useState<Dispatch[]>(initialDispatches);
  const [workspace, setWorkspace] = useState<Workspace>("dashboard");
  const [displayScore, setDisplayScore] = useState(profiles[zip].score);
  const profile = profiles[zip];
  const targetScore = Math.min(profile.score + (rainfall ? profile.rainImpact : 0), 100);

  useEffect(() => {
    document.documentElement.classList.toggle("accessibility-light", lightMode);
    return () => document.documentElement.classList.remove("accessibility-light");
  }, [lightMode]);

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

  return (
    <main className="min-h-screen text-foreground">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="print-only hidden border-b border-border pb-4"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Mine<span className="text-safety">Watch</span></h1><p className="font-mono text-[9px] uppercase text-muted-foreground">Homeowner Subsidence Risk Briefing · PA-08 · ZIP {zip}</p></div><HardHat className="size-8 text-safety" /></div></div>
        <header className="no-print mine-panel relative rounded-lg border border-border">
          {architecture && <ArchitectureBadge>{"<StateProvider />"}</ArchitectureBadge>}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3"><div className="relative grid size-11 shrink-0 place-items-center rounded-md border border-safety/50 bg-safety/10 text-safety"><HardHat className="size-6" /><ShieldCheck className="absolute -bottom-1 -right-1 size-4 fill-background" /></div><div className="min-w-0"><h1 className="truncate text-2xl font-bold">Mine<span className="text-safety">Watch</span></h1><p className="truncate font-mono text-[9px] uppercase text-muted-foreground">PA-08 District Infrastructure Pilot</p></div></div>
            <div className="flex items-center gap-2"><span className="hidden font-mono text-[9px] uppercase text-muted-foreground sm:block">Developer Architecture View</span><Switch aria-label="Developer Architecture View" checked={architecture} onCheckedChange={setArchitecture} /><Button variant="outline" size="icon" className="ml-1 size-9 shrink-0 border-border" onClick={() => setLightMode((current) => !current)} aria-label="Light/Accessibility Mode" aria-pressed={lightMode} title={lightMode ? "Switch to dark mode" : "Light/Accessibility Mode"}>{lightMode ? <Moon className="size-4" /> : <Sun className="size-4" />}</Button></div>
          </div>
          <Tabs value={workspace} onValueChange={(value) => setWorkspace(value as Workspace)}>
            <TabsList aria-label="MineWatch sections" className="grid h-auto w-full grid-cols-3 rounded-none border-t border-border bg-secondary/30 p-1.5 sm:flex sm:justify-start sm:px-4">
              <TabsTrigger value="dashboard" className="min-h-10 gap-2 rounded-md px-2 text-xs data-[state=active]:bg-safety data-[state=active]:text-safety-foreground sm:px-4 sm:text-sm"><CircleGauge className="hidden size-4 sm:block" />District Dashboard</TabsTrigger>
              <TabsTrigger value="reporting" className="min-h-10 gap-2 rounded-md px-2 text-xs data-[state=active]:bg-safety data-[state=active]:text-safety-foreground sm:px-4 sm:text-sm"><ClipboardCheck className="hidden size-4 sm:block" />Citizen Reporting</TabsTrigger>
              <TabsTrigger value="legislative" className="min-h-10 gap-2 rounded-md px-2 text-xs data-[state=active]:bg-safety data-[state=active]:text-safety-foreground sm:px-4 sm:text-sm"><Landmark className="hidden size-4 sm:block" />Legislative Hub</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <Tabs value={workspace} onValueChange={(value) => setWorkspace(value as Workspace)} className="mt-5">
          <TabsContent value="dashboard" className="mt-0"><DistrictDashboardView profile={profile} zip={zip} setZip={(value) => { setZip(value); setRainfall(false); }} rainfall={rainfall} setRainfall={setRainfall} displayScore={displayScore} architecture={architecture} /></TabsContent>
          <TabsContent value="reporting" className="mt-0"><ReportingView zip={zip} architecture={architecture} dispatches={dispatches} onDispatch={(dispatch) => setDispatches((current) => [dispatch, ...current])} /></TabsContent>
          <TabsContent value="legislative" className="mt-0"><LegislativeView profile={profile} architecture={architecture} /></TabsContent>
        </Tabs>

        <footer className="mt-6 grid gap-3 border-t border-border py-5 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs text-muted-foreground">MineWatch is a screening tool, not a geological inspection or coverage determination.</p><p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">Data model snapshot · September 2026 · PA-08 civic pilot</p></div><div className="flex items-center gap-2 font-mono text-[9px] uppercase text-muted-foreground"><ChevronRight className="size-3 text-safety" />District context: {zip}</div></footer>
        <div className="print-only hidden border-t border-border pt-4 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-risk-low" />Prepared from the MineWatch PA-08 infrastructure screening dashboard.</p></div>
      </div>
    </main>
  );
}
