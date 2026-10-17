"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import KpiCard from "@/components/dashboard/KpiCard";
import AnalyticsSections from "@/components/dashboard/AnalyticsSections";
import ActivitySections from "@/components/dashboard/ActivitySections";
import ReferenceOverview from "@/components/dashboard/ReferenceOverview";
import { getDashboardInsights } from "@/data/dashboard-insights";
import { dashboardMetrics, sumDashboardRows } from "@/data/dashboard-demo";

const TODAY = "2026-10-15"; // Demo reporting date; swap for live organization time.
const FIRST_DATE = "2025-01-01";
const LAST_DATE = "2026-12-31";

function shiftDate(dateString, days) {
	const date = new Date(`${dateString}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

function dateLabel(dateString) {
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
		.format(new Date(`${dateString}T12:00:00Z`));
}

function presetRange(preset) {
	const days = Number(preset);
	return { start: shiftDate(TODAY, -(days - 1)), end: TODAY };
}

function downloadCSV(filename, content) {
	const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

export default function DashboardPage() {
	const [range, setRange] = useState(() => presetRange("30"));
	const [draft, setDraft] = useState(() => presetRange("30"));
	const [rangeOpen, setRangeOpen] = useState(false);
	const [preset, setPreset] = useState("30");

	const isValid = draft.start && draft.end && draft.start <= draft.end &&
		draft.start >= FIRST_DATE && draft.end <= LAST_DATE;

	const { current, previous } = useMemo(() => {
		const startMs = Date.parse(`${range.start}T12:00:00Z`);
		const endMs = Date.parse(`${range.end}T12:00:00Z`);
		const days = Math.round((endMs - startMs) / 86400000) + 1;
		return {
			current: sumDashboardRows(range.start, range.end),
			previous: sumDashboardRows(shiftDate(range.start, -days), shiftDate(range.start, -1)),
		};
	}, [range]);

	const insights = useMemo(() => getDashboardInsights(range.start, range.end), [range]);

	function choosePreset(value) {
		setPreset(value);
		setDraft(presetRange(value));
	}

	function applyRange() {
		if (!isValid) return;
		setRange({ ...draft });
		setRangeOpen(false);
	}

	function exportMetrics() {
		const headers = ["Metric", "Start date", "End date", "Current value", "Previous value"];
		const rows = dashboardMetrics.map((metric) => [
			metric.label, range.start, range.end, current[metric.key], previous[metric.key],
		]);
		const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
		downloadCSV(`nexora-dashboard-${range.start}-to-${range.end}.csv`, csv);
	}

	return (
		<section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
			<div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-4">
				<div className="min-w-0">
					<h1 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[23px]">Dashboard</h1>
					<p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
						Track your sales performance and pipeline activity.
					</p>
					<p className="mt-1 text-[10px] text-muted-foreground">Demo CRM data · date filters update the metrics</p>
				</div>

				<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
					<div className="relative min-w-0">
						<button type="button" onClick={() => { setDraft({ ...range }); setRangeOpen((value) => !value); }}
							aria-expanded={rangeOpen} aria-label="Select reporting date range"
							className="nexora-menu-item flex h-8 max-w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 text-[11px] font-medium text-foreground hover:bg-muted">
							<CalendarDays className="size-4 shrink-0" aria-hidden="true" />
							<span className="truncate">{dateLabel(range.start)} – {dateLabel(range.end)}</span>
							<ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", rangeOpen && "rotate-180")} aria-hidden="true" />
						</button>
						{rangeOpen && (
							<div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[min(320px,calc(100vw-32px))] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg dark:shadow-black/30">
								<p className="text-[12px] font-semibold">Reporting period</p>
								<div className="mt-3 flex flex-wrap gap-1.5">
									{[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }].map((option) => (
										<button key={option.value} type="button" onClick={() => choosePreset(option.value)}
											className={cn("nexora-menu-item rounded-md border px-2.5 py-1.5 text-[11px]", preset === option.value ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted")}>
											{option.label}
										</button>
									))}
								</div>
								<div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
									{[{ key: "start", label: "From" }, { key: "end", label: "To" }].map((field) => (
										<label key={field.key} className="flex min-w-0 flex-col gap-1 text-[10px] font-medium text-muted-foreground">
											{field.label}
											<input type="date" min={FIRST_DATE} max={LAST_DATE} value={draft[field.key]}
												onChange={(event) => { setPreset("custom"); setDraft((value) => ({ ...value, [field.key]: event.target.value })); }}
												className="h-9 min-w-0 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground outline-none focus:border-primary" />
										</label>
									))}
								</div>
								{!isValid && <p role="alert" className="mt-2 text-[10px] text-rose-600 dark:text-rose-400">Select valid dates in chronological order.</p>}
								<div className="mt-3 flex justify-end gap-2">
									<button type="button" onClick={() => setRangeOpen(false)} className="h-8 rounded-md px-3 text-[11px] text-muted-foreground hover:bg-muted">Cancel</button>
									<button type="button" disabled={!isValid} onClick={applyRange} className="h-8 rounded-md bg-foreground px-3 text-[11px] font-semibold text-background disabled:opacity-40">Apply</button>
								</div>
							</div>
						)}
					</div>
					<button type="button" onClick={exportMetrics} className="nexora-menu-item flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 text-[11px] font-medium text-foreground hover:bg-muted">
						<Download className="size-4" aria-hidden="true" /> Export
					</button>
				</div>
			</div>

			<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{dashboardMetrics.map((metric) => (
					<KpiCard key={metric.key} metric={metric} value={current[metric.key]} previousValue={previous[metric.key]} />
				))}
			</div>

			<AnalyticsSections range={range} />
			{/* Demo-only reference widgets. Replace data adapters in data/dashboard-reference-demo.js when APIs exist. */}
			<ReferenceOverview range={range} />
			<ActivitySections I set up my first campaign in like ten minutes and two slicks smart plus far local range={range} insights={insights} />
		</section>
	);
}
