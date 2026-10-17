import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleGauge,
  ClipboardCheck,
  CloudRain,
  FileDown,
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
  Network,
  LoaderCircle,
  Image as ImageIcon,
  X,
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

import { miningFields, type FieldId, type MiningField, type Profile } from "@/lib/mining-fields";

type Workspace = "dashboard" | "reporting" | "legislative";

const reportSchema = z.object({
  type: z.enum(["Foundation Cracks", "Backyard Depressions", "Shifting Sidewalks"]),
  address: z.string().trim().min(5, "Enter a valid street address.").max(100, "Keep the address under 100 characters."),
  details: z.string().trim().min(8, "Add a brief description (at least 8 characters).").max(300, "Keep the description under 300 characters."),
});

type Dispatch = { field: FieldId; id: string; type: string; address: string; details: string; photo?: string | undefined; time: string; status: string };

const sampleDispatches = (field: MiningField): Dispatch[] => field.samples.map((address, index) => ({
  field: field.id, id: `sample-${field.id}-${index}`, address,
  type: index === 0 ? "Foundation Cracks" : "Backyard Depressions",
  details: index === 0 ? "Hairline cracking observed along the front foundation after recent rainfall." : "A shallow depression has developed near the rear property drainage line.",
  time: index === 0 ? "18 minutes ago" : "1 hour ago", status: "Sample · engineering triage",
}));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MineWatch | National AML Infrastructure Hub" },
      { name: "description", content: "Explore three national mining fields, regional mine risk simulations, incident screening, and official reclamation resources." },
      { property: "og:title", content: "MineWatch | National AML Infrastructure Hub" },
      { property: "og:description", content: "National abandoned mine land infrastructure screening across Pennsylvania, West Virginia, and Colorado." },
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
        <circle cx="110" cy="110" r="92" fill="none" stroke={meta.stroke} strokeWidth="13" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-300" />
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

function DistrictSelector({ field, zip, onChange }: { field: MiningField; zip: string; onChange: (zip: string) => void }) {
  return <div className="max-w-2xl"><Label className="mb-2 block text-xs text-ink-soft">{field.id === "pa" ? "Select PA-08 ZIP Code" : `Select ${field.state} Local Area`}</Label><Select value={zip} onValueChange={onChange}><SelectTrigger className="h-12 w-full border-border bg-secondary/60 text-sm"><SelectValue /></SelectTrigger><SelectContent>{field.profiles.map((item) => <SelectItem key={item.zip} value={item.zip}>{field.id === "pa" ? `${item.zip} — ` : ""}{item.place}</SelectItem>)}</SelectContent></Select></div>;
}

function NationalFieldSelector({ field, onChange, architecture }: { field: MiningField; onChange: (field: FieldId) => void; architecture: boolean }) {
  return <section className="relative space-y-3 border-b border-border pb-5">
    {architecture && <ArchitectureBadge>{"<RegionalStateController />"}</ArchitectureBadge>}
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Select Active National Mining Field</h2><Badge variant="outline" className="font-mono text-[9px] text-safety">TIER 01 · NATIONAL SCOPE</Badge></div>
    <div role="group" aria-label="Select Active National Mining Field" className="grid gap-2 md:grid-cols-3">{Object.values(miningFields).map((item) => <Button key={item.id} aria-pressed={field.id === item.id} variant="outline" onClick={() => onChange(item.id)} className={cn("h-auto min-h-16 justify-start whitespace-normal border-border px-4 py-3 text-left", field.id === item.id ? "border-safety bg-safety/10 text-safety" : "bg-secondary/40 text-ink-soft")}><MapPin className="size-4 shrink-0"/><span><span className="block text-xs font-semibold">{item.name}</span><span className="mt-1 block font-mono text-[9px]">{item.region}</span></span></Button>)}</div>
    <div className="flex items-start gap-3 border-l-2 border-safety bg-secondary/40 p-4"><Landmark className="mt-0.5 size-5 shrink-0 text-safety"/><div><h3 className="text-xs font-semibold text-safety">Federal AML Funding</h3><p className="mt-1 text-sm leading-6 text-ink-soft">{field.funding}</p><p className="mt-1 text-[10px] text-muted-foreground">Pilot allocation scenario · not a live award or eligibility determination</p></div></div>
  </section>;
}

