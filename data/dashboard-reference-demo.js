import { dashboardDemoRows } from "@/data/dashboard-demo";

/**
 * DEMO DATA ADAPTER — swap this file's arrays/functions for real API data later.
 * Expected backend shapes:
 *   countryBreakdown: [{ code, name, flag, share, change }]
 *   demoDeals: [{ id, name, company, amount, status }]
 *   scheduleItems: [{ id, date, time, title, company, detail, type, completed }]
 * The frontend components do not need to know whether values come from demo arrays
 * or from a server response; preserve these shapes during integration.
 */
export const DEMO_REFERENCE_DATE = "2026-10-15"; // Replace with an organization-local current date on the server.

export const countryBreakdown = [
  { code: "AU", flag: "🇦🇺", name: "Australia", share: 28, change: 6 },
  { code: "MY", flag: "🇲🇾", name: "Malaysia", share: 21, change: 3 },
  { code: "ID", flag: "🇮🇩", name: "Indonesia", share: 16, change: -2 },
  { code: "SG", flag: "🇸🇬", name: "Singapore", share: 12, change: 4 },
  { code: "JP", flag: "🇯🇵", name: "Japan", share: 9, change: -1 },
  { code: "IN", flag: "🇮🇳", name: "India", share: 7, change: 8 },
  { code: "VN", flag: "🇻🇳", name: "Vietnam", share: 4, change: 5 },
  { code: "TH", flag: "🇹🇭", name: "Thailand", share: 3, change: -3 },
];

export const demoDeals = [
  { id: "D-101", name: "Enterprise Rollout", company: "Globex", amount: 240000, status: "Won" },
  { id: "D-102", name: "Compliance Add-on", company: "Meridian Bank", amount: 95000, status: "Review" },
  { id: "D-103", name: "Platform Renewal", company: "Orion Logistics", amount: 62000, status: "Stalled" },
];

// Deliberately seeded sample appointments for the dashboard's demo day.
// TODO(DB): Replace with GET /api/calendar?date=YYYY-MM-DD (including timezone).
export const scheduleItems = [
  { id: "S-101", date: DEMO_REFERENCE_DATE, time: "09:00", title: "QBR — Globex", company: "Globex", detail: "Quarterly business review", type: "meeting", completed: false },
  { id: "S-102", date: DEMO_REFERENCE_DATE, time: "11:30", title: "Follow-up call", company: "Meridian Bank", detail: "Compliance add-on", type: "call", completed: false },
  { id: "S-103", date: DEMO_REFERENCE_DATE, time: "13:00", title: "Send proposal", company: "Orion Logistics", detail: "Renewal proposal", type: "task", completed: true },
  { id: "S-104", date: DEMO_REFERENCE_DATE, time: "14:30", title: "Demo — Northwind Traders", company: "Northwind Traders", detail: "Discovery call", type: "meeting", completed: false },
  { id: "S-105", date: DEMO_REFERENCE_DATE, time: "16:00", title: "Update CRM notes", company: "Cobalt Health", detail: "Pilot expansion", type: "task", completed: false },
  { id: "S-106", date: DEMO_REFERENCE_DATE, time: "17:00", title: "Check-in call", company: "Vantage Retail", detail: "Onboarding", type: "call", completed: false },
  { id: "S-107", date: DEMO_REFERENCE_DATE, time: "17:00", title: "a call", company: "Retail", detail: "Onding", type: "call", completed: false },
];

const sum = (items, key) => items.reduce((acc, row) => acc + row[key], 0);

/** Reporting-period source: SAME daily sample rows as Phase 1 KPI cards. */
export function getReferenceOverview(startDate, endDate) {
  const rows = dashboardDemoRows.filter((row) => row.date >= startDate && row.date <= endDate);
  const leads = sum(rows, "leads");
  const pipeline = sum(rows, "pipelineValue");
  const won = sum(rows, "wonRevenue");
  const deals = sum(rows, "openDeals");

  // TODO(DB): Replace this synthetic funnel with grouped real lead.status counts.
  // Demo shares demonstrate interaction; don't present these as actual conversion rates.
  const lifecycle = [
    { label: "Lead", color: "bg-slate-400", share: 100 },
    { label: "Contacted", color: "bg-blue-500", share: 74 },
    { label: "Qualified", color: "bg-violet-500", share: 57 },
    { label: "Proposal", color: "bg-amber-400", share: 39 },
    { label: "Customer", color: "bg-emerald-500", share: 27 },
  ].map((stage) => ({ ...stage, count: Math.round(leads * stage.share / 100) }));

  // TODO(DB): Replace country shares with grouped deal/lead country attribution.
  const countries = countryBreakdown.map((country) => ({ ...country, amount: Math.round(pipeline * country.share / 100) }));
  return { lifecycle, countries, leads, pipeline, won, deals };
}

/**
 * Revenue timeseries: group the same demo rows into equal count windows.
 * 'Week', 'Month', and 'Quarter' control granularity only WITHIN selected range.
 * TODO(DB): Replace with GET /api/dashboard/sales?start=...&end=...&resolution=...
 */
export function getSalesSeries(startDate, endDate, resolution = "month") {
  const rows = dashboardDemoRows.filter((row) => row.date >= startDate && row.date <= endDate);
  const count = resolution === "week" ? 7 : resolution === "quarter" ? 4 : 6;
  if (!rows.length) return [];
  const bucketCount = Math.min(count, rows.length);
  return Array.from({ length: bucketCount }, (_, index) => {
    const from = Math.floor(index * rows.length / bucketCount);
    const to = Math.floor((index + 1) * rows.length / bucketCount);
    const slice = rows.slice(from, to);
    const first = slice[0].date;
    return {
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${first}T12:00:00Z`)),
      revenue: sum(slice, "wonRevenue"),
    };
  });
}
