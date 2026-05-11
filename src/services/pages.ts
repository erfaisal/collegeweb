import { supabase } from "@/lib/supabase";
import type { Page } from "@/types/page";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Utility type for database mutations
 */
type PagePayload = Omit<Page, 'id' | 'created_at' | 'updated_at'>;

/**
 * Fetches all published pages.
 */
export async function getPublishedPages(): Promise<Page[]> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getPublishedPages] Error fetching published pages:", error.message);
      return [];
    }

    return data as Page[];
  } catch (err) {
    console.error("[getPublishedPages] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches a single published page by its slug.
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error(`[getPageBySlug] Error fetching page with slug ${slug}:`, error.message);
      return null;
    }

    return data as Page;
  } catch (err) {
    console.error(`[getPageBySlug] Unexpected error for slug ${slug}:`, err);
    return null;
  }
}

/**
 * Fetches all pages, regardless of publication status.
 * Useful for admin dashboards.
 */
export async function getAllPages(): Promise<Page[]> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[getAllPages] Error fetching all pages:", error.message);
      return [];
    }

    return data as Page[];
  } catch (err) {
    console.error("[getAllPages] Unexpected error:", err);
    return [];
  }
}

/**
 * Creates a new page.
 */
export async function createPage(payload: PagePayload): Promise<ServiceResponse<Page>> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[createPage] Error creating page:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Page };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createPage] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing page.
 */
export async function updatePage(
  id: string,
  payload: Partial<PagePayload>
): Promise<ServiceResponse<Page>> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updatePage] Error updating page ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Page };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updatePage] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deletes a page by its ID.
 */
export async function deletePage(id: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("pages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[deletePage] Error deleting page ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deletePage] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches published pages designated to show in the navigation bar.
 */
export async function getNavbarPages(): Promise<Page[]> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("is_published", true)
      .eq("show_in_navbar", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getNavbarPages] Error fetching navbar pages:", error.message);
      return [];
    }

    return data as Page[];
  } catch (err) {
    console.error("[getNavbarPages] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches published pages designated to show in the footer.
 */
export async function getFooterPages(): Promise<Page[]> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("is_published", true)
      .eq("show_in_footer", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getFooterPages] Error fetching footer pages:", error.message);
      return [];
    }

    return data as Page[];
  } catch (err) {
    console.error("[getFooterPages] Unexpected error:", err);
    return [];
  }
}

/**
 * Generates an SEO-friendly slug from a given title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens
}
