export interface Module {
  id: string;
  module_key: string;
  module_name: string;
  description: string | null;
  icon: string | null;
  enabled: boolean;
  visible_in_navbar: boolean;
  visible_in_homepage: boolean;
  visible_in_footer: boolean;
  homepage_order: number;
  route_path: string;
  category: string | null;
  supports_gallery: boolean;
  supports_seo: boolean;
  supports_custom_page: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Utility type for creating or updating a Module via Supabase,
 * omitting auto-generated and read-only fields.
 */
export type ModulePayload = Omit<
  Module,
  'id' | 'created_at' | 'updated_at'
>;
