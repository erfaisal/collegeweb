import { supabase } from "@/lib/supabase";
import type { 
  AuditLog, 
  AuditLogPayload, 
  AuditActionType, 
  AuditEntityType, 
  AuditSeverity, 
  AuditStatus 
} from "@/types/audit-log";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Creates a new audit log entry.
 */
export async function createAuditLog(
  payload: AuditLogPayload
): Promise<ServiceResponse<AuditLog>> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[createAuditLog] Error creating audit log:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AuditLog };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createAuditLog] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches all audit logs, ordered by most recent first.
 */
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAuditLogs] Error fetching audit logs:", error.message);
      return [];
    }

    return data as AuditLog[];
  } catch (err) {
    console.error("[getAuditLogs] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetches audit logs for a specific user, ordered by most recent first.
 */
export async function getAuditLogsByUser(user_id: string): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[getAuditLogsByUser] Error fetching logs for user ${user_id}:`, error.message);
      return [];
    }

    return data as AuditLog[];
  } catch (err) {
    console.error(`[getAuditLogsByUser] Unexpected error for user ${user_id}:`, err);
    return [];
  }
}

/**
 * Fetches audit logs related to a specific entity (e.g., all changes to a specific page).
 */
export async function getAuditLogsByEntity(
  entity_type: AuditEntityType | string,
  entity_id: string
): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", entity_type)
      .eq("entity_id", entity_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[getAuditLogsByEntity] Error fetching logs for ${entity_type} ${entity_id}:`, error.message);
      return [];
    }

    return data as AuditLog[];
  } catch (err) {
    console.error(`[getAuditLogsByEntity] Unexpected error for ${entity_type} ${entity_id}:`, err);
    return [];
  }
}

/**
 * Fetches recent audit logs with critical severity.
 * Useful for security monitoring dashboards.
 */
export async function getRecentCriticalLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("severity", "critical")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getRecentCriticalLogs] Error fetching critical logs:", error.message);
      return [];
    }

    return data as AuditLog[];
  } catch (err) {
    console.error("[getRecentCriticalLogs] Unexpected error:", err);
    return [];
  }
}

/**
 * Deletes audit logs older than a specified number of days.
 * Designed for automated maintenance tasks to manage database size.
 */
export async function deleteOldAuditLogs(days: number): Promise<ServiceResponse<null>> {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    const isoThreshold = dateThreshold.toISOString();

    const { error } = await supabase
      .from("audit_logs")
      .delete()
      .lte("created_at", isoThreshold);

    if (error) {
      console.error(`[deleteOldAuditLogs] Error deleting logs older than ${days} days:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deleteOldAuditLogs] Unexpected error:`, err);
    return { success: false, error: errorMessage };
  }
}

export interface LogSystemActionOptions {
  action_type: AuditActionType | string;
  entity_type: AuditEntityType | string;
  entity_id?: string | null;
  entity_name?: string | null;
  description: string;
  severity?: AuditSeverity | string;
  status?: AuditStatus | string;
  user_id?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  previous_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  route_path?: string | null;
}

/**
 * Helper function for quickly dispatching an audit log with sensible defaults.
 */
export async function logSystemAction(
  options: LogSystemActionOptions
): Promise<ServiceResponse<AuditLog>> {
  const payload: AuditLogPayload = {
    action_type: options.action_type,
    entity_type: options.entity_type,
    entity_id: options.entity_id || null,
    entity_name: options.entity_name || null,
    description: options.description,
    severity: options.severity || "medium",
    status: options.status || "success",
    user_id: options.user_id || null,
    user_email: options.user_email || null,
    user_role: options.user_role || null,
    previous_data: options.previous_data || null,
    new_data: options.new_data || null,
    ip_address: options.ip_address || null,
    user_agent: options.user_agent || null,
    route_path: options.route_path || null,
  };

  return await createAuditLog(payload);
}
