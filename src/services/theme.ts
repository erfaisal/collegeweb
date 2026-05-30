import { supabase } from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { revalidateTheme, THEME_TAG } from "@/lib/cache";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database"; // Assuming database types are generated/defined here

/**
 * Represents a theme record from the database.
 */
export type Theme = Tables<'themes'>;

/**
 * Represents the input for creating a new theme,
 * omitting auto-generated fields.
 */
export type ThemeInput = Omit<TablesInsert<'themes'>, 'id' | 'created_at' | 'updated_at'>;

/**
 * Represents the input for updating an existing theme,
 * omitting auto-generated fields.
 */
export type ThemeUpdateInput = Omit<TablesUpdate<'themes'>, 'id' | 'created_at' | 'updated_at'>;

/**
 * Generic service response structure for API operations.
 */
export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Represents a partial theme configuration used for presets.
 */
export type ThemePresetData = Partial<ThemeInput>;

/**
 * Represents the result of theme validation.
 */
export type ThemeValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Centralized error handling for theme service operations.
 * @param context A string describing where the error occurred (e.g., "[createTheme]").
 * @param err The error object.
 * @returns A ServiceResponse with success: false and an error message.
 */
function handleThemeError(context: string, err: unknown): ServiceResponse<null> {
  const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
  error(`${context} Failed: ${errorMessage}`, err);
  return { success: false, error: errorMessage };
}

/**
 * Fetches the currently active theme settings.
 * @returns The active theme or null if none is active.
 */
export async function getActiveTheme(): Promise<Theme | null> {
  const context = "[getActiveTheme]";
  info(`${context} Attempting to fetch active theme.`);
  try {
    const { data, error: dbError } = await supabase
      .from("themes")
      .select("*")
      .eq("is_active", true)
      .single();

    if (dbError) {
      // PGRST116 means "No rows found", which is a valid scenario for active theme
      if (dbError.code === "PGRST116") {
        info(`${context} No active theme found.`);
        return null;
      }
      throw dbError; // Re-throw other errors
    }

    info(`${context} Successfully fetched active theme: ${data.name} (ID: ${data.id}).`);
    return data;
  } catch (err) {
    handleThemeError(context, err);
    return null;
  }
}

/**
 * Fetches all themes, ordered by creation date in descending order.
 * @returns A list of themes.
 */
export async function getThemes(): Promise<Theme[]> {
  const context = "[getThemes]";
  info(`${context} Attempting to fetch all themes.`);
  try {
    const { data, error: dbError } = await supabase
      .from("themes")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      throw dbError;
    }

    info(`${context} Successfully fetched ${data.length} themes.`);
    return data;
  } catch (err) {
    handleThemeError(context, err);
    return [];
  }
}

/**
 * Fetches a theme by its ID.
 * @param id The ID of the theme to fetch.
 * @returns The theme or null if not found.
 */
export async function getThemeById(id: string): Promise<Theme | null> {
  const context = `[getThemeById - ${id}]`;
  info(`${context} Attempting to fetch theme.`);
  try {
    const { data, error: dbError } = await supabase
      .from("themes")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") {
        warn(`${context} Theme not found.`);
        return null;
      }
      throw dbError;
    }

    info(`${context} Successfully fetched theme: ${data.name}.`);
    return data;
  } catch (err) {
    handleThemeError(context, err);
    return null;
  }
}

/**
 * Creates a new theme.
 * @param data The theme data to insert.
 * @returns A ServiceResponse indicating success or failure, with the created theme if successful.
 */
export async function createTheme(data: ThemeInput): Promise<ServiceResponse<Theme>> {
  const context = `[createTheme - ${data.name}]`;
  info(`${context} Attempting to create theme.`);
  try {
    const { valid, errors } = validateTheme(data);
    if (!valid) {
      warn(`${context} Validation failed: ${errors.join(", ")}`);
      return { success: false, error: `Validation failed: ${errors.join(", ")}` };
    }

    const { data: newTheme, error: dbError } = await supabase
      .from("themes")
      .insert([data])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    revalidateTheme(THEME_TAG);
    info(`${context} Successfully created theme (ID: ${newTheme.id}).`);
    return { success: true, data: newTheme };
  } catch (err) {
    return handleThemeError(context, err);
  }
}