function DistrictDashboardView({ field, setField, refresh, profile, zip, setZip, rainfall, setRainfall, displayScore, architecture }: { field: MiningField; setField: (field: FieldId) => void; refresh: number; profile: Profile; zip: string; setZip: (zip: string) => void; rainfall: boolean; setRainfall: (value: boolean) => void; displayScore: number; architecture: boolean }) {
  const meta = riskMeta(displayScore);
  return (
    <div className="view-enter space-y-5">
      <NationalFieldSelector field={field} onChange={setField} architecture={architecture} />
      <section className="mine-panel relative rounded-lg border border-border p-4 sm:p-5">
        {architecture && <ArchitectureBadge>{"<DistrictSelector />"}</ArchitectureBadge>}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><DistrictSelector field={field} zip={zip} onChange={setZip} /><div className="flex items-center gap-2 text-xs text-muted-foreground"><Radio className="signal-pulse size-3 text-risk-low" /><span>Regional pilot sensor model</span></div></div>
      </section>
      <section className="flex items-center justify-between border-y border-border py-3">
        <div className="flex min-w-0 items-center gap-2"><MapPin className="size-4 shrink-0 text-safety" /><p className="truncate text-sm font-semibold">{profile.place}, {field.state} <span className="font-normal text-muted-foreground">· {field.id === "pa" ? `ZIP ${zip}` : field.district}</span></p></div>
        <Badge variant="outline" className={cn("shrink-0", meta.badge)}>{meta.label.toUpperCase()}</Badge>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
          {architecture && <ArchitectureBadge>{"<RiskDial />"}</ArchitectureBadge>}
          <CardHeader className="p-5 pb-0"><SectionHeading icon={CircleGauge} eyebrow="Live assessment" title="Subsidence Risk Level Score" /></CardHeader>
          <CardContent className="p-5"><div key={refresh} className={refresh > 0 ? "telemetry-refresh" : ""}><RiskDial score={displayScore} /></div>{rainfall && <div role="alert" className="view-enter mt-4 flex gap-3 rounded-md border border-risk-critical/60 bg-risk-critical/10 p-4 text-sm leading-6 text-risk-critical"><AlertTriangle className="mt-1 size-5 shrink-0" /><p><strong>ALERT:</strong> Elevated moisture levels detected in the {profile.vein} layer. Structural risk augmented.</p></div>}<div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-3 border-t border-border pt-4"><p className="text-center text-xs text-muted-foreground">Primary concern: <strong className="text-foreground">{profile.worst}</strong></p></div></CardContent>
        </Card>
        <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
          {architecture && <ArchitectureBadge>{"<TrendChart />"}</ArchitectureBadge>}
          <CardHeader className="border-b border-border p-5"><SectionHeading icon={Layers3} eyebrow="Instrument history" title="Ground Movement Analysis" detail={`Monthly pilot readings across ${field.state} monitoring sites`} /></CardHeader>
          <CardContent className="p-5"><TrendChart values={profile.trend.map((value) => rainfall ? value + profile.rainImpact / 20 : value)} /></CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard architecture={architecture} icon={Layers3} label="Historical mining depth" value={profile.depth === null ? "Unmapped Vertical Shafts" : `${profile.depth} feet`} detail={profile.vein} accent={profile.worst.includes("Depth")} />
        <MetricCard architecture={architecture} icon={CircleGauge} label="Soil stability rating" value={profile.soil} detail="Ground movement index" accent={profile.soil === "Shifting"} />
        <MetricCard architecture={architecture} icon={ShieldCheck} label="State insurance eligibility" value={profile.insurance} detail={field.id === "pa" ? "PA MSI · coverage subject to review" : `${field.agency} · mitigation review, not insurance`} accent />
      </section>
      <Card className="mine-panel print-break-avoid relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<SimulationControl />"}</ArchitectureBadge>}
        <CardContent className="p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-secondary text-safety"><CloudRain className="size-4" /></div><div className="min-w-0"><p className="text-sm font-semibold">Simulate Heavy Groundwater Impact</p><p className="text-xs text-muted-foreground">Depth model projects +{profile.rainImpact} risk points for {profile.place}</p></div></div><Switch aria-label="Simulate Heavy Groundwater Impact" checked={rainfall} onCheckedChange={setRainfall} /></div>
        {rainfall && <div className="mt-4 flex gap-3 rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-3 text-xs text-risk-moderate animate-in fade-in"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><p><strong>+{profile.rainImpact} depth-weighted risk points:</strong> Saturation can shift loose soil into abandoned {field.geology} mine voids. {profile.zip === "fairmont" ? "Steep mountain slopes and shallow voids amplify displacement." : "Water saturation can weaken void walls and amplify surface settlement."}</p></div>}</CardContent>
      </Card>
      <div className="flex justify-end border-t border-border pt-5"><Button onClick={() => window.print()} className="no-print h-11 bg-safety px-5 text-safety-foreground hover:bg-safety/90"><FileDown /> Export Homeowner Briefing PDF</Button></div>
    </div>
  );
}

