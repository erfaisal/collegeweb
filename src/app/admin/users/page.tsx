"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

// Service imports
import {
  getAllUserRoles,
  assignUserRole,
  updateUserRole,
  deactivateUserRole,
  deleteUserRole,
} from "@/services/user-roles";

// Types
export interface UserRolePermissions {
  can_manage_users: boolean;
  can_manage_settings: boolean;
  can_manage_navigation: boolean;
  can_manage_pages: boolean;
  can_manage_gallery: boolean;
  can_manage_notices: boolean;
  can_manage_faculty: boolean;
  can_manage_admissions: boolean;
  can_manage_departments: boolean;
  can_manage_hostels: boolean;
  can_manage_hospital: boolean;
  can_manage_media: boolean;
  can_manage_seo: boolean;
  can_publish_content: boolean;
}

export interface UserRole extends UserRolePermissions {
  id?: string;
  user_email: string;
  role_name: string;
  display_name: string;
  description: string;
  is_super_admin: boolean;
  is_active: boolean;
}

const defaultUserRole: UserRole = {
  user_email: "",
  role_name: "content_manager",
  display_name: "",
  description: "",
  is_super_admin: false,
  is_active: true,
  can_manage_users: false,
  can_manage_settings: false,
  can_manage_navigation: false,
  can_manage_pages: false,
  can_manage_gallery: false,
  can_manage_notices: false,
  can_manage_faculty: false,
  can_manage_admissions: false,
  can_manage_departments: false,
  can_manage_hostels: false,
  can_manage_hospital: false,
  can_manage_media: false,
  can_manage_seo: false,
  can_publish_content: false,
};

