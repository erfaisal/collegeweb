import { ROLES, PERMISSIONS } from "@/lib/constants";

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a user role, strictly tied to the ROLES constant.
 * Allows for null or undefined to represent an unauthenticated or unset role.
 */
export type Role = typeof ROLES[keyof typeof ROLES];
export type UserRole = Role | null | undefined;

/**
 * Represents a specific permission, strictly tied to the PERMISSIONS constant.
 */
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Standardized result object for permission checks, providing a boolean outcome
 * and an optional reason string.
 */
export type PermissionCheckResult = {
  allowed: boolean;
  reason: string;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Retrieves all defined permissions from the PERMISSIONS constant.
 * This is useful for roles like SUPER_ADMIN which might have access to everything.
 * @returns An array of all possible permissions.
 */
const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS) as Permission[];
};

// ============================================================================
// RBAC Configuration Constants
// ============================================================================

/**
 * Defines the hierarchy of roles using numeric priorities.
 * Higher numbers indicate higher authority or broader access.
 * This allows for comparison between roles (e.g., "is this user's role at least X?").
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100, // Highest access
  [ROLES.CONTENT_MANAGER]: 80,
  [ROLES.MEDIA_MANAGER]: 70,
  [ROLES.SEO_MANAGER]: 60,
  [ROLES.ADMISSION_STAFF]: 50,
  // Add other roles from constants if they exist and assign appropriate priorities.
  // For production, ensure ALL roles from ROLES are defined here.
};

/**
 * Maps each role to the specific permissions it possesses.
 * This is the core matrix defining what each role is authorized to do.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: getAllPermissions(), // SUPER_ADMIN has all available permissions
  [ROLES.CONTENT_MANAGER]: [
    PERMISSIONS.PAGES_MANAGE,
    PERMISSIONS.NOTICES_MANAGE,
    PERMISSIONS.NAVIGATION_MANAGE,
  ],
  [ROLES.MEDIA_MANAGER]: [
    PERMISSIONS.GALLERY_MANAGE,
    PERMISSIONS.MEDIA_MANAGE,
  ],
  [ROLES.SEO_MANAGER]: [PERMISSIONS.SEO_MANAGE],
  [ROLES.ADMISSION_STAFF]: [PERMISSIONS.ADMISSIONS_MANAGE],
};

/**
 * Maps specific application routes to the minimum set of permissions required to access them.
 * This enables route-level authorization checks.
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  "/admin/dashboard": [PERMISSIONS.DASHBOARD_VIEW],
  "/admin/pages": [PERMISSIONS.PAGES_MANAGE],
  "/admin/notices": [PERMISSIONS.NOTICES_MANAGE],
  "/admin/gallery": [PERMISSIONS.GALLERY_MANAGE],
  "/admin/faculty": [PERMISSIONS.FACULTY_MANAGE],
  "/admin/departments": [PERMISSIONS.DEPARTMENTS_MANAGE],
  "/admin/admissions": [PERMISSIONS.ADMISSIONS_MANAGE],
  "/admin/seo": [PERMISSIONS.SEO_MANAGE],
  "/admin/settings": [PERMISSIONS.SETTINGS_MANAGE],
  "/admin/users": [PERMISSIONS.USERS_MANAGE],
  // Add other admin routes and their required permissions here.
};

/**
 * Maps specific application modules (e.g., UI components, API endpoints, logical features)
 * to the minimum set of permissions required to interact with them.
 * This allows for more granular control than just route-level authorization.
 */
