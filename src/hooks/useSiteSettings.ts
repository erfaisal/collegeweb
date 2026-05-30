"use client";

import { useCallback, useEffect, useState } from "react";
import { getSiteSettings } from "@/services/settings";
import { Database } from "@/types/database"; // Assuming Database type is exported from here

// Define the SiteSettingsRow type based on your Supabase database schema
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

interface UseSiteSettingsReturn {
  settings: SiteSettingsRow | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  hasSettings: boolean;
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  logoUrl: string;
}

/**
 * A production-grade React hook for fetching and managing site-wide settings.
 *
 * This hook integrates with a Supabase backend via the getSiteSettings service
 * to retrieve global configuration for a white-label institutional CMS.
 * It provides robust state management for loading, errors, and an explicit
 * refresh mechanism.
 *
 * @returns {UseSiteSettingsReturn} An object containing site settings, loading state, error,
 *   a refresh function, and computed helper values with safe fallbacks.
 *
 * Future Compatibility:
 * - Can be easily extended with SWR/React Query for advanced caching/revalidation.
 * - Realtime subscriptions can be added via Supabase's realtime capabilities.
 * - Adaptable for multi-tenant architectures by accepting a tenant ID.
 * - Provides a foundation for theme and branding synchronization.
 */
export function useSiteSettings(): UseSiteSettingsReturn {
  const [settings, setSettings] = useState<SiteSettingsRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches the site settings from the backend.
   * Encapsulated in a useCallback to ensure a stable reference.
   */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (err) {
      // Ensure the error is an instance of Error for consistent handling
      setError(err instanceof Error ? err : new Error(String(err)));
      setSettings(null); // Clear settings on error to indicate failure
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies for a global, single-instance fetch

  /**
   * Effect hook to fetch settings on component mount.
   * Includes cleanup for safe unmounting.
   */
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const loadSettings = async () => {
      if (isMounted) {
        await fetchSettings();
      }
    };

    loadSettings();

    return () => {
      isMounted = false; // Cleanup: set flag to false when component unmounts
    };
  }, [fetchSettings]); // `fetchSettings` is stable due to useCallback

  /**
   * Manually trigger a refresh of the site settings.
   * Memoized with useCallback for stable reference.
   */
  const refresh = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Computed helper: Check if settings have been loaded successfully
  const hasSettings = settings !== null;

  // Computed helpers with safe fallbacks for UI consistency
  const siteName = settings?.site_name || "My Institution CMS";
  const siteEmail = settings?.site_email || "contact@myinstitution.com";
  const sitePhone = settings?.site_phone || "+1 (555) 123-4567";
  const siteAddress = settings?.site_address || "123 Main St, Anytown, USA";
  const logoUrl = settings?.logo_url || "/default-logo.svg";

  return {
    settings,
    loading,
    error,
    refresh,
    hasSettings,
    siteName,
    siteEmail,
    sitePhone,
    siteAddress,
    logoUrl,
  };
}