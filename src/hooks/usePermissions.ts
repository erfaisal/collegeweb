"use client";

import { useMemo } from "react";

// =============================================================================
// RBAC Definitions (MOCK)
// In a real application, these types and functions would typically reside in:
// - Types: `@/types/rbac` or similar
// - RBAC Logic: `@/lib/rbac`
// For this single-file output, they are included directly.
// =============================================================================

/**
 * Defines the possible roles within the CMS platform.
 * Extend this union type as new roles are introduced.
 */
export type Role = "SuperAdmin" | "Admin" | "Editor" | "Faculty" | "Student" | "Guest";

/**
 * Defines the granular permissions available in the CMS platform.
 * Extend this union type as new features or capabilities are added.
 */
export type Permission =
  | "user.manage"
  | "user.view"
  | "page.create"
  | "page.edit"
  | "page.publish"
  | "page.delete"
  | "media.upload"
  | "media.manage"
  | "faculty.manage"
  | "department.manage"
  | "admission.manage"
  | "seo.manage"
  | "settings.manage"
  | "content.publish"
  | "dashboard.view"
  | "analytics.view";

/**
 * Defines the application routes that might require permission checks.
 * Extend this union type for new protected routes.
 */
export type Route =
  | "/dashboard"
  | "/admin/users"
  | "/admin/pages"
  | "/admin/media"
  | "/admin/faculty"
  | "/admin/departments"
  | "/admin/admissions"
  | "/admin/seo"
  | "/admin/settings"
  | "/profile"
  | "/"; // Public or default route

/**
 * Defines logical modules within the application that might require permission checks.
 * Extend this union type for new features or sections.
 */
export type Module =
  | "dashboard"
  | "users"
  | "pages"
  | "media"
  | "faculty"
  | "departments"
  | "admissions"
  | "seo"
  | "settings"
  | "content"
  | "analytics";

/**
 * A mapping of roles to their assigned permissions.
 * In a real application, this would typically be loaded from a configuration,
 * database, or API, and managed by the `@/lib/rbac` layer.
 */
const PERMISSION_MAP: Record<Role, Permission[]> = {
  SuperAdmin: [
    "user.manage",
    "user.view",
    "page.create",
    "page.edit",
    "page.publish",
    "page.delete",
    "media.upload",
    "media.manage",
    "faculty.manage",
    "department.manage",
    "admission.manage",
    "seo.manage",
    "settings.manage",
    "content.publish",
    "dashboard.view",
    "analytics.view",
  ],
  Admin: [
    "user.view",
    "page.create",
    "page.edit",
    "page.publish",
    "media.upload",
    "media.manage",
    "faculty.manage",
    "department.manage",
    "admission.manage",
    "seo.manage",
    "settings.manage",
    "content.publish",
    "dashboard.view",
    "analytics.view",
  ],
  Editor: [
    "page.create",
    "page.edit",
    "page.publish",
    "media.upload",
    "media.manage",
    "dashboard.view",
    "content.publish",
  ],
  Faculty: [
    "dashboard.view",
    "page.view", // Example: faculty can view published pages
    "faculty.manage", // Example: faculty can manage their own profile/courses
  ],
  Student: [
    "dashboard.view",
    "page.view", // Example: students can view course pages
  ],
  Guest: [
    "page.view", // Example: public content viewing
  ],
};

/**
 * A mapping of routes to the permissions required to access them.
 * Managed by the `@/lib/rbac` layer.
 */
const ROUTES_PERMISSION_MAP: Record<Route, Permission[]> = {
  "/": [], // Public route, no specific permissions
  "/dashboard": ["dashboard.view"],
  "/admin/users": ["user.manage"],
  "/admin/pages": ["page.edit"], // Access to manage pages (edit/create)
  "/admin/media": ["media.manage"],
  "/admin/faculty": ["faculty.manage"],
  "/admin/departments": ["department.manage"],
  "/admin/admissions": ["admission.manage"],
  "/admin/seo": ["seo.manage"],
  "/admin/settings": ["settings.manage"],
  "/profile": [], // Accessible to all logged-in users, no specific permission for the route itself
};

