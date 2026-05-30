export const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module: string;
  metadata: Record<string, unknown>;
}

/**
 * Safely serializes an unknown error into a structured object.
 * Stack traces are included only in development environments for security and verbosity control.
 */
export const serializeError = (error: unknown): { name: string; message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: IS_DEVELOPMENT ? error.stack : undefined,
    };
  }
  if (typeof error === "string") {
    return { name: "Error", message: error };
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    // Attempt to extract name and message from generic objects
    const objError = error as { name?: string; message: string; stack?: string };
    return {
      name: objError.name || "Error",
      message: objError.message,
      stack: IS_DEVELOPMENT ? objError.stack : undefined,
    };
  }
  return { name: "UnknownError", message: "An unknown error occurred." };
};

// --- Future Integrations (Placeholders) ---
// TODO: Implement Sentry integration
const sendToSentry = (entry: LogEntry): void => {
  if (entry.level === LOG_LEVELS.ERROR) {
    // Example: Sentry.captureException(entry.metadata.error, { extra: entry });
    // In a real implementation, you would extract the original error object from metadata.error
    // and pass it to Sentry for proper error grouping and context.
  }
  // console.log("Sentry Placeholder:", entry);
};

// TODO: Implement Datadog integration
const sendToDatadog = (entry: LogEntry): void => {
  // Example: datadogLogger.log(entry.level.toLowerCase(), entry.message, { ...entry.metadata, module: entry.module, timestamp: entry.timestamp });
  // console.log("Datadog Placeholder:", entry);
};

// TODO: Implement OpenTelemetry integration
const sendToOpenTelemetry = (entry: LogEntry): void => {
  // Example:
  // const { trace, context } = require('@opentelemetry/api');
  // const activeSpan = trace.getSpan(context.active());
  // if (activeSpan) {
  //   activeSpan.addEvent(entry.message, {
  //     'log.level': entry.level,
  //     'log.module': entry.module,
  //     ...entry.metadata
  //   });
  // } else {
  //   // Create a new span or log directly if no active span
  // }
  // console.log("OpenTelemetry Placeholder:", entry);
};

/**
 * The core logging function for structured logging.
 * It formats log entries, handles environment-specific output,
 * and integrates with external logging services.
 */
const log = (
  level: LogLevel,
  message: string,
  module: string,
  metadata: Record<string, unknown> = {}
): void => {
  // Suppress DEBUG logs in production environments
  if (IS_PRODUCTION && level === LOG_LEVELS.DEBUG) {
    return;
  }

  const timestamp = new Date().toISOString();

  // Safely process metadata to ensure it's JSON serializable
  const safeMetadata: Record<string, unknown> = {};
  for (const key in metadata) {
    if (Object.prototype.hasOwnProperty.call(metadata, key)) {
      const value = metadata[key];
      // Serialize Error objects or objects resembling errors
      if (value instanceof Error || (typeof value === 'object' && value !== null && 'message' in value)) {
        safeMetadata[key] = serializeError(value);
      }
      // Skip functions and symbols as they are not JSON serializable
      else if (typeof value === 'function' || typeof value === 'symbol') {
        safeMetadata[key] = `[${typeof value}]`;
      }
      // Handle BigInt values by converting to string, as they are not JSON serializable by default
      else if (typeof value === 'bigint') {
        safeMetadata[key] = value.toString();
      }
      // For all other types, attempt to copy directly
      else {
        safeMetadata[key] = value;
      }
    }
  }

  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    module,
    metadata: safeMetadata,
  };

  // Output to console as a JSON string for structured logging.
  // This makes it easy for log aggregators to parse stdout/stderr.
  const logString = JSON.stringify(logEntry);

  switch (level) {
    case LOG_LEVELS.INFO:
      console.info(logString);
      break;
    case LOG_LEVELS.WARN:
      console.warn(logString);
      break;
    case LOG_LEVELS.ERROR:
      console.error(logString);
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(logString);
      break;
    default:
      console.log(logString);
  }

  // Send to future integrations
  sendToSentry(logEntry);
  sendToDatadog(logEntry);
  sendToOpenTelemetry(logEntry);
};

// --- Convenience Helper Functions ---

export const info = (
  message: string,
  module: string,
  metadata?: Record<string, unknown>
): void => {
  log(LOG_LEVELS.INFO, message, module, metadata);
};

export const warn = (
  message: string,
  module: string,
  metadata?: Record<string, unknown>
): void => {
  log(LOG_LEVELS.WARN, message, module, metadata);
};

export const error = (
  message: string,
  module: string,
  errorObj?: unknown, // Accepts any error type (Error, string, object, etc.)
  metadata?: Record<string, unknown>
): void => {
  const finalMetadata: Record<string, unknown> = { ...metadata };
  if (errorObj) {
    finalMetadata.error = serializeError(errorObj); // Serialize the error object into metadata
  }
  log(LOG_LEVELS.ERROR, message, module, finalMetadata);
};

export const debug = (
  message: string,
  module: string,
  metadata?: Record<string, unknown>
): void => {
  log(LOG_LEVELS.DEBUG, message, module, metadata);
};

// --- Audit Logging Helper ---

export interface AuditLogEvent {
  timestamp: string;
  action: string;
  entity: string; // e.g., "User", "Page", "Product"
  entityId?: string; // Optional ID of the entity
  user: { id: string; email: string } | null; // User who performed the action
  metadata: Record<string, unknown>; // Additional context for the audit event
  logLevel: LogLevel; // Audit logs are typically INFO level for the main logging stream
}

/**
 * Records an audit event for tracking user actions and system changes.
 * This helper also logs the event via the main logger for observability,
 * and returns a structured object suitable for direct persistence to an `audit_logs` table.
 */
export const auditLog = (
  action: string, // e.g., "CREATE", "UPDATE", "DELETE", "LOGIN_SUCCESS"
  entity: string,
  user: { id: string; email: string } | null,
  metadata?: Record<string, unknown>
): AuditLogEvent => {
  const auditEvent: AuditLogEvent = {
    timestamp: new Date().toISOString(),
    action,
    entity,
    entityId: metadata?.id ? String(metadata.id) : undefined, // Assuming 'id' might be in metadata
    user,
    metadata: metadata || {},
    logLevel: LOG_LEVELS.INFO,
  };

  // Log the audit event through the main logger for centralized observability
  info(`AUDIT: ${action} on ${entity}`, "AUDIT", auditEvent);

  // Return the structured object for future direct persistence (e.g., Supabase audit_logs table)
  return auditEvent;
};

// --- Analytics Event Helper ---

export interface AnalyticsEvent {
  timestamp: string;
  event: string; // e.g., "PageView", "Button_Click", "Form_Submission"
  metadata: Record<string, unknown>; // Event properties (e.g., page_path, button_id, user_id)
  logLevel: LogLevel; // Analytics events are typically INFO level
}

/**
 * Records an analytics event for tracking user behavior and application usage.
 * This helper also logs the event via the main logger for observability,
 * and returns a structured object suitable for direct persistence to an `analytics_events` table.
 */
export const analyticsLog = (
  event: string,
  metadata?: Record<string, unknown>
): AnalyticsEvent => {
  const analyticsEvent: AnalyticsEvent = {
    timestamp: new Date().toISOString(),
    event,
    metadata: metadata || {},
    logLevel: LOG_LEVELS.INFO,
  };

  // Log the analytics event through the main logger for centralized observability
  info(`ANALYTICS: ${event}`, "ANALYTICS", analyticsEvent);

  // Return the structured object for future direct persistence (e.g., Supabase analytics_events table)
  return analyticsEvent;
};