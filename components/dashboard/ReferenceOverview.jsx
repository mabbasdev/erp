"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Plus,
  RotateCcw,
  Phone,
  UsersRound,
  ListChecks,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getReferenceOverview,
  getSalesSeries,
  scheduleItems,
  DEMO_REFERENCE_DATE,
} from "@/data/dashboard-reference-demo";

/* =========================================================
   FORMATTERS
========================================================= */

const currency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const integer = (value) => new Intl.NumberFormat("en-US").format(value);

/* =========================================================
   THEMED DROPDOWN
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
          "absolute right-0 top-[calc(100%+8px)] z-40 min-w-[150px] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_28px_rgba(0,0,0,0.14)] transition-all duration-200",
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
   CARD SHELL
========================================================= */

function Card({ title, right, children, className = "", footer }) {
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 pb-2 pt-3 sm:px-5">
        <h3 className="text-[13px] font-semibold tracking-tight text-card-foreground">
          {title}
        </h3>
        {right}
      </div>

      <div className="min-h-0 flex-1 px-4 pb-4 sm:px-5">
        {children}
      </div>

      {footer && <div className="border-t border-border p-3">{footer}</div>}
    </article>
  );
}

/* =========================================================
   SALES LIFECYCLE
========================================================= */

function SalesLifecycle({ overview }) {
  const maximum = Math.max(overview.lifecycle[0]?.count || 0, 1);

  return (
    <Card
      title="Sales Lifecycle"
      right={
        <span className="text-[10px] text-muted-foreground">
          Demo funnel
        </span>
      }
    >
      <div className="space-y-3 pt-3">
        {overview.lifecycle.map((stage) => (
          <div
            key={stage.label}
            className="grid grid-cols-[84px_minmax(0,1fr)_42px] items-center gap-2.5 sm:grid-cols-[94px_minmax(0,1fr)_48px]"
          >
            <div className="flex items-center gap-2 text-[11px] font-medium text-card-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  stage.color
                )}
              />
              {stage.label}
            </div>

            <div className="h-[6px] overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300",
                  stage.color
                )}
                style={{
                  width: `${(stage.count / maximum) * 100}%`,
                }}
              />
            </div>

            <span className="text-right text-[11px] tabular-nums text-muted-foreground">
              {integer(stage.count)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Illustrative funnel derived from demo leads. Replace stage
        shares with real lead-status totals.
      </p>
    </Card>
  );
}

/* =========================================================
   SALES OVERVIEW
========================================================= */