/**
 * A mapping of modules to the permissions required to use them.
 * Managed by the `@/lib/rbac` layer.
 */
const MODULES_PERMISSION_MAP: Record<Module, Permission[]> = {
  dashboard: ["dashboard.view"],
  users: ["user.manage"],
  pages: ["page.edit"], // Module for page management
  media: ["media.manage"],
  faculty: ["faculty.manage"],
  departments: ["department.manage"],
  admissions: ["admission.manage"],
  seo: ["seo.manage"],
  settings: ["settings.manage"],
  content: ["content.publish"],
  analytics: ["analytics.view"],
};

/**
 * Retrieves all permissions associated with a given role.
 * Returns an empty array if the role is null, undefined, or unknown.
 */
export const getRolePermissions = (role: Role | null | undefined): Permission[] => {
  if (!role || !(role in PERMISSION_MAP)) {
    return [];
  }
  return PERMISSION_MAP[role];
};

/**
 * Checks if a user's current role matches a target role.
 */
export const hasRole = (currentRole: Role | null | undefined, targetRole: Role): boolean => {
  return currentRole === targetRole;
};

/**
 * Checks if a user's current role has a specific permission.
 */
export const hasPermission = (
  currentRole: Role | null | undefined,
  permission: Permission
): boolean => {
  if (!currentRole) return false;
  const rolePermissions = getRolePermissions(currentRole);
  return rolePermissions.includes(permission);
};

/**
 * Checks if a user's current role has any of the specified permissions.
 */
export const hasAnyPermission = (
  currentRole: Role | null | undefined,
  permissions: Permission[]
): boolean => {
  if (!currentRole || permissions.length === 0) return false;
  const rolePermissions = getRolePermissions(currentRole);
  return permissions.some((p) => rolePermissions.includes(p));
};

/**
 * Checks if a user's current role has all of the specified permissions.
 */
export const hasAllPermissions = (
  currentRole: Role | null | undefined,
  permissions: Permission[]
): boolean => {
  if (!currentRole || permissions.length === 0) return false;
  const rolePermissions = getRolePermissions(currentRole);
  return permissions.every((p) => rolePermissions.includes(p));
};

/**
 * Checks if a user's current role can access a specific route.
 * If a route has no explicitly required permissions, it's considered accessible.
 */
export const canAccessRoute = (currentRole: Role | null | undefined, route: Route): boolean => {
  if (!currentRole) return false;
  const requiredPermissions = ROUTES_PERMISSION_MAP[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required for this route, implicitly accessible
  }
  return hasAllPermissions(currentRole, requiredPermissions);
};

/**
 * Checks if a user's current role can access a specific application module.
 * If a module has no explicitly required permissions, it's considered accessible.
 */
export const canAccessModule = (currentRole: Role | null | undefined, module: Module): boolean => {
  if (!currentRole) return false;
  const requiredPermissions = MODULES_PERMISSION_MAP[module];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required for this module, implicitly accessible
  }
  return hasAllPermissions(currentRole, requiredPermissions);
};

/**
 * Checks if the current role is an Admin or SuperAdmin.
 */
export const isAdmin = (currentRole: Role | null | undefined): boolean => {
  return currentRole === "Admin" || currentRole === "SuperAdmin";
};

/**
 * Checks if the current role is a SuperAdmin.
 */
export const isSuperAdmin = (currentRole: Role | null | undefined): boolean => {
  return currentRole === "SuperAdmin";
};

// =============================================================================
// usePermissions Hook
// =============================================================================

/**
 * Defines the structure of the object returned by the `usePermissions` hook.
 * This interface ensures strong typing for the hook's API.
 */
