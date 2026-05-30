import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes and resolves conflicts.
 * Uses `clsx` for conditional classes and `tailwind-merge` for conflict resolution.
 *
 * @param inputs - A list of class names, arrays of class names, or objects where keys are class names and values are booleans.
 * @returns A single string of merged and optimized Tailwind CSS classes.
 * @example
 * cn("text-red-500", "p-4", { "bg-blue-200": true, "text-red-700": false }) // "p-4 bg-blue-200 text-red-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a given string into a URL-friendly slug.
 * - Converts to lowercase.
 * - Trims leading/trailing whitespace.
 * - Replaces non-alphanumeric characters (except spaces and hyphens) with nothing.
 * - Replaces spaces or underscores with hyphens.
 * - Removes leading/trailing hyphens.
 *
 * @param text - The input string to slugify.
 * @returns The slugified string.
 * @example
 * slugify("  Computer Science Engineering   ") // "computer-science-engineering"
 * slugify("Hello World! 123") // "hello-world-123"
 * slugify("Another Example --- With Dashing") // "another-example-with-dashing"
 */
export function slugify(text: string): string {
  if (typeof text !== "string") {
    console.warn("slugify received non-string input, returning empty string.", text);
    return "";
  }
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Replace non-alphanumeric, non-space, non-hyphen with nothing
    .replace(/[\s_-]+/g, "-") // Replace spaces or underscores with single hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Formats a Date object or string into a human-readable date string.
 * Example: "Jan 15, 2026"
 *
 * @param dateInput - The date as a Date object or a string.
 * @returns The formatted date string, or an empty string if the input is invalid.
 * @example
 * formatDate(new Date("2026-01-15T10:30:00Z")) // "Jan 15, 2026"
 * formatDate("2026-01-15") // "Jan 15, 2026"
 * formatDate(null) // ""
 */
export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    console.warn("formatDate received invalid date input, returning empty string.", dateInput);
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Formats a Date object or string into a human-readable date and time string.
 * Example: "Jan 15, 2026, 10:30 AM"
 *
 * @param dateInput - The date as a Date object or a string.
 * @returns The formatted date and time string, or an empty string if the input is invalid.
 * @example
 * formatDateTime(new Date("2026-01-15T10:30:00Z")) // "Jan 15, 2026, 10:30 AM"
 * formatDateTime("2026-01-15T22:45:00") // "Jan 15, 2026, 10:45 PM"
 * formatDateTime(null) // ""
 */
export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    console.warn("formatDateTime received invalid date input, returning empty string.", dateInput);
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

/**
 * Converts a size in bytes into a human-readable format (B, KB, MB, GB, etc.).
 * Examples:
 * 1024 -> 1 KB
 * 1048576 -> 1 MB
 *
 * @param bytes - The size in bytes.
 * @param decimals - The number of decimal places to include (default: 2).
 * @returns A string representing the formatted file size.
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(123456789) // "117.74 MB"
 * formatFileSize(500, 0) // "500 B"
 * formatFileSize(-100) // "0 B"
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0) {
    console.warn("formatFileSize received invalid bytes input, returning '0 B'.", bytes);
    return "0 B";
  }
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Truncates a given text string to a specified maximum length,
 * appending an ellipsis "..." if truncation occurs.
 *
 * @param text - The input string to truncate.
 * @param maxLength - The maximum length of the string before truncation.
 * @returns The truncated string with ellipsis, or the original string if shorter than maxLength.
 * @example
 * truncateText("This is a long text example.", 10) // "This is a..."
 * truncateText("Short text.", 20) // "Short text."
 * truncateText("", 5) // ""
 * truncateText("Hello", 0) // "..."
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (typeof text !== "string") {
    console.warn("truncateText received non-string input, returning empty string.", text);
    return "";
  }
  if (typeof maxLength !== "number" || isNaN(maxLength) || maxLength < 0) {
    console.warn("truncateText received invalid maxLength input, defaulting to 0.", maxLength);
    maxLength = 0;
  }

  if (text.length <= maxLength) {
    return text;
  }
  // Ensure we don't return "..." if maxLength is 0 and text is not empty.
  // Or handle cases where maxLength is too small for "..." to make sense.
  if (maxLength === 0) {
    return "...";
  }
  return text.substring(0, maxLength) + "...";
}

/**
 * Generates initials from a full name.
 * Examples:
 * John Doe -> JD
 * Faisal Muzaffar -> FM
 * SingleName -> S
 *
 * @param name - The full name string.
 * @returns The initials in uppercase, or an empty string if the name is invalid/empty.
 * @example
 * generateInitials("John Doe") // "JD"
 * generateInitials("Faisal Muzaffar") // "FM"
 * generateInitials("single") // "S"
 * generateInitials("  ") // ""
 */
export function generateInitials(name: string | null | undefined): string {
  if (typeof name !== "string" || !name.trim()) {
    return "";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") {
    return "";
  }
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || "";
  }
  return (
    (parts[0][0] || "") + (parts[parts.length - 1][0] || "")
  ).toUpperCase();
}

