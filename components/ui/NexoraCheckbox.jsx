"use client";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
/** Shared controlled checkbox, consistent in both themes.
 * TODO(API): Selection is transient UI state, not persisted to the database.
 * For bulk actions, send selected IDs to a tenant-scoped authorized Node.js endpoint.
 */
export default function NexoraCheckbox({checked=false,indeterminate=false,onChange,label,disabled=false,className=""}) {
  return <label className={cn("inline-flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-md focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",disabled&&"cursor-not-allowed opacity-45",className)}>
    <input type="checkbox" className="peer sr-only" checked={Boolean(checked)} ref={node=>{if(node)node.indeterminate=Boolean(indeterminate)}} disabled={disabled} aria-label={label} onChange={event=>onChange?.(event.target.checked)} />
    <span aria-hidden="true" className={cn("flex size-[17px] items-center justify-center rounded-[5px] border border-input bg-background text-primary-foreground transition-[background-color,border-color] duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40",(checked||indeterminate)&&"border-primary bg-primary")}>{indeterminate?<Minus className="size-3" strokeWidth={2.5}/>:checked?<Check className="size-3" strokeWidth={2.5}/>:null}</span>
  </label>;
}
