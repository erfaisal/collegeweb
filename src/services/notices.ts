import { supabase } from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { revalidateNotices } from "@/lib/cache";
import { Database } from "@/types/database"; // Supabase generated types

// --- Type Definitions ---

// Define the table name for convenience
type NoticeTable = Database["public"]["Tables"]["notices"];
export type Notice = NoticeTable["Row"];
export type InsertNotice = NoticeTable["Insert"];
export type UpdateNotice = NoticeTable["Update"];

// Define notice categories
export type NoticeCategory =
  | "admission"
  | "examination"
  | "academic"
  | "result"
  | "holiday"
  | "tender"
  | "general";

// Ensure type safety for categories
const ALL_NOTICE_CATEGORIES: NoticeCategory[] = [
  "admission",
  "examination",
  "academic",
  "result",
  "holiday",
  "tender",
  "general",
];

// Helper for SEO
export interface NoticeSEO {
  title: string;
  description?: string;
  keywords?: string[];
}

// Helper for Statistics
export interface NoticeStatistics {
  totalNotices: number;
  activeNotices: number;
  expiredNotices: number;
  featuredNotices: number;
}

// --- Helper Functions ---

/**
 * Handles common errors, logs them, and returns a standardized error object.
 * @param operationName The name of the operation being performed.
 * @param err The error object.
 * @returns A serializable error object.
 */
function handleNoticeError(
  operationName: string,
  err: unknown
): { error: string } {
  const errorMessage =
    err instanceof Error ? err.message : "An unknown error occurred.";
  error(`Failed to ${operationName}: ${errorMessage}`, { error: err });
  // For production, consider a more generic message to avoid leaking internal details.
  return { error: `Operation failed: ${operationName}. Please try again.` };
}

/**
 * Generates a unique slug from a title.
 * @param title The title of the notice.
 * @param excludeId Optional: An ID to exclude from the uniqueness check (for updates).
 * @returns A unique slug string.
 */
async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars except spaces and hyphens
    .trim()
    .replace(/\s+/g, "-"); // Replace spaces with hyphens

  if (!baseSlug) {
    baseSlug = "notice"; // Fallback slug if title is empty or unslugifiable
  }

  let uniqueSlug = baseSlug;
  let counter = 0;

  while (true) {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("id")
      .eq("slug", uniqueSlug)
      .limit(1);

    if (dbError) {
      error(`Error checking slug uniqueness for "${baseSlug}":`, dbError);
      throw dbError; // Re-throw to be caught by the calling function's error handler
    }

    // If no data, the slug is unique.
    // If data exists, but it's the item we're excluding (for updates), it's also unique for this context.
    if (!data || data.length === 0 || (excludeId && data[0].id === excludeId)) {
      break;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

// --- Notice Management Service ---

/**
 * Fetches all notices, ordered by publish_date descending.
 * @returns A list of notices or an error object.
 */
export async function getNotices(): Promise<Notice[] | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .order("publish_date", { ascending: false });

    if (dbError) {
      throw dbError;
    }

    info("Fetched all notices.");
    return data;
  } catch (err) {
    return handleNoticeError("fetch all notices", err);
  }
}

/**
 * Fetches all visible notices, ordered by publish_date descending.
 * Visible notices are those marked `visible = true`.
 * @returns A list of visible notices or an error object.
 */
export async function getPublishedNotices(): Promise<
  Notice[] | { error: string }
> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .eq("visible", true)
      .order("publish_date", { ascending: false });

    if (dbError) {
      throw dbError;
    }

    info("Fetched published notices.");
    return data;
  } catch (err) {
    return handleNoticeError("fetch published notices", err);
  }
}

/**
 * Fetches a single notice by its ID.
 * @param id The ID of the notice.
 * @returns The notice object, null if not found, or an error object.
 */
