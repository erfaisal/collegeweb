"use client";

import { useEffect, useState, ChangeEvent } from "react";

// Service imports (assumed implementations)
import { getAuditLogs, getRecentCriticalLogs } from "@/services/audit-logs";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface AuditLog {
  id: string;
  user_email: string;
  user_role: string;
  action_type: string;
  entity_type: string;
  entity_name: string;
  description: string;
  severity: SeverityLevel;
  status: "success" | "failure" | "pending";
  route_path: string;
  created_at: string;
}

interface Filters {
  severity: string;
  action_type: string;
  entity_type: string;
  user_email: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [criticalLogs, setCriticalLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<Filters>({
    severity: "",
    action_type: "",
    entity_type: "",
    user_email: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [allLogs, critLogs] = await Promise.all([
          getAuditLogs().catch(() => []),
          getRecentCriticalLogs().catch(() => [])
        ]);
        
        // Ensure data is sorted by date descending
        const sortDesc = (a: AuditLog, b: AuditLog) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        setLogs((allLogs || []).sort(sortDesc));
        setCriticalLogs((critLogs || []).sort(sortDesc));
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredLogs = logs.filter(log => {
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.action_type && !log.action_type.toLowerCase().includes(filters.action_type.toLowerCase())) return false;
    if (filters.entity_type && !log.entity_type.toLowerCase().includes(filters.entity_type.toLowerCase())) return false;
    if (filters.user_email && !log.user_email.toLowerCase().includes(filters.user_email.toLowerCase())) return false;
    return true;
  });

  const getSeverityStyles = (severity: SeverityLevel) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case "low":
      default:
        return "bg-blue-50 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "success": return "bg-emerald-500";
      case "failure": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
        <div className="h-40 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
        <div className="h-96 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Audit Logs
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Monitor enterprise-wide activity, compliance events, and critical security actions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Export CSV
          </button>
        </div>
      </header>

      {/* Critical Activity Timeline/Cards */}
      {criticalLogs.length > 0 && (
        <section aria-labelledby="critical-logs-heading" className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 id="critical-logs-heading" className="text-lg font-semibold text-red-800 dark:text-red-400">
              Recent Critical Activity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="bg-[var(--background-color)] border border-red-100 dark:border-red-900/50 rounded-lg p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300">
                    {log.action_type}
                  </span>
                  <time dateTime={log.created_at} className="text-xs text-[var(--text-color)] opacity-60">
                    {formatDate(log.created_at)}
                  </time>
                </div>
                <p className="text-sm font-medium text-[var(--text-color)] mt-1">{log.description}</p>
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-[var(--text-color)] opacity-70">
                  <span className="truncate pr-2">{log.user_email}</span>
                  <span className="font-semibold uppercase">{log.entity_type}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Audit Table Section */}
      <section className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
        
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-color)]">System Logs</h2>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="px-3 py-1.5 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none min-w-[120px]"
              aria-label="Filter by severity"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <input
              name="action_type"
              type="text"
              placeholder="Filter Action..."
              value={filters.action_type}
              onChange={handleFilterChange}
              className="px-3 py-1.5 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none w-full sm:w-[150px]"
            />

            <input
              name="user_email"
              type="text"
              placeholder="Search User..."
              value={filters.user_email}
              onChange={handleFilterChange}
              className="px-3 py-1.5 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none w-full sm:w-[200px]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap" aria-label="System Audit Logs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-80">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Timestamp</th>
                <th scope="col" className="px-6 py-4 font-medium">User / Role</th>
                <th scope="col" className="px-6 py-4 font-medium">Action & Entity</th>
                <th scope="col" className="px-6 py-4 font-medium">Description</th>
                <th scope="col" className="px-6 py-4 font-medium">Severity</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-[var(--text-color)] opacity-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p className="text-[var(--text-color)] opacity-60 font-medium">No audit logs found.</p>
                      <p className="text-xs text-[var(--text-color)] opacity-40 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <time dateTime={log.created_at} className="text-xs font-mono text-[var(--text-color)] opacity-80">
                        {formatDate(log.created_at)}
                      </time>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--text-color)]">{log.user_email}</span>
                        <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5 capitalize">{log.user_role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded w-fit text-[var(--text-color)] border border-[var(--border-color)]">
                          {log.action_type}
                        </span>
                        <span className="text-xs text-[var(--text-color)] opacity-70">
                          {log.entity_type}: <span className="font-medium">{log.entity_name}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-[var(--text-color)] opacity-90" title={log.description}>
                        {log.description}
                      </div>
                      <div className="text-xs text-[var(--text-color)] opacity-40 mt-0.5 truncate max-w-xs" title={log.route_path}>
                        Path: {log.route_path}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${getSeverityStyles(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(log.status)}`}></div>
                        <span className="text-xs font-medium capitalize text-[var(--text-color)] opacity-80">
                          {log.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination Footer Placeholder */}
        <div className="p-4 border-t border-[var(--border-color)] bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between text-sm text-[var(--text-color)] opacity-70">
          <span>Showing {filteredLogs.length} results</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-[var(--border-color)] rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-[var(--border-color)] rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
