/**
 * Defines standard page types, while allowing arbitrary strings for future scalability
 * in a dynamic CMS architecture.
 */
export type PageType =
  | 'standard'
  | 'department'
  | 'hostel'
  | 'hospital'
  | 'landing'
  | 'academic'
  | 'research'
  | 'policy'
  | (string & {}); 

export interface Page {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  content: string | null;
  featured_image_url: string | null;
  page_type: PageType;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  is_published: boolean;
  show_in_navbar: boolean;
  show_in_footer: boolean;
  allow_comments: boolean;
  template: string | null;
  author_name: string | null;
  route_path: string | null;
  display_order: number;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Utility type for creating or updating a Page via Supabase,
 * omitting auto-generated database fields.
 */
export type PagePayload = Omit<
  Page,
  'id' | 'created_at' | 'updated_at'
>;
