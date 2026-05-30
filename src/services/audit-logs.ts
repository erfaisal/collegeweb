import supabase from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { Database } from "@/types/database";

// --- Types ---

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type CreateAuditLogInput = Database["public"]["Tables"]["audit_logs"]["Insert"];

export interface AuditLogStatistics {
  totalLogs: number;
  infoLogs: number;
  warningLogs: number;
  criticalLogs: number;
}

// --- Error Handling ---

/**
 * Safely serializes and logs audit-related errors
 */
function handleAuditLogError(err: unknown, context: string): never {
  const serialized = err instanceof Error ? err.message : JSON.stringify(err);
  error(`Audit Log Service Error [${context}]: ${serialized}`, { error: err });
  throw new Error(`Audit Log Service Failure: ${serialized}`);
}

// --- Fetch Operations ---

/**
 * Retrieves all audit logs, ordered by newest first
 */
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, "getAuditLogs");
  }
}

/**
 * Retrieves a specific audit log by its UUID
 */
export async function getAuditLogById(id: string): Promise<AuditLog | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleAuditLogError(err, `getAuditLogById(${id})`);
  }
}

// --- Mutation Operations ---

/**
 * Creates a new audit log entry
 */
export async function createAuditLog(data: CreateAuditLogInput): Promise<AuditLog> {
  try {
    const { data: created, error: dbError } = await supabase
      .from("audit_logs")
      .insert(data)
      .select()
      .single();

    if (dbError) throw dbError;

    // Log the creation of the audit event itself
    info(`Audit Log created: [${created.action}] on ${created.entity} (${created.entity_id})`);
    return created;
  } catch (err) {
    handleAuditLogError(err, "createAuditLog");
  }
}

/**
 * Safely deletes an audit log entry (Admin-only architecture)
 */
export async function deleteAuditLog(id: string): Promise<void> {
  try {
    const { error: dbError } = await supabase
      .from("audit_logs")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    warn(`Audit Log deleted: ${id}. This action should be restricted to super admins.`);
  } catch (err) {
    handleAuditLogError(err, `deleteAuditLog(${id})`);
  }
}

// --- Filters & Search ---

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, `getAuditLogsByUser(${userId})`);
  }
}

export async function getAuditLogsByEntity(entity: string): Promise<AuditLog[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity", entity)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, `getAuditLogsByEntity(${entity})`);
  }
}

export async function getAuditLogsBySeverity(severity: AuditSeverity): Promise<AuditLog[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("severity", severity)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, `getAuditLogsBySeverity(${severity})`);
  }
}

export async function getRecentAuditLogs(limit: number): Promise<AuditLog[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, `getRecentAuditLogs(${limit})`);
  }
}

/**
 * Searches audit logs by action or entity fields
 */
export async function searchAuditLogs(query: string): Promise<AuditLog[]> {
  try {
    if (!query.trim()) return [];

    const safeQuery = `%${query.trim()}%`;
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .or(`action.ilike.${safeQuery},entity.ilike.${safeQuery}`)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, `searchAuditLogs(${query})`);
  }
}

// --- Statistics & Timeline ---

export async function getAuditLogStatistics(): Promise<AuditLogStatistics> {
  try {
    const [totalRes, infoRes, warningRes, criticalRes] = await Promise.all([
      supabase.from("audit_logs").select("id", { count: "exact", head: true }),
      supabase.from("audit_logs").select("id", { count: "exact", head: true }).eq("severity", "info"),
      supabase.from("audit_logs").select("id", { count: "exact", head: true }).eq("severity", "warning"),
      supabase.from("audit_logs").select("id", { count: "exact", head: true }).eq("severity", "critical"),
    ]);

    if (totalRes.error) throw totalRes.error;

    return {
      totalLogs: totalRes.count || 0,
      infoLogs: infoRes.count || 0,
      warningLogs: warningRes.count || 0,
      criticalLogs: criticalRes.count || 0,
    };
  } catch (err) {
    handleAuditLogError(err, "getAuditLogStatistics");
  }
}

export async function getEntityAuditHistory(entity: string, entityId: string): Promise<AuditLog[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity", entity)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false }); // Chronological history, newest first

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAuditLogError(err, `getEntityAuditHistory(${entity}, ${entityId})`);
  }
}

// --- Convenience Helpers ---

export async function logCreateAction(
  userId: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  return createAuditLog({
    user_id: userId,
    action: "create",
    entity,
    entity_id: entityId,
    severity: "info",
    metadata,
  });
}

export async function logUpdateAction(
  userId: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  return createAuditLog({
    user_id: userId,
    action: "update",
    entity,
    entity_id: entityId,
    severity: "info",
    metadata,
  });
}

export async function logDeleteAction(
  userId: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  return createAuditLog({
    user_id: userId,
    action: "delete",
    entity,
    entity_id: entityId,
    severity: "warning", // Deletions are typically elevated to warning
    metadata,
  });
}

export async function logLoginAction(
  userId: string,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  return createAuditLog({
    user_id: userId,
    action: "login",
    entity: "auth",
    entity_id: userId,
    severity: "info",
    metadata,
  });
}

export async function logLogoutAction(
  userId: string,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  return createAuditLog({
    user_id: userId,
    action: "logout",
    entity: "auth",
    entity_id: userId,
    severity: "info",
    metadata,
  });
}

export async function logPermissionChange(
  userId: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  return createAuditLog({
    user_id: userId,
    action: "permission_change",
    entity,
    entity_id: entityId,
    severity: "critical", // Permission changes should be highly visible
    metadata,
  });
}

// --- Future Compatibility Placeholders ---

/**
 * TODO: Implement export functionality for compliance audits
 * Will return formatted CSV/JSON of logs within a date range
 */
export async function exportAuditLogs(startDate?: Date, endDate?: Date): Promise<void> {
  warn(`exportAuditLogs is not yet implemented (Range: ${startDate} to ${endDate})`);
}

/**
 * TODO: Implement archival strategy for old logs (e.g., > 90 days)
 * Move to cold storage (S3 bucket) to maintain DB performance
 */
export async function archiveAuditLogs(daysOlderThan: number): Promise<void> {
  warn(`archiveAuditLogs is not yet implemented (Days: ${daysOlderThan})`);
}

/**
 * TODO: Implement realtime streaming of audit events
 * Useful for SIEM integrations or live security dashboards
 */
export async function streamAuditEvents(): Promise<void> {
  warn("streamAuditEvents is not yet implemented");
}
