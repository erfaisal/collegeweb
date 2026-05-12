/**
 * Defines standard homepage section identifiers, allowing arbitrary strings for 
 * custom or institution-specific dynamic sections.
 */
export type SectionKey =
  | 'hero'
  | 'about'
  | 'admissions'
  | 'faculty'
  | 'gallery'
  | 'hospital'
  | 'hostel'
  | 'placements'
  | 'testimonials'
  | 'research'
  | (string & {});

/**
 * Defines standard UI layout types for homepage sections, allowing arbitrary strings
 * for future custom layout implementations.
 */
export type LayoutType =
  | 'grid'
  | 'split'
  | 'slider'
  | 'banner'
  | 'cards'
  | 'masonry'
  | (string & {});

/**
 * Represents a dynamic homepage section within the CMS.
 * Designed to support modular rendering, drag-and-drop ordering, and customizable layouts.
 */
export interface HomepageSection {
  id: string;
  section_key: SectionKey;
  
  // Content
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: string | null; // Can hold raw text, HTML, or Markdown
  
  // Media & Actions
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  
  // Styling & Layout
  layout_type: LayoutType;
  background_style: string | null; // e.g., 'solid', 'gradient', 'image', 'none', hex codes
  custom_css_class: string | null;
  animation_style: string | null; // e.g., 'fade-in', 'slide-up'
  
  // Visibility & Ordering
  visible: boolean; // Determines if it's currently rendering on the frontend
  enabled: boolean; // Determines if the section feature is active system-wide
  display_order: number;
  
  // Associations & Advanced Data
  module_key: string | null; // Links this section to a specific module (e.g., 'hospital', 'admissions')
  section_data: Record<string, any> | null; // JSONB field for complex, section-specific configurations
  
  // SEO Configuration
  seo_title: string | null;
  seo_description: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Utility type for creating or updating a HomepageSection via Supabase,
 * omitting auto-generated database fields.
 */
export type HomepageSectionPayload = Omit<
  HomepageSection,
  'id' | 'created_at' | 'updated_at'
>;
