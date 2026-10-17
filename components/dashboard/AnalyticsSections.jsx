"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import CompactSelect from "@/components/dashboard/CompactSelect";
import { cn } from "@/lib/utils";
import { getVelocitySeries, getVelocitySummary, getPulseSnapshot, getSpotlightDeals } from "@/data/dashboard-velocity-demo";

const money = (n) => new Intl.NumberFormat("en-US", { notation: "compact", style: "currency", currency: "USD", maximumFractionDigits: 1 }).format(n);
const percent = (n) => `${n.toFixed(1)}%`;
function Trend({ value, suffix = "%", reverse = false }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-[10px] text-muted-foreground">No comparison data</span>;
  const good = reverse ? value <= 0 : value >= 0;
  return <span className={cn("text-[10px] font-medium tabular-nums", good ? "text-emerald-500" : "text-rose-500")}>{value >= 0 ? "↗ +" : "↘ "}{value.toFixed(1)}{suffix}</span>;
}
function ExportCSV({ deals }) {
  function save() {
    // TODO(API): backend-generated export via GET /api/deals/export?scope=spotlight.
    const rows = [["ID", "Deal", "Company", "Amount", "Status"], ...deals.map(d => [d.id, d.name, d.company, d.amount, d.status])];
    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const link = document.createElement("a"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.href = url; link.download = "nexora-demo-deals.csv"; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <button type="button" onClick={save} className="nexora-menu-item flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 text-[11px] font-semibold text-foreground hover:bg-muted"><Download className="size-3.5"/> Export CSV</button>;
}
const STAGES = [{key:"qualified",label:"Qualified",color:"#626262"},{key:"proposal",label:"Proposal",color:"#a3a3a3"},{key:"negotiation",label:"Negotiation",color:"#dedede"}];
function Velocity({ range }) {
  const [mode, setMode] = useState("week");
  const [shown, setShown] = useState(["qualified", "proposal", "negotiation"]);
  const bars = useMemo(() => getVelocitySeries(range.end, mode), [range.end, mode]);
  const summary = useMemo(() => getVelocitySummary(range.start, range.end), [range.start, range.end]);
  return <article className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3"><h3 className="text-[14px] font-semibold text-card-foreground">Deal Velocity</h3>
      <div role="group" aria-label="Velocity chart period" className="flex shrink-0 gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5">
        {[{ value:"week", label:"Week" }, { value:"month",label:"Month" }, {value:"year",label:"Year"}].map(item => <button key={item.value} type="button" aria-pressed={mode === item.value} onClick={() => setMode(item.value)} className={cn("nexora-menu-item rounded-md px-2.5 py-1.5 text-[10px] font-medium focus-visible:outline-2 focus-visible:outline-ring", mode === item.value ? "border border-border bg-card text-foreground shadow-sm" : "border border-transparent text-muted-foreground hover:text-foreground")}>{item.label}</button>)}
      </div></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-2"><span className="text-[26px] font-bold tracking-tight tabular-nums">{Math.round(summary.percent)}%</span><Trend value={summary.change}/></div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1" role="group" aria-label="Filter stages shown in deal velocity chart">
        {STAGES.map(stage => <button key={stage.key} type="button" aria-pressed={shown.includes(stage.key)} onClick={() => setShown(old => old.includes(stage.key) ? (old.length > 1 ? old.filter(v => v !== stage.key) : old) : [...old,stage.key])}
          className={cn("nexora-menu-item inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40", shown.includes(stage.key) ? "border-border bg-muted/60 text-foreground" : "border-transparent text-muted-foreground opacity-60 hover:opacity-100")}>
          <span className="size-2 rounded-full" style={{background:stage.color}} />{stage.label}
        </button>)}
      </div>
    </div>
    <div className="mt-4 flex h-44 items-end gap-1.5 sm:gap-2.5" aria-label={`Demo deal stage distribution grouped by ${mode}`}>
      {bars.map(bar => {
        const visibleTotal = shown.reduce((total,key) => total + Number(bar[key] || 0), 0);
        const maxTotal = Math.max(1,...bars.map(b => shown.reduce((total,key) => total + Number(b[key] || 0),0)));
        return <div key={bar.key} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <div className="pointer-events-none absolute bottom-[calc(100%-8px)] left-1/2 z-30 w-[156px] max-w-[min(156px,90vw)] -translate-x-1/2 translate-y-1 rounded-lg border border-border bg-popover p-2.5 text-popover-foreground opacity-0 shadow-lg transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <p className="text-[10px] font-semibold">{bar.label}</p>
            {STAGES.map(stage => <div key={stage.key} className="mt-1.5 flex justify-between gap-2 text-[10px]"><span className="flex items-center gap-1.5 text-muted-foreground"><i className="size-2 rounded-full" style={{background:stage.color}} />{stage.label}</span><strong className="tabular-nums">{bar[stage.key]}</strong></div>)}
            <div className="mt-2 flex justify-between border-t border-border pt-1.5 text-[10px]"><span>Visible total</span><strong>{visibleTotal}</strong></div>
          </div>
          <button type="button" aria-label={`${bar.label}: ${visibleTotal} displayed demo deals. Qualified ${bar.qualified}, proposal ${bar.proposal}, negotiation ${bar.negotiation}`} className="flex h-[125px] w-full max-w-9 items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <div className="flex w-full flex-col-reverse overflow-hidden rounded-[4px] transition-[height] duration-500 ease-out motion-reduce:transition-none" style={{height:`${visibleTotal ? Math.max(5,visibleTotal/maxTotal*100) : 2}%`}}>
              {STAGES.filter(stage => shown.includes(stage.key)).map(stage => <div key={stage.key} className="min-h-0 transition-[flex-grow,background-color] duration-500 motion-reduce:transition-none" style={{background:stage.color,flexGrow:bar[stage.key],flexBasis:0}} />)}
            </div>
          </button>
          <span className="max-w-full truncate text-[9px] text-muted-foreground">{bar.label}</span>
        </div>;
      })}
    </div>
    <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Demo stage distribution; {mode} changes the chart grouping. The percentage is a demo deal-to-lead proxy, not measured stage velocity.</p>
  </article>;
}
function Pulse({ range }) {
  const [period, setPeriod] = useState("week");
  const pulse = useMemo(() => getPulseSnapshot(range.start, range.end, period), [range.start, range.end, period]);
  const deals = useMemo(getSpotlightDeals, []);
  const statuses = { Won:"bg-emerald-500/15 text-emerald-500", Review:"bg-violet-500/15 text-violet-400", Stalled:"bg-amber-500/15 text-amber-500" };
  return <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card">
    <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5"><h3 className="text-[14px] font-semibold text-card-foreground">Pipeline Pulse</h3><CompactSelect label="Pipeline reporting period" value={period} onChange={setPeriod} options={[{value:"week",label:"This Week"},{value:"month",label:"Last 30 Days"},{value:"quarter",label:"Last 90 Days"}]} /></div>
    <div className="grid grid-cols-1 items-center gap-4 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:px-5">
      <div className="flex items-center justify-center sm:border-r sm:border-border sm:pr-4">
        {/* Fixed 112x112 SVG viewport prevents squashing in responsive flex/grid layouts.
            TODO(API): quotaPercent is a demo aggregate; load actual goals and revenue from Node.js. */}
        <div className="relative size-[112px] shrink-0" role="img" aria-label={`Quota attainment ${Math.round(pulse.quotaPercent)} percent`}>
          <svg viewBox="0 0 112 112" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="56" cy="56" r="46" fill="none" stroke="var(--muted)" strokeWidth="7" />
            <circle cx="56" cy="56" r="46" fill="none" stroke="var(--foreground)" strokeWidth="7" strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.max(0,Math.min(100,pulse.quotaPercent))} 100`} className="transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[21px] font-bold tabular-nums">{Math.round(pulse.quotaPercent)}%</span><span className="text-[10px] text-muted-foreground">quota</span></div>
        </div>
      </div>
      <div className="space-y-3">{[{label:"Pipeline Value",value:money(pulse.pipeline),change:pulse.pipelineChange},{label:"Conversion Proxy",value:percent(pulse.conversion),change:null},{label:"Avg. Deal Cycle",value:`${pulse.avgCycleDays} days`,change:pulse.cycleChange}].map(row=><div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-[11px]"><span className="text-muted-foreground">{row.label}</span><div className="flex items-center gap-2"><span className="font-semibold tabular-nums text-card-foreground">{row.value}</span>{row.change!==null&&<Trend value={row.change}/>}</div></div>)}</div>
    </div>
    <div className="mx-4 border-t border-border sm:mx-5"/>
    <div className="mx-4 my-4 flex-1 rounded-xl bg-muted/60 p-3 sm:mx-5"><h4 className="text-[13px] font-semibold">Deals in Motion</h4><div className="mt-3 space-y-3">{deals.map(deal=><div key={deal.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2"><div className="min-w-0"><p className="truncate text-[11px] font-semibold">{deal.name}</p><p className="truncate text-[10px] text-muted-foreground">{deal.company}</p></div><span className="text-[11px] font-semibold tabular-nums">{money(deal.amount)}</span><span className={cn("min-w-14 rounded-md px-1.5 py-0.5 text-center text-[9px] font-semibold", statuses[deal.status] || "bg-muted text-foreground")}>{deal.status}</span></div>)}</div></div>
    <div className="mt-auto flex gap-2 border-t border-border p-3"><ExportCSV deals={deals}/><Link href="/deals" className="nexora-menu-item flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground text-[11px] font-semibold text-background hover:opacity-90">Open Pipeline <ArrowUpRight className="size-3.5"/></Link></div>
    <p className="px-4 pb-3 text-[9px] text-muted-foreground">Quota and stage splits are demonstration values. Real data will come from target, deal and stage-history tables.</p>
  </article>;
}
/** Keep range prop stable: {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}. */
export default function AnalyticsSections({ range }) {
  return <section className="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-3 xl:grid-cols-2" aria-label="Deal velocity and pipeline pulse"><Pulse range={range}/><Velocity range={range}/></section>;
}
