"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notifications";
import { NotificationRow, Severity } from "@/types/database";

interface UseNotificationsReturn {
  notifications: NotificationRow[];
  loading: boolean;
  error: Error | null;
  unreadCount: number;
  readCount: number;
  hasUnread: boolean;
  hasNotifications: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  getNotificationsBySeverity: (severity: Severity) => NotificationRow[];
  getUnreadNotifications: () => NotificationRow[];
  getReadNotifications: () => NotificationRow[];
}

/**
 * A production-grade React hook for managing notifications in a scalable white-label CMS.
 * It provides state, actions, and computed values for notifications, with optimistic UI updates
 * and rollback mechanisms for write operations.
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true); // Prevents state updates on unmounted components

  // Set up and clean up the `isMounted` ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Fetches notifications from the backend service.
   * Handles loading and error states gracefully.
   */
  const fetchNotifications = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null); // Clear any previous error before fetching

    try {
      const data = await getNotifications();
      if (isMounted.current) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("useNotifications: Failed to fetch notifications:", err);
      if (isMounted.current) {
        setError(
          err instanceof Error
            ? err
            : new Error("An unknown error occurred while fetching notifications.")
        );
        // Optionally, clear notifications on fetch error if desired
        // setNotifications([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []); // No dependencies for fetchNotifications itself, as it's an initial data fetcher

  // Effect to fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // Re-runs if fetchNotifications identity changes (stable due to useCallback)

  /**
   * Manually triggers a refresh of the notification list.
   */
  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Marks a specific notification as read with optimistic UI updates.
   * Rolls back the UI state if the API call fails.
   * @param notificationId The ID of the notification to mark as read.
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const originalNotifications = notifications; // Capture current state for rollback

      // Optimistic UI update: immediately mark the notification as read in local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );

      try {
        await markNotificationAsRead(notificationId);
        // If successful, optimistic update is sufficient, no further action needed
      } catch (err) {
        console.error(
          `useNotifications: Failed to mark notification ${notificationId} as read:`,
          err
        );
        if (isMounted.current) {
          setError(
            err instanceof Error
              ? err
              : new Error("An unknown error occurred marking notification as read.")
          );
          // Rollback: revert to the original state if the API call fails
          setNotifications(originalNotifications);
        }
      }
    },
    [notifications] // Dependency to capture the latest notifications array for rollback
  );

  /**
   * Marks all current notifications as read with optimistic UI updates.
   * Rolls back the UI state if the API call fails.
   */
  const markAllAsRead = useCallback(async () => {
    const originalNotifications = notifications; // Capture current state for rollback

    // Optimistic UI update: immediately mark all unread notifications as read
    setNotifications((prev) =>
      prev.map((notif) => (notif.is_read ? notif : { ...notif, is_read: true }))
    );

    try {
      await markAllNotificationsAsRead();
      // If successful, optimistic update is sufficient
    } catch (err) {
      console.error(
        "useNotifications: Failed to mark all notifications as read:",
        err
      );
      if (isMounted.current) {
        setError(
          err instanceof Error
            ? err
            : new Error(
                "An unknown error occurred marking all notifications as read."
              )
        );
        // Rollback: revert to the original state
        setNotifications(originalNotifications);
      }
    }
  }, [notifications]); // Dependency to capture the latest notifications array for rollback

  // --- Computed Values ---

  /** The count of unread notifications. */
  const unreadCount = useMemo(
    () => notifications.filter((notif) => !notif.is_read).length,
    [notifications]
  );

  /** The count of read notifications. */
  const readCount = useMemo(
    () => notifications.filter((notif) => notif.is_read).length,
    [notifications]
  );

  /** True if there is at least one unread notification. */
  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  /** True if there are any notifications (read or unread). */
  const hasNotifications = useMemo(
    () => notifications.length > 0,
    [notifications]
  );

  // --- Helper Getters ---

  /**
   * Filters notifications by a specific severity level.
   * @param severity The desired severity level ('info', 'success', 'warning', 'critical').
   * @returns An array of notifications matching the severity.
   */
  const getNotificationsBySeverity = useCallback(
    (severity: Severity) => {
      return notifications.filter((notif) => notif.severity === severity);
    },
    [notifications]
  );

  /**
   * Returns an array of all unread notifications.
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notif) => !notif.is_read);
  }, [notifications]);

  /**
   * Returns an array of all read notifications.
   */
  const getReadNotifications = useCallback(() => {
    return notifications.filter((notif) => notif.is_read);
  }, [notifications]);

  /**
   * Clears all notifications from the local state. Does not affect the backend.
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    readCount,
    hasUnread,
    hasNotifications,
    refresh,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationsBySeverity,
    getUnreadNotifications,
    getReadNotifications,
  };
};