export async function getNoticeById(
  id: string
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError && dbError.code === "PGRST116") {
      // PGRST116 indicates no rows found for single()
      warn(`Notice with ID ${id} not found.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    info(`Fetched notice by ID: ${id}`);
    return data;
  } catch (err) {
    return handleNoticeError(`fetch notice by ID "${id}"`, err);
  }
}

/**
 * Fetches a single notice by its slug.
 * @param slug The slug of the notice.
 * @returns The notice object, null if not found, or an error object.
 */
export async function getNoticeBySlug(
  slug: string
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .eq("slug", slug)
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Notice with slug "${slug}" not found.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    info(`Fetched notice by slug: ${slug}`);
    return data;
  } catch (err) {
    return handleNoticeError(`fetch notice by slug "${slug}"`, err);
  }
}

/**
 * Creates a new notice.
 * Generates a unique slug if not provided or if it's not unique.
 * @param data The data for the new notice. `id` and `created_at` are automatically handled.
 * @returns The created notice or an error object.
 */
export async function createNotice(
  data: Omit<InsertNotice, "id" | "created_at">
): Promise<Notice | { error: string }> {
  try {
    const newSlug = await generateUniqueSlug(data.slug || data.title);

    const { data: createdNotice, error: dbError } = await supabase
      .from("notices")
      .insert({
        ...data,
        slug: newSlug,
        created_at: new Date().toISOString(), // Ensure created_at is set if not handled by DB default
      })
      .select("*")
      .single();

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Notice created: ${createdNotice.title} (${createdNotice.id})`);
    return createdNotice;
  } catch (err) {
    return handleNoticeError("create notice", err);
  }
}

/**
 * Updates an existing notice.
 * Revalidates cache after successful update.
 * @param id The ID of the notice to update.
 * @param data The updated data for the notice.
 * @returns The updated notice, null if not found, or an error object.
 */
export async function updateNotice(
  id: string,
  data: UpdateNotice
): Promise<Notice | { error: string } | null> {
  try {
    if (data.slug) {
      // Ensure slug uniqueness on update, excluding the current notice's ID
      data.slug = await generateUniqueSlug(data.slug, id);
    }

    const { data: updatedNotice, error: dbError } = await supabase
      .from("notices")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Attempted to update notice with ID ${id} but it was not found.`);
      return null; // Return null if the notice to update doesn't exist
    }

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Notice updated: ${updatedNotice.title} (${updatedNotice.id})`);
    return updatedNotice;
  } catch (err) {
    return handleNoticeError(`update notice "${id}"`, err);
  }
}

/**
 * Deletes a notice by its ID.
 * @param id The ID of the notice to delete.
 * @returns True if deletion was successful, false if not found, or an error object.
 */
export async function deleteNotice(
  id: string
): Promise<boolean | { error: string }> {
  try {
    const { error: dbError, count } = await supabase
      .from("notices")
      .delete()
      .eq("id", id)
      .select("id", { count: "exact" }); // Count rows affected

    if (dbError) {
      throw dbError;
    }

    if (count === 0) {
      warn(`Attempted to delete notice with ID ${id} but it was not found.`);
      return false;
    }

    revalidateNotices();
    info(`Notice deleted: ${id}`);
    return true;
  } catch (err) {
    return handleNoticeError(`delete notice "${id}"`, err);
  }
}

/**
 * Sets a notice's `visible` status to `true`.
 * @param id The ID of the notice to publish.
 * @returns The updated notice, null if not found, or an error object.
 */
export async function publishNotice(
  id: string
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .update({ visible: true })
      .eq("id", id)
      .select("*")
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Notice with ID ${id} not found for publishing.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Notice published: ${data.title} (${data.id})`);
    return data;
  } catch (err) {
    return handleNoticeError(`publish notice "${id}"`, err);
  }
}

/**
 * Sets a notice's `visible` status to `false`.
 * @param id The ID of the notice to unpublish.
 * @returns The updated notice, null if not found, or an error object.
 */
export async function unpublishNotice(
  id: string
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .update({ visible: false })
      .eq("id", id)
      .select("*")
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Notice with ID ${id} not found for unpublishing.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Notice unpublished: ${data.title} (${data.id})`);
    return data;
  } catch (err) {
    return handleNoticeError(`unpublish notice "${id}"`, err);
  }
}

