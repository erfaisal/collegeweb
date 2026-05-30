import { supabase } from "@/lib/supabase";
import { info, warn, error as logError } from "@/lib/logger";
import { revalidateSettings, SETTINGS_TAG } from "@/lib/cache";
import type { Tables, Insert, Update } from "@/types/database";

// Define specific types for clarity, based on the `site_settings` table
export type SiteSettings = Tables<'site_settings'>;
export type NewSiteSettings = Insert<'site_settings'>;
export type UpdateSiteSettings = Update<'site_settings'>;

/**
 * Handles common errors from Supabase service calls, providing consistent logging.
 * @param functionName The name of the function where the error occurred.
 * @param err The error object from Supabase or a general error.
 * @returns An object with a boolean success flag and an error message. (Note: current CRUD returns SiteSettings | null)
 */
function handleSettingsError(functionName: string, err: any): { success: false; error: string } {
  const errorMessage = err?.message || "An unexpected error occurred.";
  logError(`[${functionName}] Error: ${errorMessage}`, err);
  return { success: false, error: errorMessage };
}

// --- CORE CRUD OPERATIONS ---

/**
 * Fetches the single site settings record.
 * Assumes a single row in the 'site_settings' table for the white-label CMS.
 * @returns The site settings row or null if none exists.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1) // Expecting a single settings record
      .maybeSingle(); // Handles cases where no record exists

    if (error) {
      handleSettingsError("getSiteSettings", error);
      return null;
    }

    if (data) {
      info("[getSiteSettings] Site settings fetched successfully.", data);
    } else {
      warn("[getSiteSettings] No site settings found.");
    }
    return data;
  } catch (err) {
    handleSettingsError("getSiteSettings", err);
    return null;
  }
}

/**
 * Fetches a site settings record by its unique ID.
 * Useful if the system were to support multiple site profiles (multi-tenant future).
 * @param id The ID of the site settings record.
 * @returns The site settings row or null if not found.
 */
export async function getSiteSettingsById(id: string): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", id)
      .single(); // Expecting exactly one row for a given ID

    if (error) {
      // PGRST116 is the error code for "No rows found" in PostgREST
      if (error.code === 'PGRST116') {
        warn(`[getSiteSettingsById] No settings found for ID: ${id}`);
        return null;
      }
      handleSettingsError("getSiteSettingsById", error);
      return null;
    }

    info(`[getSiteSettingsById] Site settings for ID ${id} fetched successfully.`);
    return data;
  } catch (err) {
    handleSettingsError("getSiteSettingsById", err);
    return null;
  }
}

/**
 * Creates a new site settings record.
 * Should ideally only be called once, for initial setup.
 * @param data The data for the new site settings.
 * @returns The created site settings record or null on failure.
 */
export async function createSiteSettings(data: NewSiteSettings): Promise<SiteSettings | null> {
  try {
    const { data: createdData, error } = await supabase
      .from("site_settings")
      .insert(data)
      .select("*")
      .single();

    if (error) {
      handleSettingsError("createSiteSettings", error);
      return null;
    }

    revalidateSettings(); // Invalidate cache to ensure fresh data
    info("[createSiteSettings] Site settings created successfully.", createdData);
    return createdData;
  } catch (err) {
    handleSettingsError("createSiteSettings", err);
    return null;
  }
}

/**
 * Updates an existing site settings record.
 * @param id The ID of the site settings record to update.
 * @param data The partial data to update.
 * @returns The updated site settings record or null on failure.
 */
export async function updateSiteSettings(
  id: string,
  data: UpdateSiteSettings
): Promise<SiteSettings | null> {
  try {
    const { data: updatedData, error } = await supabase
      .from("site_settings")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      handleSettingsError("updateSiteSettings", error);
      return null;
    }

    revalidateSettings(); // Invalidate cache
    info(`[updateSiteSettings] Site settings for ID ${id} updated successfully.`, updatedData);
    return updatedData;
  } catch (err) {
    handleSettingsError("updateSiteSettings", err);
    return null;
  }
}

/**
 * Upserts a site settings record. If a record exists, it updates the first one found;
 * otherwise, it creates a new record. This is suitable for single-row settings.
 * @param data The data to upsert.
 * @returns The upserted site settings record or null on failure.
 */
