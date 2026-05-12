"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  getAllPages,
  createPage,
  updatePage,
  deletePage,
  generateSlug,
} from "@/services/pages";

export interface Page {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  featured_image_url: string;
  page_type: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  is_published: boolean;
  show_in_navbar: boolean;
  show_in_footer: boolean;
  display_order: number;
  category: string;
  tags: string; // Stored as comma-separated string for simplicity in form
}

const defaultPageContent: Page = {
  title: "",
  slug: "",
  short_description: "",
  content: "",
  featured_image_url: "",
  page_type: "standard",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  is_published: false,
  show_in_navbar: false,
  show_in_footer: false,
  display_order: 0,
  category: "",
  tags: "",
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<Page>(defaultPageContent);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      setIsLoading(true);
      const data = await getAllPages();
      setPages(data || []);
    } catch (error) {
      console.error("Failed to load pages:", error);
      showMessage("error", "Failed to load pages.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateNew = () => {
    setFormData(defaultPageContent);
    setView("form");
    setMessage(null);
  };

  const handleEdit = (page: Page) => {
    setFormData({ ...page });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      await deletePage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
      showMessage("success", "Page deleted successfully.");
    } catch (error) {
      console.error("Failed to delete page:", error);
      showMessage("error", "Failed to delete page.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTitleBlur = async () => {
    // Auto-generate slug only if it's a new page and slug is empty
    if (!formData.id && formData.title && !formData.slug) {
      try {
        const slug = await generateSlug(formData.title);
        setFormData((prev) => ({ ...prev, slug }));
      } catch (error) {
        console.error("Failed to generate slug:", error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (formData.id) {
        const updated = await updatePage(formData.id, formData);
        setPages((prev) => prev.map((p) => (p.id === formData.id ? updated : p)));
        showMessage("success", "Page updated successfully.");
      } else {
        const created = await createPage(formData);
        setPages((prev) => [created, ...prev]);
        showMessage("success", "Page created successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save page:", error);
      showMessage("error", "Failed to save page. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  // UI Components

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Pages
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage your website's content pages, routing, and visibility.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Page
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-80">
              <tr>
                <th className="px-6 py-4 font-medium">Page Details</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Visibility</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No pages found. Click "Add New Page" to get started.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--text-color)]">{page.title}</p>
                      <p className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">/{page.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.is_published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {page.show_in_navbar && <span className="text-xs border border-[var(--border-color)] px-2 py-0.5 rounded text-[var(--text-color)] opacity-70">Navbar</span>}
                        {page.show_in_footer && <span className="text-xs border border-[var(--border-color)] px-2 py-0.5 rounded text-[var(--text-color)] opacity-70">Footer</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-color)] opacity-80">
                      {page.category || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(page)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => page.id && handleDelete(page.id)}
                          disabled={deletingId === page.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingId === page.id ? 'Deleting...' : 'Delete'}
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
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
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
              {formData.id ? "Edit Page" : "Create New Page"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            {isSaving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Core Information</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Page Title *</label>
              <input
                id="title" name="title" required
                value={formData.title} onChange={handleChange} onBlur={handleTitleBlur}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. About Our Institution"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-medium text-[var(--text-color)] opacity-90">URL Slug *</label>
              <input
                id="slug" name="slug" required
                value={formData.slug} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. about-us"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="short_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Short Description</label>
              <textarea
                id="short_description" name="short_description" rows={2}
                value={formData.short_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="content" className="text-sm font-medium text-[var(--text-color)] opacity-90">Page Content</label>
              {/* Future Integration: Replace textarea with Rich Text Editor (e.g., TipTap/Quill) */}
              <textarea
                id="content" name="content" rows={12}
                value={formData.content} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                placeholder="<p>Enter your HTML or standard content here...</p>"
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Search Engine Optimization (SEO)</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="seo_title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Meta Title</label>
              <input
                id="seo_title" name="seo_title"
                value={formData.seo_title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seo_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Meta Description</label>
              <textarea
                id="seo_description" name="seo_description" rows={3}
                value={formData.seo_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seo_keywords" className="text-sm font-medium text-[var(--text-color)] opacity-90">Meta Keywords</label>
              <input
                id="seo_keywords" name="seo_keywords"
                value={formData.seo_keywords} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="education, admission, university"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Publishing & Visibility</h2>
            
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox" name="is_published"
                  checked={formData.is_published} onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </div>
              <span className="text-sm font-medium text-[var(--text-color)]">Publish Page</span>
            </label>

            <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="show_in_navbar"
                  checked={formData.show_in_navbar} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-[var(--text-color)]">Show in Main Navbar</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="show_in_footer"
                  checked={formData.show_in_footer} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-[var(--text-color)]">Show in Footer Links</span>
              </label>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Page Metadata</h2>

            <div className="space-y-1.5">
              <label htmlFor="page_type" className="text-sm font-medium text-[var(--text-color)] opacity-90">Page Type</label>
              <select
                id="page_type" name="page_type"
                value={formData.page_type} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                <option value="standard">Standard Page</option>
                <option value="landing">Landing Page</option>
                <option value="department">Department Template</option>
                <option value="contact">Contact Template</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium text-[var(--text-color)] opacity-90">Category</label>
              <input
                id="category" name="category"
                value={formData.category} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. Admissions"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-sm font-medium text-[var(--text-color)] opacity-90">Tags (comma separated)</label>
              <input
                id="tags" name="tags"
                value={formData.tags} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="display_order" className="text-sm font-medium text-[var(--text-color)] opacity-90">Display Order</label>
              <input
                id="display_order" name="display_order" type="number" min="0"
                value={formData.display_order} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="featured_image_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">Featured Image URL</label>
              <input
                id="featured_image_url" name="featured_image_url" type="url"
                value={formData.featured_image_url} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="https://..."
              />
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