/**
 * Sets a notice's `featured` status to `true`.
 * @param id The ID of the notice to feature.
 * @returns The updated notice, null if not found, or an error object.
 */
export async function featureNotice(
  id: string
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .update({ featured: true })
      .eq("id", id)
      .select("*")
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Notice with ID ${id} not found for featuring.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Notice featured: ${data.title} (${data.id})`);
    return data;
  } catch (err) {
    return handleNoticeError(`feature notice "${id}"`, err);
  }
}

/**
 * Sets a notice's `featured` status to `false`.
 * @param id The ID of the notice to unfeature.
 * @returns The updated notice, null if not found, or an error object.
 */
export async function unfeatureNotice(
  id: string
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .update({ featured: false })
      .eq("id", id)
      .select("*")
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Notice with ID ${id} not found for unfeaturing.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Notice unfeatured: ${data.title} (${data.id})`);
    return data;
  } catch (err) {
    return handleNoticeError(`unfeature notice "${id}"`, err);
  }
}

/**
 * Fetches notices filtered by category.
 * @param category The category to filter by.
 * @returns A list of notices in the specified category or an error object.
 */
export async function getNoticesByCategory(
  category: NoticeCategory
): Promise<Notice[] | { error: string }> {
  if (!ALL_NOTICE_CATEGORIES.includes(category)) {
    warn(`Invalid notice category provided: ${category}`);
    return { error: `Invalid category: ${category}` };
  }

  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .eq("category", category)
      .order("publish_date", { ascending: false });

    if (dbError) {
      throw dbError;
    }

    info(`Fetched notices for category: ${category}`);
    return data;
  } catch (err) {
    return handleNoticeError(`fetch notices by category "${category}"`, err);
  }
}

/**
 * Fetches all active notices.
 * Active notices are `visible = true` and `expiry_date` is either null or in the future.
 * @returns A list of active notices or an error object.
 */
export async function getActiveNotices(): Promise<Notice[] | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .eq("visible", true)
      .or("expiry_date.is.null,expiry_date.gte." + new Date().toISOString())
      .order("publish_date", { ascending: false });

    if (dbError) {
      throw dbError;
    }

    info("Fetched active notices.");
    return data;
  } catch (err) {
    return handleNoticeError("fetch active notices", err);
  }
}

/**
 * Searches notices by title, short_description, and content.
 * @param query The search query string.
 * @returns A list of matching notices or an error object.
 */
export async function searchNotices(
  query: string
): Promise<Notice[] | { error: string }> {
  try {
    // For full-text search, consider configuring a tsvector column and using `fts` or `plfts` in Supabase.
    // This example uses `ilike` for basic case-insensitive substring matching across multiple columns.
    const { data, error: dbError } = await supabase
      .from("notices")
      .select("*")
      .or(
        `title.ilike.%${query}%,short_description.ilike.%${query}%,content.ilike.%${query}%`
      )
      .order("publish_date", { ascending: false });

    if (dbError) {
      throw dbError;
    }

    info(`Searched notices with query: "${query}"`);
    return data;
  } catch (err) {
    return handleNoticeError(`search notices with query "${query}"`, err);
  }
}

/**
 * Updates the display order for a specific notice.
 * @param id The ID of the notice.
 * @param displayOrder The new display order value.
 * @returns The updated notice, null if not found, or an error object.
 */
export async function updateNoticeOrder(
  id: string,
  displayOrder: number
): Promise<Notice | null | { error: string }> {
  try {
    const { data, error: dbError } = await supabase
      .from("notices")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .select("*")
      .single();

    if (dbError && dbError.code === "PGRST116") {
      warn(`Notice with ID ${id} not found for order update.`);
      return null;
    }

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(`Updated display order for notice ${id} to ${displayOrder}`);
    return data;
  } catch (err) {
    return handleNoticeError(`update notice order for "${id}"`, err);
  }
}

