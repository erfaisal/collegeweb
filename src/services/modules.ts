import { supabase } from "@/lib/supabase";
import type { Module } from "@/types/module";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetches all modules regardless of status.
 */
export async function getAllModules(): Promise<Module[]> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .order("homepage_order", { ascending: true });

    if (error) {
      console.error("[getAllModules] Error fetching all modules:", error.message);
      return [];
    }

    return data as Module[];
  } catch (err) {
    console.error("[getAllModules] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches all enabled modules.
 */
export async function getEnabledModules(): Promise<Module[]> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("enabled", true)
      .order("homepage_order", { ascending: true });

    if (error) {
      console.error("[getEnabledModules] Error fetching enabled modules:", error.message);
      return [];
    }

    return data as Module[];
  } catch (err) {
    console.error("[getEnabledModules] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches modules that are enabled and set to be visible on the homepage.
 */
export async function getHomepageModules(): Promise<Module[]> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("enabled", true)
      .eq("visible_in_homepage", true)
      .order("homepage_order", { ascending: true });

    if (error) {
      console.error("[getHomepageModules] Error fetching homepage modules:", error.message);
      return [];
    }

    return data as Module[];
  } catch (err) {
    console.error("[getHomepageModules] Unexpected error:", err);
    return [];
  }
}

/**
 * Updates a module's settings.
 */
export async function updateModule(
  id: string,
  payload: Partial<Omit<Module, 'id' | 'created_at' | 'updated_at'>>
): Promise<ServiceResponse<Module>> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateModule] Error updating module ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Module };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateModule] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Toggles a module's enabled status.
 */
export async function toggleModule(
  id: string,
  enabled: boolean
): Promise<ServiceResponse<Module>> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .update({ enabled })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[toggleModule] Error toggling module ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Module };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[toggleModule] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates a module's homepage ordering index.
 */
export async function updateHomepageOrder(
  id: string,
  homepage_order: number
): Promise<ServiceResponse<Module>> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .update({ homepage_order })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateHomepageOrder] Error updating order for module ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Module };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateHomepageOrder] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches enabled modules configured to display in the navbar.
 */
export async function getNavbarModules(): Promise<Module[]> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("enabled", true)
      .eq("visible_in_navbar", true)
      .order("homepage_order", { ascending: true });

    if (error) {
      console.error("[getNavbarModules] Error fetching navbar modules:", error.message);
      return [];
    }

    return data as Module[];
  } catch (err) {
    console.error("[getNavbarModules] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches enabled modules configured to display in the footer.
 */
export async function getFooterModules(): Promise<Module[]> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("enabled", true)
      .eq("visible_in_footer", true)
      .order("homepage_order", { ascending: true });

    if (error) {
      console.error("[getFooterModules] Error fetching footer modules:", error.message);
      return [];
    }

    return data as Module[];
  } catch (err) {
    console.error("[getFooterModules] Unexpected error:", err);
    return [];
  }
}
