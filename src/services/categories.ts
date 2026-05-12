import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/category";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Extended type for UI rendering to support recursive hierarchical structures,
 * such as nested category lists.
 */
export interface CategoryTreeItem extends Category {
  children?: CategoryTreeItem[];
}

/**
 * Utility type for database mutations
 */
type CategoryPayload = Omit<Category, 'id' | 'created_at' | 'updated_at'>;

/**
 * Fetches all categories, regardless of type or visibility.
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getAllCategories] Error fetching all categories:", error.message);
      return [];
    }

    return data as Category[];
  } catch (err) {
    console.error("[getAllCategories] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches visible categories filtered by a specific category type.
 */
export async function getCategoriesByType(category_type: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("category_type", category_type)
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(`[getCategoriesByType] Error fetching categories for type ${category_type}:`, error.message);
      return [];
    }

    return data as Category[];
  } catch (err) {
    console.error(`[getCategoriesByType] Unexpected error for type ${category_type}:`, err);
    return [];
  }
}

/**
 * Fetches a single category by its slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`[getCategoryBySlug] Error fetching category with slug ${slug}:`, error.message);
      return null;
    }

    return data as Category;
  } catch (err) {
    console.error(`[getCategoryBySlug] Unexpected error for slug ${slug}:`, err);
    return null;
  }
}

/**
 * Creates a new category.
 */
export async function createCategory(payload: CategoryPayload): Promise<ServiceResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[createCategory] Error creating category:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Category };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createCategory] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing category.
 */
export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>
): Promise<ServiceResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateCategory] Error updating category ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Category };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateCategory] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deletes a category by its ID.
 */
export async function deleteCategory(id: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[deleteCategory] Error deleting category ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deleteCategory] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches categories of a specific type and constructs a hierarchical tree structure.
 * Ideal for rendering multi-level dropdowns or categorized lists.
 */
export async function getCategoryTree(category_type: string): Promise<CategoryTreeItem[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("category_type", category_type)
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(`[getCategoryTree] Error fetching categories for tree type ${category_type}:`, error.message);
      return [];
    }

    const items = data as Category[];
    return buildCategoryTree(items, null);
  } catch (err) {
    console.error(`[getCategoryTree] Unexpected error for tree type ${category_type}:`, err);
    return [];
  }
}

/**
 * Recursive helper function to build the category tree.
 */
function buildCategoryTree(items: Category[], parentId: string | null): CategoryTreeItem[] {
  return items
    .filter((item) => item.parent_id === parentId)
    .map((item) => {
      const children = buildCategoryTree(items, item.id);
      return {
        ...item,
        ...(children.length > 0 && { children }),
      };
    });
}

/**
 * Generates an SEO-friendly slug from a given category name.
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens
}
