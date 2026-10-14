
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SidebarProfile from "@/components/layout/SidebarProfile";

import {
    Target,
    Search,
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    X,
} from "lucide-react";

import {
    sidebarMenu,
    workspace,
    currentUser,
} from "@/data/sidebar-menu";

import { useSidebar } from "@/components/layout/SidebarProvider";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

/* ---------------------------------------
   ROUTE HELPERS
---------------------------------------- */

function isActiveRoute(pathname, href) {
    if (!href) return false;

    return (
        pathname === href ||
        pathname.startsWith(`${href}/`)
    );
}

/* ---------------------------------------
   WORKSPACE BRAND
---------------------------------------- */

function WorkspaceHeader({
    collapsed,
    isMobile,
    onCollapse,
    onNavigate,
}) {
    const [workspaceOpen, setWorkspaceOpen] = useState(false);

    return (
        <div
            className={cn(
                "relative flex h-[84px] shrink-0",
                "items-center border-b border-slate-100",
                collapsed ? "justify-center px-2" : "px-4"
            )}
        >
            <button
                type="button"
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                aria-expanded={workspaceOpen}
                aria-label="Workspace information"
                className={cn(
                    "group flex min-w-0 items-center",
                    "rounded-xl p-1.5 text-left",
                    "transition-colors duration-200",
                    "hover:bg-slate-50",
                    collapsed ? "justify-center" : "flex-1 gap-3"
                )}
            >
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center",
                        "justify-center rounded-xl",
                        "bg-slate-950 text-white",
                        "shadow-sm transition-transform duration-200",
                        "group-hover:scale-[1.04]"
                    )}
                >
                    <Target
                        className="h-5 w-5"
                        strokeWidth={1.8}
                    />
                </div>

                {!collapsed && (
                    <>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-bold tracking-[-0.3px] text-slate-950">
                                {workspace.name}
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                {workspace.type}
                            </p>
                        </div>

                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                    </>
                )}
            </button>

            {workspaceOpen && !collapsed && (
                <div
                    className={cn(
                        "absolute left-4 right-4 top-[74px] z-30",
                        "rounded-xl border border-slate-200",
                        "bg-white p-3 shadow-lg"
                    )}
                >
                    <p className="text-xs font-semibold text-slate-900">
                        {workspace.name} {workspace.type}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Current workspace
                    </p>
                </div>
            )}

            {!isMobile && (
                <button
                    type="button"
                    onClick={onCollapse}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className={cn(
                        "absolute top-[70px] z-20",
                        "flex h-7 w-7 items-center",
                        "justify-center rounded-lg",
                        "border border-slate-200",
                        "bg-white text-slate-500 shadow-sm",
                        "transition-colors hover:bg-slate-50",
                        collapsed ? "right-[-13px]" : "right-[-13px]"
                    )}
                >
                    {collapsed ? (
                        <PanelLeftOpen className="h-3.5 w-3.5" />
                    ) : (
                        <PanelLeftClose className="h-3.5 w-3.5" />
                    )}
                </button>
            )}
        </div>
    );
}

/* ---------------------------------------
   SEARCH
---------------------------------------- */

function SidebarSearch({ value, onChange }) {
    return (
        <div className="px-3 pb-2 pt-3">
            <div className="relative">
                <Search
                    className={cn(
                        "absolute left-3 top-1/2",
                        "h-4 w-4 -translate-y-1/2",
                        "text-slate-400"
                    )}
                />

                <input
                    type="search"
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder="Search navigation..."
                    aria-label="Search navigation"
                    className={cn(
                        "h-[34px] w-full rounded-md",
                        "border border-sidebar-border",
                        "bg-sidebar pl-9 pr-3",
                        "text-[11px] text-foreground",
                        "outline-none",
                        "placeholder:text-muted-foreground",
                        "transition-colors duration-150",
                        "hover:border-primary/30",
                        "focus:border-primary",
                        "focus:ring-2 focus:ring-primary/10"
                    )}
                />
            </div>
        </div>
    );
}

/* ---------------------------------------
   SINGLE NAVIGATION ITEM
---------------------------------------- */

