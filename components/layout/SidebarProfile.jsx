
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
    ChevronsUpDown,
    Palette,
    Sun,
    Moon,
    Monitor,
    Sparkles,
    CircleUserRound,
    CreditCard,
    Bell,
    Settings2,
    LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { currentUser } from "@/data/sidebar-menu";

/* ==========================================
   PROFILE MENU CONFIGURATION
========================================== */

const profileMenu = [
    {
        label: "Account",
        icon: CircleUserRound,
        href: "/account",
    },
    {
        label: "Billing",
        icon: CreditCard,
        href: "/billing",
    },
    {
        label: "Notifications",
        icon: Bell,
        href: "/notifications",
    },
    {
        label: "Settings",
        icon: Settings2,
        href: "/settings",
    },
];

const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
];

/* ==========================================
   THEME SELECTOR
========================================== */

function ThemeSelector({ theme, onChange, ready }) {
    return (
        <div className="flex h-10 items-center justify-between gap-2 px-2.5">
            <div className="flex items-center gap-2">
                <Palette
                    className="h-[15px] w-[15px] text-foreground/80"
                    strokeWidth={1.8}
                />

                <span className="text-[11px] font-medium text-foreground">
                    Theme
                </span>
            </div>

            <div
                role="group"
                aria-label="Theme preference"
                className={cn(
                    "flex items-center gap-0.5",
                    "rounded-md border border-border",
                    "bg-muted/40 p-0.5"
                )}
            >
                {themes.map((option) => {
                    const Icon = option.icon;
                    const selected = theme === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={!ready}
                            title={option.label}
                            aria-label={`${option.label} theme`}
                            aria-pressed={selected}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "flex h-6 w-6 items-center justify-center",
                                "rounded-[5px]",
                                "focus-visible:outline-none",
                                "focus-visible:ring-2 focus-visible:ring-ring",
                                selected
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-foreground/75 hover:text-foreground"
                            )}
                        >
                            <Icon
                                className="h-3.5 w-3.5"
                                strokeWidth={1.8}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ==========================================
   PROFILE AVATAR
========================================== */

function ProfileAvatar({ size = "sm" }) {
    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center",
                "rounded-full bg-[#DCEEE8]",
                "font-semibold text-[#176B57]",
                "dark:bg-[#254D40] dark:text-[#B2E6CF]",
                size === "lg"
                    ? "h-9 w-9 text-[11px]"
                    : "h-8 w-8 text-[10px]"
            )}
        >
            {currentUser.initials}
        </div>
    );
}

/* ==========================================
   SIDEBAR PROFILE
========================================== */