function SalesOverview({ range }) {
  const [resolution, setResolution] = useState("month");

  const points = useMemo(
    () => getSalesSeries(range.start, range.end, resolution),
    [range.start, range.end, resolution]
  );

  const total = points.reduce(
    (result, item) => result + item.revenue,
    0
  );

  const max = Math.max(
    ...points.map((point) => point.revenue),
    1
  );

  const x = (index) =>
    points.length === 1
      ? 300
      : 14 + (572 * index) / Math.max(points.length - 1, 1);

  const y = (value) => 124 - (value / max) * 103;

  const line = points
    .map((point, index) => `${x(index)},${y(point.revenue)}`)
    .join(" ");

  return (
    <Card
      title="Sales Overview"
      right={
        <ThemedSelect
          label="Sales chart resolution"
          value={resolution}
          onChange={setResolution}
          options={[
            { value: "week", label: "Weekly" },
            { value: "month", label: "Monthly" },
            { value: "quarter", label: "Quarterly" },
          ]}
          menuClassName="min-w-[140px]"
        />
      }
    >
      <p className="mt-1 text-[23px] font-semibold tracking-tight tabular-nums text-card-foreground">
        {currency(total)}
      </p>

      <p className="text-[10px] text-muted-foreground">
        Won revenue · selected period
      </p>

      <div
        className="mt-3"
        role="img"
        aria-label={`Sample revenue chart: ${points
          .map((point) => `${point.label} ${currency(point.revenue)}`)
          .join(", ")}`}
      >
        <svg
          className="h-32 w-full sm:h-36"
          viewBox="0 0 600 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[20, 70, 124].map((lineY) => (
            <line
              key={lineY}
              x1="0"
              x2="600"
              y1={lineY}
              y2={lineY}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="3 5"
            />
          ))}

          {points.length > 1 && (
            <polygon
              points={`14,124 ${line} 586,124`}
              className="fill-foreground"
              opacity="0.07"
            />
          )}

          <polyline
            points={line}
            stroke="currentColor"
            className="text-foreground transition-all duration-500"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point, index) => (
            <circle
              key={index}
              cx={x(index)}
              cy={y(point.revenue)}
              r="2.6"
              className="fill-card stroke-foreground"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div className="flex justify-between gap-1 text-[9px] text-muted-foreground">
          {points.map((point, index) => (
            <span key={index} className="truncate">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   TODAY'S SCHEDULE
========================================================= */

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);

  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"
    }`;
}

const typeIcons = {
  meeting: UsersRound,
  call: Phone,
  task: ListChecks,
};

const typeColors = {
  meeting:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  call: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  task: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function TodaySchedule() {
  // TODO(API):
  // GET /api/tasks?date=YYYY-MM-DD
  // POST /api/tasks
  // PATCH /api/tasks/:id
  // DELETE /api/tasks/:id
  //
  // This version remains session-local demo state.
  const [tasks, setTasks] = useState(scheduleItems);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    detail: "",
    time: "09:00",
    type: "task",
  });
  const [error, setError] = useState("");

  const pending = tasks.filter((item) => !item.completed).length;

  const visible = tasks
    .filter((item) => !showOnlyPending || !item.completed)
    .sort((a, b) => a.time.localeCompare(b.time));

  function toggle(id) {
    setTasks((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  }

  function addTask(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)
    ) {
      setError("Enter a title and a valid time.");
      return;
    }

    const task = {
      id: `demo-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      date: DEMO_REFERENCE_DATE,
      ...form,
      title: form.title.trim(),
      company: form.company.trim(),
      detail: form.detail.trim(),
      completed: false,
    };

    setTasks((prev) => [...prev, task]);
    setForm({
      title: "",
      company: "",
      detail: "",
      time: "09:00",
      type: "task",
    });
    setError("");
    setAdding(false);
    setShowOnlyPending(false);
  }

  return (
    <Card
      title="Today's Schedule"
      right={
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
            {pending} left
          </span>

          <button
            type="button"
            onClick={() => setShowOnlyPending((v) => !v)}
            aria-pressed={showOnlyPending}
            className={cn(
              "nexora-menu-item rounded-md border border-border px-2 py-1 text-[10px]",
              showOnlyPending
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Pending
          </button>
        </div>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setAdding((v) => !v);
              setError("");
            }}
            aria-expanded={adding}
            className="nexora-menu-item flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-foreground px-2 text-[11px] font-semibold text-background hover:opacity-90"
          >
            <Plus className="size-3.5" />
            Add Task
          </button>

          <Link
            href="/calendar"
            className="nexora-menu-item flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border border-border text-[11px] font-medium text-foreground hover:bg-muted"
          >
            <CalendarDays className="size-3.5" />
            Calendar
          </Link>

          <button
            type="button"
            onClick={() => {
              setTasks(scheduleItems);
              setAdding(false);
            }}
            aria-label="Reset demo tasks"
            title="Reset demo tasks"
            className="nexora-menu-item flex size-9 items-center justify-center rounded-md border border-border hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      }
    >
      <p className="mb-2 text-[10px] text-muted-foreground">
        Demo schedule · {DEMO_REFERENCE_DATE}
      </p>

      <div
        className={cn(
          "grid transition-all duration-200",
          adding
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {adding && (
            <form
              onSubmit={addTask}
              className="mb-3 space-y-2 rounded-lg border border-border bg-muted/40 p-3"
            >
              <label className="block text-[10px] font-semibold text-foreground">
                Task title *
                <input
                  autoFocus
                  required
                  maxLength={140}
                  value={form.title}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Call new customer"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground outline-none focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] font-semibold">
                  Time *
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        time: e.target.value,
                      }))
                    }
                    className="mt-1 h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-[11px] text-foreground"
                  />
                </label>

                <label className="text-[10px] font-semibold">
                  Type
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        type: e.target.value,
                      }))
                    }
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground"
                  >
                    <option value="task">Task</option>
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </label>
              </div>

              <label className="block text-[10px] font-semibold">
                Company
                <input
                  maxLength={100}
                  value={form.company}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground"
                />
              </label>

              <label className="block text-[10px] font-semibold">
                Details
                <input
                  maxLength={240}
                  value={form.detail}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      detail: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-[11px] text-foreground"
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="text-[10px] text-rose-500"
                >
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="h-8 rounded-md px-3 text-[11px] text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-8 rounded-md bg-foreground px-3 text-[11px] font-semibold text-background"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="divide-y divide-border">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-muted-foreground">
            No pending tasks. Add one above.
          </p>
        ) : (
          visible.map((entry) => {
            const Icon = typeIcons[entry.type] || Clock3;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-2 py-3"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    typeColors[entry.type]
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[11px] font-semibold",
                      entry.completed &&
                      "text-muted-foreground line-through"
                    )}
                  >
                    {entry.title}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {[entry.company, entry.detail]
                      .filter(Boolean)
                      .join(" · ") || "Personal task"}
                  </p>
                </div>

                <time
                  className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
                  dateTime={`${entry.date}T${entry.time}`}
                >
                  {formatTime(entry.time)}
                </time>

                <button
                  type="button"
                  onClick={() => toggle(entry.id)}
                  aria-label={`${entry.completed
                      ? "Mark incomplete"
                      : "Mark complete"
                    }: ${entry.title}`}
                  aria-pressed={entry.completed}
                  className={cn(
                    "nexora-menu-item flex size-5 shrink-0 items-center justify-center rounded border",
                    entry.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  )}
                >
                  {entry.completed && (
                    <Check className="size-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   SECTION WRAPPER
========================================================= */

export default function ReferenceOverview({ range }) {
  const overview = useMemo(
    () => getReferenceOverview(range.start, range.end),
    [range.start, range.end]
  );

  return (
    <section
      aria-label="Sales lifecycle, sales overview and schedule"
      className="mt-3"
    >
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid min-w-0 auto-rows-min gap-3">
          <SalesLifecycle overview={overview} />
          <SalesOverview range={range} />
        </div>

        <div className="min-w-0 xl:col-span-2">
          <TodaySchedule />
        </div>
      </div>
    </section>
  );
}