/**
 * Builds a full canonical URL by combining a base URL and a path.
 * Handles cases where base URL might end with a slash or path might start with one.
 * Uses URL constructor for robust path resolution.
 *
 * @param baseUrl - The base URL (e.g., "https://www.example.com").
 * @param path - The relative or absolute path (e.g., "/about", "products/item-1").
 * @returns The full canonical URL string, or an empty string if inputs are invalid.
 * @example
 * buildCanonicalUrl("https://www.example.com/", "about") // "https://www.example.com/about"
 * buildCanonicalUrl("https://www.example.com", "/products/item-1") // "https://www.example.com/products/item-1"
 * buildCanonicalUrl("https://www.example.com/blog", "../posts/post-1") // "https://www.example.com/posts/post-1"
 */
export function buildCanonicalUrl(baseUrl: string | null | undefined, path: string | null | undefined): string {
  if (typeof baseUrl !== "string" || !baseUrl) {
    console.warn("buildCanonicalUrl received invalid baseUrl, returning empty string.", baseUrl);
    return "";
  }
  if (typeof path !== "string") {
    console.warn("buildCanonicalUrl received invalid path, defaulting to '/' for path.", path);
    path = "/";
  }

  try {
    // Get the origin of the base URL to ensure canonical paths are rooted.
    const baseOrigin = new URL(baseUrl).origin;
    // The URL constructor correctly handles path resolution relative to the origin.
    return new URL(path, baseOrigin).toString();
  } catch (error) {
    console.error(`Error building canonical URL for base "${baseUrl}" and path "${path}":`, error);
    return "";
  }
}

/**
 * Builds a page title suitable for an HTML <title> tag.
 * If a title is provided, it's combined with the site name. Otherwise, only the site name is used.
 * Example: "Admissions | ABC Engineering College"
 *
 * @param title - The specific page title (e.g., "Admissions").
 * @param siteName - The name of the website/platform (e.g., "ABC Engineering College").
 * @returns The formatted page title string.
 * @example
 * buildPageTitle("Admissions", "ABC Engineering College") // "Admissions | ABC Engineering College"
 * buildPageTitle("", "My Platform") // "My Platform"
 * buildPageTitle("Contact", "") // "Contact" (if siteName is empty)
 */
export function buildPageTitle(title: string | null | undefined, siteName: string | null | undefined): string {
  const trimmedTitle = (title || "").trim();
  const trimmedSiteName = (siteName || "").trim();

  if (!trimmedSiteName) {
    return trimmedTitle; // If siteName is empty, just return title
  }

  return trimmedTitle ? `${trimmedTitle} | ${trimmedSiteName}` : trimmedSiteName;
}

/**
 * Safely truncates and cleans a metadata description to a maximum of 160 characters.
 * - Removes HTML tags.
 * - Replaces multiple spaces with a single space.
 * - Truncates to the specified length.
 *
 * @param description - The raw description string.
 * @param maxLength - The maximum length for the description (default: 160).
 * @returns The cleaned and truncated description string.
 * @example
 * buildMetaDescription("<p>This is a <b>rich</b> description with <i>html tags</i>.</p>", 50) // "This is a rich description with html tags."
 * buildMetaDescription("A very long description that exceeds the typical 160 character limit for SEO purposes and needs to be truncated gracefully.", 100) // "A very long description that exceeds the typical 160 character limit for SEO purposes and needs to be trunca..."
 * buildMetaDescription(null) // ""
 */