/**
 * Checks if a slug is available (i.e., not currently in use by another notice).
 * @param slug The slug to check.
 * @param excludeId Optional: An ID to exclude from the check (useful during updates).
 * @returns True if available, false otherwise, or an error object.
 */
export async function isNoticeSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean | { error: string }> {
  try {
    let query = supabase.from("notices").select("id").eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error: dbError } = await query.limit(1);

    if (dbError) {
      throw dbError;
    }

    return data.length === 0;
  } catch (err) {
    return handleNoticeError(`check slug availability for "${slug}"`, err);
  }
}

/**
 * Duplicates an existing notice. A new unique slug is generated, and " - Copy" is appended to the title.
 * @param id The ID of the notice to duplicate.
 * @returns The new duplicated notice or an error object.
 */
export async function duplicateNotice(
  id: string
): Promise<Notice | { error: string } | null> {
  try {
    const originalNoticeResult = await getNoticeById(id);

    if (originalNoticeResult === null || "error" in originalNoticeResult) {
      if (originalNoticeResult === null) {
        warn(`Cannot duplicate: Notice with ID ${id} not found.`);
      }
      return originalNoticeResult; // Return null or error from getNoticeById
    }

    const originalNotice = originalNoticeResult;

    const newTitle = `${originalNotice.title} - Copy`;
    const newSlug = await generateUniqueSlug(newTitle); // Ensure a unique slug for the copy

    // Prepare data for the new notice, omitting ID and created_at which are generated.
    // Also reset visible/featured status for a fresh duplicate.
    const { id: _, created_at: __, ...dataToDuplicate } = originalNotice;

    const { data: duplicatedNotice, error: dbError } = await supabase
      .from("notices")
      .insert({
        ...dataToDuplicate,
        title: newTitle,
        slug: newSlug,
        visible: false, // Default to unpublished for duplicated items
        featured: false, // Default to not featured for duplicated items
        created_at: new Date().toISOString(),
        publish_date: new Date().toISOString(), // New publish date
        expiry_date: null, // Reset expiry by default
      })
      .select("*")
      .single();

    if (dbError) {
      throw dbError;
    }

    revalidateNotices();
    info(
      `Notice duplicated: from ${originalNotice.id} to ${duplicatedNotice.id}`
    );
    return duplicatedNotice;
  } catch (err) {
    return handleNoticeError(`duplicate notice "${id}"`, err);
  }
}

/**
 * Checks if a notice is expired based on its `expiry_date`.
 * @param notice The notice object.
 * @returns True if the notice has an expiry date in the past, false otherwise.
 */
export function isNoticeExpired(notice: Notice): boolean {
  if (!notice.expiry_date) {
    return false;
  }
  const expiry = new Date(notice.expiry_date);
  const now = new Date();
  // Consider time zones if `expiry_date` is only a date string without time.
  // For precise day-end expiry: if expiry_date is 'YYYY-MM-DD', it expires at the end of that day.
  // This simple comparison assumes expiry_date includes time or means "at the start of the day".
  return expiry < now;
}

/**
 * Iterates through all visible notices and sets `visible` to `false` for any that have expired.
 * @returns The count of notices archived or an error object.
 */
export async function archiveExpiredNotices(): Promise<
  number | { error: string }
> {
  try {
    const { data: expiredVisibleNotices, error: fetchError } = await supabase
      .from("notices")
      .select("id")
      .eq("visible", true)
      .lt("expiry_date", new Date().toISOString()); // notices with expiry_date in the past

    if (fetchError) {
      throw fetchError;
    }

    if (expiredVisibleNotices.length === 0) {
      info("No visible expired notices to archive.");
      return 0;
    }

    const expiredIds = expiredVisibleNotices.map((n) => n.id);

    const { error: updateError, count } = await supabase
      .from("notices")
      .update({ visible: false })
      .in("id", expiredIds)
      .select("id", { count: "exact" });

    if (updateError) {
      throw updateError;
    }

    if (count && count > 0) {
      revalidateNotices();
      info(`Archived ${count} expired notices.`);
    }

    return count ?? 0;
  } catch (err) {
    return handleNoticeError("archive expired notices", err);
  }
}

