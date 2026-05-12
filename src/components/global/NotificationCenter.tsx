"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: NotificationSeverity;
  created_at: string;
  read: boolean;
}

// Mock Data representing various operational states
const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif_1",
    title: "Database Backup Failed",
    description: "The scheduled automated backup for the main cluster failed to complete.",
    type: "system_alert",
    severity: "critical",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
  },
  {
    id: "notif_2",
    title: "New Admission Campaign Live",
    description: "The Fall 2025 Admissions campaign has been successfully published.",
    type: "content_update",
    severity: "success",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "notif_3",
    title: "High API Latency Detected",
    description: "Admissions portal API response times are exceeding 2000ms threshold.",
    type: "performance",
    severity: "warning",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: true,
  },
  {
    id: "notif_4",
    title: "System Maintenance Scheduled",
    description: "Routine server maintenance is scheduled for Sunday at 02:00 AM.",
    type: "maintenance",
    severity: "info",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
];

const getSeverityStyles = (severity: NotificationSeverity) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "success":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "info":
    default:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }
};

const getSeverityIcon = (severity: NotificationSeverity) => {
  switch (severity) {
    case "critical":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "warning":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "success":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Simulate initial fetch of notifications
    const fetchNotifications = async () => {
      setIsLoading(true);
      // Simulate network latency
      setTimeout(() => {
        setNotifications(MOCK_NOTIFICATIONS);
        setIsLoading(false);
      }, 600);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[var(--text-color)]"
        aria-label={`View notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 opacity-70" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-[var(--surface-color)]"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-label="Notification Center"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
            <h3 className="font-bold text-[var(--text-color)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors focus:outline-none"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              // Loading State
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-full"></div>
                      <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-[var(--text-color)] opacity-30" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-color)] opacity-90">All caught up!</p>
                <p className="text-xs text-[var(--text-color)] opacity-60 mt-1">There are no new notifications at this time.</p>
              </div>
            ) : (
              // Notification Items
              <ul className="divide-y divide-[var(--border-color)]">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`relative flex gap-3 p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-default ${!notification.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true"></span>
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getSeverityStyles(notification.severity)}`}>
                      {getSeverityIcon(notification.severity)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <p className={`text-sm font-semibold truncate text-[var(--text-color)] ${!notification.read ? 'opacity-100' : 'opacity-80'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] font-medium text-[var(--text-color)] opacity-50 whitespace-nowrap pt-0.5">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs text-[var(--text-color)] line-clamp-2 ${!notification.read ? 'opacity-80' : 'opacity-60'}`}>
                        {notification.description}
                      </p>
                    </div>

                    {/* Quick Action (Mark Read) */}
                    {!notification.read && (
                      <button
                        onClick={(e) => markAsRead(notification.id, e)}
                        className="opacity-0 group-hover:opacity-100 absolute right-2 bottom-2 p-1.5 rounded bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:text-indigo-600 focus:opacity-100 transition-opacity shadow-sm z-10"
                        title="Mark as read"
                        aria-label="Mark notification as read"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border-color)] text-center bg-black/[0.01] dark:bg-white/[0.01]">
            <button className="text-xs font-semibold text-[var(--text-color)] opacity-60 hover:opacity-100 transition-opacity focus:outline-none">
              View All Activity &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
