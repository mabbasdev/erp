"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessible compact project-themed select.
 * Input: options [{value:string,label:string}], value:string, onChange(value).
 * TODO(API): options can come from GET /api/team (owners), GET /api/lead-stages,
 * GET /api/lead-sources; normalize API results into this stable option shape.
 * Server must validate selected IDs and allowed stage transitions on mutation.
 */
export default function CompactSelect({ value, onChange, options = [], label = "Select", className, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({top:0,left:0,width:160});
  const id = useId();
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option || "Select..." } : option
  );
  const selectedIndex = normalized.findIndex((option) => String(option.value) === String(value ?? ""));
  const selected = normalized[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => { if (!ref.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => { if (open) optionRefs.current[activeIndex]?.focus(); }, [open, activeIndex]);
  useEffect(() => {
    if (!open) return;
    function locate() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuHeight = Math.min(224, normalized.length * 32 + 8);
      const above = window.innerHeight - rect.bottom < menuHeight + 12 && rect.top > menuHeight;
      setPosition({
        top: above ? rect.top - menuHeight - 5 : rect.bottom + 5,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 160) - 8)),
        width: Math.max(rect.width, 160),
      });
    }
    locate();
    window.addEventListener("resize", locate);
    window.addEventListener("scroll", locate, true);
    return () => { window.removeEventListener("resize", locate); window.removeEventListener("scroll", locate, true); };
  }, [open, normalized.length]);

  function commit(option) { onChange?.(option.value); setOpen(false); triggerRef.current?.focus(); }
  function keyboard(event) {
    if (disabled) return;
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault(); setActiveIndex(Math.max(0, selectedIndex)); setOpen(true); return;
    }
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => (index + (event.key === "ArrowDown" ? 1 : -1) + normalized.length) % normalized.length);
    }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); commit(normalized[activeIndex]); }
    if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
    if (event.key === "End") { event.preventDefault(); setActiveIndex(normalized.length - 1); }
  }

  return (
    <div ref={ref} className={cn("relative min-w-0", className)} onKeyDown={keyboard}>
      <button ref={triggerRef} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        aria-label={label} disabled={disabled}
        onClick={() => { setActiveIndex(Math.max(0, selectedIndex)); setOpen(previous => !previous); }}
        className="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 text-left text-[11px] font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50">
        <span className="truncate">{selected?.label || "Select..."}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-150", open && "rotate-180")} />
      </button>
      {open && createPortal(
        <div ref={menuRef} id={id} role="listbox" aria-label={label}
          style={{top:position.top,left:position.left,width:position.width}}
          className="fixed z-[999] max-h-56 overflow-y-auto overscroll-contain rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[0_10px_28px_rgba(0,0,0,.12)] dark:shadow-[0_12px_28px_rgba(0,0,0,.45)] animate-in fade-in-0 zoom-in-95 duration-150">
          {normalized.map((option, index) => (
            <button key={String(option.value)} ref={element => optionRefs.current[index] = element} type="button" role="option"
              aria-selected={String(option.value) === String(value ?? "")} tabIndex={index === activeIndex ? 0 : -1}
              onMouseEnter={() => setActiveIndex(index)} onClick={() => commit(option)}
              className={cn("flex h-8 w-full items-center justify-between gap-3 rounded-md px-2.5 text-left text-[11px] transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none", String(option.value) === String(value ?? "") && "bg-accent text-accent-foreground")}
            ><span className="truncate">{option.label}</span>{String(option.value) === String(value ?? "") && <Check className="size-3.5 shrink-0" />}</button>
          ))}
        </div>, document.body
      )}
    </div>
  );
}
