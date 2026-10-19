
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";


import {
    Target,
    Search,
    ChevronRight,
    ChevronsUpDown,
} from "lucide-react";

import {
    sidebarMenu,
    workspace,
} from "@/data/sidebar-menu";


import AnimatedPopover from "@/components/layout/AnimatedPopover";
import SidebarProfile from "@/components/layout/SidebarProfile";
import { useSidebar } from "@/components/layout/SidebarProvider";
import { cn } from "@/lib/utils";


import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

/* ============================================
   ROUTE HELPERS
============================================ */

function isActiveRoute(pathname, href) {
    if (!href) return false;

    return (
        pathname === href ||
        pathname.startsWith(`${href}/`)
    );
}

/* ============================================
   WORKSPACE HEADER
============================================ */


function WorkspaceHeader({
    collapsed,
    isMobile,
    onCollapse,
}) {
    const [workspaceOpen, setWorkspaceOpen] = useState(false);

    return (
        <div
            className={cn(
                "relative flex h-[76px] shrink-0",
                "items-center border-b border-sidebar-border",
                "bg-sidebar",
                collapsed ? "justify-center px-2" : "px-4"
            )}
        >
            <button
                type="button"
                onClick={() => setWorkspaceOpen((value) => !value)}
                aria-expanded={workspaceOpen}
                aria-label="Workspace information"
                className={cn(
                    "nexora-menu-item",
                    "group flex min-w-0 items-center",
                    "rounded-lg p-1.5 text-left",
                    "hover:bg-sidebar-accent/60",
                    collapsed
                        ? "justify-center"
                        : "flex-1 gap-2.5"
                )}
            >
                <div
                    className={cn(
                        "flex h-9 w-9 shrink-0 items-center",
                        "justify-center rounded-xl",
                        "bg-[#1c1c1c] text-white",
                        "dark:bg-[#292929] dark:text-[#f0f0f0]"
                    )}
                >
                    <Target className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>

                {!collapsed && (
                    <>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold leading-[18px] text-foreground">
                                {workspace.name}
                            </p>

                            <p className="truncate text-[10px] font-medium leading-[15px] text-muted-foreground">
                                {workspace.type}
                            </p>
                        </div>

                        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </>
                )}
            </button>

            {!collapsed && (
                <AnimatedPopover
                    open={workspaceOpen}
                    className="left-4 right-4 top-[66px] p-3"
                >
                    <p className="text-[11px] font-semibold">
                        {workspace.name} {workspace.type}
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                        Current workspace
                    </p>
                </AnimatedPopover>
            )}
        </div>
    );
}


/* ============================================
   SIDEBAR SEARCH
============================================ */

function SidebarSearch({ value, onChange }) {
    return (
        <div className="px-3 pb-2 pt-3">
            <div className="relative">
                <Search
                    className={cn(
                        "absolute left-3 top-1/2",
                        "h-4 w-4 -translate-y-1/2",
                        "text-muted-foreground"
                    )}
                />

                <input
                    type="search"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Search navigation..."
                    aria-label="Search navigation"
                    className={cn(
                        "h-[34px] w-full rounded-md",
                        "border border-sidebar-border",
                        "bg-sidebar pl-9 pr-3",
                        "text-[11px] text-sidebar-foreground",
                        "outline-none",
                        "placeholder:text-muted-foreground",
                        "transition-colors duration-150",
                        "hover:border-primary/30",
                        "focus:border-primary",
                        "focus:ring-2 focus:ring-primary/10",
                        "dark:bg-[#191919]",
                        "dark:hover:border-[#404040]"
                    )}
                />
            </div>
        </div>
    );
}

/* ============================================
   NAVIGATION ITEM
============================================ */