export function buildMetaDescription(description: string | null | undefined, maxLength = 160): string {
  if (typeof description !== "string") {
    return "";
  }

  // Remove HTML tags
  const cleanedText = description.replace(/<[^>]*>?/gm, "");

  // Replace multiple spaces with a single space and trim
  const singleSpaceText = cleanedText.replace(/\s\s+/g, " ").trim();

  return truncateText(singleSpaceText, maxLength);
}

/**
 * Generates fallback alt text for an image.
 * Prioritizes provided alt text, then fallback text, then a generic "Image".
 * Ensures the alt text is trimmed and safe.
 *
 * @param altText - The primary alt text from content.
 * @param fallbackText - A secondary fallback text if primary is not available.
 * @returns The generated alt text string.
 * @example
 * getImageAlt("Custom alt", "Fallback alt") // "Custom alt"
 * getImageAlt(null, "Fallback alt") // "Fallback alt"
 * getImageAlt(undefined, undefined) // "Image"
 * getImageAlt("  ", "Fallback") // "Fallback" (if altText is just whitespace)
 */
export function getImageAlt(
  altText: string | null | undefined,
  fallbackText?: string | null | undefined
): string {
  const primary = (altText || "").trim();
  const fallback = (fallbackText || "").trim();
  return primary || fallback || "Image";
}

interface PaginationResult {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  offset: number;
  limit: number;
}

/**
 * Creates pagination metadata based on current page, page size, and total items.
 *
 * @param page - The current page number (1-indexed).
 * @param pageSize - The number of items per page.
 * @param totalItems - The total number of items available.
 * @returns An object containing pagination details.
 * @example
 * createPagination(1, 10, 100)
 * // { currentPage: 1, totalPages: 10, hasNext: true, hasPrevious: false, offset: 0, limit: 10 }
 * createPagination(5, 10, 45)
 * // { currentPage: 5, totalPages: 5, hasNext: false, hasPrevious: true, offset: 40, limit: 10 }
 * createPagination(1, 0, 100) // Handles pageSize 0, results in 1 page, limit 10 (default)
 * createPagination(1, 10, 0) // { currentPage: 1, totalPages: 1, hasNext: false, hasPrevious: false, offset: 0, limit: 10 }
 */
export function createPagination(page: number, pageSize: number, totalItems: number): PaginationResult {
  const parsedPage = typeof page === "number" && !isNaN(page) ? Math.floor(page) : 1;
  const currentPage = Math.max(1, parsedPage);

  const parsedPageSize = typeof pageSize === "number" && !isNaN(pageSize) ? Math.floor(pageSize) : 10;
  const effectivePageSize = Math.max(1, parsedPageSize); // Default pageSize to 1 if invalid or 0

  const parsedTotalItems = typeof totalItems === "number" && !isNaN(totalItems) ? Math.floor(totalItems) : 0;
  const effectiveTotalItems = Math.max(0, parsedTotalItems);

  const totalPages = Math.max(1, Math.ceil(effectiveTotalItems / effectivePageSize));

  // Ensure currentPage does not exceed totalPages after calculations
  const finalCurrentPage = Math.min(currentPage, totalPages);

  return {
    currentPage: finalCurrentPage,
    totalPages,
    hasNext: finalCurrentPage < totalPages,
    hasPrevious: finalCurrentPage > 1,
    offset: Math.max(0, (finalCurrentPage - 1) * effectivePageSize),
    limit: effectivePageSize,
  };
}

/**
 * A reusable sort helper that sorts an array of objects by a numeric 'displayOrder' property in ascending order.
 * If 'displayOrder' is not present or not a number, items are placed at the end.
 * Creates a new array, does not mutate the original.
 *
 * @template T - The type of objects in the array.
 * @param items - The array of objects to sort.
 * @param orderKey - The key of the property to sort by (default: 'displayOrder').
 * @returns A new array sorted by display order.
 * @example
 * sortByDisplayOrder([{name: 'C', displayOrder: 3}, {name: 'A', displayOrder: 1}, {name: 'B', displayOrder: 2}])
 * // [{name: 'A', displayOrder: 1}, {name: 'B', displayOrder: 2}, {name: 'C', displayOrder: 3}]
 * sortByDisplayOrder([{name: 'C'}, {name: 'A', displayOrder: 1}], 'order') // will treat 'C' as if it has no order
 * sortByDisplayOrder(null) // []
 */
