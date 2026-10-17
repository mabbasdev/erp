import { dashboardDemoRows } from "@/data/dashboard-demo";

// Derived from the same deterministic demo records used by the KPI cards.
export function getDashboardInsights(startDate, endDate) {
  const rows = dashboardDemoRows.filter((row) => row.date >= startDate && row.date <= endDate);
  const buckets = Array.from({ length: Math.min(7, Math.max(1, rows.length)) }, (_, i) => {
    const a = Math.floor((i * rows.length) / Math.min(7, Math.max(1, rows.length)));
    const b = Math.floor(((i + 1) * rows.length) / Math.min(7, Math.max(1, rows.length)));
    const chunk = rows.slice(a, b);
    return {
      label: chunk.length ? new Date(`${chunk[0].date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : "—",
      leads: chunk.reduce((sum, row) => sum + row.leads, 0),
      pipeline: chunk.reduce((sum, row) => sum + row.pipelineValue, 0),
      won: chunk.reduce((sum, row) => sum + row.wonRevenue, 0),
    };
  });
  const total = rows.reduce((result, r) => ({ leads: result.leads + r.leads, pipeline: result.pipeline + r.pipelineValue, won: result.won + r.wonRevenue, deals: result.deals + r.openDeals }), { leads: 0, pipeline: 0, won: 0, deals: 0 });
  // Illustrative segmentation applied to actual period totals, not real CRM source records.
  const sources = [
    { name: "Organic", share: 37, color: "bg-sky-500" },
    { name: "Referrals", share: 29, color: "bg-violet-500" },
    { name: "Paid", share: 22, color: "bg-emerald-500" },
    { name: "Other", share: 12, color: "bg-amber-500" },
  ].map((entry) => ({ ...entry, amount: Math.round((total.pipeline * entry.share) / 100) }));
  const dealStages = [
    { name: "Qualified", share: 31 },
    { name: "Proposal", share: 28 },
    { name: "Negotiation", share: 25 },
    { name: "Review", share: 16 },
  ].map((entry) => ({ ...entry, count: Math.round((total.deals * entry.share) / 100) }));
  return { buckets, total, sources, dealStages, winRate: total.pipeline ? (total.won / total.pipeline) * 100 : 0 };
}

// Illustrative event stream. Dates deliberately kept near the demo reference date.
export const dashboardActivity = [
  { id: "ac1", date: "2026-10-15", title: "New lead assigned", detail: "Inbound website enquiry · Olivia Chen", type: "lead", time: "10:42 AM" },
  { id: "ac2", date: "2026-10-14", title: "Deal moved to negotiation", detail: "Atlas Consulting · Enterprise renewal", type: "deal", time: "3:25 PM" },
  { id: "ac3", date: "2026-10-13", title: "Proposal shared", detail: "Northstar Labs · Annual services", type: "proposal", time: "1:16 PM" },
  { id: "ac4", date: "2026-10-10", title: "Lead qualified", detail: "Sapphire Technologies · Referral", type: "lead", time: "11:03 AM" },
  { id: "ac5", date: "2026-09-28", title: "Deal marked won", detail: "Evergreen Media · Onboarding", type: "deal", time: "9:18 AM" },
  { id: "ac6", date: "2026-08-26", title: "New contact added", detail: "Westfield Partners · New account", type: "lead", time: "2:05 PM" },
];

export const dashboardFollowUps = [
  { id: "f1", date: "2026-10-15", title: "Call Northstar Labs", detail: "Confirm proposal feedback", priority: "High" },
  { id: "f2", date: "2026-10-16", title: "Email Atlas Consulting", detail: "Share updated pricing", priority: "Medium" },
  { id: "f3", date: "2026-10-18", title: "Review Sapphire lead", detail: "Verify opportunity scope", priority: "Normal" },
  { id: "f4", date: "2026-10-21", title: "Schedule Evergreen check-in", detail: "Post-sale follow-up", priority: "Normal" },
];
