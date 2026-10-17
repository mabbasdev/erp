"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared dashboard period menu. A real button/menu, not an OS-native select.
 * TODO(API): period changes currently drive demo selectors; later use the value
 * as an API query parameter, with server-side authorization and validation.
 */
export default function CompactSelect({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const id = useId();
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return (
    <div ref={root} className="relative shrink-0">
      <button ref={trigger} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)}
        className="nexora-menu-item inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[10px] font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40">
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className={cn("size-3 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div id={id} role="menu" aria-label={label} inert={!open} data-open={open} className={cn(
        "nexora-popover absolute right-0 top-[calc(100%+6px)] z-50 w-max min-w-[126px] max-w-[calc(100vw-32px)] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_20px_rgba(0,0,0,.14)] dark:shadow-[0_8px_20px_rgba(0,0,0,.35)]"
      )}>
        {options.map(option => <button key={option.value} type="button" role="menuitemradio" aria-checked={value === option.value}
          onClick={() => { onChange(option.value); setOpen(false); trigger.current?.focus(); }}
          className={cn("nexora-menu-item flex h-8 w-full items-center justify-between gap-3 rounded-md px-2.5 text-left text-[10px] font-medium outline-none hover:bg-accent focus-visible:bg-accent", value === option.value && "bg-accent text-accent-foreground")}>
          {option.label}<Check className={cn("size-3.5", value !== option.value && "invisible")} />
        </button>)}
      </div>
    </div>
  );
}
