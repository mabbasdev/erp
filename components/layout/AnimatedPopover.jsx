
"use client";

import { cn } from "@/lib/utils";

/**
 * Shared floating panel for Nexora CRM.
 *
 * - Animates both opening and closing.
 * - Never introduces a backdrop blur.
 * - Prevents interaction while closed.
 * - Supports accessible reduced-motion preferences.
 * - Keeps all popovers visually consistent.
 */
export default function AnimatedPopover({
    open,
    children,
    className,
    id,
    ...props
}) {
    return (
        <div
            id={id}
            inert={!open}
            aria-hidden={!open}
            data-open={open ? "true" : "false"}
            className={cn(
                "nexora-popover",
                "absolute z-50",
                "rounded-lg border border-border",
                "bg-popover text-popover-foreground",
                "shadow-[0_5px_16px_rgba(0,0,0,0.07)]",
                "dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
