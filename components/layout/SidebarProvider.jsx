
"use client";

import {
    createContext,
    useContext,
    useState,
} from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    // Shared mobile drawer state.
    // Both Sidebar and DashboardHeader can control it.
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <SidebarContext.Provider
            value={{
                collapsed,
                setCollapsed,
                mobileOpen,
                setMobileOpen,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error(
            "useSidebar must be used inside SidebarProvider"
        );
    }

    return context;
}