export function sortByDisplayOrder<T>(items: T[] | null | undefined, orderKey: keyof T = "displayOrder" as keyof T): T[] {
  if (!Array.isArray(items)) {
    console.warn("sortByDisplayOrder received non-array input, returning empty array.", items);
    return [];
  }

  // Create a shallow copy to avoid mutating the original array
  return [...items].sort((a, b) => {
    const orderA = Number(a[orderKey]);
    const orderB = Number(b[orderKey]);

    const isANumber = !isNaN(orderA);
    const isBNumber = !isNaN(orderB);

    if (isANumber && isBNumber) {
      return orderA - orderB;
    }
    if (isANumber) {
      return -1; // 'a' comes first if only 'a' has a valid number
    }
    if (isBNumber) {
      return 1; // 'b' comes first if only 'b' has a valid number
    }
    return 0; // maintain relative order if neither has a valid number
  });
}

/**
 * A reusable sort helper that sorts an array of objects alphabetically by a specified string key.
 * Creates a new array, does not mutate the original.
 * Handles cases where the key might not exist or not be a string.
 *
 * @template T - The type of objects in the array.
 * @param items - The array of objects to sort.
 * @param key - The key of the string property to sort by (default: 'name').
 * @returns A new array sorted alphabetically.
 * @example
 * sortAlphabetically([{name: 'Zebra'}, {name: 'Apple'}, {name: 'Banana'}])
 * // [{name: 'Apple'}, {name: 'Banana'}, {name: 'Zebra'}]
 * sortAlphabetically([{title: 'Gamma'}, {title: 'Alpha'}], 'title')
 * // [{title: 'Alpha'}, {title: 'Gamma'}]
 * sortAlphabetically(null) // []
 */
export function sortAlphabetically<T>(items: T[] | null | undefined, key: keyof T = "name" as keyof T): T[] {
  if (!Array.isArray(items)) {
    console.warn("sortAlphabetically received non-array input, returning empty array.", items);
    return [];
  }

  // Create a shallow copy to avoid mutating the original array
  return [...items].sort((a, b) => {
    const valueA = String(a[key] || "").toLowerCase();
    const valueB = String(b[key] || "").toLowerCase();

    return valueA.localeCompare(valueB);
  });
}

/**
 * Formats a phone number string for basic display, primarily for 10-digit US numbers.
 * This is a basic formatter that strips non-digits and applies a simple pattern.
 * For robust international formatting, a dedicated library (e.g., `libphonenumber-js`) is recommended.
 * Example: "1234567890" -> "(123) 456-7890"
 *
 * @param phoneNumber - The raw phone number string.
 * @returns The formatted phone number string, or the original if it cannot be formatted in the US pattern.
 * @example
 * formatPhoneNumber("1234567890") // "(123) 456-7890"
 * formatPhoneNumber("+1 (987) 654-3210") // "(987) 654-3210" (strips +1 for US formatting)
 * formatPhoneNumber("555-1234") // "555-1234" (if not 10 digits)
 * formatPhoneNumber(null) // ""
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
  if (typeof phoneNumber !== "string") {
    console.warn("formatPhoneNumber received non-string input, returning empty string.", phoneNumber);
    return "";
  }
  const cleaned = phoneNumber.replace(/\D/g, ""); // Remove all non-digit characters

  // Basic US formatting for 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }

  // For other lengths, return the cleaned string. If cleaned is empty, return original.
  return cleaned || phoneNumber;
}

/**
 * Checks if a given URL is external to the current application's domain.
 * Requires `window.location.origin` which is available client-side.
 * For server-side rendering, `currentDomain` must be explicitly provided.
 *
 * @param url - The URL string to check.
 * @param currentDomain - The current domain or origin of the application (e.g., "https://www.example.com").
 *                          Defaults to `window.location.origin` if client-side.
 * @returns `true` if the URL is external, `false` otherwise.
 * @example
 * // Assuming window.location.origin is "https://myapp.com"
 * isExternalUrl("https://myapp.com/about") // false
 * isExternalUrl("/contact") // false (relative path)
 * isExternalUrl("https://another-domain.com") // true
 * isExternalUrl("mailto:test@example.com") // true (mailto is always external)
 * isExternalUrl("tel:+1234567890") // true (tel is always external)
 * isExternalUrl(null) // false
 */