export interface UsePermissionsReturn {
  /** The normalized role being checked, or null if invalid/undefined. */
  role: Role | null;
  /** An array of all permissions associated with the current role. */
  permissions: Permission[];
  /** The total number of permissions for the current role. */
  permissionCount: number;
  /** True if the current role is 'Admin' or 'SuperAdmin'. */
  isAdmin: boolean;
  /** True if the current role is 'SuperAdmin'. */
  isSuperAdmin: boolean;
  /** Checks if the current role matches a specific target role. */
  hasRole: (targetRole: Role) => boolean;
  /** Checks if the current role possesses a specific permission. */
  hasPermission: (permission: Permission) => boolean;
  /** Checks if the current role possesses at least one of the specified permissions. */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** Checks if the current role possesses all of the specified permissions. */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** Checks if the current role can access a specific application route. */
  canAccessRoute: (route: Route) => boolean;
  /** Checks if the current role can access a specific application module/feature. */
  canAccessModule: (module: Module) => boolean;
  /** Returns the full list of permissions for the current role. */
  getPermissions: () => Permission[];
  /** Convenience flag: True if the user can manage users. */
  canManageUsers: boolean;
  /** Convenience flag: True if the user can manage pages (create/edit). */
  canManagePages: boolean;
  /** Convenience flag: True if the user can manage media files. */
  canManageMedia: boolean;
  /** Convenience flag: True if the user can manage faculty profiles/data. */
  canManageFaculty: boolean;
  /** Convenience flag: True if the user can manage departments. */
  canManageDepartments: boolean;
  /** Convenience flag: True if the user can manage admissions processes. */
  canManageAdmissions: boolean;
  /** Convenience flag: True if the user can manage SEO settings. */
  canManageSEO: boolean;
  /** Convenience flag: True if the user can manage general application settings. */
  canManageSettings: boolean;
  /** Convenience flag: True if the user can publish content. */
  canPublishContent: boolean;
}

/**
 * A React hook providing comprehensive permission checks and role-based access control utilities
 * based on the authenticated user's role. It memoizes results for performance and stable references.
 *
 * This hook is designed for client-side usage in React components.
 *
 * @param currentRole The role of the currently authenticated user. Can be null or undefined.
 * @returns An object containing role information, permission lists, and helper functions for access checks.
 */
