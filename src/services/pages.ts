import { supabase } from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { revalidatePages, revalidatePagePath } from "@/lib/cache";
import type { Database } from "@/types/database";

// Define the specific types for the 'pages' table for strict type safety
type DbPage = Database['public']['Tables']['pages']['Row'];
type DbPageInsert = Database['public']['Tables']['pages']['Insert'];
type DbPageUpdate = Database['public']['Tables']['pages']['Update'];

/**
 * Standardized service response type for mutations and operations that might fail.
 */
export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number; // Optional: for more detailed HTTP-like error codes
};

/**
 * Utility function for consistent error handling and logging.
 */
function handlePageError(
  functionName: string,
  err: unknown,
  context?: { id?: string; slug?: string; query?: string; displayOrder?: number }
): ServiceResponse {
  let errorMessage = "An unexpected error occurred.";
  let logMessage = `[${functionName}]`;

  if (err instanceof Error) {
    errorMessage = err.message;
    logMessage += ` Error: ${err.message}`;
  } else if (typeof err === 'string') {
    errorMessage = err;
    logMessage += ` Error: ${err}`;
  }

  if (context?.id) logMessage += ` ID: ${context.id}`;
  if (context?.slug) logMessage += ` Slug: ${context.slug}`;
  if (context?.query) logMessage += ` Query: ${context.query}`;
  if (context?.displayOrder !== undefined) logMessage += ` Display Order: ${context.displayOrder}`;

  error(logMessage, err); // Log the full error object for debugging
  return { success: false, error: errorMessage, statusCode: 500 };
}

/**
 * Fetches all pages from the database, ordered by display_order.
 * Includes both visible and invisible pages.
 */
export async function getAllPages(): Promise<DbPage[]> {
  try {
    info("[getAllPages] Attempting to fetch all pages.");
    const { data, error: dbError } = await supabase
      .from("pages")
      .select("*")
      .order("display_order", { ascending: true });

    if (dbError) {
      warn(`[getAllPages] Supabase error: ${dbError.message}`);
      return [];
    }

    info(`[getAllPages] Successfully fetched ${data.length} pages.`);
    return data;
  } catch (err) {
    handlePageError("getAllPages", err);
    return [];
  }
}

/**
 * Fetches all visible (published) pages, ordered by display_order.
 */
export async function getPublishedPages(): Promise<DbPage[]> {
  try {
    info("[getPublishedPages] Attempting to fetch published pages.");
    const { data, error: dbError } = await supabase
      .from("pages")
      .select("*")
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (dbError) {
      warn(`[getPublishedPages] Supabase error: ${dbError.message}`);
      return [];
    }

    info(`[getPublishedPages] Successfully fetched ${data.length} published pages.`);
    return data;
  } catch (err) {
    handlePageError("getPublishedPages", err);
    return [];
  }
}

/**
 * Fetches a single page by its ID.
 * Returns null if the page is not found.
 */
export async function getPageById(id: string): Promise<DbPage | null> {
  try {
    info(`[getPageById] Attempting to fetch page by ID: ${id}`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError) {
      // PGRST116 is the error code for "No rows found"
      if (dbError.code === 'PGRST116') {
        info(`[getPageById] No page found with ID: ${id}`);
        return null;
      }
      warn(`[getPageById] Supabase error for ID ${id}: ${dbError.message}`);
      return null;
    }

    info(`[getPageById] Successfully fetched page with ID: ${id}`);
    return data;
  } catch (err) {
    handlePageError("getPageById", err, { id });
    return null;
  }
}

/**
 * Fetches a single visible page by its slug.
 * Returns null if the page is not found or is not visible.
 */