function ReportingView({ field, zip, architecture, dispatches, onDispatch }: { field: MiningField; zip: string; architecture: boolean; dispatches: Dispatch[]; onDispatch: (dispatch: Dispatch) => void }) {
  const [observation, setObservation] = useState("Foundation Cracks");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const addressId = useId(), detailsId = useId(), photoId = useId();
  const [submitting, setSubmitting] = useState(false);
  const reportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (reportTimer.current) clearTimeout(reportTimer.current); }, []);
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) { toast.error("Unsupported Photo Format", { description: "Attach .jpg, .jpeg, or .png images only." }); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo Exceeds 5MB", { description: "Compress the structural photo and try again." }); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(typeof reader.result === "string" ? reader.result : null); setPhotoName(file.name); };
    reader.readAsDataURL(file);
  };
  const submitReport = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = reportSchema.safeParse({ type: observation, address, details });
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; }
    if (submitting) return;
    setSubmitting(true);
    reportTimer.current = setTimeout(() => {
    const id = `MW-${zip}-${Date.now()}`;
    onDispatch({ field: field.id, id, type: parsed.data.type, address: parsed.data.address, details: parsed.data.details, photo: photo ?? undefined, time: "Just now", status: "Municipal review" });
    setErrors({}); setObservation(""); setAddress(""); setDetails(""); setPhoto(null); setPhotoName("");
    setSubmitting(false);
    toast.success("Report Successfully Synced to State AML Database", { description: `${field.agency} pilot intake · simulated transmission only.` });
    }, 700);
  };
  return (
    <div className="view-enter mx-auto grid max-w-4xl gap-5">
      <Card className="mine-panel relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<FormController />"}</ArchitectureBadge>}
        <CardHeader className="border-b border-border p-5 sm:p-6"><SectionHeading icon={ClipboardCheck} eyebrow={`${field.id.toUpperCase()} Incident Screening Portal`} title="Report Local Subsidence Signs" detail="Submit visible changes for municipal screening. For immediate danger, call 911 and leave the area." /></CardHeader>
        <CardContent className="p-5 sm:p-6"><form onSubmit={submitReport} className="space-y-5" noValidate>
          <div><Label className="mb-2 block" htmlFor="observation-type">Observation Type</Label><Select value={observation} onValueChange={setObservation}><SelectTrigger id="observation-type" className="h-11 border-border bg-secondary/60"><SelectValue placeholder="Select observation type" /></SelectTrigger><SelectContent><SelectItem value="Foundation Cracks">Foundation Cracks</SelectItem><SelectItem value="Backyard Depressions">Backyard Depressions</SelectItem><SelectItem value="Shifting Sidewalks">Shifting Sidewalks</SelectItem></SelectContent></Select></div>
          <div><Label className="mb-2 block" htmlFor={addressId}>Street Address</Label><Input id={addressId} value={address} onChange={(event) => { setAddress(event.target.value); setErrors((current) => ({ ...current, address: "" })); }} placeholder="Street number and name" className="h-11 border-border bg-secondary/60" aria-invalid={Boolean(errors["address"])} /><p className="mt-1 text-xs text-risk-critical">{errors["address"]}</p></div>
          <div><div className="mb-2 flex justify-between"><Label htmlFor={detailsId}>Description</Label><span className="font-mono text-[9px] text-muted-foreground">{details.length}/300</span></div><Textarea id={detailsId} value={details} onChange={(event) => { setDetails(event.target.value.slice(0, 300)); setErrors((current) => ({ ...current, details: "" })); }} maxLength={300} rows={7} placeholder="Describe the size, location, when you first noticed it, and whether it is changing…" className="resize-none border-border bg-secondary/60" aria-invalid={Boolean(errors["details"])} /><p className="mt-1 text-xs text-risk-critical">{errors["details"]}</p></div>
          <div><Label className="mb-2 block" htmlFor={photoId}>Upload Structural Photo (Max 5MB)</Label>
          <label htmlFor={photoId} className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-border bg-secondary/40 p-4 transition-colors hover:border-safety/70">
            {photo ? (
              <>
                <img src={photo} alt="Selected structural photo preview" className="size-14 shrink-0 rounded-md border border-border object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{photoName}</p><p className="text-[10px] text-muted-foreground">Attached · .jpg/.jpeg/.png · stays on this device</p></div>
                <Button type="button" variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label="Remove photo" onClick={(event) => { event.preventDefault(); setPhoto(null); setPhotoName(""); }}><X /></Button>
              </>
            ) : (
              <>
                <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-background/60"><ImageIcon className="size-4 text-safety" /></span>
                <div className="min-w-0"><p className="text-xs font-medium">Attach a structural photo for engineering review</p><p className="text-[10px] text-muted-foreground">Accepted: .jpg · .jpeg · .png · max 5MB · never uploaded</p></div>
              </>
            )}
          </label>
          <input id={photoId} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handlePhotoChange} className="sr-only" />
        </div>
          <p className="text-xs text-muted-foreground">Simulated incident screening · no report is sent to a government agency.</p><p role="alert" className="text-xs text-risk-critical">{errors["type"]}</p><Button type="submit" disabled={submitting} className="h-11 w-full bg-safety text-safety-foreground hover:bg-safety/90">{submitting ? <LoaderCircle className="animate-spin"/> : <Send/>}{submitting ? "Transmitting Report…" : "Submit Report"}</Button>
        </form><div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">{["Local municipal review", "District engineering triage", `${field.agency} incident screening`].map((step, index) => <div key={step} className="flex items-center gap-2 text-xs"><span className="grid size-6 shrink-0 place-items-center rounded-sm border border-border font-mono text-[9px] text-safety">0{index + 1}</span><span className="text-ink-soft">{step}</span></div>)}</div></CardContent>
      </Card>
      <Card className="mine-panel relative rounded-lg border-border">
        {architecture && <ArchitectureBadge>{"<DispatchLog />"}</ArchitectureBadge>}
        <CardHeader className="border-b border-border p-5"><SectionHeading icon={History} eyebrow="Neighborhood signal" title="Recent Regional Dispatches" detail={`${field.state} · session reports and two sample dispatches`} /></CardHeader>
        <CardContent className="p-5"><div aria-live="polite" aria-relevant="additions" className="grid gap-5 md:grid-cols-2">{dispatches.map((item, index) => <article key={item.id} className="view-enter border-l border-safety pl-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{item.type}</p><span className="font-mono text-[9px] text-muted-foreground">#{index + 1}</span></div><p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="size-3 text-safety" />{item.address}</p><div className="mt-2 flex items-start gap-3"><p className="text-sm leading-6 text-ink-soft">{item.details}</p>{item.photo ? <img src={item.photo} alt={`Structural photo for ${item.address}`} className="size-16 shrink-0 rounded-md border border-border object-cover" /> : <span className="grid size-16 shrink-0 place-items-center rounded-md border border-dashed border-border bg-secondary/50 px-1 text-center font-mono text-[8px] uppercase leading-tight text-muted-foreground">No Media Attached</span>}</div><div className="mt-3 flex items-center justify-between gap-3"><Badge variant="outline" className="border-border bg-secondary text-[9px] text-ink-soft">{item.status}</Badge><span className="text-[10px] text-muted-foreground">{item.time}</span></div></article>)}</div><div className="mt-6 flex items-center gap-2 border-t border-border pt-4 font-mono text-[9px] uppercase text-muted-foreground"><Radio className="signal-pulse size-3 text-risk-low" />{field.district} pilot intake active</div></CardContent>
      </Card>
    </div>
  );
}