function NavigationItem({
    item,
    pathname,
    collapsed,
    onNavigate,
    onExpandSidebar,
}) {
    const active = isActiveRoute(pathname, item.href);
    const [expanded, setExpanded] = useState(false);

    const Icon = item.icon;

    const itemClasses = cn(
        "group relative flex h-[34px] w-full",
        "items-center rounded-md text-left",
        "transition-colors duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-sidebar-ring/30",

        collapsed
            ? "justify-center px-2"
            : "gap-2.5 px-2.5",

        active
            ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
            : "font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
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
                <span className="absolute bottom-1.5 left-0 top-1.5 w-[2px] rounded-r-full bg-sidebar-primary" />
            )}


            <Icon
                strokeWidth={1.8}
                className={cn(
                    "h-4 w-4 shrink-0",
                    "transition-colors duration-150",
                    active
                        ? "text-sidebar-primary"
                        : "text-[#52615B] group-hover:text-foreground"
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
                                "transition-transform duration-150",
                                expanded && "rotate-90"
                            )}
                        />
                    )}
                </>
            )}
        </>
    );

    return (
        <div>
            {item.expandable ? (
                <button
                    type="button"
                    title={collapsed ? item.title : undefined}
                    aria-expanded={expanded}
                    onClick={handleExpandableClick}
                    className={itemClasses}
                >
                    {content}
                </button>
            ) : (
                <Link
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={itemClasses}
                >
                    {content}
                </Link>
            )}

            {item.expandable && expanded && !collapsed && (
                <div className="ml-[18px] border-l border-sidebar-border pl-3 py-0.5">
                    <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex h-[30px] items-center",
                            "rounded-md px-2.5",
                            "text-[11px] font-medium",
                            "transition-colors duration-150",
                            active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-foreground/75 hover:bg-sidebar-accent/60 hover:text-foreground"
                        )}
                    >
                        All {item.title}
                    </Link>
                </div>
            )}
        </div>
    );
}


/* ---------------------------------------
   NAVIGATION SECTION
---------------------------------------- */

function NavigationSection({
    section,
    pathname,
    collapsed,
    onNavigate,
    onExpandSidebar,
}) {
    return (
        <div className="mb-3">
            {!collapsed && (
                <div className="mb-[5px] px-2.5">

                    <h3 className="text-[10px] font-semibold tracking-[0.02em] text-[#52615B]">
                        {section.section}
                    </h3>

                </div>
            )}

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


/* ---------------------------------------
   SIDEBAR CONTENT
---------------------------------------- */

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
        <div className="flex h-full min-h-0 flex-col bg-white">
            <WorkspaceHeader
                collapsed={collapsed}
                isMobile={isMobile}
                onCollapse={onCollapse}
                onNavigate={onNavigate}
            />

            {!collapsed && (
                <SidebarSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            )}

            <nav
                aria-label="CRM navigation"
                className={cn(
                    "min-h-0 flex-1 overflow-y-auto",
                    "overscroll-contain",
                    "scrollbar-thin",
                    "[scrollbar-color:#cbd5e1_transparent]",
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
                        <Search className="mx-auto mb-3 h-5 w-5 text-slate-300" />

                        <p className="text-xs text-slate-500">
                            No matching navigation items
                        </p>
                    </div>
                )}
            </nav>


            <SidebarProfile
                collapsed={collapsed}
                onNavigate={onNavigate}
            />

        </div>
    );
}

/* ---------------------------------------
   SIDEBAR WRAPPER
---------------------------------------- */

export default function Sidebar() {
    const { collapsed, setCollapsed } = useSidebar();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40",
                    "hidden border-r border-slate-200",
                    "bg-white lg:block",
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

            {/* Mobile Menu Button */}
            <div className="fixed left-3 top-3 z-40 lg:hidden">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Open navigation"
                    onClick={() => setMobileOpen(true)}
                    className="h-10 w-10 border-slate-200 bg-white shadow-sm"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile Drawer - Base UI */}
            <Sheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
            >
                <SheetContent
                    side="left"
                    showCloseButton={false}
                    className="w-64 max-w-[85vw] border-r border-slate-200 bg-white p-0"
                >
                    <SheetTitle className="sr-only">
                        Nexora CRM Navigation
                    </SheetTitle>

                    <SheetDescription className="sr-only">
                        Navigate through Nexora CRM modules
                    </SheetDescription>

                    <div className="relative h-full">
                        <SidebarContent
                            isMobile
                            onNavigate={() => setMobileOpen(false)}
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Close navigation"
                            onClick={() => setMobileOpen(false)}
                            className="absolute right-3 top-6 h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