/**
 * Updates an existing theme.
 * @param id The ID of the theme to update.
 * @param data The partial theme data to update.
 * @returns A ServiceResponse indicating success or failure, with the updated theme if successful.
 */
export async function updateTheme(id: string, data: ThemeUpdateInput): Promise<ServiceResponse<Theme>> {
  const context = `[updateTheme - ${id}]`;
  info(`${context} Attempting to update theme.`);
  try {
    const { valid, errors } = validateTheme(data); // Validate partial data as well
    if (!valid) {
      warn(`${context} Validation failed: ${errors.join(", ")}`);
      return { success: false, error: `Validation failed: ${errors.join(", ")}` };
    }

    const { data: updatedTheme, error: dbError } = await supabase
      .from("themes")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    revalidateTheme(THEME_TAG);
    info(`${context} Successfully updated theme.`);
    return { success: true, data: updatedTheme };
  } catch (err) {
    return handleThemeError(context, err);
  }
}

/**
 * Deletes a theme by its ID.
 * Prevents deletion if the theme is currently active.
 * @param id The ID of the theme to delete.
 * @returns A ServiceResponse indicating success or failure.
 */
export async function deleteTheme(id: string): Promise<ServiceResponse<null>> {
  const context = `[deleteTheme - ${id}]`;
  info(`${context} Attempting to delete theme.`);
  try {
    const themeToDelete = await getThemeById(id);
    if (!themeToDelete) {
      warn(`${context} Theme not found, cannot delete.`);
      return { success: false, error: "Theme not found." };
    }

    if (themeToDelete.is_active) {
      warn(`${context} Cannot delete active theme.`);
      return { success: false, error: "Cannot delete the active theme. Deactivate it first." };
    }

    const { error: dbError } = await supabase
      .from("themes")
      .delete()
      .eq("id", id);

    if (dbError) {
      throw dbError;
    }

    revalidateTheme(THEME_TAG);
    info(`${context} Successfully deleted theme.`);
    return { success: true };
  } catch (err) {
    return handleThemeError(context, err);
  }
}

/**
 * Activates a theme, deactivating any previously active theme.
 * This operation aims for atomicity by using sequential updates, but note that Supabase client
 * does not offer explicit ACID transactions for multiple `update` calls. For true atomicity,
 * a Supabase database function (RPC) would be required.
 * @param id The ID of the theme to activate.
 * @returns A ServiceResponse indicating success or failure, with the newly active theme if successful.
 */
export async function activateTheme(id: string): Promise<ServiceResponse<Theme>> {
  const context = `[activateTheme - ${id}]`;
  info(`${context} Attempting to activate theme.`);
  try {
    const themeToActivate = await getThemeById(id);
    if (!themeToActivate) {
      warn(`${context} Theme not found, cannot activate.`);
      return { success: false, error: "Theme not found." };
    }

    // 1. Deactivate current active theme (if any)
    const activeTheme = await getActiveTheme();
    if (activeTheme && activeTheme.id !== id) {
      info(`${context} Deactivating previously active theme: ${activeTheme.name} (ID: ${activeTheme.id}).`);
      const { error: deactivateError } = await supabase
        .from("themes")
        .update({ is_active: false })
        .eq("id", activeTheme.id);

      if (deactivateError) {
        // Log, but proceed cautiously. If deactivation fails, activating the new one might lead to two active themes.
        warn(`${context} Failed to deactivate old theme ${activeTheme.id}: ${deactivateError.message}`);
        // Consider a more robust rollback/error strategy here, e.g., via a database function.
      }
    }

    // 2. Activate the selected theme
    info(`${context} Activating theme: ${themeToActivate.name}.`);
    const { data: activatedTheme, error: activateError } = await supabase
      .from("themes")
      .update({ is_active: true })
      .eq("id", id)
      .select()
      .single();

    if (activateError) {
      throw activateError; // If activation fails, this is a critical error
    }

    revalidateTheme(THEME_TAG);
    info(`${context} Successfully activated theme (ID: ${activatedTheme.id}).`);
    return { success: true, data: activatedTheme };
  } catch (err) {
    return handleThemeError(context, err);
  }
}