function NavigationItem({
    item,
    pathname,
    collapsed,
    onNavigate,
    onExpandSidebar,
}) {
    const active = item.expandable ? pathname === item.href : isActiveRoute(pathname, item.href);
    const withinSection = isActiveRoute(pathname,item.href);
    const [expanded, setExpanded] = useState(withinSection);
    const Icon = item.icon;

    const itemClasses = cn(
        "nexora-menu-item",
        "group relative flex h-[34px] w-full",
        "items-center rounded-md text-left",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-sidebar-ring/30",

        collapsed
            ? "justify-center px-2"
            : "gap-2.5 px-2.5",

        active
            ? [
                "bg-sidebar-accent font-semibold",
                "text-sidebar-accent-foreground",
                "dark:ring-1 dark:ring-inset dark:ring-white/5",
            ]
            : [
                "font-medium text-sidebar-foreground",
                "hover:bg-sidebar-accent/70",
                "hover:text-sidebar-accent-foreground",
            ]
    );

    function handleExpandableClick() {
        if (collapsed) {
            onExpandSidebar();
        }

        setExpanded((previous) => !previous);
    }

    const content = (
        <>
            {active && (
                <span className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-r-full bg-sidebar-primary" />
            )}

            <Icon
                strokeWidth={1.8}
                className={cn(
                    "h-4 w-4 shrink-0",
                    active
                        ? "text-sidebar-primary dark:text-[#e5e5e5]"
                        : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                )}
            />

            {!collapsed && (
                <>
                    <span className="min-w-0 flex-1 truncate text-[12px]">
                        {item.title}
                    </span>

                    {item.expandable && (
                        <ChevronRight
                            className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                "text-muted-foreground",
                                "transition-transform duration-200",
                                (expanded || withinSection) && "rotate-90"
                            )}
                        />
                    )}
                </>
            )}
        </>
    );

    const navigationElement = item.expandable ? (
        <button
            type="button"
            aria-expanded={expanded}
            title={collapsed ? undefined : item.title}
            onClick={handleExpandableClick}
            className={itemClasses}
        >
            {content}
        </button>
    ) : (
        <Link
            href={item.href}
            title={collapsed ? undefined : item.title}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={itemClasses}
        >
            {content}
        </Link>
    );

    return (
        <div>
            {/* Base UI compatible collapsed tooltip */}

            {collapsed ? (
                <Tooltip>
                    <TooltipTrigger render={navigationElement} />

                    <TooltipContent
                        side="right"
                        sideOffset={10}
                        className={cn(
                            "z-100",
                            "rounded-md border border-border",
                            "bg-popover px-2.5 py-1.5",
                            "text-[11px] font-medium",
                            "text-popover-foreground shadow-sm"
                        )}
                    >
                        {item.title}
                    </TooltipContent>
                </Tooltip>
            ) : (
                navigationElement
            )}

            {/* Animated submenu */}

            {item.expandable && !collapsed && (
                <div
                    className="nexora-accordion"
                    data-open={(expanded || withinSection) ? "true" : "false"}
                    inert={!(expanded || withinSection)}
                    aria-hidden={!(expanded || withinSection)}
                >
                    <div className="nexora-accordion-inner">
                        <div className="ml-[18px] border-l border-sidebar-border py-0.5 pl-3">
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    "nexora-menu-item",
                                    "flex h-[30px] items-center",
                                    "rounded-md px-2.5",
                                    "text-[11px] font-medium",
                                    (pathname === item.href)
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/70"
                                )}
                            >
                                All {item.title}
                            </Link>
                            {item.id === "leads" && [
                                { href: "/leads/pipeline", label: "Pipeline" },
                                { href: "/leads/new", label: "Add Lead" },
                            ].map(sub => <Link key={sub.href} href={sub.href} onClick={onNavigate}
                                className={cn("nexora-menu-item flex h-[30px] items-center rounded-md px-2.5 text-[11px] font-medium hover:bg-sidebar-accent/70", pathname === sub.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground")}>{sub.label}</Link>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


/* ============================================
   NAVIGATION SECTION
============================================ */


/* ============================================
   NAVIGATION SECTION
============================================ */

function NavigationSection({
    section,
    pathname,
    collapsed,
    onNavigate,
    onExpandSidebar,
}) {
    return (
        <div className="mb-3">
            {/* Section heading */}

            {!collapsed && (
                <div className="mb-[5px] px-2.5">
                    <h3
                        className={cn(
                            "text-[10px] font-semibold",
                            "tracking-[0.02em]",
                            "text-muted-foreground"
                        )}
                    >
                        {section.section}
                    </h3>
                </div>
            )}

            {/* Section navigation items */}

            <div className="space-y-px">
                {section.items.map((item) => (
                    <NavigationItem
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                        onExpandSidebar={onExpandSidebar}
                    />
                ))}
            </div>
        </div>
    );
}


/* ============================================
   SIDEBAR CONTENT
============================================ */

function SidebarContent({
    collapsed = false,
    isMobile = false,
    onCollapse,
    onExpandSidebar,
    onNavigate,
}) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return sidebarMenu;

        return sidebarMenu
            .map((section) => ({
                ...section,
                items: section.items.filter(
                    (item) =>
                        item.title.toLowerCase().includes(query) ||
                        section.section.toLowerCase().includes(query)
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [searchQuery]);

    return (
        <div
            className={cn(
                "flex h-full min-h-0 flex-col",
                "bg-sidebar text-sidebar-foreground"
            )}
        >
            <WorkspaceHeader
                collapsed={collapsed}
                isMobile={isMobile}
                onCollapse={onCollapse}
            />

            {!collapsed && (
                <SidebarSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            )}

            {/* Scrollable navigation */}

            <nav
                aria-label="CRM navigation"
                className={cn(
                    "nexora-scrollbar min-h-0 flex-1",
                    "overflow-y-auto overscroll-contain",
                    collapsed
                        ? "px-2 pt-3"
                        : "px-3 pt-2"
                )}
            >
                {filteredSections.map((section) => (
                    <NavigationSection
                        key={section.section}
                        section={section}
                        pathname={pathname}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                        onExpandSidebar={onExpandSidebar}
                    />
                ))}

                {filteredSections.length === 0 && (
                    <div className="px-3 py-10 text-center">
                        <Search className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />

                        <p className="text-xs text-muted-foreground">
                            No matching navigation items
                        </p>
                    </div>
                )}
            </nav>

            {/* Profile always remains accessible */}

            <SidebarProfile
                collapsed={collapsed}
                onNavigate={onNavigate}
            />
        </div>
    );
}

/* ============================================
   RESPONSIVE SIDEBAR
============================================ */

export default function Sidebar() {

    const {
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
    } = useSidebar();



    return (
        <>
            {/* Desktop sidebar */}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40",
                    "hidden lg:block",
                    "border-r border-sidebar-border",
                    "bg-sidebar text-sidebar-foreground",
                    "transition-[width] duration-300 ease-in-out",
                    collapsed ? "w-[72px]" : "w-64"
                )}
            >
                <SidebarContent
                    collapsed={collapsed}
                    onCollapse={() => setCollapsed(!collapsed)}
                    onExpandSidebar={() => setCollapsed(false)}
                />
            </aside>

            {/* Mobile navigation trigger */}



            {/* Mobile drawer — shadcn Base UI */}

            <Sheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
            >
                <SheetContent
                    side="left"
                    showCloseButton={false}
                    className={cn(
                        "w-64 max-w-[85vw] gap-0 p-0",
                        "border-r border-sidebar-border",
                        "bg-sidebar text-sidebar-foreground"
                    )}
                >
                    <SheetTitle className="sr-only">
                        Nexora CRM Navigation
                    </SheetTitle>

                    <SheetDescription className="sr-only">
                        Navigate through Nexora CRM modules
                    </SheetDescription>

                    <div className="relative h-full min-h-0">
                        <SidebarContent
                            isMobile
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