export default function SidebarProfile({
    collapsed = false,
    onNavigate,
}) {
    /* --------------------------------------
       DROPDOWN STATE
    -------------------------------------- */

    const [open, setOpen] = useState(false);

    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    /* --------------------------------------
       THEME STATE
       Hooks must remain inside component
    -------------------------------------- */

    const [theme, setTheme] = useState("system");
    const [themeReady, setThemeReady] = useState(false);

    /* Read saved theme once */

    useEffect(() => {
        const saved = localStorage.getItem("nexora-theme");

        if (["light", "dark", "system"].includes(saved)) {
            setTheme(saved);
        }

        setThemeReady(true);
    }, []);

    /* Apply theme and monitor system changes */

    useEffect(() => {
        if (!themeReady) return;

        const media = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        function applyTheme() {
            const dark =
                theme === "dark" ||
                (theme === "system" && media.matches);

            document.documentElement.classList.toggle(
                "dark",
                dark
            );
        }

        applyTheme();

        media.addEventListener("change", applyTheme);

        return () => {
            media.removeEventListener("change", applyTheme);
        };
    }, [theme, themeReady]);

    /* Handle theme selection */

    function changeTheme(value) {
        setTheme(value);
        localStorage.setItem("nexora-theme", value);
    }

    /* --------------------------------------
       CLOSE ON OUTSIDE CLICK / ESCAPE
    -------------------------------------- */

    useEffect(() => {
        if (!open) return;

        function handleOutsideClick(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener(
            "pointerdown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [open]);

    function closeMenu() {
        setOpen(false);
        onNavigate?.();
    }

    /* --------------------------------------
       COMPONENT JSX
    -------------------------------------- */

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative z-50 shrink-0",
                "border-t border-sidebar-border",
                "bg-sidebar",
                collapsed ? "p-2" : "p-2.5"
            )}
        >
            {/* PROFILE TRIGGER */}

            <button
                ref={triggerRef}
                type="button"
                aria-label="User profile menu"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={
                    open ? "nexora-profile-menu" : undefined
                }
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    "flex h-[49px] w-full items-center",
                    "rounded-lg border text-left",
                    "transition-colors duration-150",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-ring/40",
                    collapsed
                        ? "justify-center border-transparent p-1"
                        : "gap-2 border-sidebar-border px-2",
                    open
                        ? "bg-sidebar-accent border-sidebar-border"
                        : "bg-sidebar hover:bg-sidebar-accent/50"
                )}
            >
                <ProfileAvatar />

                {!collapsed && (
                    <>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[11.5px] font-semibold leading-[17px] text-foreground">
                                {currentUser.name}
                            </p>

                            <p className="truncate text-[10px] leading-[15px] text-muted-foreground">
                                {currentUser.email}
                            </p>
                        </div>

                        <ChevronsUpDown
                            className="h-3.5 w-3.5 shrink-0 text-foreground/65"
                            strokeWidth={1.8}
                        />
                    </>
                )}
            </button>

            {/* COMPACT PROFILE DROPDOWN */}

            {open && (
                <div
                    id="nexora-profile-menu"
                    className={cn(
                        "absolute bottom-full z-50 mb-2",
                        "w-[244px] max-w-[calc(100vw-20px)]",
                        "overflow-hidden rounded-[10px]",
                        "border border-border",
                        "bg-popover text-popover-foreground",
                        "shadow-[0_8px_24px_rgba(17,35,29,0.10)]",
                        "dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
                        collapsed
                            ? "left-[calc(100%+8px)] bottom-0 mb-0"
                            : "left-2.5"
                    )}
                >
                    {/* USER DETAILS */}

                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                        <ProfileAvatar size="lg" />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[11.5px] font-semibold leading-[17px] text-foreground">
                                {currentUser.name}
                            </p>

                            <p className="truncate text-[10px] leading-[15px] text-muted-foreground">
                                {currentUser.email}
                            </p>
                        </div>
                    </div>

                    <div className="mx-2 border-t border-border" />

                    {/* THEME SELECTOR */}

                    <ThemeSelector
                        theme={theme}
                        onChange={changeTheme}
                        ready={themeReady}
                    />

                    {/* UPGRADE TO PRO */}

                    <div className="px-1.5 pb-1">
                        <Link
                            href="/upgrade"
                            onClick={closeMenu}
                            className={cn(
                                "flex h-8 items-center gap-2",
                                "rounded-md px-2.5",
                                "text-[11px] font-medium text-foreground",
                                "hover:bg-accent",
                                "focus-visible:outline-none",
                                "focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                        >
                            <Sparkles
                                className="h-[15px] w-[15px] text-primary"
                                strokeWidth={1.8}
                            />

                            <span>Upgrade to Pro</span>
                        </Link>
                    </div>

                    <div className="mx-2 border-t border-border" />

                    {/* ACCOUNT MENU */}

                    <div className="space-y-0.5 px-1.5 py-1.5">
                        {profileMenu.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={closeMenu}
                                    className={cn(
                                        "flex h-8 items-center gap-2",
                                        "rounded-md px-2.5",
                                        "text-[11px] font-medium text-foreground",
                                        "hover:bg-accent",
                                        "hover:text-accent-foreground",
                                        "focus-visible:outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-ring"
                                    )}
                                >
                                    <Icon
                                        className="h-[15px] w-[15px] shrink-0 text-foreground/75"
                                        strokeWidth={1.8}
                                    />

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mx-2 border-t border-border" />

                    {/* LOGOUT PLACEHOLDER */}

                    <div className="px-1.5 py-1.5">
                        <button
                            type="button"
                            disabled
                            title="Available when authentication is implemented"
                            className={cn(
                                "flex h-8 w-full items-center gap-2",
                                "cursor-not-allowed rounded-md px-2.5",
                                "text-left text-[11px] font-medium",
                                "text-red-600 opacity-65",
                                "dark:text-red-400"
                            )}
                        >
                            <LogOut
                                className="h-[15px] w-[15px]"
                                strokeWidth={1.8}
                            />

                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
