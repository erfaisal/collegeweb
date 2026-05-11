import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/types/settings";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ThemeSettings = Pick<SiteSettings, 'primary_color' | 'secondary_color' | 'accent_color'>;

export type ModuleSettings = Pick<
  SiteSettings,
  | 'show_hospital'
  | 'show_hostel'
  | 'show_gallery'
  | 'show_faculty'
  | 'show_placements'
  | 'show_research'
  | 'show_testimonials'
  | 'show_contact_form'
>;

/**
 * Fetches the single site settings record.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (error) {
      console.error("[getSiteSettings] Error fetching site settings:", error.message);
      return null;
    }

    return data as SiteSettings;
  } catch (err) {
    console.error("[getSiteSettings] Unexpected error:", err);
    return null;
  }
}

/**
 * Updates the site settings for a given ID.
 */
export async function updateSiteSettings(
  id: string,
  data: Partial<SiteSettings>
): Promise<ServiceResponse<SiteSettings>> {
  try {
    const { data: updatedData, error } = await supabase
      .from("site_settings")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateSiteSettings] Error updating settings for ID ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: updatedData as SiteSettings };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during update.";
    console.error("[updateSiteSettings] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Seeds the database with default institutional settings if none exist.
 */
export async function createDefaultSiteSettings(): Promise<ServiceResponse<SiteSettings>> {
  try {
    // Prevent duplicate insertion by checking if a row already exists
    const { data: existingSettings, error: fetchError } = await supabase
      .from("site_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[createDefaultSiteSettings] Error checking existing settings:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (existingSettings) {
      return { success: false, error: "Site settings already exist. Skipping default creation." };
    }

    // Production-safe placeholder values for an institutional CMS
    const defaultSettings: Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'> = {
      site_name: "Lumina Institute of Technology",
      site_description: "Empowering the next generation of innovators and leaders.",
      contact_email: "contact@luminainstitute.edu",
      contact_phone: "+1 (555) 123-4567",
      address: "100 Innovation Drive, Tech Campus, City, ST 12345",
      primary_color: "#0f172a", // slate-900
      secondary_color: "#334155", // slate-700
      accent_color: "#3b82f6", // blue-500
      logo_url: null,
      favicon_url: null,
      show_hospital: false,
      show_hostel: true,
      show_gallery: true,
      show_faculty: true,
      show_placements: true,
      show_research: true,
      show_testimonials: true,
      show_contact_form: true,
      social_facebook: "https://facebook.com",
      social_twitter: "https://twitter.com",
      social_linkedin: "https://linkedin.com",
      social_instagram: "https://instagram.com",
    } as any; // Cast as any to bypass strict typing for missing optional fields based on actual definition

    const { data: insertedData, error: insertError } = await supabase
      .from("site_settings")
      .insert([defaultSettings])
      .select()
      .single();

    if (insertError) {
      console.error("[createDefaultSiteSettings] Error inserting default settings:", insertError.message);
      return { success: false, error: insertError.message };
    }

    return { success: true, data: insertedData as SiteSettings };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during insertion.";
    console.error("[createDefaultSiteSettings] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches only the theme-related color settings.
 */
export async function getThemeSettings(): Promise<ThemeSettings | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("primary_color, secondary_color, accent_color")
      .single();

    if (error) {
      console.error("[getThemeSettings] Error fetching theme settings:", error.message);
      return null;
    }

    return data as ThemeSettings;
  } catch (err) {
    console.error("[getThemeSettings] Unexpected error:", err);
    return null;
  }
}

/**
 * Fetches only the module visibility toggle settings.
 */
export async function getModuleSettings(): Promise<ModuleSettings | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select(`
        show_hospital, 
        show_hostel, 
        show_gallery, 
        show_faculty, 
        show_placements, 
        show_research, 
        show_testimonials, 
        show_contact_form
      `)
      .single();

    if (error) {
      console.error("[getModuleSettings] Error fetching module settings:", error.message);
      return null;
    }

    return data as ModuleSettings;
  } catch (err) {
    console.error("[getModuleSettings] Unexpected error:", err);
    return null;
  }
}
