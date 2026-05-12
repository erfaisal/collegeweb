"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

// Service imports (assumed implementations)
import {
  getAllNavigationItems,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
} from "@/services/navigation";

export interface NavigationItem {
  id?: string;
  label: string;
  href: string;
  icon: string;
  parent_id: string | null;
  position: string;
  order_index: number;
  visible: boolean;
  open_in_new_tab: boolean;
  show_in_navbar: boolean;
  show_in_footer: boolean;
  is_external: boolean;
  module_key: string;
}

const defaultNavItem: NavigationItem = {
  label: "",
  href: "",
  icon: "",
  parent_id: null,
  position: "main",
  order_index: 0,
  visible: true,
  open_in_new_tab: false,
  show_in_navbar: true,
  show_in_footer: false,
  is_external: false,
  module_key: "",
};

export default function AdminNavigationPage() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<NavigationItem>(defaultNavItem);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setIsLoading(true);
      const data = await getAllNavigationItems();
      // Sort by parent (null first) then order_index
      const sortedData = (data || []).sort((a: NavigationItem, b: NavigationItem) => {
        if (a.parent_id === b.parent_id) {
          return a.order_index - b.order_index;
        }
        return a.parent_id ? 1 : -1;
      });
      setNavItems(sortedData);
    } catch (error) {
      console.error("Failed to fetch navigation items:", error);
      showMessage("error", "Failed to load navigation items.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateNew = () => {
    setFormData(defaultNavItem);
    setView("form");
    setMessage(null);
  };

  const handleEdit = (item: NavigationItem) => {
    setFormData({ ...item });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this navigation item? If it has children, they may be orphaned.")) return;

    try {
      setDeletingId(id);
      await deleteNavigationItem(id);
      setNavItems((prev) => prev.filter((i) => i.id !== id));
      showMessage("success", "Navigation item deleted successfully.");
    } catch (error) {
      console.error("Failed to delete navigation item:", error);
      showMessage("error", "Failed to delete navigation item.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value === "null" ? null : value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (formData.id) {
        const updated = await updateNavigationItem(formData.id, formData);
        setNavItems((prev) => {
          const newList = prev.map((item) => (item.id === formData.id ? updated : item));
          return newList.sort((a, b) => a.order_index - b.order_index);
        });
        showMessage("success", "Navigation item updated successfully.");
      } else {
        const created = await createNavigationItem(formData);
        setNavItems((prev) => [...prev, created].sort((a, b) => a.order_index - b.order_index));
        showMessage("success", "Navigation item created successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save navigation item:", error);
      showMessage("error", "Failed to save navigation item. Please verify your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Navigation Menus
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage your site's hierarchical navigation structure, footers, and links.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Menu Item
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
                <th className="px-6 py-4 font-medium">Label & Path</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Hierarchy</th>
                <th className="px-6 py-4 font-medium">Visibility</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {navItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No navigation items found. Click "Add Menu Item" to get started.
                  </td>
                </tr>
              ) : (
                navItems.map((item) => {
                  const parent = navItems.find((p) => p.id === item.parent_id);
                  return (
                    <tr key={item.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text-color)]">
                            {item.parent_id ? "— " : ""}{item.label}
                          </span>
                          <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">{item.href}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-color)] font-mono text-xs">
                          {item.order_index}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-color)] opacity-80">
                        {parent ? <span className="text-xs px-2 py-1 bg-black/5 dark:bg-white/5 rounded">Child of: {parent.label}</span> : <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded font-medium">Root Item</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!item.visible && <span className="text-xs border border-red-200 bg-red-50 text-red-700 px-2 py-0.5 rounded">Hidden</span>}
                          {item.show_in_navbar && <span className="text-xs border border-[var(--border-color)] px-2 py-0.5 rounded text-[var(--text-color)] opacity-70">Navbar</span>}
                          {item.show_in_footer && <span className="text-xs border border-[var(--border-color)] px-2 py-0.5 rounded text-[var(--text-color)] opacity-70">Footer</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors focus:outline-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => item.id && handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 focus:outline-none"
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 max-w-5xl">
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
              {formData.id ? "Edit Menu Item" : "Create Menu Item"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Item"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Link Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="label" className="text-sm font-medium text-[var(--text-color)] opacity-90">Display Label *</label>
                <input
                  id="label" name="label" required
                  value={formData.label} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. About Us"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="href" className="text-sm font-medium text-[var(--text-color)] opacity-90">Destination URL/Path *</label>
                <input
                  id="href" name="href" required
                  value={formData.href} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                  placeholder="e.g. /about-us or https://external.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="parent_id" className="text-sm font-medium text-[var(--text-color)] opacity-90">Parent Item</label>
                <select
                  id="parent_id" name="parent_id"
                  value={formData.parent_id || "null"} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="null">None (Root Level)</option>
                  {navItems
                    .filter((item) => item.id !== formData.id) // Prevent self-nesting
                    .map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="order_index" className="text-sm font-medium text-[var(--text-color)] opacity-90">Display Order</label>
                <input
                  id="order_index" name="order_index" type="number"
                  value={formData.order_index} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Advanced Configuration</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="icon" className="text-sm font-medium text-[var(--text-color)] opacity-90">Icon Identifier (Optional)</label>
                <input
                  id="icon" name="icon"
                  value={formData.icon} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. lucide:home"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="module_key" className="text-sm font-medium text-[var(--text-color)] opacity-90">Module Key Binding</label>
                <input
                  id="module_key" name="module_key"
                  value={formData.module_key} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. admissions_module"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="position" className="text-sm font-medium text-[var(--text-color)] opacity-90">Menu Position Target</label>
                <select
                  id="position" name="position"
                  value={formData.position} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="main">Main Navigation</option>
                  <option value="topbar">Top Bar</option>
                  <option value="sidebar">Sidebar Menu</option>
                  <option value="quick_links">Quick Links</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Visibility Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="visible"
                    checked={formData.visible} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-color)]">Active / Published</span>
              </label>

              <hr className="border-[var(--border-color)]" />

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="show_in_navbar"
                  checked={formData.show_in_navbar} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-[var(--text-color)]">Show in Navbar</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="show_in_footer"
                  checked={formData.show_in_footer} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-[var(--text-color)]">Show in Footer</span>
              </label>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Link Behaviors</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="open_in_new_tab"
                  checked={formData.open_in_new_tab} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--text-color)]">Open in New Tab</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Adds target="_blank"</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="is_external"
                  checked={formData.is_external} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--text-color)]">External Link</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Adds rel="noopener noreferrer"</span>
                </div>
              </label>
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