/**
 * Clones an existing theme, creating a new theme with a specified name.
 * @param id The ID of the theme to clone.
 * @param newName The name for the new cloned theme.
 * @returns A ServiceResponse indicating success or failure, with the new cloned theme if successful.
 */
export async function cloneTheme(id: string, newName: string): Promise<ServiceResponse<Theme>> {
  const context = `[cloneTheme - ${id}]`;
  info(`${context} Attempting to clone theme.`);
  try {
    const originalTheme = await getThemeById(id);
    if (!originalTheme) {
      warn(`${context} Original theme not found for cloning.`);
      return { success: false, error: "Original theme not found." };
    }

    const { id: _, created_at: __, updated_at: ___, ...cloneData } = originalTheme;
    const newThemeData: ThemeInput = {
      ...cloneData,
      name: newName,
      is_active: false, // Cloned theme should not be active by default
    };

    const { data: newTheme, error: dbError } = await supabase
      .from("themes")
      .insert([newThemeData])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    revalidateTheme(THEME_TAG);
    info(`${context} Successfully cloned theme (ID: ${newTheme.id}, New Name: ${newTheme.name}).`);
    return { success: true, data: newTheme };
  } catch (err) {
    return handleThemeError(context, err);
  }
}

/**
 * Validates a theme object, checking for common issues like color formats and radius units.
 * @param theme The theme object (or partial) to validate.
 * @returns An object indicating validity and a list of errors if any.
 */
