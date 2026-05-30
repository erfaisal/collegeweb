"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getActiveTheme } from "@/services/theme";
import { ThemeRow } from "@/types/database";

// Define default CSS variables for fallback and reset
const DEFAULT_CSS_VARS: Record<string, string> = {
  "--primary-color": "#007bff", // Bootstrap primary blue
  "--secondary-color": "#6c757d", // Bootstrap secondary grey
  "--accent-color": "#ffc107", // Bootstrap yellow
  "--background-color": "#ffffff", // White
  "--surface-color": "#f8f9fa", // Light grey
  "--text-color": "#212529", // Dark grey
  "--muted-text-color": "#6c757d", // Muted grey
  "--navbar-background": "#ffffff",
  "--footer-background": "#f8f9fa",
  "--button-radius": "0px",
  "--card-radius": "0px",
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Resets CSS variables to default values.
   */
  const resetTheme = useCallback(() => {
    if (typeof document === "undefined") return; // Ensure client-side
    const root = document.documentElement;
    Object.entries(DEFAULT_CSS_VARS).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });
  }, []);

  /**
   * Applies the given theme's CSS variables to the document's root element.
   * If theme is null, it resets to defaults.
   */
  const applyTheme = useCallback(
    (newTheme: ThemeRow | null) => {
      if (typeof document === "undefined") return; // Ensure client-side
      const root = document.documentElement;

      if (!newTheme) {
        resetTheme(); // Apply defaults if no theme is provided
        return;
      }

      root.style.setProperty(
        "--primary-color",
        newTheme.primary_color || DEFAULT_CSS_VARS["--primary-color"],
      );
      root.style.setProperty(
        "--secondary-color",
        newTheme.secondary_color || DEFAULT_CSS_VARS["--secondary-color"],
      );
      root.style.setProperty(
        "--accent-color",
        newTheme.accent_color || DEFAULT_CSS_VARS["--accent-color"],
      );
      root.style.setProperty(
        "--background-color",
        newTheme.background_color || DEFAULT_CSS_VARS["--background-color"],
      );
      root.style.setProperty(
        "--surface-color",
        newTheme.surface_color || DEFAULT_CSS_VARS["--surface-color"],
      );
      root.style.setProperty(
        "--text-color",
        newTheme.text_color || DEFAULT_CSS_VARS["--text-color"],
      );
      root.style.setProperty(
        "--muted-text-color",
        newTheme.muted_text_color || DEFAULT_CSS_VARS["--muted-text-color"],
      );
      root.style.setProperty(
        "--navbar-background",
        newTheme.navbar_background || DEFAULT_CSS_VARS["--navbar-background"],
      );
      root.style.setProperty(
        "--footer-background",
        newTheme.footer_background || DEFAULT_CSS_VARS["--footer-background"],
      );
      root.style.setProperty(
        "--button-radius",
        newTheme.button_radius || DEFAULT_CSS_VARS["--button-radius"],
      );
      root.style.setProperty(
        "--card-radius",
        newTheme.card_radius || DEFAULT_CSS_VARS["--card-radius"],
      );
    },
    [resetTheme],
  );

  /**
   * Fetches the active theme from the service.
   */
  const fetchTheme = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeTheme = await getActiveTheme();
      setTheme(activeTheme);
      applyTheme(activeTheme); // Automatically apply the fetched theme
    } catch (err) {
      console.error("Failed to fetch active theme:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setTheme(null); // Clear theme on error
      applyTheme(null); // Reset CSS variables to defaults on error
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  /**
   * Effect to fetch theme on component mount.
   */
  useEffect(() => {
    fetchTheme();
    // No cleanup needed for simple fetch, but for subscriptions/listeners, it would be here.
  }, [fetchTheme]);

  /**
   * Allows external components to trigger a theme refresh.
   */
  const refresh = useCallback(() => {
    void fetchTheme(); // Use void to explicitly mark as not awaiting
  }, [fetchTheme]);

  // --- Computed Helpers ---
  const primaryColor = useMemo(
    () => theme?.primary_color || DEFAULT_CSS_VARS["--primary-color"],
    [theme?.primary_color],
  );

  const secondaryColor = useMemo(
    () => theme?.secondary_color || DEFAULT_CSS_VARS["--secondary-color"],
    [theme?.secondary_color],
  );

  const accentColor = useMemo(
    () => theme?.accent_color || DEFAULT_CSS_VARS["--accent-color"],
    [theme?.accent_color],
  );

  const backgroundColor = useMemo(
    () => theme?.background_color || DEFAULT_CSS_VARS["--background-color"],
    [theme?.background_color],
  );

  const surfaceColor = useMemo(
    () => theme?.surface_color || DEFAULT_CSS_VARS["--surface-color"],
    [theme?.surface_color],
  );

  const textColor = useMemo(
    () => theme?.text_color || DEFAULT_CSS_VARS["--text-color"],
    [theme?.text_color],
  );

  const mutedTextColor = useMemo(
    () => theme?.muted_text_color || DEFAULT_CSS_VARS["--muted-text-color"],
    [theme?.muted_text_color],
  );

  const navbarBackground = useMemo(
    () => theme?.navbar_background || DEFAULT_CSS_VARS["--navbar-background"],
    [theme?.navbar_background],
  );

  const footerBackground = useMemo(
    () => theme?.footer_background || DEFAULT_CSS_VARS["--footer-background"],
    [theme?.footer_background],
  );

  const buttonRadius = useMemo(
    () => theme?.button_radius || DEFAULT_CSS_VARS["--button-radius"],
    [theme?.button_radius],
  );

  const cardRadius = useMemo(
    () => theme?.card_radius || DEFAULT_CSS_VARS["--card-radius"],
    [theme?.card_radius],
  );

  const siteLogo = useMemo(
    () => theme?.site_logo_url || "", // Fallback to empty string for URLs
    [theme?.site_logo_url],
  );

  const faviconUrl = useMemo(
    () => theme?.favicon_url || "", // Fallback to empty string for URLs
    [theme?.favicon_url],
  );

  // Default to false if not explicitly true to maintain expected behavior
  const darkModeEnabled = useMemo(
    () => !!theme?.dark_mode_enabled,
    [theme?.dark_mode_enabled],
  );

  /**
   * Helper to check if dark mode is enabled.
   */
  const isDarkMode = useMemo(() => darkModeEnabled, [darkModeEnabled]);

  return {
    theme,
    loading,
    error,
    refresh,
    applyTheme,
    // Computed values
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    surfaceColor,
    textColor,
    mutedTextColor,
    navbarBackground,
    footerBackground,
    buttonRadius,
    cardRadius,
    siteLogo,
    faviconUrl,
    darkModeEnabled,
    isDarkMode,
  };
}