
"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error("useSidebar must be used inside SidebarProvider");
    }

    return context;
}
