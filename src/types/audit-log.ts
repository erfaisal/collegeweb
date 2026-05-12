/**
 * Defines standard audit log action types, allowing arbitrary strings for future scalability.
 */
export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'login'
  | 'logout'
  | (string & {});

/**
 * Defines standard entity types being audited, allowing arbitrary strings for future scalability.
 */
export type AuditEntityType =
  | 'page'
  | 'faculty'
  | 'gallery'
  | 'notice'
  | 'settings'
  | 'user_role'
  | 'media'
  | 'navigation'
  | (string & {});

/**
 * Defines the severity level of the audited event.
 */
export type AuditSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | (string & {});

/**
 * Defines the execution status of the action being logged.
 */
export type AuditStatus = 
  | 'success' 
  | 'failure' 
  | 'warning' 
  | (string & {});

/**
 * Represents a single audit log entry within the institutional CMS platform.
 * Designed to track administrative actions, ensure compliance, and provide security accountability.
 */
export interface AuditLog {
  id: string;
  
  // User/Actor Information
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  
  // Action Context
  action_type: AuditActionType;
  entity_type: AuditEntityType;
  entity_id: string | null;
  entity_name: string | null; // Human-readable identifier for the entity (e.g., page title)
  description: string | null; // Human-readable summary of the action
  
  // Data Changes (JSONB in Supabase)
  previous_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  
  // Request/Network Context
  ip_address: string | null;
  user_agent: string | null;
  route_path: string | null;
  
  // Metadata
  severity: AuditSeverity;
  status: AuditStatus;
  
  // Timestamp
  created_at: string;
}

/**
 * Utility type for creating an AuditLog entry via Supabase,
 * omitting auto-generated database fields.
 */
export type AuditLogPayload = Omit<
  AuditLog,
  'id' | 'created_at'
>;
