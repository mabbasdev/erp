import { BadgeDollarSign, Handshake, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
	target: Target,
	handshake: Handshake,
	"trending-up": TrendingUp,
	"badge-dollar-sign": BadgeDollarSign,
};

const tones = {
	blue: "bg-blue-500 text-white",
	purple: "bg-violet-600 text-white",
	green: "bg-emerald-600 text-white",
	orange: "bg-orange-500 text-white",
};

function formatAmount(value, kind) {
	if (kind === "money") {
		return new Intl.NumberFormat("en-US", {
			style: "currency", currency: "USD", maximumFractionDigits: 1,
			notation: value >= 1000 ? "compact" : "standard",
		}).format(value);
	}
	return new Intl.NumberFormat("en-US").format(value);
}

export default function KpiCard({ metric, value, previousValue }) {
	const Icon = icons[metric.icon];
	const change = previousValue ? ((value - previousValue) / previousValue) * 100 : null;
	const positive = change !== null && change >= 0;
	return (
		<article className={cn(
			"relative isolate min-w-0 overflow-hidden rounded-xl border border-border bg-card",
			"px-4 py-4 sm:px-4 sm:py-4 lg:px-5",
			"transition-colors duration-150 hover:border-foreground/15"
		)}>
			<div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 nexora-kpi-dots" />
			<div className="flex items-start justify-between gap-3">
				<p className="pt-1 text-[12px] font-medium text-muted-foreground sm:text-[12px]">{metric.label}</p>
				<div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg shadow-sm", tones[metric.tone])}>
					<Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.9} />
				</div>
			</div>
			<p className="mt-4 text-[22px] font-semibold tracking-[-0.04em] tabular-nums text-card-foreground sm:text-[24px]">
				{formatAmount(value, metric.kind)}
			</p>
			<div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px]">
				<span className={cn(
					"rounded-md border px-1.5 py-0.5 font-semibold tabular-nums",
					change === null ? "border-border bg-muted text-muted-foreground" :
						positive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
							"border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
				)}>
					{change === null ? "—" : `${positive ? "+" : ""}${change.toFixed(1)}%`}
				</span>
				<span className="text-muted-foreground">vs. previous period</span>
			</div>
		</article>
	);
}
