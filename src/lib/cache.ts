import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';

// --- Cache Durations ---
// These constants define the time-to-live (TTL) for different types of cached data in seconds.
// A higher value means data stays in cache longer, reducing database/API calls but increasing
// the potential for stale data. Values are chosen based on expected data change frequency.
export const SETTINGS_CACHE_SECONDS = 3600; // 1 hour
export const THEME_CACHE_SECONDS = 3600; // 1 hour
export const NAVIGATION_CACHE_SECONDS = 3600; // 1 hour
export const SEO_CACHE_SECONDS = 3600; // 1 hour
export const HOMEPAGE_CACHE_SECONDS = 1800; // 30 minutes
export const PAGE_CACHE_SECONDS = 1800; // 30 minutes
export const NOTICES_CACHE_SECONDS = 900; // 15 minutes (more dynamic content)
export const FACULTY_CACHE_SECONDS = 1800; // 30 minutes
export const DEPARTMENTS_CACHE_SECONDS = 1800; // 30 minutes

// --- Cache Tags ---
// These constants define unique string identifiers (tags) for different categories of cached data.
// They are crucial for targeted cache invalidation. When data associated with a tag changes,
// `revalidateTag()` can be called with the corresponding tag to instantly clear only that specific
// category of cached data across all relevant parts of the application.
//
// In a multi-tenant SaaS context, these tags represent *global* categories. For tenant-specific
// invalidation (e.g., only settings for `tenantA` change), additional tenant-specific tags
// would typically be added when `unstable_cache` is called, and `revalidateTag()` would be invoked
// with the specific tenant tag. For this implementation, we're using broad, category-level tags
// as requested by the `revalidateX()` helper signatures without arguments.
export const SETTINGS_TAG = 'settings';
export const THEME_TAG = 'theme';
export const NAVIGATION_TAG = 'navigation';
export const SEO_TAG = 'seo';
export const HOMEPAGE_TAG = 'homepage';
export const PAGES_TAG = 'pages'; // For all generic CMS pages
export const NOTICES_TAG = 'notices';
export const FACULTY_TAG = 'faculty';
export const DEPARTMENTS_TAG = 'departments';

// --- Helper Types ---
/**
 * A generic type for an async function that can be cached.
 * @template T The return type of the function's Promise.
 * @template Args The argument types of the function.
 */
type CacheableFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

// --- Core Caching Helper ---
/**
 * Creates a cached version of an async function using Next.js's `unstable_cache`.
 * This helper simplifies setting up cached data fetches with automatic revalidation tags and duration.
 *
 * @template T The return type of the callback function.
 * @template Args The argument types of the callback function.
 * @param {string[]} keyParts An array of strings that form the unique static cache key for the query.
 *                            These static parts are combined by Next.js with arguments passed to the
 *                            callback function to create a distinct cache entry. For example, `['settings-query']`.
 * @param {CacheableFunction<T, Args>} callback The async function whose results should be cached.
 * @param {string[]} tags An array of cache tags for targeted revalidation using `revalidateTag()`.
 *                        These tags must be static strings defined at the module level.
 * @param {number | false | undefined} revalidate The cache duration in seconds.
 *                                                - `number`: TTL in seconds.
 *                                                - `false`: Indefinite cache (until manual revalidation or app restart).
 *                                                - `undefined`: Next.js default (usually 60 seconds).
 * @returns {CacheableFunction<T, Args>} A cached version of the callback function.
 */
export function createCachedQuery<T, Args extends any[]>(
  keyParts: string[],
  callback: CacheableFunction<T, Args>,
  tags: string[],
  revalidate?: number | false
): CacheableFunction<T, Args> {
  return unstable_cache(callback, keyParts, {
    tags,
    revalidate,
  });
}

// --- Revalidation Helpers (Tag-based) ---
// These functions trigger cache invalidation for specific data categories by calling `revalidateTag()`.
// This is critical for ensuring content freshness across the platform. When content changes in the CMS
// (e.g., via Supabase webhooks, API calls, or CMS backend events), the relevant `revalidateX()`
// function should be called to instantly purge outdated cached data.
//
// Invalidation Flow:
// 1. A data change occurs (e.g., an admin updates settings in the CMS).
// 2. An API endpoint or server action handling the update calls the appropriate `revalidateX()` helper.
// 3. `revalidateTag()` is invoked with the specific tag (e.g., 'settings').
// 4. Next.js clears all cached entries associated with that tag, ensuring subsequent requests
//    fetch fresh data.
//
// Revalidation Strategy:
// For institutional CMS and multi-tenant SaaS, this broad tag-based revalidation is effective for
// changes that impact all instances or a significant portion of the platform. For highly granular
// tenant-specific content that changes frequently, consider defining cached queries that include
// tenant-ID specific tags (e.g., `['settings', `tenant-${tenantId}-settings`]`) when `unstable_cache` is
// called, and corresponding tenant-aware revalidation helpers (e.g., `revalidateTenantSettings(tenantId)`).

export function revalidateSettings(): void {
  revalidateTag(SETTINGS_TAG);
  console.log(`Revalidated cache tag: ${SETTINGS_TAG}`);
}

export function revalidateTheme(): void {
  revalidateTag(THEME_TAG);
  console.log(`Revalidated cache tag: ${THEME_TAG}`);
}