export async function upsertSiteSettings(data: UpdateSiteSettings): Promise<SiteSettings | null> {
  try {
    const existingSettings = await getSiteSettings();

    if (existingSettings) {
      // Update existing settings
      const { data: updatedData, error } = await supabase
        .from("site_settings")
        .update(data)
        .eq("id", existingSettings.id)
        .select("*")
        .single();

      if (error) {
        handleSettingsError("upsertSiteSettings (update)", error);
        return null;
      }
      revalidateSettings();
      info(`[upsertSiteSettings] Site settings (ID: ${existingSettings.id}) updated successfully.`);
      return updatedData;
    } else {
      // Create new settings
      // Ensure 'id' is not sent in an insert operation as it's auto-generated
      const { id, ...insertData } = data;
      const { data: createdData, error } = await supabase
        .from("site_settings")
        .insert(insertData as NewSiteSettings)
        .select("*")
        .single();

      if (error) {
        handleSettingsError("upsertSiteSettings (create)", error);
        return null;
      }
      revalidateSettings();
      info("[upsertSiteSettings] New site settings created successfully.");
      return createdData;
    }
  } catch (err) {
    handleSettingsError("upsertSiteSettings", err);
    return null;
  }
}

/**
 * Deletes a site settings record. This operation is critical for a CMS
 * and should be used with extreme caution, as settings are fundamental.
 * @param id The ID of the site settings record to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export async function deleteSiteSettings(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("site_settings")
      .delete()
      .eq("id", id);

    if (error) {
      handleSettingsError("deleteSiteSettings", error);
      return false;
    }

    revalidateSettings();
    warn(`[deleteSiteSettings] Site settings for ID ${id} deleted successfully. This is typically not recommended for a CMS.`);
    return true;
  } catch (err) {
    handleSettingsError("deleteSiteSettings", err);
    return false;
  }
}

// --- VALIDATION HELPERS ---

/**
 * Checks if the provided settings object has at least one valid contact information field.
 * @param settings The site settings object.
 * @returns True if email, phone, or whatsapp is present, false otherwise.
 */
export function hasValidContactInfo(settings: SiteSettings | null | undefined): boolean {
  if (!settings) return false;
  return !!settings.email || !!settings.phone || !!settings.whatsapp;
}

/**
 * Checks if the provided settings object has any valid social media links.
 * @param settings The site settings object.
 * @returns True if at least one social media link is present, false otherwise.
 */
export function hasValidSocialLinks(settings: SiteSettings | null | undefined): boolean {
  if (!settings) return false;
  return (
    !!settings.facebook_url ||
    !!settings.instagram_url ||
    !!settings.twitter_url ||
    !!settings.linkedin_url ||
    !!settings.youtube_url
  );
}

// --- COMPUTED & CONTACT HELPERS ---

// Default fallback values for common site settings
const DEFAULT_SITE_NAME = "Lumina Institute";
const DEFAULT_SITE_TAGLINE = "Empowering the next generation of innovators and leaders.";
const DEFAULT_SITE_LOGO = "/images/default-logo.svg";
const DEFAULT_SITE_FAVICON = "/images/default-favicon.svg";
const DEFAULT_SITE_EMAIL = "contact@luminainstitute.edu";
const DEFAULT_SITE_PHONE = "+1-555-SITE-PHONE";
const DEFAULT_SITE_ADDRESS = "100 Innovation Drive, Tech Campus, City, ST 12345";
const DEFAULT_SITE_FOOTER_TEXT = "Lumina Institute";
const DEFAULT_SITE_COPYRIGHT_TEXT = `&copy; ${new Date().getFullYear()} Lumina Institute. All rights reserved.`;

// Client-side cache for settings to reduce repeated fetches in the browser.
// Server-side rendering will rely on Next.js cache revalidation.
let _cachedSettings: SiteSettings | null = null;
let _lastFetchTime: number = 0;
const CLIENT_CACHE_DURATION_MS = 60 * 1000; // 1 minute

/**
 * Private helper to fetch and cache site settings.
 * Optimized for client-side to prevent excessive API calls.
 * @returns The site settings or null.
 */
async function _getSettingsOrNull(): Promise<SiteSettings | null> {
  if (typeof window !== 'undefined') { // Only apply client-side caching logic
    if (_cachedSettings && (Date.now() - _lastFetchTime < CLIENT_CACHE_DURATION_MS)) {
      return _cachedSettings;
    }
  }

  const settings = await getSiteSettings();
  if (typeof window !== 'undefined') {
    _cachedSettings = settings;
    _lastFetchTime = Date.now();
  }
  return settings;
}

/**
 * Returns the site name from settings, or a default fallback.
 */
export async function getSiteName(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.site_name || DEFAULT_SITE_NAME;
}

/**
 * Returns the site tagline from settings, or a default fallback.
 */
