import { supabase } from '@/lib/supabase';
import { error as logError, info as logInfo, warn as logWarn } from '@/lib/logger';

// --- Type Definitions (Assuming these are from @/types/database or defined here for clarity) ---
// If these types are explicitly defined in @/types/database, you would import them directly.
// For a standalone service file, defining them here ensures clarity and self-containment.

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';
export type NotificationType = string; // Example: 'system', 'user_action', 'alert', etc.

export interface Notification {
  id: string; // Assuming UUID
  title: string;
  description: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  read: boolean;
  created_at: string; // ISO timestamp
}

export type InsertNotification = Omit<Notification, 'id' | 'created_at' | 'read'> & {
  read?: boolean; // Optional, defaults to false on insert
};

export type UpdateNotification = Partial<Omit<Notification, 'id' | 'created_at'>>;

// --- Error Handling Helper ---
const handleNotificationError = (
  operation: string,
  err: unknown,
  id?: string,
  data?: any
): { error: string; details?: any } => {
  const errorMessage = `Failed to ${operation} notification${id ? ` with ID ${id}` : ''}.`;
  const errorDetails = err instanceof Error ? err.message : String(err);
  const serializableError = {
    error: errorMessage,
    details: errorDetails,
    id,
    data: data ? JSON.stringify(data) : undefined,
  };
  logError(errorMessage, { id, data, error: err });
  return serializableError;
};

// --- Notification Service Layer ---

/**
 * Fetches all notifications, ordered by creation date descending.
 * @returns An array of Notification objects.
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    logInfo('Successfully fetched all notifications.');
    return data || [];
  } catch (err) {
    handleNotificationError('fetch all', err);
    return [];
  }
};

/**
 * Fetches a single notification by its ID.
 * @param id The ID of the notification.
 * @returns The Notification object or null if not found.
 */
export const getNotificationById = async (id: string): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }

    if (data) {
      logInfo(`Successfully fetched notification with ID: ${id}`);
    } else {
      logWarn(`Notification with ID ${id} not found.`);
    }
    return data || null;
  } catch (err) {
    handleNotificationError('fetch', err, id);
    return null;
  }
};

/**
 * Creates a new notification.
 * @param data The notification data to insert (title, description, type, severity).
 * @returns The newly created Notification object.
 */
export const createNotification = async (data: InsertNotification): Promise<Notification | null> => {
  try {
    const { data: createdNotification, error } = await supabase
      .from('notifications')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    logInfo('Successfully created notification.', { id: createdNotification?.id, title: data.title });
    return createdNotification || null;
  } catch (err) {
    handleNotificationError('create', err, undefined, data);
    return null;
  }
};

/**
 * Updates an existing notification.
 * @param id The ID of the notification to update.
 * @param data The partial notification data to update.
 * @returns The updated Notification object.
 */
export const updateNotification = async (
  id: string,
  data: UpdateNotification
): Promise<Notification | null> => {
  try {
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!updatedNotification) {
      logWarn(`Attempted to update notification with ID ${id}, but it was not found.`);
      return null;
    }

    logInfo(`Successfully updated notification with ID: ${id}`, { updatedFields: Object.keys(data) });
    return updatedNotification;
  } catch (err) {
    handleNotificationError('update', err, id, data);
    return null;
  }
};

/**
 * Marks a specific notification as read.
 * @param id The ID of the notification to mark as read.
 * @returns The updated Notification object.
 */
export const markNotificationAsRead = async (id: string): Promise<Notification | null> => {
  return updateNotification(id, { read: true });
};

/**
 * Marks a specific notification as unread.
 * @param id The ID of the notification to mark as unread.
 * @returns The updated Notification object.
 */
export const markNotificationAsUnread = async (id: string): Promise<Notification | null> => {
  return updateNotification(id, { read: false });
};

/**
 * Marks all unread notifications as read.
 * @returns The count of notifications that were marked as read.
 */
export const markAllNotificationsAsRead = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .select('*', { count: 'exact' });

    if (error) {
      throw error;
    }

    logInfo(`Successfully marked ${count} notifications as read.`);
    return count || 0;
  } catch (err) {
    handleNotificationError('mark all as read', err);
    return 0;
  }
};

/**
 * Deletes a notification by its ID.
 * @param id The ID of the notification to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    // Optional: Check if the notification exists before attempting deletion for a "safer" delete log
    const existing = await getNotificationById(id);
    if (!existing) {
      logWarn(`Attempted to delete notification with ID ${id}, but it does not exist.`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    logInfo(`Successfully deleted notification with ID: ${id}`);
    return true;
  } catch (err) {
    handleNotificationError('delete', err, id);
    return false;
  }
};

/**
 * Gets the count of unread notifications.
 * @returns The number of unread notifications.
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      throw error;
    }

    logInfo('Successfully retrieved unread notification count.');
    return count || 0;
  } catch (err) {
    handleNotificationError('get unread count', err);
    return 0;
  }
};

/**
 * Fetches notifications filtered by severity.
 * @param severity The severity level to filter by.
 * @returns An array of Notification objects.
 */
export const getNotificationsBySeverity = async (severity: NotificationSeverity): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('severity', severity)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    logInfo(`Successfully fetched notifications with severity: ${severity}`);
    return data || [];
  } catch (err) {
    handleNotificationError('fetch by severity', err, undefined, { severity });
    return [];
  }
};

/**
 * Fetches all unread notifications.
 * @returns An array of unread Notification objects.
 */
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    logInfo('Successfully fetched unread notifications.');
    return data || [];
  } catch (err) {
    handleNotificationError('fetch unread', err);
    return [];
  }
};

/**
 * Fetches all read notifications.
 * @returns An array of read Notification objects.
 */
export const getReadNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    logInfo('Successfully fetched read notifications.');
    return data || [];
  } catch (err) {
    handleNotificationError('fetch read', err);
    return [];
  }
};

/**
 * TODO: Implement real-time subscription to notifications using Supabase Realtime.
 * This would typically involve subscribing to INSERT, UPDATE, DELETE events on the 'notifications' table.
 */
export const subscribeToNotifications = () => {
  logInfo('Placeholder for subscribeToNotifications. Realtime implementation pending.');
  // Example structure (needs actual event handling and callback logic):
  // return supabase
  //   .channel('public:notifications')
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
  //     console.log('Change received!', payload);
  //     // Process payload, e.g., update a state management store
  //   })
  //   .subscribe();
};

// Note on Multi-Tenant Compatibility:
// For multi-tenant support, each function that queries or modifies notifications
// would need to include an `.eq('tenant_id', currentTenantId)` clause,
// where `currentTenantId` is retrieved from the session or context.
// The `notifications` table would also require a `tenant_id` column.