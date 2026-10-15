// Deterministic demo records. Replace with real CRM aggregates later.
const start = new Date("2025-01-01T12:00:00Z");
const end = new Date("2026-12-31T12:00:00Z");

export const dashboardDemoRows = [];
for (let index = 0, day = new Date(start); day <= end; index++, day.setUTCDate(day.getUTCDate() + 1)) {
    const season = 1 + 0.12 * Math.sin(index / 29);
    const leads = Math.round((19 + (index * 7) % 16) * season);
    const openDeals = Math.round((2 + (index * 3) % 5) * season);
    const pipelineValue = openDeals * (2100 + (index * 131) % 2400);
    const wonRevenue = Math.round(pipelineValue * (0.36 + (index % 7) * 0.025));
    dashboardDemoRows.push({
        date: day.toISOString().slice(0, 10),
        leads,
        openDeals,
        pipelineValue,
        wonRevenue,
    });
}

export const dashboardMetrics = [
    { key: "leads", label: "Total Leads", kind: "count", icon: "target", tone: "blue" },
    { key: "openDeals", label: "Open Deals", kind: "count", icon: "handshake", tone: "purple" },
    { key: "pipelineValue", label: "Pipeline Value", kind: "money", icon: "trending-up", tone: "green" },
    { key: "wonRevenue", label: "Won Revenue", kind: "money", icon: "badge-dollar-sign", tone: "orange" },
];

export function sumDashboardRows(startDate, endDate) {
    return dashboardDemoRows.reduce((totals, row) => {
        if (row.date >= startDate && row.date <= endDate) {
            for (const key of ["leads", "openDeals", "pipelineValue", "wonRevenue"]) {
                totals[key] += row[key];
            }
        }
        return totals;
    }, { leads: 0, openDeals: 0, pipelineValue: 0, wonRevenue: 0 });
}
