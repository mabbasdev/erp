
"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import Link from "next/link";

import {
    PanelLeft,
    Search,
    Bell,
    Plus,
    ChevronDown,
    Command,
    Target,
    Handshake,
    UsersRound,
    X,
    Menu,
    CheckCheck,
    ClipboardList,
    CreditCard,
    CalendarClock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { sidebarMenu } from "@/data/sidebar-menu";
import { useSidebar } from "@/components/layout/SidebarProvider";
import AnimatedPopover from "@/components/layout/AnimatedPopover";

/* ============================================
   CONFIGURATION
============================================ */

const createActions = [
    {
        title: "New Lead",
        href: "/leads/create",
        icon: Target,
    },
    {
        title: "New Deal",
        href: "/deals/create",
        icon: Handshake,
    },
    {
        title: "New Contact",
        href: "/contacts/create",
        icon: UsersRound,
    },
];

const allNavigationItems = sidebarMenu.flatMap(
    (section) => section.items
);

/* ============================================
   SHARED POPOVER BEHAVIOR
============================================ */

function useDismissiblePopover() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        function handleOutside(event) {
            if (!containerRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", handleOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    return {
        open,
        setOpen,
        containerRef,
        triggerRef,
    };
}

/* ============================================
   PAGE TITLE RESOLVER
============================================ */

function getPageTitle(pathname) {
    const matched = allNavigationItems
        .filter((item) => item.href)
        .sort((a, b) => b.href.length - a.href.length)
        .find(
            (item) =>
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
        );

    if (matched) return matched.title;

    const segment = pathname.split("/").filter(Boolean).at(-1);

    if (!segment) return "Dashboard";

    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* ============================================
   NAVIGATION SEARCH
============================================ */

function HeaderSearch() {
    const router = useRouter();

    const {
        open,
        setOpen,
        containerRef,
        triggerRef,
    } = useDismissiblePopover();

    const [query, setQuery] = useState("");
    const inputRef = useRef(null);

    const results = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return allNavigationItems.slice(0, 6);
        }

        return allNavigationItems.filter((item) =>
            item.title.toLowerCase().includes(term)
        );
    }, [query]);

    useEffect(() => {
        function handleShortcut(event) {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();
                setOpen(true);
            }
        }

        window.addEventListener("keydown", handleShortcut);

        return () => {
            window.removeEventListener("keydown", handleShortcut);
        };
    }, [setOpen]);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        } else {
            setQuery("");
        }
    }, [open]);

    function navigateTo(href) {
        setOpen(false);
        setQuery("");
        router.push(href);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="Search navigation"
                aria-expanded={open}
                className={cn(
                    "flex h-8 w-8 items-center justify-center gap-2",
                    "rounded-md border border-border",
                    "bg-background sm:justify-start sm:px-2.5",
                    "text-muted-foreground",
                    "nexora-menu-item",
                    "hover:border-primary/25",
                    "hover:text-foreground",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring/30",
                    "sm:w-44 lg:w-56 xl:w-64"
                )}
            >
                <Search className="h-3.5 w-3.5 shrink-0" />

                <span className="hidden flex-1 text-left text-[11px] sm:block">
                    Search...
                </span>

                <span className="hidden items-center gap-0.5 rounded border border-border px-1 py-0.5 text-[9px] md:flex">
                    <Command className="h-2.5 w-2.5" />
                    K
                </span>
            </button>

            <AnimatedPopover
                open={open}
                className={cn(
                    "fixed left-3 right-3 top-[64px]",
                    "w-auto sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[288px]",
                    "overflow-hidden"
                )}
            >
                <div className="flex items-center gap-2 border-b border-border px-3">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />

                    <input
                        ref={inputRef}
                        type="search"
                        tabIndex={open ? 0 : -1}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && results[0]) {
                                navigateTo(results[0].href);
                            }
                        }}
                        placeholder="Search modules..."
                        aria-label="Search modules"
                        className={cn(
                            "h-10 min-w-0 flex-1",
                            "bg-transparent text-[11px]",
                            "text-popover-foreground",
                            "outline-none",
                            "placeholder:text-muted-foreground"
                        )}
                    />

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close search"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="nexora-scrollbar max-h-60 overflow-y-auto p-1.5">
                    {results.length > 0 ? (
                        results.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => navigateTo(item.href)}
                                    className={cn(
                                        "nexora-menu-item",
                                        "flex h-8 w-full items-center gap-2.5",
                                        "rounded-md px-2.5 text-left",
                                        "text-[11px] text-popover-foreground",
                                        "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{item.title}</span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                            No matching modules
                        </p>
                    )}
                </div>
            </AnimatedPopover>
        </div>
    );
}