export function revalidateNavigation(): void {
  revalidateTag(NAVIGATION_TAG);
  console.log(`Revalidated cache tag: ${NAVIGATION_TAG}`);
}

export function revalidateSEO(): void {
  revalidateTag(SEO_TAG);
  console.log(`Revalidated cache tag: ${SEO_TAG}`);
}

export function revalidateHomepage(): void {
  revalidateTag(HOMEPAGE_TAG);
  console.log(`Revalidated cache tag: ${HOMEPAGE_TAG}`);
}

export function revalidatePages(): void {
  revalidateTag(PAGES_TAG);
  console.log(`Revalidated cache tag: ${PAGES_TAG}`);
}

export function revalidateNotices(): void {
  revalidateTag(NOTICES_TAG);
  console.log(`Revalidated cache tag: ${NOTICES_TAG}`);
}

export function revalidateFaculty(): void {
  revalidateTag(FACULTY_TAG);
  console.log(`Revalidated cache tag: ${FACULTY_TAG}`);
}

export function revalidateDepartments(): void {
  revalidateTag(DEPARTMENTS_TAG);
  console.log(`Revalidated cache tag: ${DEPARTMENTS_TAG}`);
}

// --- Path Revalidation Helpers ---
// These functions trigger cache invalidation for specific Next.js page paths.
// This is useful for clearing the HTML cache of a specific page when its underlying data changes,
// ensuring users see the most up-to-date version of that page on subsequent visits.
export function revalidateHomePagePath(): void {
  revalidatePath('/', 'page');
  console.log('Revalidated path: /');
}

/**
 * Revalidates a specific page path.
 * @param path The absolute path of the page to revalidate (e.g., '/about', '/news/article-slug').
 */
export function revalidatePagePath(path: string): void {
  if (!path.startsWith('/')) {
    console.warn(`Attempted to revalidate an invalid path: "${path}". Path must start with '/'.`);
    return;
  }
  revalidatePath(path, 'page');
  console.log(`Revalidated path: ${path}`);
}

// --- Example Cached Queries ---
// These examples demonstrate how to use `createCachedQuery` to wrap data fetching functions.
// In a real application, the mock `setTimeout` would be replaced with actual Supabase queries,
// API calls, or database fetches.

interface Settings {
  id: number;
  tenantId: string;
  siteName: string;
  logoUrl: string;
  contactEmail: string;
  socialLinks: { [key: string]: string };
}

interface Theme {
  id: number;
  tenantId: string;
  primaryColor: string;
  fontFamily: string;
  darkModeEnabled: boolean;
}

interface NavigationItem {
  id: number;
  label: string;
  path: string;
  children?: NavigationItem[];
}

/**
 * Example 1: Cached Settings for a tenant.
 * The `tenantId` argument is automatically incorporated into the cache key by `unstable_cache`.
 */
export const cachedSettings = createCachedQuery(
  ['settings-data'], // Static key parts for this specific settings query.
  async (tenantId: string): Promise<Settings> => {
    // In a real app, this would be a Supabase query or API call:
    // const { data, error } = await supabase.from('settings').select('*').eq('tenant_id', tenantId).single();
    console.log(`[CACHE MISS] Fetching settings for tenant: ${tenantId}...`);
    await new Promise((resolve) => setTimeout(resolve, 150)); // Simulate async DB/API call
    return {
      id: 1,
      tenantId,
      siteName: `Institution CMS - ${tenantId}`,
      logoUrl: '/logos/default-logo.png',
      contactEmail: `contact@${tenantId}.edu`,
      socialLinks: { twitter: `https://twitter.com/${tenantId}` },
    };
  },
  [SETTINGS_TAG], // Global tag for all settings data.
  SETTINGS_CACHE_SECONDS
);

/**
 * Example 2: Cached Theme for a tenant.
 */
export const cachedTheme = createCachedQuery(
  ['theme-data'],
  async (tenantId: string): Promise<Theme> => {
    // const { data } = await supabase.from('themes').select('*').eq('tenant_id', tenantId).single();
    console.log(`[CACHE MISS] Fetching theme for tenant: ${tenantId}...`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      id: 1,
      tenantId,
      primaryColor: '#0056b3',
      fontFamily: 'Inter, sans-serif',
      darkModeEnabled: false,
    };
  },
  [THEME_TAG],
  THEME_CACHE_SECONDS
);

/**
 * Example 3: Cached Navigation for a tenant.
 */
export const cachedNavigation = createCachedQuery(
  ['navigation-data'],
  async (tenantId: string): Promise<NavigationItem[]> => {
    // const { data } = await supabase.from('navigation').select('*').eq('tenant_id', tenantId).order('order_idx');
    console.log(`[CACHE MISS] Fetching navigation for tenant: ${tenantId}...`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      { id: 1, label: 'Home', path: '/' },
      { id: 2, label: 'About Us', path: '/about' },
      {
        id: 3,
        label: 'Academics',
        path: '/academics',
        children: [
          { id: 4, label: 'Departments', path: '/academics/departments' },
          { id: 5, label: 'Faculty', path: '/academics/faculty' },
        ],
      },
      { id: 6, label: 'Admissions', path: '/admissions' },
      { id: 7, label: 'Contact', path: '/contact' },
    ];
  },
  [NAVIGATION_TAG],
  NAVIGATION_CACHE_SECONDS
);