export function validateTheme(theme: Partial<ThemeInput>): ThemeValidationResult {
  const errors: string[] = [];
  const isValidColor = (color: string | null | undefined) =>
    !color || /^#([A-Fa-f0-9]{3,4}){1,2}$|^rgb\((\d{1,3},\s*){2}\d{1,3}\)$|^rgba\((\d{1,3},\s*){3}\d{1,3}(\.\d+)?\)$|^hsl\((\d{1,3},\s*){2}\d{1,3}%\)$|^hsla\((\d{1,3},\s*){3}\d{1,3}%(\.\d+)?\)$/.test(color);
  const isValidCssUnit = (value: string | null | undefined) =>
    !value || /^(-?\d*\.?\d+(px|em|rem|%|vw|vh|vmin|vmax))$/.test(value);
  const isNotEmpty = (value: string | null | undefined) =>
    value && value.trim().length > 0;

  if (theme.name !== undefined && !isNotEmpty(theme.name)) {
    errors.push("Theme name cannot be empty.");
  }
  if (theme.primary_color !== undefined && !isValidColor(theme.primary_color)) {
    errors.push("Invalid primary color format.");
  }
  if (theme.secondary_color !== undefined && !isValidColor(theme.secondary_color)) {
    errors.push("Invalid secondary color format.");
  }
  if (theme.accent_color !== undefined && !isValidColor(theme.accent_color)) {
    errors.push("Invalid accent color format.");
  }
  if (theme.background_color !== undefined && !isValidColor(theme.background_color)) {
    errors.push("Invalid background color format.");
  }
  if (theme.surface_color !== undefined && !isValidColor(theme.surface_color)) {
    errors.push("Invalid surface color format.");
  }
  if (theme.text_color !== undefined && !isValidColor(theme.text_color)) {
    errors.push("Invalid text color format.");
  }
  if (theme.muted_text_color !== undefined && !isValidColor(theme.muted_text_color)) {
    errors.push("Invalid muted text color format.");
  }
  if (theme.navbar_background !== undefined && !isValidColor(theme.navbar_background)) {
    errors.push("Invalid navbar background color format.");
  }
  if (theme.footer_background !== undefined && !isValidColor(theme.footer_background)) {
    errors.push("Invalid footer background color format.");
  }
  if (theme.font_family !== undefined && !isNotEmpty(theme.font_family)) {
    errors.push("Base font family cannot be empty.");
  }
  if (theme.heading_font_family !== undefined && !isNotEmpty(theme.heading_font_family)) {
    errors.push("Heading font family cannot be empty.");
  }
  if (theme.button_radius !== undefined && !isValidCssUnit(theme.button_radius)) {
    errors.push("Invalid button radius unit or value (e.g., '0.5rem', '8px', '10%').");
  }
  if (theme.card_radius !== undefined && !isValidCssUnit(theme.card_radius)) {
    errors.push("Invalid card radius unit or value (e.g., '0.75rem', '12px').");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Converts a theme object into a CSS custom properties (variables) mapping.
 * @param theme The theme settings object.
 * @returns A record of CSS variable names to their values.
 */
export function buildThemeVariables(theme: Theme): Record<string, string> {
  return {
    "--theme-primary-color": theme.primary_color,
    "--theme-secondary-color": theme.secondary_color,
    "--theme-accent-color": theme.accent_color,
    "--theme-background-color": theme.background_color,
    "--theme-surface-color": theme.surface_color,
    "--theme-text-color": theme.text_color,
    "--theme-muted-text-color": theme.muted_text_color,
    "--theme-navbar-background": theme.navbar_background,
    "--theme-footer-background": theme.footer_background,
    "--theme-font-family": theme.font_family,
    "--theme-heading-font-family": theme.heading_font_family,
    "--theme-button-radius": theme.button_radius,
    "--theme-card-radius": theme.card_radius,
  };
}

/**
 * Retrieves the logo URL from a theme.
 * @param theme The theme object.
 * @returns The logo URL or null.
 */
export function getThemeLogo(theme: Theme): string | null {
  return theme.logo_url;
}

/**
 * Retrieves the favicon URL from a theme.
 * @param theme The theme object.
 * @returns The favicon URL or null.
 */
export function getThemeFavicon(theme: Theme): string | null {
  return theme.favicon_url;
}

/**
 * Checks if dark mode is enabled for a given theme.
 * @param theme The theme object.
 * @returns True if dark mode is enabled, false otherwise.
 */
export function isDarkTheme(theme: Theme): boolean {
  return theme.dark_mode_enabled;
}

/**
 * Returns a preset for a medical institution theme.
 */
export function createMedicalThemePreset(): ThemePresetData {
  return {
    name: "Medical Institution Preset",
    primary_color: "#005b96", // Trustworthy Medical Blue
    secondary_color: "#03396c", // Darker blue
    accent_color: "#6497b1", // Lighter blue accent
    background_color: "#f8f9fa", // Light gray background
    surface_color: "#ffffff", // White surfaces
    text_color: "#212529", // Dark text
    muted_text_color: "#6c757d", // Muted gray text
    navbar_background: "#ffffff",
    footer_background: "#03396c",
    font_family: "Roboto, sans-serif",
    heading_font_family: "Montserrat, sans-serif",
    button_radius: "0.5rem",
    card_radius: "0.75rem",
    dark_mode_enabled: false,
    is_active: false,
  };
}

/**
 * Returns a preset for an engineering institution theme.
 */
export function createEngineeringThemePreset(): ThemePresetData {
  return {
    name: "Engineering Institution Preset",
    primary_color: "#2c3e50", // Industrial Dark Blue/Gray
    secondary_color: "#34495e", // Darker gray
    accent_color: "#e67e22", // Energetic Orange
    background_color: "#ecf0f1", // Light industrial gray
    surface_color: "#ffffff", // White surfaces
    text_color: "#2c3e50", // Dark text
    muted_text_color: "#7f8c8d", // Muted gray text
    navbar_background: "#2c3e50",
    footer_background: "#34495e",
    font_family: "Inter, sans-serif",
    heading_font_family: "Roboto Mono, monospace",
    button_radius: "0.25rem",
    card_radius: "0.5rem",
    dark_mode_enabled: false,
    is_active: false,
  };
}

/**
 * Returns a preset for a university institution theme.
 */
export function createUniversityThemePreset(): ThemePresetData {
  return {
    name: "University Institution Preset",
    primary_color: "#5b0e2d", // Classic Crimson/Maroon
    secondary_color: "#3b0918", // Darker maroon
    accent_color: "#d4af37", // Gold
    background_color: "#fdfdfd", // Off-white background
    surface_color: "#ffffff", // White surfaces
    text_color: "#343a40", // Dark text
    muted_text_color: "#6c757d", // Muted gray text
    navbar_background: "#5b0e2d",
    footer_background: "#3b0918",
    font_family: "Lora, serif",
    heading_font_family: "Playfair Display, serif",
    button_radius: "0.125rem",
    card_radius: "0.25rem",
    dark_mode_enabled: false,
    is_active: false,
  };
}

/**
 * Returns a preset for a school institution theme.
 */
export function createSchoolThemePreset(): ThemePresetData {
  return {
    name: "School Institution Preset",
    primary_color: "#27ae60", // Friendly Green
    secondary_color: "#2ecc71", // Lighter green
    accent_color: "#f1c40f", // Yellow
    background_color: "#ecf4f3", // Very light green background
    surface_color: "#ffffff", // White surfaces
    text_color: "#2d3436", // Dark charcoal text
    muted_text_color: "#636e72", // Muted gray text
    navbar_background: "#27ae60",
    footer_background: "#2d3436",
    font_family: "Nunito, sans-serif",
    heading_font_family: "Nunito, sans-serif",
    button_radius: "1rem", // Softer, rounder corners
    card_radius: "1.5rem",
    dark_mode_enabled: false,
    is_active: false,
  };
}

/**
 * Returns a preset for a modern dark theme.
 */
export function createModernDarkThemePreset(): ThemePresetData {
  return {
    name: "Modern Dark Theme Preset",
    primary_color: "#5f2c3e", // Deep purple-red
    secondary_color: "#3c1e2a", // Even darker
    accent_color: "#ffc107", // Amber accent
    background_color: "#1a1a1a", // Very dark gray
    surface_color: "#2b2b2b", // Slightly lighter dark gray for surfaces
    text_color: "#e0e0e0", // Light text
    muted_text_color: "#b0b0b0", // Muted light gray text
    navbar_background: "#2b2b2b",
    footer_background: "#1a1a1a",
    font_family: "Lato, sans-serif",
    heading_font_family: "Oswald, sans-serif",
    button_radius: "0.375rem",
    card_radius: "0.5rem",
    dark_mode_enabled: true,
    is_active: false,
  };
}


// --- Future Compatibility Placeholders ---

/**
 * TODO: Implement functionality to export theme settings.
 * This might involve generating a JSON file or a configuration string.
 * Could be useful for backup or manual transfer.
 */
export async function exportTheme(): Promise<ServiceResponse<string>> {
  warn("[exportTheme] Functionality not yet implemented.");
  return { success: false, error: "Not yet implemented." };
}

/**
 * TODO: Implement functionality to import theme settings.
 * This would parse a JSON file or configuration string and create/update a theme.
 * Requires careful validation and potentially conflict resolution.
 */
export async function importTheme(): Promise<ServiceResponse<Theme>> {
  warn("[importTheme] Functionality not yet implemented.");
  return { success: false, error: "Not yet implemented." };
}

/**
 * TODO: Implement functionality to generate a theme using AI.
 * This could take natural language descriptions or visual preferences
 * and suggest theme configurations.
 */
export async function generateAITheme(): Promise<ServiceResponse<Theme>> {
  warn("[generateAITheme] Functionality not yet implemented.");
  return { success: false, error: "Not yet implemented." };
}