/* ============================================
   NOTIFICATIONS
============================================ */

const demoNotifications = [
    { id: 1, title: "New lead assigned", description: "A new lead is waiting for your review.", time: "2m", type: "lead", unread: true },
    { id: 2, title: "Payment recorded", description: "A payment has been added to the activity log.", time: "18m", type: "billing", unread: true },
    { id: 3, title: "Follow-up reminder", description: "Three contacts are due for follow-up.", time: "1h", type: "reminder", unread: false },
    { id: 4, title: "Team update", description: "The monthly pipeline notes were updated.", time: "Today", type: "team", unread: false },
];

const notificationIcons = {
    lead: Target,
    billing: CreditCard,
    reminder: CalendarClock,
    team: UsersRound,
};

function HeaderNotifications() {
    const { open, setOpen, containerRef, triggerRef } = useDismissiblePopover();
    // Demo-only state. Connect to a notifications API when a backend is available.
    const [notifications, setNotifications] = useState(demoNotifications);
    const [filter, setFilter] = useState("all");
    const unreadCount = notifications.filter((item) => item.unread).length;
    const visible = notifications.filter((item) => filter === "all" || item.unread);

    function markRead(id) {
        setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item));
    }

    function markAllRead() {
        setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    "nexora-menu-item relative flex h-8 w-8 items-center justify-center rounded-md",
                    "text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                )}
            >
                <Bell className="h-4 w-4" strokeWidth={1.8} />
                {unreadCount > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>

            <AnimatedPopover
                open={open}
                className="fixed left-3 right-3 top-[64px] w-auto overflow-hidden sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[320px]"
            >
                <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-2.5">
                    <div>
                        <h3 className="text-[12px] font-semibold text-popover-foreground">Notifications</h3>
                        <p className="text-[10px] text-muted-foreground">{unreadCount} unread</p>
                    </div>
                    <button type="button" onClick={markAllRead} disabled={unreadCount === 0}
                        className="nexora-menu-item inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-primary hover:bg-accent disabled:cursor-default disabled:opacity-40">
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                </div>
                <div className="flex gap-1 border-b border-border px-2 py-1.5">
                    {["all", "unread"].map((value) => (
                        <button key={value} type="button" onClick={() => setFilter(value)}
                            aria-pressed={filter === value}
                            className={cn("nexora-menu-item rounded-md px-2.5 py-1 text-[10px] font-medium capitalize",
                                filter === value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted")}
                        >{value === "all" ? "All" : `Unread (${unreadCount})`}</button>
                    ))}
                </div>
                <div className="nexora-scrollbar max-h-[min(360px,55dvh)] overflow-y-auto p-1.5">
                    {visible.length === 0 ? (
                        <p className="px-3 py-7 text-center text-[11px] text-muted-foreground">No notifications in this view.</p>
                    ) : visible.map((item) => {
                        const Icon = notificationIcons[item.type] || ClipboardList;
                        return (
                            <button key={item.id} type="button" onClick={() => markRead(item.id)}
                                className={cn("nexora-menu-item flex w-full items-start gap-2.5 rounded-md px-2 py-2.5 text-left hover:bg-accent", item.unread && "bg-accent/50")}
                                aria-label={`${item.title}${item.unread ? ", mark as read" : ", read"}`}>
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                                    <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-start justify-between gap-2">
                                        <span className="text-[11px] font-semibold leading-4 text-popover-foreground">{item.title}</span>
                                        <span className="shrink-0 text-[9px] text-muted-foreground">{item.time}</span>
                                    </span>
                                    <span className="mt-0.5 block text-[10px] leading-[1.55] text-muted-foreground">{item.description}</span>
                                </span>
                                {item.unread && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                            </button>
                        );
                    })}
                </div>
            </AnimatedPopover>
        </div>
    );
}

/* ============================================
   CREATE MENU
============================================ */

function HeaderCreate() {
    const {
        open,
        setOpen,
        containerRef,
        triggerRef,
    } = useDismissiblePopover();

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    "nexora-menu-item",
                    "flex h-8 items-center justify-center gap-1.5",
                    "rounded-full bg-foreground px-3.5",
                    "text-[11px] font-semibold text-background",
                    "hover:bg-foreground/90",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring/30"
                )}
            >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Create</span>

                <ChevronDown
                    className={cn(
                        "hidden h-3 w-3 opacity-70 sm:block",
                        "transition-transform duration-150",
                        open && "rotate-180"
                    )}
                />
            </button>

            <AnimatedPopover
                open={open}
                className="fixed right-3 top-[64px] w-44 p-1 sm:absolute sm:right-0 sm:top-[calc(100%+8px)]"
            >
                <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">
                    Quick Create
                </p>

                {createActions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.title}
                            href={action.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "nexora-menu-item",
                                "flex h-8 items-center gap-2",
                                "rounded-md px-2.5",
                                "text-[11px] font-medium",
                                "text-popover-foreground",
                                "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {action.title}
                        </Link>
                    );
                })}
            </AnimatedPopover>
        </div>
    );
}


