/**
 * Represents SEO metadata for a specific page or entity within the CMS.
 * Designed to cleanly map to Next.js 14 Metadata API and support standard 
 * Open Graph, Twitter Cards, and JSON-LD structured data.
 */
export interface SEOData {
  id: string;
  title: string | null;
  description: string | null;
  keywords: string[] | null;
  canonical_url: string | null;
  
  // Open Graph
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  
  // Twitter Cards
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_url: string | null;
  
  // Directives and Crawling
  robots: string | null; // e.g., 'index, follow', 'noindex, nofollow'
  revisit_after: string | null; // e.g., '7 days'
  
  // Advanced & Localization
  structured_data: Record<string, any> | null; // JSON-LD schema object
  author: string | null;
  language: string | null; // e.g., 'en-US'
  
  // Theming & Identity
  favicon_url: string | null;
  theme_color: string | null; // e.g., '#ffffff'
  
  // Relationship
  page_path: string; // The unique route path this SEO data applies to (e.g., '/', '/about', '/academics/cs')
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Utility type for creating or updating SEO records via Supabase,
 * omitting auto-generated database fields.
 */
export type SEOPayload = Omit<
  SEOData,
  'id' | 'created_at' | 'updated_at'
>;