function LegislativeView({ field, profile, architecture, score }: { field: MiningField; profile: Profile; architecture: boolean; score: number }) {
  return <div className="view-enter grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
    <Card className="mine-panel relative rounded-lg border-border">
      {architecture && <ArchitectureBadge>{"<LegislativeFeed />"}</ArchitectureBadge>}
      <CardHeader className="border-b border-border p-5"><SectionHeading icon={Building2} eyebrow={`Policy signal · ${field.district}`} title="Legislative Corner" detail={`${field.state} reclamation context · official federal resources`} /></CardHeader>
      <CardContent className="space-y-6 p-5">{[
        { title: "Bipartisan Infrastructure Law · AML reclamation", text: `Federal reclamation grants support eligible abandoned coal mine hazards. ${field.state} priorities in this pilot focus on ${field.id === "pa" ? "anthracite subsidence and legacy mine mapping" : field.id === "wv" ? "acid mine drainage and mountain slope stabilization" : "hardrock shaft closure; coal AML and hardrock programs have different eligibility rules"}.`, url: "https://www.osmre.gov/bil" },
        { title: "Department of the Interior · community protection", text: "Follow federal reclamation announcements and state-administered project funding. Regional pilot allocations are not live grant announcements.", url: "https://www.doi.gov/pressreleases" },
        { title: "Bureau of Land Management · abandoned mine lands", text: field.id === "co" ? "Western public-land mine hazards require coordinated access, shaft inventory, and reclamation planning." : "BLM national mine-land restoration provides a federal comparison; local coal AML contacts remain with the state agency.", url: "https://www.blm.gov/programs/aml-environmental-cleanup" },
      ].map((item) => <article key={item.title} className="border-l border-safety pl-4"><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{item.text}</p><a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-safety">Official updates <ArrowUpRight className="size-3"/></a></article>)}</CardContent>
    </Card>
    <Card className="mine-panel relative rounded-lg border-border">
      {architecture && <ArchitectureBadge>{"<ActionProtocol />"}</ArchitectureBadge>}
      <CardHeader className="border-b border-border p-5"><SectionHeading icon={Landmark} eyebrow={`Government resources · ${field.district}`} title="Regional Action Protocol" detail={`${profile.place} · ${riskMeta(score).label} modeled risk`} /></CardHeader>
      <CardContent className="space-y-5 p-5"><div className="flex items-center gap-2"><Badge variant="outline" className={riskMeta(score).badge}>{riskMeta(score).label} priority</Badge><span className="text-xs text-muted-foreground">{score}/100{score !== profile.score ? " · groundwater scenario" : " · baseline"}</span></div><ol className="space-y-4">{(score > 70 && profile.score <= 70 ? ["Groundwater scenario elevates modeled risk: avoid unstable areas and seek professional review.", ...profile.protocol] : profile.protocol).map((step,index) => <li key={step} className="flex gap-3 text-sm leading-6 text-ink-soft"><span className="grid size-7 shrink-0 place-items-center rounded-sm bg-safety font-mono text-[10px] text-safety-foreground">{index+1}</span><span>{step}</span></li>)}</ol>
      <div className="border-t border-border pt-4"><h3 className="text-sm font-semibold">{field.id === "pa" ? "PA Mine Subsidence Insurance" : "State hazard mitigation review"}</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{field.program}</p></div>
      <Button asChild variant="outline" className="h-auto w-full justify-between whitespace-normal py-3 text-left"><a href={field.resourceUrl} target="_blank" rel="noreferrer">{field.resourceTitle}<ArrowUpRight className="size-4 shrink-0 text-safety"/></a></Button>
      <Button asChild variant="outline" className="h-auto w-full justify-start whitespace-normal border-safety/50 py-3 text-left text-safety"><a href={`tel:${field.telephone}`}><Phone className="size-4 shrink-0"/>{field.hotline}</a></Button>
      {field.protectionUrl && <Button asChild variant="outline" className="h-auto w-full justify-between whitespace-normal py-3 text-left"><a href={field.protectionUrl} target="_blank" rel="noreferrer">{field.id === "wv" ? "WV BRIM Mine Subsidence Insurance" : "CO Mine Subsidence Protection · coal eligibility"}<ArrowUpRight className="size-4 shrink-0 text-safety"/></a></Button>}
      {field.id === "pa" && <a href="tel:8883572674" className="block text-xs text-muted-foreground">Mine Subsidence Assistance · 1-888-357-2674</a>}
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-4 shrink-0 text-risk-low"/>Official {field.state} resource links · agency determines eligibility</p></CardContent>
    </Card>
  </div>;
}

function MineWatchDashboard() {
  const [fieldId, setFieldId] = useState<FieldId>("pa");
  const [zip, setZip] = useState("18503");
  const [rainfall, setRainfall] = useState(false);
  const [architecture, setArchitecture] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>("dashboard");
  const [syncing, setSyncing] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const field = miningFields[fieldId];
  const profile = field.profiles.find((item) => item.zip === zip) ?? field.profiles[0];
  const targetScore = Math.min((profile?.score ?? 0) + (rainfall ? profile?.rainImpact ?? 0 : 0), 100);
  const [displayScore, setDisplayScore] = useState(58);
  const scoreRef = useRef(58);
  useEffect(() => () => { if (syncTimer.current) clearTimeout(syncTimer.current); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("accessibility-light", lightMode);
    return () => document.documentElement.classList.remove("accessibility-light");
  }, [lightMode]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { scoreRef.current = targetScore; setDisplayScore(targetScore); return; }
    const start = scoreRef.current;
    const started = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 450, 1);
      const value = Math.round(start + (targetScore - start) * (1 - Math.pow(1 - progress, 3)));
      scoreRef.current = value; setDisplayScore(value);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetScore]);
  if (!profile) return null;
  const changeField = (id: FieldId) => { setFieldId(id); setZip(miningFields[id].profiles[0]?.zip ?? ""); setRainfall(false); };
  const syncFeed = () => {
    if (syncing) return;
    setSyncing(true);
    syncTimer.current = setTimeout(() => {
      setSyncing(false); setRefresh((value) => value + 1);
      toast.success("✓ Unified USGS Geodatabase Sync Complete. 48 Active Regional Sensors Online.", { description: "Simulated federal GIS refresh · no live USGS connection." });
    }, 1200);
  };
  const regionDispatches = [...dispatches.filter((item) => item.field === fieldId), ...sampleDispatches(field)];
  const analytics = <DistrictDashboardView field={field} setField={changeField} refresh={refresh} profile={profile} zip={zip} setZip={(value) => { setZip(value); setRainfall(false); }} rainfall={rainfall} setRainfall={setRainfall} displayScore={displayScore} architecture={architecture} />;
  return <main className="min-h-screen text-foreground">
    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-8">
      <div className="print-only hidden border-b border-border pb-4"><h1 className="text-2xl font-bold">MineWatch · Homeowner Briefing</h1><p className="text-xs text-muted-foreground">{field.district} · {profile.place} · modeled score {targetScore}/100</p></div>
      <header className="no-print mine-panel relative rounded-lg border border-border">
        {architecture && <ArchitectureBadge>{"<StateProvider />"}</ArchitectureBadge>}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3"><img src="/favicon.svg" alt="" className="size-12 shrink-0"/><div className="min-w-0"><h1 className="text-2xl font-bold">Mine<span className="text-safety">Watch</span></h1><p className="text-[11px] font-medium text-ink-soft">{field.district} District Infrastructure Pilot</p><p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">National Infrastructure Pilot</p></div></div>
          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
            <Button variant="outline" disabled={syncing} onClick={syncFeed} title="Simulated federal telemetry refresh" className="h-auto min-h-10 max-w-full whitespace-normal border-safety/40 py-2 text-xs text-safety">{syncing ? <LoaderCircle className="size-4 shrink-0 animate-spin"/> : <Network className="size-4 shrink-0"/>}{syncing ? "Streaming Federal GIS Arrays..." : "Sync USGS Satellite Feed"}</Button>
            <div className="flex items-center gap-2"><Label htmlFor="developer-view" className="text-[10px] text-muted-foreground">Developer Architecture View</Label><Switch id="developer-view" aria-label="Developer Architecture View" checked={architecture} onCheckedChange={setArchitecture}/></div>
            <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={() => setLightMode((value) => !value)} aria-label="Light/Accessibility Mode" aria-pressed={lightMode} title={lightMode ? "Switch to dark mode" : "Light/Accessibility Mode"}>{lightMode ? <Moon className="size-4"/> : <Sun className="size-4"/>}</Button>
          </div>
        </div>
        <Tabs value={workspace} onValueChange={(value) => setWorkspace(value as Workspace)}><TabsList aria-label={`MineWatch ${field.district} sections`} className="grid h-auto w-full grid-cols-3 rounded-none border-t border-border bg-secondary/30 p-1.5 sm:flex sm:justify-start sm:px-4">
          <TabsTrigger value="dashboard" className="min-h-11 whitespace-normal rounded-md px-2 text-xs data-[state=active]:bg-safety data-[state=active]:text-safety-foreground sm:px-4 sm:text-sm"><CircleGauge className="hidden size-4 sm:block"/>District Dashboard</TabsTrigger>
          <TabsTrigger value="reporting" className="min-h-11 whitespace-normal rounded-md px-2 text-xs data-[state=active]:bg-safety data-[state=active]:text-safety-foreground sm:px-4 sm:text-sm"><ClipboardCheck className="hidden size-4 sm:block"/>Report an Incident</TabsTrigger>
          <TabsTrigger value="legislative" className="min-h-11 whitespace-normal rounded-md px-2 text-xs data-[state=active]:bg-safety data-[state=active]:text-safety-foreground sm:px-4 sm:text-sm"><Landmark className="hidden size-4 sm:block"/>Legislative Tracker</TabsTrigger>
        </TabsList></Tabs>
      </header>
      <Tabs value={workspace} onValueChange={(value) => setWorkspace(value as Workspace)} className="no-print mt-5">
        <TabsContent value="dashboard" className="mt-0">{analytics}</TabsContent>
        <TabsContent value="reporting" className="mt-0"><ReportingView field={field} zip={zip} architecture={architecture} dispatches={regionDispatches} onDispatch={(dispatch) => setDispatches((current) => [dispatch, ...current])}/></TabsContent>
        <TabsContent value="legislative" className="mt-0"><LegislativeView field={field} profile={profile} architecture={architecture} score={targetScore}/></TabsContent>
      </Tabs>
      <div className="print-only hidden mt-5">{analytics}</div>
      <footer className="mt-auto pt-6">
        <div className="grid gap-5 border-y border-border py-5 md:grid-cols-3">{[
          ["National Unreclaimed Sites", "50,000+", "High-Priority Voids Tracked"],
          ["Federal BIL Funding Pool", "$11.3 Billion", "Total National Allocation"],
          ["Active Community Protection Engine", "3", "Independent Geologies Scaled"],
        ].map(([label,value,detail]) => <div key={label}><p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold text-safety">{value}</p><p className="mt-1 text-xs text-ink-soft">{detail}</p></div>)}</div>
        <div className="grid gap-3 py-5 md:grid-cols-[1fr_auto]"><div><p className="text-xs text-muted-foreground">MineWatch is a screening tool, not a geological inspection or coverage determination.</p><p className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">Data model snapshot · October 2026 · national pilot · simulated telemetry, reports, and regional allocations</p></div><p className="text-xs text-muted-foreground">Regional context: {field.district} · {profile.place}</p></div>
      </footer>
    </div>
  </main>;
}
