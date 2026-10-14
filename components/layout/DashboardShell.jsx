
"use client";

import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import {
    SidebarProvider,
    useSidebar,
} from "@/components/layout/SidebarProvider";

function DashboardContent({ children }) {
    const { collapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main
                className={cn(
                    "min-h-screen min-w-0",
                    "transition-[margin-left] duration-300 ease-in-out",
                    collapsed ? "lg:ml-[72px]" : "lg:ml-64"
                )}
            >
                {children}
            </main>
        </div>
    );
}

export default function DashboardShell({ children }) {
    return (
        <SidebarProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </SidebarProvider>
    );
}
