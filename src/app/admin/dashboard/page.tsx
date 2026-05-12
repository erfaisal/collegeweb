"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Service imports
import { getEnabledModules } from "@/services/modules";
import { getAuditLogs } from "@/services/audit-logs";
import { getAdmissionInquiries } from "@/services/admissions";
import { getGalleryImages } from "@/services/gallery";
import { getFacultyMembers } from "@/services/faculty";
import { getNotices } from "@/services/notices";

// Types
interface DashboardStats {
  admissions: number;
  faculty: number;
  notices: number;
  galleryItems: number;
}

interface AuditLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
}

interface Module {
  id: string;
  name: string;
  status: "active" | "inactive";
  description?: string;
}

const QUICK_ACTIONS = [
  { label: "Admissions", href: "/admin/admissions" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Notices", href: "/admin/notices" },
  { label: "Faculty", href: "/admin/faculty" },
  { label: "Pages", href: "/admin/pages" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    admissions: 0,
    faculty: 0,
    notices: 0,
    galleryItems: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        // Execute all independent fetches concurrently for performance
        const [
          modulesData,
          logsData,
          admissionsData,
          galleryData,
          facultyData,
          noticesData,
        ] = await Promise.all([
          getEnabledModules().catch(() => []),
          getAuditLogs().catch(() => []),
          getAdmissionInquiries().catch(() => []),
          getGalleryImages().catch(() => []),
          getFacultyMembers().catch(() => []),
          getNotices().catch(() => []),
        ]);

        if (isMounted) {
          setModules(modulesData.slice(0, 6) || []); // Limit displayed modules
          setRecentLogs(logsData.slice(0, 5) || []); // Limit recent logs
          
          setStats({
            admissions: admissionsData?.length || 0,
            faculty: facultyData?.length || 0,
            notices: noticesData?.length || 0,
            galleryItems: galleryData?.length || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
          ))}
        </div>
        <div className="h-64 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Dashboard Overview
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Welcome back to the institutional CMS administration panel.
          </p>
        </div>
      </header>

      {/* Statistics Cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Key Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Total Admissions", value: stats.admissions, color: "text-blue-600 dark:text-blue-400" },
            { label: "Total Faculty", value: stats.faculty, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Total Notices", value: stats.notices, color: "text-amber-600 dark:text-amber-400" },
            { label: "Gallery Items", value: stats.galleryItems, color: "text-purple-600 dark:text-purple-400" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-[var(--background-color)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <p className="text-sm font-medium text-[var(--text-color)] opacity-70">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-lg font-semibold text-[var(--text-color)] mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 hover:border-indigo-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Enabled Modules */}
        <section aria-labelledby="modules-heading" className="xl:col-span-2 space-y-4">
          <h2 id="modules-heading" className="text-lg font-semibold text-[var(--text-color)]">
            Active System Modules
          </h2>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] overflow-hidden shadow-sm">
            {modules.length > 0 ? (
              <ul className="divide-y divide-[var(--border-color)]">
                {modules.map((module) => (
                  <li key={module.id} className="p-4 sm:p-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[var(--text-color)]">
                          {module.name}
                        </p>
                        {module.description && (
                          <p className="text-sm text-[var(--text-color)] opacity-60">
                            {module.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Active
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[var(--text-color)] opacity-60">No active modules found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity / Audit Logs */}
        <section aria-labelledby="activity-heading" className="space-y-4">
          <h2 id="activity-heading" className="text-lg font-semibold text-[var(--text-color)]">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] overflow-hidden shadow-sm">
            {recentLogs.length > 0 ? (
              <ul className="divide-y divide-[var(--border-color)]">
                {recentLogs.map((log) => (
                  <li key={log.id} className="p-4 sm:p-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[var(--text-color)] truncate">
                          {log.action}
                        </span>
                        <time 
                          dateTime={log.timestamp} 
                          className="text-xs text-[var(--text-color)] opacity-50 whitespace-nowrap"
                        >
                          {new Date(log.timestamp).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-[var(--text-color)] opacity-70 line-clamp-2">
                        {log.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[var(--text-color)] opacity-60">No recent activity.</p>
              </div>
            )}
            
            <div className="p-4 border-t border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
              <Link 
                href="/admin/audit-logs"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors w-full inline-block text-center"
              >
                View all logs &rarr;
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
