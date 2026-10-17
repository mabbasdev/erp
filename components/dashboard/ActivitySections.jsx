"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, CalendarClock, Check, CircleCheck, Clock3, Handshake, Target, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardActivity, dashboardFollowUps } from "@/data/dashboard-insights";

function Panel({ title, description, icon: Icon, children }) {
  return <article className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5"><div><h3 className="text-[13px] font-semibold text-card-foreground">{title}</h3><p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p></div><Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></div>
    <div className="p-3 sm:p-4">{children}</div>
  </article>;
}

const typeIcon = { lead: Target, deal: Handshake, proposal: UsersRound };

export default function ActivitySections({ range, insights }) {
  const [completed, setCompleted] = useState([]);
  const activity = useMemo(() => dashboardActivity.filter((item) => item.date >= range.start && item.date <= range.end), [range]);
  const upcoming = dashboardFollowUps.filter((item) => !completed.includes(item.id));
  const completedCount = dashboardFollowUps.length - upcoming.length;
  const insightsList = [
    { title: "Leads captured", detail: `${insights.total.leads.toLocaleString()} demo leads in the selected period` },
    { title: "Revenue conversion", detail: `${insights.winRate.toFixed(1)}% of sample pipeline value recorded as won revenue` },
    { title: "Follow-up checklist", detail: `${completedCount} of ${dashboardFollowUps.length} demo follow-ups completed in this session` },
  ];

  return <section aria-labelledby="workspace-heading" className="mt-6 pb-4">
    <div className="mb-3"><h2 id="workspace-heading" className="text-[15px] font-semibold tracking-tight text-foreground sm:text-[16px]">Activity & insights</h2><p className="mt-0.5 text-[11px] text-muted-foreground">A practical snapshot of what needs attention</p></div>
    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
      <Panel title="Recent Activity" description="Illustrative events within the selected date range" icon={Clock3}>
        {activity.length ? <div className="space-y-1">{activity.map((item) => { const Icon = typeIcon[item.type] || BellRing; return <div key={item.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background"><Icon className="size-4 text-muted-foreground" aria-hidden="true" /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-card-foreground">{item.title}</p><p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p></div><div className="shrink-0 text-right text-[9px] text-muted-foreground"><p>{item.date.slice(5)}</p><p>{item.time}</p></div></div>; })}</div> : <p className="px-2 py-8 text-center text-[11px] text-muted-foreground">No sample activity in this date range.</p>}
      </Panel>
      <Panel title="Upcoming Follow-ups" description="Interactive checklist · local demo state" icon={CalendarClock}>
        <div className="space-y-1">{upcoming.length ? upcoming.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"><button type="button" title={`Mark ${item.title} complete`} aria-label={`Mark ${item.title} complete`} onClick={() => setCompleted((existing) => [...existing, item.id])} className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Check className="size-4" aria-hidden="true" /></button><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-card-foreground">{item.title}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{item.detail}</p></div><div className="shrink-0 text-right"><p className="text-[10px] tabular-nums text-muted-foreground">{item.date.slice(5)}</p><p className="text-[9px] text-muted-foreground">{item.priority}</p></div></div>) : <div className="flex flex-col items-center gap-2 py-6 text-center"><CircleCheck className="size-6 text-primary" /><p className="text-[11px] text-muted-foreground">All demo follow-ups completed.</p></div>}</div>
        {completedCount > 0 && <button type="button" onClick={() => setCompleted([])} className="mt-3 text-[10px] font-semibold text-primary hover:underline">Reset demo checklist</button>}
      </Panel>
      <Panel title="Pipeline Insights" description="Derived from the sample reporting data" icon={BellRing}>
        <div className="space-y-3">{insightsList.map((item) => <div key={item.title} className="rounded-lg border border-border bg-background px-3 py-2.5"><p className="text-[11px] font-semibold text-foreground">{item.title}</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p></div>)}</div>
      </Panel>
      <Panel title="Quick Actions" description="Jump straight into your CRM workspace" icon={ArrowRight}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{[
          { label: "View Leads", desc: "Review enquiries", href: "/leads", icon: Target },
          { label: "View Deals", desc: "Track opportunities", href: "/deals", icon: Handshake },
          { label: "Contacts", desc: "Manage relationships", href: "/contacts", icon: UsersRound },
          { label: "Activities", desc: "See team activity", href: "/activities", icon: CalendarClock },
        ].map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="nexora-menu-item group flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-muted"><Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold text-foreground">{item.label}</span><span className="block text-[10px] text-muted-foreground">{item.desc}</span></span><ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /></Link>; })}</div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Actions navigate to the corresponding CRM module; those routes must exist in your application.</p>
      </Panel>
    </div>
  </section>;
}