/**
 * Retrieves various statistics about notices.
 * @returns An object containing total, active, expired, and featured notice counts, or an error object.
 */
export async function getNoticeStatistics(): Promise<
  NoticeStatistics | { error: string }
> {
  try {
    const now = new Date().toISOString();

    // Total notices
    const { count: totalCount, error: totalError } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true });
    if (totalError) throw totalError;

    // Active notices (visible, not expired)
    const { count: activeCount, error: activeError } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true })
      .eq("visible", true)
      .or("expiry_date.is.null,expiry_date.gte." + now);
    if (activeError) throw activeError;

    // Expired notices (based on expiry_date, visible or not)
    const { count: expiredCount, error: expiredError } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true })
      .lt("expiry_date", now);
    if (expiredError) throw expiredError;

    // Featured notices
    const { count: featuredCount, error: featuredError } = await supabase
      .from("notices")
      .select("id", { count: "exact", head: true })
      .eq("featured", true);
    if (featuredError) throw featuredError;

    info("Fetched notice statistics.");
    return {
      totalNotices: totalCount ?? 0,
      activeNotices: activeCount ?? 0,
      expiredNotices: expiredCount ?? 0,
      featuredNotices: featuredCount ?? 0,
    };
  } catch (err) {
    return handleNoticeError("get notice statistics", err);
  }
}

/**
 * Builds SEO metadata for a given notice.
 * @param notice The notice object.
 * @returns An object with SEO title, description, and keywords.
 */
export function buildNoticeSEO(notice: Notice): NoticeSEO {
  return {
    title: notice.title,
    description:
      notice.short_description || notice.content?.substring(0, 160) || "",
    // Keywords could be derived from categories or tags if they existed, or from content analysis.
    keywords: [notice.category, "notice", "news", "announcement"].filter(
      Boolean
    ) as string[],
  };
}

// --- Future Compatibility Placeholders ---

/**
 * Schedules a notice to be published or unpublished at a future date/time.
 * TODO: Implement this using a background job queue (e.g., cron jobs, webhooks, Supabase Edge Functions + queues).
 */
export async function scheduleNotice(
  id: string,
  scheduleDate: Date,
  action: "publish" | "unpublish"
): Promise<boolean | { error: string }> {
  warn(
    `[TODO] scheduleNotice: Notice ID ${id} to ${action} on ${scheduleDate.toISOString()}. This feature is not yet implemented.`
  );
  // Placeholder implementation: For now, always returns an error.
  return { error: "Not yet implemented: Notice scheduling." };
}

/**
 * Sends notifications about a notice (e.g., push notifications, email).
 * TODO: Implement this using a notification service (e.g., Supabase Realtime, external notification provider).
 */
export async function sendNoticeNotification(
  id: string,
  message: string
): Promise<boolean | { error: string }> {
  warn(
    `[TODO] sendNoticeNotification: Notice ID ${id} with message "${message}". This feature is not yet implemented.`
  );
  // Placeholder implementation: For now, always returns an error.
  return { error: "Not yet implemented: Notice notifications." };
}

/**
 * Placeholder for an approval workflow for notices before publishing.
 * TODO: Implement an approval process with roles and states (e.g., draft, pending review, approved).
 */
export async function approveNotice(
  id: string,
  approvedByUserId: string // This would typically come from the authentication context
): Promise<Notice | null | { error: string }> {
  warn(
    `[TODO] approveNotice: Notice ID ${id} approved by user ${approvedByUserId}. This feature is not yet implemented.`
  );
  // Placeholder implementation: For now, it could simply publish the notice.
  return publishNotice(id);
}

// --- Multi-Tenant Compatibility Note ---
// For future multi-tenant compatibility, ensure a 'tenant_id' column exists
// on the 'notices' table. All queries would then need to include `.eq('tenant_id', currentTenantId)`.
// This service assumes a single tenant or that tenant_id is managed externally or globally.
// E.g., `const { data, error } = await supabase.from('notices').select('*').eq('tenant_id', tenantId);`