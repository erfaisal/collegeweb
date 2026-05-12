/**
 * Defines standard roles within the institutional CMS, 
 * while allowing arbitrary strings for future custom roles and SaaS multi-tenancy.
 */
export type RoleName =
  | 'super_admin'
  | 'content_manager'
  | 'admission_staff'
  | 'faculty_manager'
  | 'media_manager'
  | 'seo_manager'
  | (string & {});

/**
 * Represents a user's role and access control permissions within the CMS platform.
 * Designed to map cleanly to Supabase Row Level Security (RLS) and middleware checks.
 */
export interface UserRole {
  id: string;
  user_id: string; // Maps to auth.users ID
  role_name: RoleName;
  display_name: string;
  description: string | null;
  
  // JSONB structure for fine-grained or future dynamic permissions
  permissions: string[] | Record<string, boolean> | null;
  
  // Core Module Permission Flags
  can_manage_users: boolean;
  can_manage_settings: boolean;
  can_manage_navigation: boolean;
  can_manage_pages: boolean;
  can_manage_gallery: boolean;
  can_manage_notices: boolean;
  can_manage_faculty: boolean;
  can_manage_admissions: boolean;
  can_manage_departments: boolean;
  can_manage_hostels: boolean;
  can_manage_hospital: boolean;
  can_manage_media: boolean;
  can_manage_seo: boolean;
  
  // Content Lifecycle
  can_publish_content: boolean;
  
  // Administrative & Status
  is_super_admin: boolean; // Overrides all other permissions when true
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Utility type for creating or updating a UserRole via Supabase,
 * omitting auto-generated database fields.
 */
export type UserRolePayload = Omit<
  UserRole,
  'id' | 'created_at' | 'updated_at'
>;
