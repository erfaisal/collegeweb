"use client";

import { useEffect, useState } from "react";

// --- Types ---

export type BackupType = "database" | "media" | "full_system" | "settings_only";
export type BackupStatus = "completed" | "running" | "failed" | "archived";

export interface BackupRecord {
  id: string;
  backup_name: string;
  backup_type: BackupType;
  created_at: string;
  status: BackupStatus;
  file_size: number; // in bytes
  initiated_by: string;
}

// --- Mock Data ---

const MOCK_BACKUPS: BackupRecord[] = [
  {
    id: "bkp_1001",
    backup_name: "Weekly Full System Snapshot",
    backup_type: "full_system",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: "running",
    file_size: 0,
    initiated_by: "System Scheduler",
  },
  {
    id: "bkp_1002",
    backup_name: "Pre-Deployment Database Dump",
    backup_type: "database",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    status: "completed",
    file_size: 1024 * 1024 * 245, // 245 MB
    initiated_by: "admin@institution.edu",
  },
  {
    id: "bkp_1003",
    backup_name: "Monthly Media Archive",
    backup_type: "media",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    status: "completed",
    file_size: 1024 * 1024 * 1024 * 4.2, // 4.2 GB
    initiated_by: "System Scheduler",
  },
  {
    id: "bkp_1004",
    backup_name: "Emergency Settings Rollback",
    backup_type: "settings_only",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
    status: "completed",
    file_size: 1024 * 512, // 512 KB
    initiated_by: "devops@institution.edu",
  },
  {
    id: "bkp_1005",
    backup_name: "Failed AWS S3 Sync",
    backup_type: "full_system",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    status: "failed",
    file_size: 1024 * 1024 * 890, // 890 MB (Partial)
    initiated_by: "System Scheduler",
  },
  {
    id: "bkp_1006",
    backup_name: "Q1 Full Institutional Archive",
    backup_type: "full_system",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // ~2 months ago
    status: "archived",
    file_size: 1024 * 1024 * 1024 * 12.5, // 12.5 GB
    initiated_by: "System Scheduler",
  },
];

// --- Helpers ---

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusStyles = (status: BackupStatus) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    case "running":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 animate-pulse";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
    case "archived":
      return "bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400 border-gray-200 dark:border-gray-500/20";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getTypeLabel = (type: BackupType) => {
  switch (type) {
    case "database": return "Database";
    case "media": return "Media Assets";
    case "full_system": return "Full System";
    case "settings_only": return "Settings Only";
  }
};

// --- Component ---

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<BackupRecord | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchBackups = async () => {
      try {
        setIsLoading(true);
        // await fetch('/api/backups')
        setTimeout(() => {
          setBackups(MOCK_BACKUPS);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to fetch backups", error);
        setIsLoading(false);
      }
    };
    fetchBackups();
  }, []);

  const handleCreateBackup = () => {
    setIsCreating(true);
    // Simulate API call to trigger backup
    setTimeout(() => {
      const newBackup: BackupRecord = {
        id: `bkp_${Math.floor(Math.random() * 10000)}`,
        backup_name: "Manual System Snapshot",
        backup_type: "full_system",
        created_at: new Date().toISOString(),
        status: "running",
        file_size: 0,
        initiated_by: "Current User",
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
    }, 1200);
  };

  const handleRestoreClick = (backup: BackupRecord) => {
    setRestoreTarget(backup);
  };

  const cancelRestore = () => {
    setRestoreTarget(null);
  };

  const confirmRestore = () => {
    // Future integration point for actual restore logic
    alert(`Initiating restore sequence for ${restoreTarget?.backup_name}. System will enter maintenance mode.`);
    setRestoreTarget(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Disaster Recovery & Backups
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage system snapshots, automated backups, and point-in-time recovery options.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            className="px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border-color)] rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            onClick={() => window.location.reload()}
          >
            Refresh List
          </button>
          <button 
            type="button"
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Initializing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                Create Backup Now
              </>
            )}
          </button>
        </div>
      </header>

      {/* Restore Warning Overlay / Modal Architecture Placeholder */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-center text-[var(--text-color)] mb-2">
              Critical Restore Operation
            </h2>
            <p className="text-center text-[var(--text-color)] opacity-70 text-sm mb-6">
              You are about to restore the system using the backup <strong>"{restoreTarget.backup_name}"</strong>. This will overwrite current live data and may result in permanent data loss for records created after <strong>{formatDate(restoreTarget.created_at)}</strong>.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-6 text-sm text-amber-800 dark:text-amber-400">
              <strong>Requirement:</strong> The system will be placed into maintenance mode for approximately 15-45 minutes. Active user sessions will be terminated.
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={cancelRestore}
                className="flex-1 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-lg font-semibold text-[var(--text-color)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRestore}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm focus:ring-4 focus:ring-red-500/30"
              >
                I Understand, Initiate Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Overview Widget */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-1">Total Storage Used</p>
            <p className="text-2xl font-extrabold text-[var(--text-color)]">17.8 GB</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
          </div>
        </div>
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-1">Automated Schedule</p>
            <p className="text-2xl font-extrabold text-[var(--text-color)]">Daily <span className="text-sm font-medium opacity-60 ml-1">at 02:00 AM</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-1">Cloud Sync Status</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Healthy
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
          </div>
        </div>
      </section>

      {/* Main Backups Table */}
      <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-color)]">Backup History</h2>
          <div className="text-sm opacity-60">Showing latest {backups.length} records</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-70">
              <tr>
                <th className="px-6 py-4 font-semibold">Backup Details</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Initiated By</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-black/10 dark:bg-white/10 rounded w-48 mb-2"></div><div className="h-3 bg-black/5 dark:bg-white/5 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-black/5 dark:bg-white/5 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-black/5 dark:bg-white/5 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-black/10 dark:bg-white/10 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-black/5 dark:bg-white/5 rounded w-32"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-black/5 dark:bg-white/5 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : backups.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[var(--text-color)] opacity-60">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    <p className="text-lg font-medium">No backups found</p>
                    <p className="text-sm mt-1">Configure automated backups or initiate a manual snapshot.</p>
                  </td>
                </tr>
              ) : (
                // Render Actual Rows
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--text-color)]">{backup.backup_name}</div>
                      <div className="text-xs opacity-60 mt-0.5">{formatDate(backup.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-xs font-medium text-[var(--text-color)] opacity-80">
                        {getTypeLabel(backup.backup_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold capitalize tracking-wide ${getStatusStyles(backup.status)}`}>
                        {backup.status === 'running' && (
                          <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-color)] opacity-80 font-mono text-sm">
                      {backup.status === 'running' ? 'Calculating...' : formatBytes(backup.file_size)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-color)] opacity-80 text-sm">
                      {backup.initiated_by}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={backup.status !== "completed" && backup.status !== "archived"}
                          className="p-2 text-[var(--text-color)] opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          aria-label="Download Backup"
                          title="Download File"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                        <button
                          onClick={() => handleRestoreClick(backup)}
                          disabled={backup.status !== "completed" && backup.status !== "archived"}
                          className="px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