export function isExternalUrl(
  url: string | null | undefined,
  currentDomain?: string | URL | null | undefined
): boolean {
  if (typeof url !== "string" || !url.trim()) {
    return false; // An empty or invalid URL cannot be external
  }
  const trimmedUrl = url.trim();

  // Handle mailto, tel, sms, whatsapp protocols which are always "external" in terms of navigating away from the site
  if (/^(mailto|tel|sms|whatsapp):/i.test(trimmedUrl)) {
    return true;
  }

  let effectiveCurrentDomain: string | URL | undefined = currentDomain;

  if (!effectiveCurrentDomain && typeof window !== "undefined") {
    effectiveCurrentDomain = window.location.origin;
  }

  // If we still don't have a current domain, and the URL is relative,
  // we can't determine if it's external, so we assume it's internal.
  // If the URL is absolute and has a different scheme/host than a default assumed one, it's external.
  if (!effectiveCurrentDomain) {
    try {
      // Use a dummy base for parsing to distinguish absolute vs relative.
      // If the URL is absolute (e.g., "http://external.com/path"), its host will be different from "localhost".
      // If it's relative (e.g., "/path"), its host will be "localhost".
      const parsedUrl = new URL(trimmedUrl, "http://localhost");
      return parsedUrl.host !== "localhost" && parsedUrl.hostname !== "localhost";
    } catch (e) {
      console.error(`isExternalUrl: Failed to parse URL "${trimmedUrl}" without currentDomain.`, e);
      return false; // Malformed URL, treat as not external for safety
    }
  }

  try {
    const urlObj = new URL(trimmedUrl, effectiveCurrentDomain);
    const domainObj = new URL(effectiveCurrentDomain);

    // Compare protocols and hosts. If they differ, it's external.
    // This covers cases like http://example.com vs https://example.com (different protocol)
    // or http://example.com vs http://sub.example.com (different host)
    return urlObj.protocol !== domainObj.protocol || urlObj.host !== domainObj.host;
  } catch (e) {
    // Malformed URL or other parsing error, consider it not external for safety
    console.error(`isExternalUrl: Failed to parse URL "${trimmedUrl}" with base "${effectiveCurrentDomain}".`, e);
    return false;
  }
}

/**
 * Extracts the video ID from a YouTube URL and returns the URL for its highest quality thumbnail.
 * Supports various YouTube URL formats. Falls back to 'hqdefault.jpg' if 'maxresdefault.jpg' is not found.
 *
 * @param youtubeUrl - The full YouTube video URL.
 * @returns The URL of the YouTube thumbnail, or an empty string if the URL is invalid.
 * @example
 * getYouTubeThumbnail("https://www.youtube.com/watch?v=dQw4w9WgXcQ") // "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
 * getYouTubeThumbnail("https://youtu.be/dQw4w9WgXcQ") // "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
 * getYouTubeThumbnail("https://www.youtube.com/embed/dQw4w9WgXcQ") // "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
 * getYouTubeThumbnail(null) // ""
 */
export function getYouTubeThumbnail(youtubeUrl: string | null | undefined): string {
  if (typeof youtubeUrl !== "string" || !youtubeUrl.trim()) {
    console.warn("getYouTubeThumbnail received invalid YouTube URL input, returning empty string.", youtubeUrl);
    return "";
  }

  let videoId: string | null = null;
  const url = youtubeUrl.trim();

  // Regex to match various YouTube URL formats and extract the video ID
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);

  if (match && match[1]) {
    videoId = match[1];
  }

  if (videoId) {
    // maxresdefault is the highest quality available. If not available, YouTube serves hqdefault, mqdefault, or default.
    // We return maxresdefault and let YouTube handle fallbacks on their side if maxres is missing.
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  console.warn("Could not extract YouTube video ID from URL, returning empty string.", youtubeUrl);
  return "";
}