export const MODULE_PERMISSIONS: Record<string, Permission[]> = {
  dashboard: [PERMISSIONS.DASHBOARD_VIEW],
  pages: [PERMISSIONS.PAGES_MANAGE],
  notices: [PERMISSIONS.NOTICES_MANAGE],
  gallery: [PERMISSIONS.GALLERY_MANAGE],
  media: [PERMISSIONS.MEDIA_MANAGE],
  faculty: [PERMISSIONS.FACULTY_MANAGE],
  departments: [PERMISSIONS.DEPARTMENTS_MANAGE],
  admissions: [PERMISSIONS.ADMISSIONS_MANAGE],
  seo: [PERMISSIONS.SEO_MANAGE],
  settings: [PERMISSIONS.SETTINGS_MANAGE],
  users: [PERMISSIONS.USERS_MANAGE],
  // Add other modules and their required permissions here.
};

// ============================================================================
// Core RBAC Functions
// ============================================================================

/**
 * Checks if a user's role meets or exceeds a required role in the hierarchy.
 * Useful for determining minimum access levels (e.g., "only managers and above").
 *
 * @param userRole The role of the current user. Can be null or undefined.
 * @param requiredRole The minimum role required for the action.
 * @returns `true` if `userRole`'s hierarchy level is greater than or equal to `requiredRole`'s, `false` otherwise.
 */
export function hasRole(userRole: UserRole, requiredRole: Role): boolean {
  if (!userRole) {
    return false; // No role provided, so no access.
  }

  const userPriority = ROLE_HIERARCHY[userRole];
  const requiredPriority = ROLE_HIERARCHY[requiredRole];

  if (userPriority === undefined || requiredPriority === undefined) {
    // Log a warning if roles are not defined in the hierarchy.
    console.warn(
      `RBAC Warning: Undefined role(s) encountered. User: "${userRole}", Required: "${requiredRole}". Ensure all ROLES are mapped in ROLE_HIERARCHY.`
    );
    return false;
  }

  return userPriority >= requiredPriority;
}

/**
 * Checks if a specific role possesses a given permission.
 *
 * @param role The role to check.
 * @param permission The permission to verify.
 * @returns `true` if the role has the permission, `false` otherwise.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  if (!role) {
    return false;
  }
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) {
    return false; // Role has no permissions defined.
  }
  return rolePermissions.includes(permission);
}

/**
 * Checks if a specific role possesses at least one of the given permissions.
 * Useful for scenarios where multiple permissions could grant access (e.g., "edit OR publish").
 *
 * @param role The role to check.
 * @param permissions An array of permissions to check against.
 * @returns `true` if the role has any of the permissions, `false` otherwise.
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  if (!role || !permissions || permissions.length === 0) {
    return false;
  }
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) {
    return false;
  }
  // Use a Set for optimized lookup performance, especially with many permissions.
  const rolePermissionsSet = new Set(rolePermissions);
  return permissions.some((p) => rolePermissionsSet.has(p));
}

/**
 * Checks if a specific role possesses all of the given permissions.
 * Useful for strict authorization where multiple conditions must be met.
 *
 * @param role The role to check.
 * @param permissions An array of permissions to verify.
 * @returns `true` if the role has all specified permissions, `false` otherwise.
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  if (!role || !permissions || permissions.length === 0) {
    // If no permissions are required, or role is missing, return false for safety.
    return false;
  }
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) {
    return false;
  }
  // Use a Set for optimized lookup performance.
  const rolePermissionsSet = new Set(rolePermissions);
  return permissions.every((p) => rolePermissionsSet.has(p));
}

/**
 * Determines if a role can access a specific application route based on predefined mappings.
 * Access is granted only if the role possesses ALL permissions required for the route.
 *
 * @param role The role to check.
 * @param route The full route path (e.g., "/admin/pages").
 * @returns `true` if the role has all required permissions for the route, `false` otherwise.
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  if (!role) {
    return false;
  }
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // If a route is not explicitly mapped to permissions, deny access by default for security.
    // In some cases, a `DASHBOARD_VIEW` or `ADMIN_PANEL_ACCESS` permission might be a fallback.
    return false;
  }
  return hasAllPermissions(role, requiredPermissions);
}

/**
 * Determines if a role can access or manage a specific application module.
 * Modules can be UI components, features, or logical sections of the application.
 * Access is granted only if the role possesses ALL permissions required for the module.
 *
 * @param role The role to check.
 * @param moduleKey The unique key for the module (e.g., "pages", "admissions").
 * @returns `true` if the role has all required permissions for the module, `false` otherwise.
 */
