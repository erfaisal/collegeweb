import { supabase } from "@/lib/supabase";
import type { HomepageSection, HomepageSectionPayload } from "@/types/homepage-section";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PresetName = 
  | 'medical_college' 
  | 'engineering_college' 
  | 'university' 
  | 'school';

export interface HomepagePresetConfig {
  section_key: string;
  display_order: number;
  enabled: boolean;
  layout_type: string;
}

/**
 * Fetches homepage sections intended for public display.
 * Only returns sections where enabled = true and visible = true.
 */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("enabled", true)
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getHomepageSections] Error fetching homepage sections:", error.message);
      return [];
    }

    return data as HomepageSection[];
  } catch (err) {
    console.error("[getHomepageSections] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches all homepage sections, regardless of status.
 * Useful for admin builder interfaces.
 */
export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getAllHomepageSections] Error fetching all sections:", error.message);
      return [];
    }

    return data as HomepageSection[];
  } catch (err) {
    console.error("[getAllHomepageSections] Unexpected error:", err);
    return [];
  }
}

/**
 * Creates a new homepage section.
 */
export async function createHomepageSection(
  payload: HomepageSectionPayload
): Promise<ServiceResponse<HomepageSection>> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[createHomepageSection] Error creating section:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as HomepageSection };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createHomepageSection] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing homepage section.
 */
export async function updateHomepageSection(
  id: string,
  payload: Partial<HomepageSectionPayload>
): Promise<ServiceResponse<HomepageSection>> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateHomepageSection] Error updating section ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as HomepageSection };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateHomepageSection] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deletes a homepage section by its ID.
 */
export async function deleteHomepageSection(id: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("homepage_sections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[deleteHomepageSection] Error deleting section ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deleteHomepageSection] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Toggles a section's system-wide enabled status.
 */
export async function toggleHomepageSection(
  id: string,
  enabled: boolean
): Promise<ServiceResponse<HomepageSection>> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .update({ enabled })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[toggleHomepageSection] Error toggling section ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as HomepageSection };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[toggleHomepageSection] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates a section's display order, typically after a drag-and-drop operation.
 */
export async function updateHomepageSectionOrder(
  id: string,
  display_order: number
): Promise<ServiceResponse<HomepageSection>> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .update({ display_order })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateHomepageSectionOrder] Error updating order for section ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as HomepageSection };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateHomepageSectionOrder] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches homepage sections linked to a specific module key.
 */
export async function getHomepageSectionsByModule(module_key: string): Promise<HomepageSection[]> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("module_key", module_key)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(`[getHomepageSectionsByModule] Error fetching sections for module ${module_key}:`, error.message);
      return [];
    }

    return data as HomepageSection[];
  } catch (err) {
    console.error(`[getHomepageSectionsByModule] Unexpected error for module ${module_key}:`, err);
    return [];
  }
}

/**
 * Returns predefined homepage structural configurations tailored for specific institutional types.
 */
export function getHomepagePreset(presetName: PresetName): HomepagePresetConfig[] {
  const presets: Record<PresetName, HomepagePresetConfig[]> = {
    medical_college: [
      { section_key: "hero", display_order: 1, enabled: true, layout_type: "banner" },
      { section_key: "hospital", display_order: 2, enabled: true, layout_type: "split" },
      { section_key: "about", display_order: 3, enabled: true, layout_type: "grid" },
      { section_key: "faculty", display_order: 4, enabled: true, layout_type: "cards" },
      { section_key: "admissions", display_order: 5, enabled: true, layout_type: "banner" },
      { section_key: "research", display_order: 6, enabled: true, layout_type: "grid" },
    ],
    engineering_college: [
      { section_key: "hero", display_order: 1, enabled: true, layout_type: "slider" },
      { section_key: "about", display_order: 2, enabled: true, layout_type: "split" },
      { section_key: "placements", display_order: 3, enabled: true, layout_type: "cards" },
      { section_key: "research", display_order: 4, enabled: true, layout_type: "grid" },
      { section_key: "faculty", display_order: 5, enabled: true, layout_type: "cards" },
      { section_key: "hostel", display_order: 6, enabled: true, layout_type: "split" },
    ],
    university: [
      { section_key: "hero", display_order: 1, enabled: true, layout_type: "banner" },
      { section_key: "about", display_order: 2, enabled: true, layout_type: "split" },
      { section_key: "admissions", display_order: 3, enabled: true, layout_type: "grid" },
      { section_key: "faculty", display_order: 4, enabled: true, layout_type: "cards" },
      { section_key: "research", display_order: 5, enabled: true, layout_type: "grid" },
      { section_key: "gallery", display_order: 6, enabled: true, layout_type: "masonry" },
      { section_key: "testimonials", display_order: 7, enabled: true, layout_type: "slider" },
    ],
    school: [
      { section_key: "hero", display_order: 1, enabled: true, layout_type: "slider" },
      { section_key: "about", display_order: 2, enabled: true, layout_type: "split" },
      { section_key: "admissions", display_order: 3, enabled: true, layout_type: "banner" },
      { section_key: "gallery", display_order: 4, enabled: true, layout_type: "grid" },
      { section_key: "testimonials", display_order: 5, enabled: true, layout_type: "cards" },
    ],
  };

  return presets[presetName] || [];
}
