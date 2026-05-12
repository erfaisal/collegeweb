import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/user-role";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type UserRolePayload = Omit<UserRole, 'id' | 'created_at' | 'updated_at'>;

/**
 * Fetches the role assignments and permissions for a specific user.
 */
export async function getUserRole(user_id: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        console.error(`[getUserRole] Error fetching role for user ${user_id}:`, error.message);
      }
      return null;
    }

    return data as UserRole;
  } catch (err) {
    console.error(`[getUserRole] Unexpected error for user ${user_id}:`, err);
    return null;
  }
}

/**
 * Fetches all user roles.
 */
export async function getAllUserRoles(): Promise<UserRole[]> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllUserRoles] Error fetching user roles:", error.message);
      return [];
    }

    return data as UserRole[];
  } catch (err) {
    console.error("[getAllUserRoles] Unexpected error:", err);
    return [];
  }
}

/**
 * Assigns a new role and permission set to a user.
 */
export async function assignUserRole(
  payload: UserRolePayload
): Promise<ServiceResponse<UserRole>> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[assignUserRole] Error assigning user role:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as UserRole };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[assignUserRole] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing user role's permissions or status.
 */
export async function updateUserRole(
  id: string,
  payload: Partial<UserRolePayload>
): Promise<ServiceResponse<UserRole>> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateUserRole] Error updating role ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as UserRole };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateUserRole] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deactivates a user role, revoking all permissions without deleting the record.
 */
export async function deactivateUserRole(id: string): Promise<ServiceResponse<UserRole>> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[deactivateUserRole] Error deactivating role ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as UserRole };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deactivateUserRole] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Completely removes a user role assignment.
 */
export async function deleteUserRole(id: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[deleteUserRole] Error deleting role ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deleteUserRole] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Dynamically checks if a user has a specific permission.
 * Automatically grants access if the user is an active super admin.
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  permissionKey: keyof UserRole
): boolean {
  if (!userRole || !userRole.is_active) return false;
  if (userRole.is_super_admin) return true;

  // Ensure the requested key evaluates to a truthy boolean
  return Boolean(userRole[permissionKey]);
}

/**
 * Determines if the user holds an active super admin role.
 */
export function isSuperAdmin(userRole: UserRole | null | undefined): boolean {
  return Boolean(userRole?.is_active && userRole?.is_super_admin);
}

/**
 * Helper utility to determine access to a specific CMS module area.
 */
export function canAccessModule(
  userRole: UserRole | null | undefined,
  moduleKey: string
): boolean {
  if (!userRole || !userRole.is_active) return false;
  if (userRole.is_super_admin) return true;

  const permissionMap: Record<string, keyof UserRole> = {
    settings: 'can_manage_settings',
    users: 'can_manage_users',
    navigation: 'can_manage_navigation',
    pages: 'can_manage_pages',
    gallery: 'can_manage_gallery',
    notices: 'can_manage_notices',
    faculty: 'can_manage_faculty',
    admissions: 'can_manage_admissions',
    departments: 'can_manage_departments',
    hostels: 'can_manage_hostels',
    hospital: 'can_manage_hospital',
    media: 'can_manage_media',
    seo: 'can_manage_seo',
  };

  const requiredPermission = permissionMap[moduleKey];
  
  if (requiredPermission) {
    return Boolean(userRole[requiredPermission]);
  }

  // If a module isn't mapped directly to a boolean flag, deny by default
  return false;
}
