"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getActiveTheme, generateCSSVariables } from "@/services/theme";
import type { ThemeSettings } from "@/types/theme";

interface ThemeContextValue {
  theme: ThemeSettings | null;
  loading: boolean;
  isDarkMode: boolean;
  refreshTheme: () => Promise<void>;
  toggleDarkMode: (enabled?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  /**
   * Fetches the active theme from the database and initializes state.
   */
  const fetchTheme = useCallback(async () => {
    setLoading(true);
    try {
      const activeTheme = await getActiveTheme();
      if (activeTheme) {
        setTheme(activeTheme);
        setIsDarkMode(activeTheme.dark_mode_enabled ?? false);
      }
    } catch (error) {
      console.error("[ThemeProvider] Failed to fetch active theme:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the theme on initial mount
  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  /**
   * Applies CSS variables to the document root whenever the theme changes.
   * Also manages the Tailwind 'dark' class for systemic dark mode support.
   */
  useEffect(() => {
    const root = document.documentElement;

    if (theme) {
      // Generate and apply dynamic CSS variables
      const cssVariables = generateCSSVariables(theme);
      Object.entries(cssVariables).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value);
        }
      });
    }

    // Toggle Tailwind's dark mode class based on state
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Cleanup function to remove inline styles if the component unmounts
    // (Optional but good practice in strict mode or live preview scenarios)
    return () => {
      if (theme) {
        const cssVariables = generateCSSVariables(theme);
        Object.keys(cssVariables).forEach((key) => {
          root.style.removeProperty(key);
        });
      }
    };
  }, [theme, isDarkMode]);

  /**
   * Toggles the local dark mode state. 
   * In a full implementation, this might also call an update function in your 
   * services to persist the user's preference to the database or local storage.
   */
  const toggleDarkMode = useCallback((enabled?: boolean) => {
    setIsDarkMode((prev) => (enabled !== undefined ? enabled : !prev));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        isDarkMode,
        refreshTheme: fetchTheme,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to securely consume the ThemeContext globally.
 * Ensures the hook is only used within a valid provider boundary.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider. Ensure your component tree is wrapped.");
  }

  return context;
}
