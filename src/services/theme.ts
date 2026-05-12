import { supabase } from "@/lib/supabase";
import type { ThemeSettings } from "@/types/theme";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ThemePreset = Pick<
  ThemeSettings,
  | 'primary_color'
  | 'secondary_color'
  | 'accent_color'
  | 'font_family_base'
  | 'font_family_heading'
  | 'layout_style'
  | 'border_radius'
>;

/**
 * Fetches the currently active theme settings.
 */
export async function getActiveTheme(): Promise<ThemeSettings | null> {
  try {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        console.error("[getActiveTheme] Error fetching active theme:", error.message);
      }
      return null;
    }

    return data as ThemeSettings;
  } catch (err) {
    console.error("[getActiveTheme] Unexpected error:", err);
    return null;
  }
}

/**
 * Updates a specific theme's configuration.
 */
export async function updateTheme(
  id: string,
  payload: Partial<Omit<ThemeSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<ServiceResponse<ThemeSettings>> {
  try {
    const { data, error } = await supabase
      .from("themes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateTheme] Error updating theme ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ThemeSettings };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateTheme] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Seeds the database with a production-safe default institutional theme.
 * Prevents insertion if a theme already exists.
 */
export async function createDefaultTheme(): Promise<ServiceResponse<ThemeSettings>> {
  try {
    // Check if any theme exists to prevent duplicates
    const { data: existingTheme, error: fetchError } = await supabase
      .from("themes")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[createDefaultTheme] Error checking existing themes:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (existingTheme) {
      return { success: false, error: "A theme already exists. Skipping default creation." };
    }

    const defaultThemePayload: Omit<ThemeSettings, 'id' | 'created_at' | 'updated_at'> = {
      theme_name: "Default Institutional",
      is_active: true,
      primary_color: "#0f172a", // Slate 900
      secondary_color: "#334155", // Slate 700
      accent_color: "#3b82f6", // Blue 500
      background_color: "#ffffff",
      text_color: "#1e293b", // Slate 800
      font_family_base: "Inter, sans-serif",
      font_family_heading: "Merriweather, serif",
      border_radius: "0.375rem", // Standard rounding
      layout_style: "boxed",
      dark_mode_enabled: false,
    } as any; // Allow bypass for any additional optional fields defined in the type

    const { data, error } = await supabase
      .from("themes")
      .insert([defaultThemePayload])
      .select()
      .single();

    if (error) {
      console.error("[createDefaultTheme] Error creating default theme:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ThemeSettings };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createDefaultTheme] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Converts a theme object into a CSS custom properties (variables) mapping.
 */
export function generateCSSVariables(theme: ThemeSettings): Record<string, string> {
  return {
    "--theme-primary-color": theme.primary_color,
    "--theme-secondary-color": theme.secondary_color,
    "--theme-accent-color": theme.accent_color,
    "--theme-background-color": theme.background_color || "#ffffff",
    "--theme-text-color": theme.text_color || "#111827",
    "--theme-font-base": theme.font_family_base,
    "--theme-font-heading": theme.font_family_heading,
    "--theme-border-radius": theme.border_radius,
    "--theme-layout-max-width": theme.layout_style === "full" ? "100%" : "1280px",
  };
}

/**
 * Returns a dictionary of predefined institutional theme presets.
 */
export function getThemePresets(): Record<string, ThemePreset> {
  return {
    medical: {
      primary_color: "#005b96", // Trustworthy Medical Blue
      secondary_color: "#03396c",
      accent_color: "#6497b1",
      font_family_base: "Roboto, sans-serif",
      font_family_heading: "Montserrat, sans-serif",
      layout_style: "boxed",
      border_radius: "0.5rem",
    },
    engineering: {
      primary_color: "#2c3e50", // Industrial Dark Blue/Gray
      secondary_color: "#34495e",
      accent_color: "#e67e22", // Energetic Orange
      font_family_base: "Inter, sans-serif",
      font_family_heading: "Roboto Mono, monospace",
      layout_style: "full",
      border_radius: "0.25rem",
    },
    university: {
      primary_color: "#5b0e2d", // Classic Crimson/Maroon
      secondary_color: "#3b0918",
      accent_color: "#d4af37", // Gold
      font_family_base: "Lora, serif",
      font_family_heading: "Playfair Display, serif",
      layout_style: "boxed",
      border_radius: "0.125rem",
    },
    school: {
      primary_color: "#27ae60", // Friendly Green
      secondary_color: "#2ecc71",
      accent_color: "#f1c40f", // Yellow
      font_family_base: "Nunito, sans-serif",
      font_family_heading: "Nunito, sans-serif",
      layout_style: "full",
      border_radius: "1rem", // Softer, rounder corners
    },
  };
}

/**
 * Generates browser-safe CSS string representation to be injected into the document.
 * Returns an object containing both the inline style string and the raw variables.
 */
export function applyThemeToDocument(theme: ThemeSettings | null) {
  if (!theme) return { cssString: "", variables: {} };

  const variables = generateCSSVariables(theme);
  
  const cssString = Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");

  return {
    cssString: `:root { ${cssString} }`,
    variables,
  };
}

/**
 * Toggles the dark mode setting on the currently active theme.
 */
export async function toggleDarkMode(enabled: boolean): Promise<ServiceResponse<ThemeSettings>> {
  try {
    const activeTheme = await getActiveTheme();

    if (!activeTheme) {
      return { success: false, error: "No active theme found to update." };
    }

    const { data, error } = await supabase
      .from("themes")
      .update({ dark_mode_enabled: enabled })
      .eq("id", activeTheme.id)
      .select()
      .single();

    if (error) {
      console.error("[toggleDarkMode] Error toggling dark mode:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ThemeSettings };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[toggleDarkMode] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}