export function canAccessModule(role: UserRole, moduleKey: string): boolean {
  if (!role) {
    return false;
  }
  const requiredPermissions = MODULE_PERMISSIONS[moduleKey];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // Deny access by default if a module is not explicitly mapped for security.
    return false;
  }
  return hasAllPermissions(role, requiredPermissions);
}

/**
 * Checks if the given role is considered an "admin" role within the platform context.
 * An admin role is typically one with elevated privileges, defined by a hierarchy threshold.
 *
 * @param role The role to check.
 * @returns `true` if the role is an admin role, `false` otherwise.
 */
export function isAdmin(role: UserRole): boolean {
  if (!role) {
    return false;
  }
  // For this CMS, we might consider any role from ADMISSION_STAFF upwards as an 'admin'
  // as they have access to an admin-specific module. Adjust the threshold as needed.
  const MIN_ADMIN_PRIORITY = ROLE_HIERARCHY[ROLES.ADMISSION_STAFF];
  const userPriority = ROLE_HIERARCHY[role];

  return userPriority !== undefined && userPriority >= MIN_ADMIN_PRIORITY;
}

/**
 * Checks if the given role is specifically the `SUPER_ADMIN` role.
 * This role typically has unrestricted access and might bypass other permission checks.
 *
 * @param role The role to check.
 * @returns `true` if the role is `SUPER_ADMIN`, `false` otherwise.
 */
export function isSuperAdmin(role: UserRole): boolean {
  if (!role) {
    return false;
  }
  return role === ROLES.SUPER_ADMIN;
}

/**
 * Placeholder for future department-level authorization.
 *
 * TODO: Implement detailed logic based on:
 *   1. Department-specific permissions (e.g., `DEPARTMENT_X_MANAGE_ADMISSIONS`).
 *   2. User-to-department assignments (e.g., a user having a `DEPARTMENT_MANAGER` role for a specific departmentId).
 *   3. Multi-tenancy context, where departments might belong to different tenants.
 * This would typically involve querying user's department affiliations from the database.
 *
 * @param role The role of the user.
 * @param departmentId The ID of the department to manage.
 * @returns Always returns `false` for now, denying access until implemented.
 */
export function canManageDepartment(
  role: UserRole,
  departmentId: string
): boolean {
  console.warn(
    `RBAC: canManageDepartment for departmentId "${departmentId}" is a placeholder and not yet implemented. Denying access.`
  );
  // Example future logic:
  // if (isSuperAdmin(role)) return true;
  // if (hasPermission(role, PERMISSIONS.DEPARTMENTS_MANAGE_ALL)) return true; // Global department management
  // Fetch user's assigned departments and check if role has specific permission for this departmentId.
  return false;
}

/**
 * Retrieves all permissions associated with a given role from the `ROLE_PERMISSIONS` matrix.
 *
 * @param role The role for which to retrieve permissions.
 * @returns An array of permissions, or an empty array if the role has no defined permissions.
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// ============================================================================
// Authorization Result Utility
// ============================================================================

/**
 * Creates a standardized `PermissionCheckResult` object.
 * This can be used to return consistent results from authorization checks,
 * especially when a reason for denial is helpful for debugging or UI feedback.
 *
 * @param allowed A boolean indicating whether the action is permitted.
 * @param reason An optional string explaining the result (e.g., "Insufficient role," "Missing permission").
 * @returns A `PermissionCheckResult` object.
 */
export function buildPermissionResult(
  allowed: boolean,
  reason: string = ""
): PermissionCheckResult {
  return { allowed, reason };
}