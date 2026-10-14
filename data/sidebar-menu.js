
import {
    LayoutDashboard,
    ChartNoAxesCombined,
    Target,
    UsersRound,
    Building2,
    Handshake,
    Fingerprint,
    Activity,
    CalendarDays,
    UserRound,
    Settings2
} from "lucide-react";

export const sidebarMenu = [
    {
        section: "Overview",
        items: [
            {
                id: "dashboard",
                title: "Dashboard",
                icon: LayoutDashboard,
                href: "/dashboard",
            },
        ],
    },
    {
        section: "Analytics",
        items: [
            {
                id: "reports",
                title: "Reports",
                icon: ChartNoAxesCombined,
                href: "/reports",
            },
        ],
    },
    {
        section: "CRM",
        items: [
            {
                id: "leads",
                title: "Leads",
                icon: Target,
                href: "/leads",
                expandable: true,
            },
            {
                id: "contacts",
                title: "Contacts",
                icon: UsersRound,
                href: "/contacts",
            },
            {
                id: "companies",
                title: "Companies",
                icon: Building2,
                href: "/companies",
            },
            {
                id: "deals",
                title: "Deals",
                icon: Handshake,
                href: "/deals",
                expandable: true,
            },
        ],
    },
    {
        section: "Authentication",
        items: [
            {
                id: "auth",
                title: "Auth",
                icon: Fingerprint,
                href: "/auth",
                expandable: true,
            },
        ],
    },
    {
        section: "Engagement",
        items: [
            {
                id: "activities",
                title: "Activities",
                icon: Activity,
                href: "/activities",
            },
            {
                id: "calendar",
                title: "Calendar",
                icon: CalendarDays,
                href: "/calendar",
            },
        ],
    },
    {
        section: "Workspace",
        items: [
            {
                id: "team",
                title: "Team",
                icon: UserRound,
                href: "/team",
            },
        ],
    },
    {
        section: "Settings",
        items: [
            {
                id: "settings",
                title: "Settings",
                icon: Settings2,
                href: "/settings",
            },
        ],
    },
];

export const workspace = {
    name: "Nexora",
    type: "CRM",
};

export const currentUser = {
    name: "Alex Morgan",
    email: "alex@nexora.dev",
    initials: "AM",
};