export async function getSiteTagline(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.tagline || DEFAULT_SITE_TAGLINE;
}

/**
 * Returns the URL of the site logo, or a default fallback.
 */
export async function getSiteLogo(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.logo_url || DEFAULT_SITE_LOGO;
}

/**
 * Returns the URL of the site favicon, or a default fallback.
 */
export async function getSiteFavicon(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.favicon_url || DEFAULT_SITE_FAVICON;
}

/**
 * Returns the site's primary contact email, or a default fallback.
 */
export async function getSiteEmail(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.email || DEFAULT_SITE_EMAIL;
}

/**
 * Returns the site's primary contact phone number, or a default fallback.
 */
export async function getSitePhone(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.phone || DEFAULT_SITE_PHONE;
}

/**
 * Returns the site's main address, or a default fallback.
 */
export async function getSiteAddress(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.address || DEFAULT_SITE_ADDRESS;
}

/**
 * Returns the site's footer text, or a default fallback.
 */
export async function getSiteFooterText(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.footer_text || DEFAULT_SITE_FOOTER_TEXT;
}

/**
 * Returns the site's copyright text, or a default fallback.
 */
export async function getSiteCopyrightText(): Promise<string> {
  const settings = await _getSettingsOrNull();
  return settings?.copyright_text || DEFAULT_SITE_COPYRIGHT_TEXT;
}

/**
 * Builds a comprehensive, formatted address string from available settings.
 * @param settings The site settings object.
 * @returns A formatted address string, or an empty string if no address parts are available.
 */
export function buildFullAddress(settings: SiteSettings | null | undefined): string {
  if (!settings) return "";

  const parts = [];
  if (settings.address) parts.push(settings.address);
  if (settings.city) parts.push(settings.city);
  if (settings.state) parts.push(settings.state);
  if (settings.postal_code) parts.push(settings.postal_code);
  if (settings.country) parts.push(settings.country);

  return parts.filter(Boolean).join(", ");
}

// --- SOCIAL HELPERS ---

/**
 * Returns an object containing normalized social media URLs from site settings.
 * Filters out any empty or null links.
 * @param settings The site settings object.
 * @returns An object with keys for each social media platform and their respective URLs.
 */
export function getSocialLinks(settings: SiteSettings | null | undefined): {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
} {
  if (!settings) return {};

  const links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  } = {};

  if (settings.facebook_url) links.facebook = settings.facebook_url;
  if (settings.instagram_url) links.instagram = settings.instagram_url;
  if (settings.twitter_url) links.twitter = settings.twitter_url;
  if (settings.linkedin_url) links.linkedin = settings.linkedin_url;
  if (settings.youtube_url) links.youtube = settings.youtube_url;

  return links;
}

// --- FUTURE COMPATIBILITY PLACEHOLDERS ---

/**
 * TODO: Implement functionality to export site settings data.
 * This could involve fetching all relevant settings fields and formatting them
 * into a portable format (e.g., JSON, YAML) for backup or migration purposes.
 */
export async function exportSettings(): Promise<any> {
  warn("[exportSettings] Not yet implemented. This function will export site settings data.");
  // Placeholder: Fetch current settings
  const settings = await getSiteSettings();
  if (settings) {
    info("[exportSettings] Exporting current settings (placeholder).", settings);
    return { data: settings, message: "Export functionality not fully implemented, returning current settings." };
  }
  return { error: "No settings to export.", status: "not implemented" };
}

/**
 * TODO: Implement functionality to import site settings.
 * This would typically involve accepting a settings data object, validating it,
 * and then using the `upsertSiteSettings` function to apply the changes to the database.
 * Careful handling of existing data and potential conflicts is necessary.
 */
export async function importSettings(settingsData: Partial<SiteSettings>): Promise<boolean> {
  warn("[importSettings] Not yet implemented. This function will import and apply site settings data.");
  if (!settingsData || Object.keys(settingsData).length === 0) {
    warn("[importSettings] No data provided for import.");
    return false;
  }
  // Placeholder: Attempt to upsert the provided data
  const result = await upsertSiteSettings(settingsData);
  if (result) {
    info("[importSettings] Successfully processed import (placeholder).", result);
    return true;
  }
  return false;
}

/**
 * TODO: Implement a versioning system for settings schema.
 * This function could return the current schema version of the site_settings table.
 * Useful for managing database migrations and ensuring compatibility across updates.
 */
export function versionSettings(): string {
  warn("[versionSettings] Not yet implemented. This function would return the current settings schema version.");
  return "1.0.0"; // Placeholder version string
}