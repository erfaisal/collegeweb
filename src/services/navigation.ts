import { supabase } from "@/lib/supabase";
import type { NavigationItem, NavigationTreeItem, NavigationItemPayload } from "@/types/navigation";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetches all visible navigation items intended for the navbar.
 */
export async function getNavbarNavigation(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabase
      .from("navigation")
      .select("*")
      .eq("show_in_navbar", true)
      .eq("visible", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("[getNavbarNavigation] Error fetching navbar items:", error.message);
      return [];
    }

    return data as NavigationItem[];
  } catch (err) {
    console.error("[getNavbarNavigation] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches all visible navigation items intended for the footer.
 */
export async function getFooterNavigation(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabase
      .from("navigation")
      .select("*")
      .eq("show_in_footer", true)
      .eq("visible", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("[getFooterNavigation] Error fetching footer items:", error.message);
      return [];
    }

    return data as NavigationItem[];
  } catch (err) {
    console.error("[getFooterNavigation] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches all navigation items regardless of visibility (useful for admin panels).
 */
export async function getAllNavigationItems(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabase
      .from("navigation")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("[getAllNavigationItems] Error fetching all navigation items:", error.message);
      return [];
    }

    return data as NavigationItem[];
  } catch (err) {
    console.error("[getAllNavigationItems] Unexpected error:", err);
    return [];
  }
}

/**
 * Creates a new navigation item.
 */
export async function createNavigationItem(
  payload: NavigationItemPayload
): Promise<ServiceResponse<NavigationItem>> {
  try {
    const { data, error } = await supabase
      .from("navigation")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[createNavigationItem] Error creating item:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as NavigationItem };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createNavigationItem] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing navigation item.
 */
export async function updateNavigationItem(
  id: string,
  payload: Partial<NavigationItemPayload>
): Promise<ServiceResponse<NavigationItem>> {
  try {
    const { data, error } = await supabase
      .from("navigation")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateNavigationItem] Error updating item ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as NavigationItem };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateNavigationItem] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deletes a navigation item.
 */
export async function deleteNavigationItem(id: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("navigation")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[deleteNavigationItem] Error deleting item ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deleteNavigationItem] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches visible navigation items and constructs a hierarchical tree structure.
 * Ideal for rendering multi-level dropdowns or mega menus in the UI.
 */
export async function getNavigationTree(): Promise<NavigationTreeItem[]> {
  try {
    const { data, error } = await supabase
      .from("navigation")
      .select("*")
      .eq("visible", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("[getNavigationTree] Error fetching items for tree:", error.message);
      return [];
    }

    const items = data as NavigationItem[];
    return buildTree(items, null);
  } catch (err) {
    console.error("[getNavigationTree] Unexpected error:", err);
    return [];
  }
}

/**
 * Recursive helper function to build the navigation tree.
 */
function buildTree(items: NavigationItem[], parentId: string | null): NavigationTreeItem[] {
  return items
    .filter((item) => item.parent_id === parentId)
    .map((item) => {
      const children = buildTree(items, item.id);
      return {
        ...item,
        ...(children.length > 0 && { children }),
      };
    });
}