const COMMON_ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "content_manager", label: "Content Manager" },
  { value: "admission_staff", label: "Admission Staff" },
  { value: "media_manager", label: "Media Manager" },
  { value: "seo_manager", label: "SEO Manager" },
  { value: "department_head", label: "Department Head" },
  { value: "custom", label: "Custom Role..." },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<UserRole>(defaultUserRole);
  const [isSaving, setIsSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [customRoleMode, setCustomRoleMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const data = await getAllUserRoles();
      setUsers(data || []);
    } catch (error) {
      console.error("Failed to load user roles:", error);
      showMessage("error", "Failed to load user roles and permissions.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setFormData(defaultUserRole);
    setCustomRoleMode(false);
    setView("form");
    setMessage(null);
  };

  const handleEdit = (user: UserRole) => {
    setFormData({ ...user });
    setCustomRoleMode(!COMMON_ROLES.some(r => r.value === user.role_name));
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user's role assignment? They will lose all admin access.")) return;

    try {
      setProcessingId(id);
      await deleteUserRole(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showMessage("success", "User role assignment deleted.");
    } catch (error) {
      console.error("Failed to delete user role:", error);
      showMessage("error", "Failed to delete user role.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;

    try {
      setProcessingId(id);
      if (currentStatus) {
        await deactivateUserRole(id);
      } else {
        // Assuming update handles activation if deactivate is a specific endpoint
        const userToUpdate = users.find(u => u.id === id);
        if (userToUpdate) {
          await updateUserRole(id, { ...userToUpdate, is_active: true });
        }
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: !currentStatus } : u))
      );
      showMessage("success", `User account ${currentStatus ? 'deactivated' : 'activated'}.`);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      showMessage("error", "Failed to update user status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === "role_select") {
        if (value === "custom") {
          setCustomRoleMode(true);
          setFormData((prev) => ({ ...prev, role_name: "" }));
        } else {
          setCustomRoleMode(false);
          setFormData((prev) => ({ ...prev, role_name: value }));
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Basic validation
    if (!formData.user_email.includes("@")) {
      showMessage("error", "Please provide a valid email address.");
      setIsSaving(false);
      return;
    }

    try {
      if (formData.id) {
        const updated = await updateUserRole(formData.id, formData);
        setUsers((prev) => prev.map((u) => (u.id === formData.id ? updated : u)));
        showMessage("success", "User role and permissions updated.");
      } else {
        const created = await assignUserRole(formData);
        setUsers((prev) => [...prev, created]);
        showMessage("success", "New user role assigned successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save user role:", error);
      showMessage("error", "Failed to save user role configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for rendering permission toggles grouped by category
  const renderPermissionToggle = (key: keyof UserRolePermissions, label: string, description: string) => {
    const isSuperAdmin = formData.is_super_admin;
    const isChecked = isSuperAdmin || formData[key as keyof UserRole];

    return (
      <label className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${isChecked ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-500/5 dark:border-indigo-500/20' : 'bg-[var(--background-color)] border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5'} ${isSuperAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}>
        <div className="relative flex items-center mt-0.5">
          <input
            type="checkbox"
            name={key}
            checked={isChecked as boolean}
            onChange={handleChange}
            disabled={isSuperAdmin}
            className="sr-only peer"
          />
          <div className={`w-9 h-5 rounded-full transition-colors ${isChecked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isChecked ? 'translate-x-4' : ''}`}></div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--text-color)]">{label}</span>
          <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">{description}</span>
        </div>
      </label>
    );
  };

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Users & Roles
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage administrative access, roles, and granular permissions across the CMS.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          Assign User Role
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-80">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Role Configuration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No admin users found. Click "Assign User Role" to get started.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                          {user.display_name?.charAt(0) || user.user_email.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text-color)]">{user.display_name || "Unnamed User"}</span>
                          <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">{user.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {user.is_super_admin ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                            Super Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 uppercase tracking-wider">
                            {user.role_name.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${user.is_active ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors text-sm focus:outline-none"
                        >
                          Edit Roles
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => user.id && handleToggleActive(user.id, user.is_active)}
                          disabled={processingId === user.id}
                          className="text-[var(--text-color)] opacity-60 hover:opacity-100 font-medium transition-colors text-sm disabled:opacity-30 focus:outline-none"
                        >
                          {processingId === user.id ? '...' : user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => user.id && handleDelete(user.id)}
                          disabled={processingId === user.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors text-sm disabled:opacity-50 focus:outline-none"
                        >
                          {processingId === user.id ? '...' : 'Remove'}
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

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 max-w-6xl mx-auto">
      <header className="sticky top-0 z-20 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[var(--background-color)]/95 backdrop-blur-sm border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setView("list")}
            className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-color)]"
            aria-label="Back to list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)]">
              {formData.id ? "Edit User Permissions" : "Assign User Role"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Core Settings Column */}
        <div className="space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Identity & Role</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="user_email" className="text-sm font-medium text-[var(--text-color)] opacity-90">User Email *</label>
              <input
                id="user_email" name="user_email" type="email" required
                value={formData.user_email} onChange={handleChange}
                disabled={!!formData.id} // Don't allow email change on edit usually
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none disabled:opacity-50"
                placeholder="admin@institution.edu"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="display_name" className="text-sm font-medium text-[var(--text-color)] opacity-90">Display Name</label>
              <input
                id="display_name" name="display_name"
                value={formData.display_name} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="role_select" className="text-sm font-medium text-[var(--text-color)] opacity-90">Role Template</label>
              <select
                id="role_select" name="role_select"
                value={customRoleMode ? "custom" : (COMMON_ROLES.some(r => r.value === formData.role_name) ? formData.role_name : "custom")} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {customRoleMode && (
              <div className="space-y-1.5 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border-color)]">
                <label htmlFor="role_name" className="text-sm font-medium text-[var(--text-color)] opacity-90">Custom Role Identifier *</label>
                <input
                  id="role_name" name="role_name" required
                  value={formData.role_name} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                  placeholder="e.g. hr_manager"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Internal Note / Description</label>
              <textarea
                id="description" name="description" rows={3}
                value={formData.description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                placeholder="Briefly describe responsibilities..."
              />
            </div>

            <div className="pt-4 mt-2 border-t border-[var(--border-color)] space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="is_active"
                    checked={formData.is_active} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--text-color)]">Account Active</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Allow user to log in</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="is_super_admin"
                    checked={formData.is_super_admin} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-purple-900 dark:text-purple-300">Super Administrator</span>
                  <span className="text-xs text-purple-700 dark:text-purple-400 opacity-80 mt-0.5">Grants unrestricted access across all modules. Overrides granular permissions below.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Permissions Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-[var(--text-color)]">Granular Permissions</h2>
              <p className="text-sm text-[var(--text-color)] opacity-60 mt-1">Configure specific module access for this user role.</p>
            </div>
            
            <div className={`p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${formData.is_super_admin ? 'opacity-50 pointer-events-none' : ''}`}>
              
              {/* System & Global */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[var(--text-color)] uppercase tracking-wider opacity-50 mb-3 border-b border-[var(--border-color)] pb-2">System & Core</h3>
                {renderPermissionToggle("can_manage_users", "Manage Users", "Create, edit, and delete staff accounts.")}
                {renderPermissionToggle("can_manage_settings", "Global Settings", "Access and modify core CMS configuration.")}
                {renderPermissionToggle("can_manage_navigation", "Navigation Menus", "Edit headers, footers, and link structures.")}
                {renderPermissionToggle("can_manage_seo", "SEO & Metadata", "Manage global and page-specific SEO tags.")}
              </div>

              {/* Content & Media */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[var(--text-color)] uppercase tracking-wider opacity-50 mb-3 border-b border-[var(--border-color)] pb-2">Content & Media</h3>
                {renderPermissionToggle("can_manage_pages", "Dynamic Pages", "Create and edit standard CMS pages.")}
                {renderPermissionToggle("can_publish_content", "Publish Content", "Bypass drafts and publish directly to live site.")}
                {renderPermissionToggle("can_manage_media", "Media Library", "Upload, edit, and delete assets/documents.")}
                {renderPermissionToggle("can_manage_notices", "Notices & Alerts", "Publish global notices and announcements.")}
                {renderPermissionToggle("can_manage_gallery", "Photo Galleries", "Manage institutional albums and photos.")}
              </div>

              {/* Modules / Institutional */}
              <div className="space-y-3 md:col-span-2 mt-4">
                <h3 className="text-xs font-bold text-[var(--text-color)] uppercase tracking-wider opacity-50 mb-3 border-b border-[var(--border-color)] pb-2">Institutional Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderPermissionToggle("can_manage_admissions", "Admissions Module", "Handle inquiries, programs, and intake status.")}
                  {renderPermissionToggle("can_manage_faculty", "Faculty Directory", "Manage staff profiles and departmental links.")}
                  {renderPermissionToggle("can_manage_departments", "Departments", "Edit academic department pages and structures.")}
                  {renderPermissionToggle("can_manage_hostels", "Hostel Management", "Manage accommodation details and capacities.")}
                  {renderPermissionToggle("can_manage_hospital", "Hospital Module", "If applicable, manage clinical/hospital pages.")}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
        <div className="h-96 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
      </div>
    );
  }

  return view === "list" ? renderList() : renderForm();
}