/* ============================================
   RESPONSIVE APPLICATION NAVBAR
============================================ */

export default function DashboardHeader() {
    const pathname = usePathname();

    const {
        collapsed,
        setCollapsed,
        setMobileOpen,
    } = useSidebar();

    const pageTitle = getPageTitle(pathname);

    return (
        <header
            className={cn(
                "relative z-30 flex shrink-0",
                "h-14 sm:h-[60px] lg:h-16",
                "items-center justify-between",
                "gap-2 border-b border-border",
                "bg-card text-card-foreground",
                "px-3 sm:px-4 lg:px-5"
            )}
        >
            {/* ====================================
			    LEFT NAVIGATION
			==================================== */}

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                {/* Mobile sidebar trigger */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation"
                    className={cn(
                        "nexora-menu-item",
                        "flex h-8 w-8 shrink-0",
                        "items-center justify-center",
                        "rounded-md text-foreground",
                        "hover:bg-accent",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-ring/30",
                        "lg:hidden"
                    )}
                >
                    <Menu className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </button>

                {/* Desktop sidebar control */}
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className={cn(
                        "nexora-menu-item",
                        "hidden h-8 w-8 shrink-0",
                        "items-center justify-center",
                        "rounded-md text-foreground",
                        "hover:bg-accent",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-ring/30",
                        "lg:flex"
                    )}
                >
                    <PanelLeft
                        className="h-[17px] w-[17px]"
                        strokeWidth={1.8}
                    />
                </button>

                {/* Visual separator */}
                <div className="h-5 w-px shrink-0 bg-border" />

                {/* Current module */}
                <h2
                    className={cn(
                        "min-w-0 truncate",
                        "text-[13px] font-semibold",
                        "text-foreground sm:text-[14px]",
                        "max-[350px]:max-w-[96px]"
                    )}
                >
                    {pageTitle}
                </h2>
            </div>

            {/* ====================================
			    RIGHT NAVBAR ACTIONS
			==================================== */}

            <div
                className={cn(
                    "flex shrink-0 items-center",
                    "gap-1 sm:gap-2 lg:gap-3"
                )}
            >
                <HeaderSearch />
                <HeaderNotifications />
                <HeaderCreate />
            </div>
        </header>
    );
}