export async function getPageBySlug(slug: string): Promise<DbPage | null> {
  try {
    info(`[getPageBySlug] Attempting to fetch visible page by slug: ${slug}`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("visible", true)
      .single();

    if (dbError) {
      // PGRST116 is the error code for "No rows found"
      if (dbError.code === 'PGRST116') {
        info(`[getPageBySlug] No visible page found with slug: ${slug}`);
        return null;
      }
      warn(`[getPageBySlug] Supabase error for slug ${slug}: ${dbError.message}`);
      return null;
    }

    info(`[getPageBySlug] Successfully fetched page with slug: ${slug}`);
    return data;
  } catch (err) {
    handlePageError("getPageBySlug", err, { slug });
    return null;
  }
}

/**
 * Creates a new page in the database.
 * Revalidates the cache for all pages upon successful creation.
 */
export async function createPage(payload: DbPageInsert): Promise<ServiceResponse<DbPage>> {
  try {
    info("[createPage] Attempting to create a new page.");
    const { data, error: dbError } = await supabase
      .from("pages")
      .insert([payload])
      .select()
      .single();

    if (dbError) {
      return handlePageError("createPage", dbError, { slug: payload.slug });
    }

    revalidatePages();
    info(`[createPage] Successfully created page with ID: ${data.id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("createPage", err, { slug: payload.slug });
  }
}

/**
 * Updates an existing page by its ID.
 * Revalidates the cache for all pages and the specific page path upon success.
 */
export async function updatePage(id: string, payload: DbPageUpdate): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[updatePage] Attempting to update page with ID: ${id}.`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handlePageError("updatePage", dbError, { id });
    }

    revalidatePages();
    if (data?.slug) {
      revalidatePagePath(data.slug);
    }
    info(`[updatePage] Successfully updated page with ID: ${id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("updatePage", err, { id });
  }
}

/**
 * Deletes a page by its ID.
 * Revalidates the cache for all pages and the specific page path upon success.
 */
export async function deletePage(id: string): Promise<ServiceResponse<null>> {
  try {
    info(`[deletePage] Attempting to delete page with ID: ${id}.`);

    // Fetch the page's slug BEFORE deletion for cache revalidation
    const { data: pageToDelete, error: fetchError } = await supabase
      .from("pages")
      .select("slug")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      warn(`[deletePage] Error fetching slug for page ${id} during deletion: ${fetchError.message}`);
      // Continue with deletion attempt even if slug fetch failed
    }

    const { error: dbError } = await supabase
      .from("pages")
      .delete()
      .eq("id", id);

    if (dbError) {
      return handlePageError("deletePage", dbError, { id });
    }

    revalidatePages();
    if (pageToDelete?.slug) {
      revalidatePagePath(pageToDelete.slug);
    }
    info(`[deletePage] Successfully deleted page with ID: ${id}. Cache revalidated.`);
    return { success: true };
  } catch (err) {
    return handlePageError("deletePage", err, { id });
  }
}

/**
 * Publishes a page by setting its 'visible' status to true and 'published_at' to the current timestamp.
 * Revalidates the cache for all pages and the specific page path upon success.
 */
export async function publishPage(id: string): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[publishPage] Attempting to publish page with ID: ${id}.`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .update({ visible: true, published_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handlePageError("publishPage", dbError, { id });
    }

    revalidatePages();
    if (data?.slug) {
      revalidatePagePath(data.slug);
    }
    info(`[publishPage] Successfully published page with ID: ${id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("publishPage", err, { id });
  }
}

/**
 * Unpublishes a page by setting its 'visible' status to false and clearing 'published_at'.
 * Revalidates the cache for all pages and the specific page path upon success.
 */
export async function unpublishPage(id: string): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[unpublishPage] Attempting to unpublish page with ID: ${id}.`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .update({ visible: false, published_at: null })
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handlePageError("unpublishPage", dbError, { id });
    }

    revalidatePages();
    if (data?.slug) {
      revalidatePagePath(data.slug);
    }
    info(`[unpublishPage] Successfully unpublished page with ID: ${id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("unpublishPage", err, { id });
  }
}

/**
 * Features a page by setting its 'featured' status to true.
 * Revalidates the cache for all pages upon success.
 */
export async function featurePage(id: string): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[featurePage] Attempting to feature page with ID: ${id}.`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .update({ featured: true })
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handlePageError("featurePage", dbError, { id });
    }

    revalidatePages();
    info(`[featurePage] Successfully featured page with ID: ${id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("featurePage", err, { id });
  }
}

/**
 * Unfeatures a page by setting its 'featured' status to false.
 * Revalidates the cache for all pages upon success.
 */
export async function unfeaturePage(id: string): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[unfeaturePage] Attempting to unfeature page with ID: ${id}.`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .update({ featured: false })
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handlePageError("unfeaturePage", dbError, { id });
    }

    revalidatePages();
    info(`[unfeaturePage] Successfully unfeatured page with ID: ${id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("unfeaturePage", err, { id });
  }
}

/**
 * Searches pages based on a query across title, content, and short_description fields.
 * Results are ordered by display_order.
 */
export async function searchPages(query: string): Promise<DbPage[]> {
  try {
    info(`[searchPages] Attempting to search pages with query: "${query}".`);
    const searchQuery = `%${query.toLowerCase()}%`;
    const { data, error: dbError } = await supabase
      .from("pages")
      .select("*")
      // Using .or() for multiple column ILIKE search
      .or(`title.ilike.${searchQuery},content.ilike.${searchQuery},short_description.ilike.${searchQuery}`)
      .order("display_order", { ascending: true });

    if (dbError) {
      warn(`[searchPages] Supabase error for query "${query}": ${dbError.message}`);
      return [];
    }

    info(`[searchPages] Found ${data.length} pages for query: "${query}".`);
    return data;
  } catch (err) {
    handlePageError("searchPages", err, { query });
    return [];
  }
}

/**
 * Updates the display order of a specific page.
 * Revalidates the cache for all pages upon success.
 */
export async function updatePageOrder(id: string, displayOrder: number): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[updatePageOrder] Attempting to update display order for page ID: ${id} to ${displayOrder}.`);
    const { data, error: dbError } = await supabase
      .from("pages")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handlePageError("updatePageOrder", dbError, { id, displayOrder });
    }

    revalidatePages();
    info(`[updatePageOrder] Successfully updated display order for page ID: ${id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("updatePageOrder", err, { id, displayOrder });
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

/**
 * Checks if a slug is available for a new page or for an existing page (excluding its own ID).
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  try {
    info(`[isSlugAvailable] Checking availability for slug: ${slug}. Exclude ID: ${excludeId || 'none'}`);
    let query = supabase
      .from("pages")
      .select("id")
      .eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error: dbError } = await query.single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 means no rows found, which implies availability
      warn(`[isSlugAvailable] Supabase error checking slug ${slug}: ${dbError.message}`);
      return false; // Treat as unavailable on error to prevent potential conflicts
    }

    const available = !data; // If data is null, the slug is available
    info(`[isSlugAvailable] Slug '${slug}' is ${available ? 'available' : 'not available'}.`);
    return available;
  } catch (err) {
    handlePageError("isSlugAvailable", err, { slug });
    return false;
  }
}

/**
 * Duplicates an existing page. A new copy is created with " Copy" appended to the title
 * and a unique slug. The new page is initially set as not visible (draft).
 * Revalidates the cache for all pages upon success.
 */
export async function duplicatePage(id: string): Promise<ServiceResponse<DbPage>> {
  try {
    info(`[duplicatePage] Attempting to duplicate page with ID: ${id}.`);

    const originalPage = await getPageById(id);
    if (!originalPage) {
      return { success: false, error: "Original page not found.", statusCode: 404 };
    }

    let newTitle = `${originalPage.title || "Untitled"} Copy`;
    let newSlugBase = generateSlug(newTitle);
    let newSlug = newSlugBase;
    let counter = 1;

    // Ensure the new slug is unique
    while (!(await isSlugAvailable(newSlug))) {
      newSlug = `${newSlugBase}-${counter}`;
      counter++;
    }

    // Create payload for the new page
    const payload: DbPageInsert = {
      ...originalPage,
      id: undefined, // Let Supabase generate a new ID
      created_at: undefined, // Let Supabase set created_at
      updated_at: undefined, // Let Supabase set updated_at
      published_at: null, // New copy is initially unpublished
      title: newTitle,
      slug: newSlug,
      visible: false, // New copy is a draft by default
      // Keep featured_image_url as it's often desired for duplicates
      // Set display_order to a high value to appear at the end or handle specifically
      display_order: (originalPage.display_order || 0) + 100, // Example: put at the end
    };

    const { data, error: dbError } = await supabase
      .from("pages")
      .insert([payload])
      .select()
      .single();

    if (dbError) {
      return handlePageError("duplicatePage", dbError, { id, slug: newSlug });
    }

    revalidatePages();
    info(`[duplicatePage] Successfully duplicated page from ID: ${id} to new page ID: ${data.id}. Cache revalidated.`);
    return { success: true, data: data };
  } catch (err) {
    return handlePageError("duplicatePage", err, { id });
  }
}

/**
 * Retrieves various statistics about the pages in the CMS.
 */
export async function getPageStatistics(): Promise<{
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  featuredPages: number;
}> {
  try {
    info("[getPageStatistics] Fetching page statistics.");

    const { count: totalPages, error: totalError } = await supabase
      .from("pages")
      .select("id", { count: 'exact' });

    if (totalError) throw totalError;

    const { count: publishedPages, error: publishedError } = await supabase
      .from("pages")
      .select("id", { count: 'exact' })
      .eq("visible", true);

    if (publishedError) throw publishedError;

    const { count: draftPages, error: draftError } = await supabase
      .from("pages")
      .select("id", { count: 'exact' })
      .eq("visible", false);

    if (draftError) throw draftError;

    const { count: featuredPages, error: featuredError } = await supabase
      .from("pages")
      .select("id", { count: 'exact' })
      .eq("featured", true);

    if (featuredError) throw featuredError;

    const stats = {
      totalPages: totalPages || 0,
      publishedPages: publishedPages || 0,
      draftPages: draftPages || 0,
      featuredPages: featuredPages || 0,
    };
    info("[getPageStatistics] Successfully fetched page statistics.", stats);
    return stats;
  } catch (err) {
    handlePageError("getPageStatistics", err);
    return { totalPages: 0, publishedPages: 0, draftPages: 0, featuredPages: 0 };
  }
}

/**
 * Builds SEO metadata (title, description, keywords) for a page with safe fallbacks.
 */
export function buildPageSEO(page: Partial<DbPage>): { title: string; description: string; keywords: string[] } {
  const defaultTitle = "CMS Page";
  const defaultDescription = "Explore content on our platform.";
  const defaultKeywords = ["cms", "content", "platform"];

  const seoTitle = page.seo_title || page.title || defaultTitle;
  const seoDescription = page.seo_description || page.short_description || page.content?.substring(0, 160) || defaultDescription;
  const seoKeywords = page.seo_keywords ? page.seo_keywords.split(',').map(k => k.trim()).filter(Boolean) : defaultKeywords;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: Array.from(new Set(seoKeywords)), // Ensure unique keywords
  };
}

// --- Future Compatibility Placeholders ---

/**
 * Schedules a page to be published at a specific date and time.
 * TODO: Implement scheduling logic, likely involving a background job or a scheduled database function.
 * This function would typically update a `scheduled_publish_at` field and a background worker
 * would check for pages that are due to be published.
 */
export async function schedulePublish(id: string, publishAt: Date): Promise<ServiceResponse<null>> {
  warn(`[schedulePublish] Function not yet implemented for page ID: ${id}.`);
  return { success: false, error: "Function not yet implemented.", statusCode: 501 };
}

/**
 * Creates a new version of an existing page, allowing for draft edits without affecting the live version.
 * TODO: Implement page versioning logic. This typically requires a separate 'page_versions' table
 * or a more complex schema where a page can have multiple content versions.
 */
export async function versionPage(id: string): Promise<ServiceResponse<null>> {
  warn(`[versionPage] Function not yet implemented for page ID: ${id}.`);
  return { success: false, error: "Function not yet implemented.", statusCode: 501 };
}

/**
 * Approves a page, typically in a workflow system, making it ready for publishing or a next stage.
 * TODO: Implement approval workflow logic. This would involve updating a `status` field
 * and potentially recording the approver and approval date.
 */
export async function approvePage(id: string): Promise<ServiceResponse<null>> {
  warn(`[approvePage] Function not yet implemented for page ID: ${id}.`);
  return { success: false, error: "Function not yet implemented.", statusCode: 501 };
}