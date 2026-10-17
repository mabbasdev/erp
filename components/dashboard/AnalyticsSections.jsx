"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getVelocitySeries,
  getVelocitySummary,
  getPulseSnapshot,
  getSpotlightDeals,
} from "@/data/dashboard-velocity-demo";

/* =========================================================
   FORMATTERS
========================================================= */

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(n);

const percent = (n) => `${Number(n || 0).toFixed(1)}%`;

/* =========================================================
   SMALL UTILITIES
========================================================= */

function Trend({ value, suffix = "%", reverse = false }) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className="text-[10px] text-muted-foreground">
        No comparison data
      </span>
    );
  }

  const good = reverse ? value <= 0 : value >= 0;

  return (
    <span
      className={cn(
        "text-[10px] font-medium tabular-nums",
        good ? "text-emerald-500" : "text-rose-500"
      )}
    >
      {value >= 0 ? "↗ +" : "↘ "}
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

/* =========================================================
   THEMED DROPDOWN
   Reusable compact dropdown for dashboard widgets.
   TODO(UI): Extract to a shared component later if reused more.
========================================================= */

function ThemedSelect({
  value,
  onChange,
  options,
  label,
  buttonClassName = "",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const active = options.find((item) => item.value === value);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "nexora-menu-item flex h-8 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-[10px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          buttonClassName
        )}
      >
        <span>{active?.label}</span>
        <ChevronDown
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] z-40 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_28px_rgba(0,0,0,0.14)] transition-all duration-200",
          "dark:shadow-[0_10px_32px_rgba(0,0,0,0.35)]",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
          menuClassName
        )}
        role="listbox"
        aria-label={label}
      >
        {options.map((item) => {
          const selected = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className={cn(
                "nexora-menu-item flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-left text-[10px] font-medium transition-colors",
                selected
                  ? "bg-accent text-accent-foreground"
                  : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span>{item.label}</span>
              {selected && <Check className="size-3.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   EXPORT CSV
========================================================= */

function ExportCSV({ deals }) {
  function save() {
    // TODO(API):
    // Replace this client-side export with a backend endpoint:
    // GET /api/deals/export?scope=spotlight
    // Backend can generate a richer CSV using actual DB records.
    const rows = [
      ["ID", "Deal", "Company", "Amount", "Status"],
      ...deals.map((d) => [
        d.id,
        d.name,
        d.company,
        d.amount,
        d.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

    const link = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    link.href = url;
    link.download = "nexora-demo-deals.csv";
    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <button
      type="button"
      onClick={save}
      className="nexora-menu-item flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <Download className="size-3.5" />
      Export CSV
    </button>
  );
}

/* =========================================================
   DEAL VELOCITY
========================================================= */

const stageConfig = [
  {
    key: "qualified",
    label: "Qualified",
    color: "#6a6a6a",
    segmentClass: "bg-[#6a6a6a]",
  },
  {
    key: "proposal",
    label: "Proposal",
    color: "#a0a0a0",
    segmentClass: "bg-[#9f9f9f]",
  },
  {
    key: "negotiation",
    label: "Negotiation",
    color: "#dedede",
    segmentClass: "bg-[#dedede]",
  },
];

function Velocity({ range }) {
  const [mode, setMode] = useState("month");
  const [activeStages, setActiveStages] = useState([
    "qualified",
    "proposal",
    "negotiation",
  ]);

  const bars = useMemo(
    () => getVelocitySeries(range.end, mode),
    [range.end, mode]
  );

  const summary = useMemo(
    () => getVelocitySummary(range.start, range.end),
    [range.start, range.end]
  );

  const normalizedBars = useMemo(() => {
    const data = bars.map((bar) => {
      const visibleTotal = stageConfig.reduce((sum, stage) => {
        if (!activeStages.includes(stage.key)) return sum;
        return sum + Number(bar[stage.key] || 0);
      }, 0);

      return {
        ...bar,
        visibleTotal,
      };
    });

    const maxVisible = Math.max(
      1,
      ...data.map((item) => item.visibleTotal)
    );

    return data.map((item) => ({
      ...item,
      heightPct: item.visibleTotal
        ? (item.visibleTotal / maxVisible) * 100
        : 0,
    }));
  }, [bars, activeStages]);

  function toggleStage(key) {
    setActiveStages((previous) => {
      if (previous.includes(key)) {
        // Keep at least one active stage.
        if (previous.length === 1) return previous;
        return previous.filter((item) => item !== key);
      }

      return [...previous, key];
    });
  }

  return (
    <article className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-card-foreground">
          Deal Velocity
        </h3>

        <div
          role="group"
          aria-label="Velocity chart period"
          className="flex shrink-0 gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5"
        >
          {[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={mode === item.value}
              onClick={() => setMode(item.value)}
              className={cn(
                "nexora-menu-item rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                mode === item.value
                  ? "border border-border bg-card text-foreground shadow-sm"
                  : "border border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-tight tabular-nums text-card-foreground">
            {Math.round(summary.percent)}%
          </span>
          <Trend value={summary.change} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {stageConfig.map((stage) => {
            const active = activeStages.includes(stage.key);

            return (
              <button
                key={stage.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleStage(stage.key)}
                className={cn(
                  "nexora-menu-item flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  active
                    ? "border-border bg-muted text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <i
                  className="size-2 rounded-full"
                  style={{ background: stage.color }}
                />
                {stage.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-4 flex h-44 items-end gap-2 sm:gap-3"
        role="img"
        aria-label={`Illustrative ${mode} deal velocity distribution`}
      >
        {normalizedBars.map((bar) => (
          <div
            key={bar.key}
            className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            {/* Tooltip */}
            <div
              className={cn(
                "pointer-events-none absolute bottom-[calc(100%-4px)] left-1/2 z-20 w-[148px] -translate-x-1/2 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition-all duration-200",
                "dark:shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
                "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              )}
            >
              <p className="text-[10px] font-semibold">
                {bar.label}
              </p>

              <div className="mt-2 space-y-1.5 text-[9.5px] text-muted-foreground">
                {stageConfig.map((stage) => (
                  <div
                    key={stage.key}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-1.5">
                      <i
                        className="size-2 rounded-full"
                        style={{
                          background: stage.color,
                        }}
                      />
                      {stage.label}
                    </span>
                    <span className="tabular-nums text-popover-foreground">
                      {bar[stage.key]}
                    </span>
                  </div>
                ))}

                <div className="mt-2 flex items-center justify-between border-t border-border pt-1.5">
                  <span>Visible total</span>
                  <span className="font-medium tabular-nums text-popover-foreground">
                    {bar.visibleTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex h-[126px] w-full max-w-9 items-end">
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-[5px] transition-[height] duration-500 ease-out motion-reduce:transition-none"
                style={{
                  height: `${bar.visibleTotal
                      ? Math.max(12, bar.heightPct)
                      : 6
                    }%`,
                }}
              >
                {stageConfig.map((stage) => {
                  if (!activeStages.includes(stage.key)) {
                    return null;
                  }

                  return (
                    <div
                      key={stage.key}
                      className={cn(
                        stage.segmentClass,
                        "transition-all duration-500 ease-out"
                      )}
                      style={{
                        flex: bar.visibleTotal
                          ? bar[stage.key]
                          : 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <span className="max-w-full truncate text-[9px] text-muted-foreground">
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        Demo stage distribution. Clicking the stage filters updates
        the chart. Later, replace this with real stage-history data
        from MySQL.
      </p>
    </article>
  );
}

/* =========================================================
   PIPELINE PULSE
========================================================= */

function Pulse({ range }) {
  const [period, setPeriod] = useState("week");

  const pulse = useMemo(
    () => getPulseSnapshot(range.start, range.end, period),
    [range.start, range.end, period]
  );

  const deals = useMemo(getSpotlightDeals, []);

  const statuses = {
    Won: "bg-emerald-500/15 text-emerald-500",
    Review: "bg-violet-500/15 text-violet-400",
    Stalled: "bg-amber-500/15 text-amber-500",
  };

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <h3 className="text-[14px] font-semibold text-card-foreground">
          Pipeline Pulse
        </h3>

        <ThemedSelect
          label="Pipeline reporting period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "week", label: "This Week" },
            { value: "month", label: "Last 30 Days" },
            { value: "quarter", label: "Last 90 Days" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 items-center gap-4 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:px-5">
        <div className="flex justify-center sm:border-r sm:border-border sm:pr-4">
          <div
            className="relative flex size-[112px] items-center justify-center rounded-full transition-all duration-500"
            style={{
              background: `conic-gradient(var(--foreground) ${pulse.quotaPercent}%, var(--muted) 0)`,
            }}
          >
            <div className="flex size-[98px] flex-col items-center justify-center rounded-full bg-card">
              <span className="text-[21px] font-bold tabular-nums">
                {Math.round(pulse.quotaPercent)}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                quota
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              label: "Pipeline Value",
              value: money(pulse.pipeline),
              change: pulse.pipelineChange,
            },
            {
              label: "Conversion Proxy",
              value: percent(pulse.conversion),
              change: null,
            },
            {
              label: "Avg. Deal Cycle",
              value: `${pulse.avgCycleDays} days`,
              change: pulse.cycleChange,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-[11px]"
            >
              <span className="text-muted-foreground">
                {row.label}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums text-card-foreground">
                  {row.value}
                </span>
                {row.change !== null && (
                  <Trend value={row.change} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 border-t border-border sm:mx-5" />

      <div className="mx-4 my-4 flex-1 rounded-xl bg-muted/60 p-3 sm:mx-5">
        <h4 className="text-[13px] font-semibold">Deals in Motion</h4>

        <div className="mt-3 space-y-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold">
                  {deal.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {deal.company}
                </p>
              </div>

              <span className="text-[11px] font-semibold tabular-nums">
                {money(deal.amount)}
              </span>

              <span
                className={cn(
                  "min-w-14 rounded-md px-1.5 py-0.5 text-center text-[9px] font-semibold",
                  statuses[deal.status] ||
                  "bg-muted text-foreground"
                )}
              >
                {deal.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        <ExportCSV deals={deals} />

        <Link
          href="/deals"
          className="nexora-menu-item flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground text-[11px] font-semibold text-background hover:opacity-90"
        >
          Open Pipeline
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <p className="px-4 pb-3 text-[9px] text-muted-foreground">
        Quota and stage splits are demo values. Later, map these to
        MySQL-backed pipeline targets, deals, and stage-history
        records.
      </p>
    </article>
  );
}

/* =========================================================
   SECTION
========================================================= */

/**
 * Keep range prop stable:
 * { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 *
 * TODO(API):
 * Replace getVelocitySeries/getVelocitySummary/getPulseSnapshot/getSpotlightDeals
 * with Node.js API calls that read from MySQL.
 */
export default function AnalyticsSections({ range }) {
  return (
    <section
      className="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-3 xl:grid-cols-2"
      aria-label="Deal velocity and pipeline pulse"
    >
      <Pulse range={range} />
      <Velocity range={range} />
    </section>
  );
}