"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayLeadName, initials } from "@/data/leads-demo";

const sizeClass = {
  xs: "size-8 text-[11px]",
  sm: "size-9 text-[11px]",
  md: "size-11 text-[13px]",
  lg: "size-14 text-[17px]",
};

/**
 * Shared lead avatar (list, board, details, forms): a lead's image is ALWAYS
 * taken from lead.profileImage. Initials are used for missing/broken URLs.
 * TODO(API): lead.profileImage comes from GET /api/leads and GET /api/leads/:id
 * as { fileId, url, path }. No separate image lookup for each UI surface.
 */
export default function LeadAvatar({ lead, size = "sm", preview = false, className = "" }) {
  const name = displayLeadName(lead || { firstName: "", lastName: "" }) || "Lead";
  const url = lead?.profileImage?.url || "";
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setFailed(false), [url]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const hasImage = Boolean(url && !failed);
  const content = <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted font-semibold text-muted-foreground", sizeClass[size] || sizeClass.sm, className)}>
    {hasImage ? <img src={url} alt={name} className="size-full object-cover" onError={() => setFailed(true)} referrerPolicy="no-referrer" /> : initials(name)}
    {preview && hasImage && <ZoomIn className="absolute bottom-0 right-0 size-3 rounded-full bg-background text-foreground" aria-hidden="true" />}
  </span>;
  return <>
    {preview && hasImage ? <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} aria-label={`Preview ${name}'s photo`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-ring">{content}</button> : content}
    {open && hasImage && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label={`${name} profile image`} className="relative max-h-[90dvh] max-w-[min(90vw,760px)] rounded-xl border border-border bg-card p-3 shadow-xl">
        <button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close preview" className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 text-foreground hover:bg-muted"><X className="size-4" /></button>
        <img src={url} alt={`${name} profile`} className="max-h-[78dvh] max-w-full rounded-lg object-contain" />
        <p className="mt-2 pr-10 text-[12px] font-medium text-foreground">{name}</p>
      </div>
    </div>}
  </>;
}
