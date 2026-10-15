
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "nexora-theme";
const VALID_THEMES = ["light", "dark", "system"];

function applyTheme(theme) {
    const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    const isDark =
        theme === "dark" ||
        (theme === "system" && systemDark);

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme =
        isDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("system");
    const [ready, setReady] = useState(false);

    // Load the user's saved preference once.
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (VALID_THEMES.includes(saved)) {
                setTheme(saved);
            }
        } catch {
            // Storage may be unavailable in some browsers.
        }

        setReady(true);
    }, []);

    // Keep the document synchronized with theme changes.
    useEffect(() => {
        if (!ready) return;

        const media = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        const update = () => applyTheme(theme);

        update();

        media.addEventListener("change", update);

        return () => {
            media.removeEventListener("change", update);
        };
    }, [theme, ready]);

    function changeTheme(value) {
        if (!VALID_THEMES.includes(value)) return;

        // Apply immediately to avoid delayed color changes.
        applyTheme(value);
        setTheme(value);

        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // Theme switching still works without storage.
        }
    }

    return (
        <ThemeContext.Provider
            value={{ theme, changeTheme, ready }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}
