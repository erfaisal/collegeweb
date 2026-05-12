"use client";

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  type ReactNode 
} from "react";
import { getSiteSettings, getModuleSettings } from "@/services/settings";
import type { SiteSettings } from "@/types/settings";

/**
 * Infer the ModuleSettings type directly from the service return type
 * to ensure strict synchronization with the database schema and service layer.
 */
type ModuleSettings = NonNullable<Awaited<ReturnType<typeof getModuleSettings>>>;

interface SettingsContextValue {
  settings: SiteSettings | null;
  modules: ModuleSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [modules, setModules] = useState<ModuleSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both settings payloads concurrently for optimal performance
      const [siteData, moduleData] = await Promise.all([
        getSiteSettings(),
        getModuleSettings(),
      ]);

      if (siteData) {
        setSettings(siteData);
      }
      
      if (moduleData) {
        setModules(moduleData);
      }
    } catch (error) {
      console.error("[SettingsProvider] Failed to initialize platform settings:", error);
      // In a production app, you might want to integrate with a logging service like Sentry here
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        modules,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Custom hook to securely consume the SettingsContext globally.
 * Ensures the hook is only used within a valid provider boundary.
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider. Ensure your component tree is wrapped.");
  }
  
  return context;
}
