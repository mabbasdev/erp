import { dashboardDemoRows } from "@/data/dashboard-demo";
import { demoDeals } from "@/data/dashboard-reference-demo";

/**
 * DEMO ADAPTER — keep UI unaware of MySQL/HTTP.
 * TODO(API): Replace getVelocitySeries/getPulseSnapshot/getSpotlightDeals with
 * GET /api/dashboard/velocity, GET /api/dashboard/pulse and GET /api/deals/spotlight.
 * The dataset contains daily AGGREGATES, not real deal-stage events; the stage
 * splits and quota target below are deliberately illustrative.
 */
export const DEMO_QUOTA_TARGET = 250000; // TODO(DB): organization_target.amount, currency USD
const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
function dayDiff(a, b) { return Math.floor((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000); }
function shift(iso, days) { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
function periodRows(start, end) { return dashboardDemoRows.filter(row => row.date >= start && row.date <= end); }
function comparison(start, end, key) {
  const days = Math.max(1, dayDiff(end, start) + 1);
  const now = sum(periodRows(start, end), key);
  const before = sum(periodRows(shift(start, -days), shift(start, -1)), key);
  return { now, before, change: before > 0 ? (now / before - 1) * 100 : null };
}
function weekStart(iso) { const d = new Date(`${iso}T00:00:00Z`); const day = d.getUTCDay(); return shift(iso, -((day + 6) % 7)); }
function dateForBucket(iso, mode) {
  if (mode === "week") return iso;
  if (mode === "month") return iso.slice(0, 7);
  return iso.slice(0, 4);
}
function labelForKey(key, mode) {
  if (mode === "week") return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(`${key}T00:00:00Z`));
  if (mode === "month") return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${key}-01T00:00:00Z`));
  return key;
}
export function getVelocitySeries(end, mode = "month") {
  // Week: Mon-Sun containing reporting end; month: Jan-Dec of end's year;
  // year: 5-year rolling window. Buckets with no demo rows have value 0.
  const start = mode === "week" ? weekStart(end) : mode === "month" ? `${end.slice(0, 4)}-01-01` : `${Number(end.slice(0, 4)) - 4}-01-01`;
  const last = mode === "week" ? shift(start, 6) : mode === "month" ? `${end.slice(0, 4)}-12-31` : `${end.slice(0, 4)}-12-31`;
  const keys = mode === "week" ? Array.from({ length: 7 }, (_, i) => shift(start, i)) : mode === "month" ? Array.from({ length: 12 }, (_, i) => `${end.slice(0, 4)}-${String(i + 1).padStart(2, "0")}`) : Array.from({ length: 5 }, (_, i) => String(Number(end.slice(0, 4)) - 4 + i));
  const buckets = new Map(keys.map(key => [key, 0]));
  periodRows(start, last).forEach(row => { const key = dateForBucket(row.date, mode); if (buckets.has(key)) buckets.set(key, buckets.get(key) + Number(row.openDeals || 0)); });
  const maximum = Math.max(1, ...buckets.values());
  return keys.map(key => {
    const total = buckets.get(key);
    // TODO(DB): Real stage distribution from deal_stage_history events.
    const qualified = Math.round(total * 0.49);
    const proposal = Math.round(total * 0.31);
    return { key, label: labelForKey(key, mode), total, qualified, proposal, negotiation: total - qualified - proposal, heightPct: total / maximum * 100 };
  });
}
export function getVelocitySummary(start, end) {
  const { now, change } = comparison(start, end, "openDeals");
  const { now: leads } = comparison(start, end, "leads");
  // Demo proxy, NOT actual throughput: active deal count divided by leads captured.
  return { percent: leads ? Math.min(100, now / leads * 100) : 0, change, openDeals: now };
}
export function getPulseSnapshot(start, end, period = "week") {
  // Period dropdown controls the lookback window relative to dashboard end.
  const days = period === "week" ? 7 : period === "month" ? 30 : 90;
  const from = shift(end, -(days - 1));
  const pipeline = comparison(from, end, "pipelineValue");
  const revenue = comparison(from, end, "wonRevenue");
  const leads = comparison(from, end, "leads");
  const deals = comparison(from, end, "openDeals");
  const quota = DEMO_QUOTA_TARGET * days / 30;
  return {
    pipeline: pipeline.now, pipelineChange: pipeline.change,
    conversion: leads.now ? deals.now / leads.now * 100 : 0,
    revenue: revenue.now, revenueChange: revenue.change,
    quota, quotaPercent: quota ? Math.min(100, revenue.now / quota * 100) : 0,
    // TODO(DB): replace with AVG(DATEDIFF(won_at, opened_at)) for won deals.
    avgCycleDays: 34,
    cycleChange: null,
  };
}
export function getSpotlightDeals() {
  // TODO(API): fetch actual latest deals, scoped to organization, sorted by updated_at.
  return demoDeals;
}
