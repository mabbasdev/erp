"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, CalendarClock, Handshake, Target, UsersRound, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** DEMO LIVE ADAPTER, NOT LIVE DB DATA.
 * Existing `insights` prop comes from the selected date-range demo adapter.
 * The 15-second tick simulates changes for presentation only.
 * TODO(API): Replace this hook with authenticated GET /api/dashboard/insights?window=24h
 * returning { capturedLeads24h, revenueConversion24h, completedFollowUps24h,
 * pendingFollowUps, updatedAt }. Use your Node.js server's organization timezone
 * and tenant-scoped parameterized MySQL queries. Poll via TanStack Query/SWR
 * or stream changes over SSE/WebSockets. Remove demoTick when real data exists.
 */
function useDemoLiveInsights(insights) {
  const [demoTick, setDemoTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDemoTick(t => t + 1), 15000);
    return () => clearInterval(id);
  }, []);
  const result = useMemo(() => ({
    leads: Math.max(0, Number(insights?.total?.leads ?? 0)) + Math.floor(demoTick / 3),
    conversion: Math.max(0, Number(insights?.winRate ?? 0)) + (demoTick % 4) * 0.1,
    completed: demoTick % 5,
    pending: 4 - (demoTick % 5)
  }), [insights, demoTick]);
  return { result, demoTick };
}

function Panel({ title, description, icon: Icon, children }) {
  return <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-foreground/20">
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5"><div><h3 className="text-[13px] font-semibold text-card-foreground">{title}</h3><p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p></div><Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></div>
    <div className="flex-1 p-3 sm:p-4">{children}</div>
  </article>;
}

export default function ActivitySections({ insights }) {
  const { result, demoTick } = useDemoLiveInsights(insights);
  const entries = [
    { title: "Leads captured", value: result.leads.toLocaleString("en-US"), detail: "Selected-period demo leads · simulated updates" },
    { title: "Revenue conversion", value: `${result.conversion.toFixed(1)}%`, detail: "Won revenue relative to demo pipeline value" },
    { title: "Follow-up checklist", value: `${result.completed} / 4`, detail: `${result.pending} pending · simulated task progress` }
  ];
  return <section aria-labelledby="workspace-heading" className="mt-5 pb-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 id="workspace-heading" className="text-[15px] font-semibold tracking-tight text-foreground sm:text-[16px]">Activity & insights</h2><p className="mt-0.5 text-[11px] text-muted-foreground">A practical snapshot of what needs attention</p></div><span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><RefreshCw className="size-3" /> Simulated refresh · 15s</span></div>
    {/* Intentional removal: Recent Activity, Upcoming Follow-ups.
        "Last 24 hours" is a future API window, not a claim that these sample
        values were computed using timestamps from an actual database. */}
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
      <Panel title="Pipeline Insights" description="Today / Last 24 hours · demo preview" icon={BellRing}>
        <div className="grid gap-2" aria-live="off">
          {entries.map(entry => <div key={entry.title} className="group flex min-h-[62px] items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/60 motion-reduce:transform-none"><div className="min-w-0"><p className="text-[11px] font-semibold text-foreground">{entry.title}</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{entry.detail}</p></div><span className="shrink-0 text-[15px] font-semibold tabular-nums tracking-tight text-foreground">{entry.value}</span></div>)}
        </div>
        <p className="mt-2 text-[9px] text-muted-foreground">Demo update #{demoTick}. Database values will replace the simulation after API integration.</p>
      </Panel>
      <Panel title="Quick Actions" description="Jump straight into your CRM workspace" icon={ArrowRight}>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">{[
          { label: "View Leads", desc: "Review enquiries", href: "/leads", icon: Target },
          { label: "View Deals", desc: "Track opportunities", href: "/deals", icon: Handshake },
          { label: "Contacts", desc: "Manage relationships", href: "/contacts", icon: UsersRound },
          { label: "Activities", desc: "See team activity", href: "/activities", icon: CalendarClock },
        ].map(item => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="nexora-menu-item group flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-3 outline-none transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transform-none"><Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-foreground">{item.label}</span><span className="block text-[10px] text-muted-foreground">{item.desc}</span></span><ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></Link>; })}</div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">These links open the respective CRM routes when implemented.</p>
      </Panel>
    </div>
  </section>;
}