export const usePermissions = (
  currentRole: Role | null | undefined
): UsePermissionsReturn => {
  // Normalize the role to ensure it's a known Role type or null, gracefully handling invalid inputs.
  const normalizedRole = useMemo(() => {
    return currentRole && (currentRole in PERMISSION_MAP) ? currentRole : null;
  }, [currentRole]);

  // Memoize the array of permissions for the normalized role.
  const memoizedPermissions = useMemo(() => {
    return getRolePermissions(normalizedRole);
  }, [normalizedRole]);

  // Memoize the count of permissions.
  const memoizedPermissionCount = useMemo(() => {
    return memoizedPermissions.length;
  }, [memoizedPermissions]);

  // Memoize common role checks directly.
  const memoizedIsAdmin = useMemo(() => {
    return isAdmin(normalizedRole);
  }, [normalizedRole]);

  const memoizedIsSuperAdmin = useMemo(() => {
    return isSuperAdmin(normalizedRole);
  }, [normalizedRole]);

  // Memoized curried helper functions, bound to the normalized role for a stable API.
  const memoizedHasRole = useMemo(() => {
    return (targetRole: Role) => hasRole(normalizedRole, targetRole);
  }, [normalizedRole]);

  const memoizedHasPermission = useMemo(() => {
    return (permission: Permission) => hasPermission(normalizedRole, permission);
  }, [normalizedRole]);

  const memoizedHasAnyPermission = useMemo(() => {
    return (permissions: Permission[]) => hasAnyPermission(normalizedRole, permissions);
  }, [normalizedRole]);

  const memoizedHasAllPermissions = useMemo(() => {
    return (permissions: Permission[]) => hasAllPermissions(normalizedRole, permissions);
  }, [normalizedRole]);

  const memoizedCanAccessRoute = useMemo(() => {
    return (route: Route) => canAccessRoute(normalizedRole, route);
  }, [normalizedRole]);

  const memoizedCanAccessModule = useMemo(() => {
    return (module: Module) => canAccessModule(normalizedRole, module);
  }, [normalizedRole]);

  const memoizedGetPermissions = useMemo(() => {
    // Return a function that fetches permissions, providing a consistent API with other methods.
    return () => getRolePermissions(normalizedRole);
  }, [normalizedRole]);

  // Memoized computed flags for specific common management tasks.
  // These use the memoized `hasPermission` function to ensure consistency and performance.
  const canManageUsers = useMemo(() => memoizedHasPermission("user.manage"), [memoizedHasPermission]);
  const canManagePages = useMemo(() => memoizedHasPermission("page.edit"), [memoizedHasPermission]);
  const canManageMedia = useMemo(() => memoizedHasPermission("media.manage"), [memoizedHasPermission]);
  const canManageFaculty = useMemo(() => memoizedHasPermission("faculty.manage"), [memoizedHasPermission]);
  const canManageDepartments = useMemo(() => memoizedHasPermission("department.manage"), [memoizedHasPermission]);
  const canManageAdmissions = useMemo(() => memoizedHasPermission("admission.manage"), [memoizedHasPermission]);
  const canManageSEO = useMemo(() => memoizedHasPermission("seo.manage"), [memoizedHasPermission]);
  const canManageSettings = useMemo(() => memoizedHasPermission("settings.manage"), [memoizedHasPermission]);
  const canPublishContent = useMemo(() => memoizedHasPermission("content.publish"), [memoizedHasPermission]);

  // Memoize the entire return object to ensure stable references across re-renders.
  // This prevents unnecessary re-renders in child components that consume these values.
  return useMemo(
    () => ({
      role: normalizedRole,
      permissions: memoizedPermissions,
      permissionCount: memoizedPermissionCount,
      isAdmin: memoizedIsAdmin,
      isSuperAdmin: memoizedIsSuperAdmin,
      hasRole: memoizedHasRole,
      hasPermission: memoizedHasPermission,
      hasAnyPermission: memoizedHasAnyPermission,
      hasAllPermissions: memoizedHasAllPermissions,
      canAccessRoute: memoizedCanAccessRoute,
      canAccessModule: memoizedCanAccessModule,
      getPermissions: memoizedGetPermissions,
      canManageUsers,
      canManagePages,
      canManageMedia,
      canManageFaculty,
      canManageDepartments,
      canManageAdmissions,
      canManageSEO,
      canManageSettings,
      canPublishContent,
    }),
    [
      normalizedRole,
      memoizedPermissions,
      memoizedPermissionCount,
      memoizedIsAdmin,
      memoizedIsSuperAdmin,
      memoizedHasRole,
      memoizedHasPermission,
      memoizedHasAnyPermission,
      memoizedHasAllPermissions,
      memoizedCanAccessRoute,
      memoizedCanAccessModule,
      memoizedGetPermissions,
      canManageUsers,
      canManagePages,
      canManageMedia,
      canManageFaculty,
      canManageDepartments,
      canManageAdmissions,
      canManageSEO,
      canManageSettings,
      canPublishContent,
    ]
  );
};

// =============================================================================
// Helper Hooks for specific use cases (built on top of the core RBAC functions)
// =============================================================================

/**
 * A concise helper hook to check if a user with a given role has a specific permission.
 * Uses `useMemo` for performance.
 *
 * @param role The role of the user to check.
 * @param permission The permission to check for.
 * @returns True if the role has the permission, false otherwise.
 */
export const useIsAuthorized = (
  role: Role | null | undefined,
  permission: Permission
): boolean => {
  return useMemo(() => hasPermission(role, permission), [role, permission]);
};

/**
 * A concise helper hook to check if a user with a given role can access a specific route.
 * Uses `useMemo` for performance.
 *
 * @param role The role of the user to check.
 * @param route The route to check access for.
 * @returns True if the role can access the route, false otherwise.
 */
export const useCanAccessRoute = (
  role: Role | null | undefined,
  route: Route
): boolean => {
  return useMemo(() => canAccessRoute(role, route), [role, route]);
};

/**
 * A concise helper hook to check if a user with a given role can access a specific module.
 * Uses `useMemo` for performance.
 *
 * @param role The role of the user to check.
 * @param module The module to check access for.
 * @returns True if the role can access the module, false otherwise.
 */
export const useCanAccessModule = (
  role: Role | null | undefined,
  module: Module
): boolean => {
  return useMemo(() => canAccessModule(role, module), [role, module]);
};