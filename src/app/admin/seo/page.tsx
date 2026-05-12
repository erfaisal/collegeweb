"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

// Service imports
import {
  getSEOByPath, // In a real app, you'd likely have a getAllSEO() as well, assuming getSEOByPath can fetch all if no path provided or we have a distinct fetch list function
  createSEOData,
  updateSEOData,
  deleteSEOData,
} from "@/services/seo";

// Mapped from requirements
export interface SEOEntry {
  id?: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image_url: string;
  robots: string;
  structured_data: string;
  author: string;
  language: string;
  revisit_after: string;
  theme_color: string;
}

const defaultSEOEntry: SEOEntry = {
  page_path: "",
  title: "",
  description: "",
  keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  twitter_title: "",
  twitter_description: "",
  twitter_image_url: "",
  robots: "index, follow",
  structured_data: "",
  author: "",
  language: "en",
  revisit_after: "7 days",
  theme_color: "#ffffff",
};

// Mocking getAllSEOEntries since getSEOByPath is provided but we need a list view
// In production, this would be imported from "@/services/seo"
const getAllSEOEntries = async (): Promise<SEOEntry[]> => {
  // Try using getSEOByPath without args if that's the intended implementation
  return (await getSEOByPath("")) as unknown as SEOEntry[];
};

export default function AdminSEOPage() {
  const [seoEntries, setSeoEntries] = useState<SEOEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<SEOEntry>(defaultSEOEntry);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      setIsLoading(true);
      // Fallback logic for demo. Replace with real API call.
      let data;
      try {
        data = await getAllSEOEntries();
      } catch (e) {
        data = []; // Fallback if mock fails
      }
      setSeoEntries(data || []);
    } catch (error) {
      console.error("Failed to fetch SEO entries:", error);
      showMessage("error", "Failed to load SEO metadata.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setFormData(defaultSEOEntry);
    setView("form");
    setMessage(null);
  };

  const handleEdit = (entry: SEOEntry) => {
    setFormData({ ...entry });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this SEO configuration? The page will fall back to global SEO settings.")) return;

    try {
      setDeletingId(id);
      await deleteSEOData(id);
      setSeoEntries((prev) => prev.filter((e) => e.id !== id));
      showMessage("success", "SEO metadata deleted successfully.");
    } catch (error) {
      console.error("Failed to delete SEO metadata:", error);
      showMessage("error", "Failed to delete SEO metadata.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Basic validation
    if (!formData.page_path.startsWith("/")) {
      showMessage("error", "Page Path must start with a forward slash (/).");
      setIsSaving(false);
      return;
    }

    try {
      if (formData.id) {
        const updated = await updateSEOData(formData.id, formData);
        setSeoEntries((prev) => prev.map((item) => (item.id === formData.id ? updated : item)));
        showMessage("success", "SEO configuration updated successfully.");
      } else {
        const created = await createSEOData(formData);
        setSeoEntries((prev) => [created, ...prev]);
        showMessage("success", "SEO configuration created successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save SEO metadata:", error);
      showMessage("error", "Failed to save SEO configuration. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            SEO Management
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage page-specific metadata, open graph tags, and technical SEO properties.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add SEO Entry
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
                <th className="px-6 py-4 font-medium">Page Path</th>
                <th className="px-6 py-4 font-medium">Meta Title</th>
                <th className="px-6 py-4 font-medium">Robots</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {seoEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No SEO metadata entries found. Global fallbacks are currently active.
                  </td>
                </tr>
              ) : (
                seoEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-mono bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded text-[var(--text-color)]">
                        {entry.page_path}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-color)] max-w-xs truncate" title={entry.title}>
                        {entry.title || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-color)] opacity-80">
                      {entry.robots || "index, follow"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => entry.id && handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 focus:outline-none"
                        >
                          {deletingId === entry.id ? 'Deleting...' : 'Delete'}
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
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 max-w-6xl">
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
              {formData.id ? "Edit SEO Entry" : "Create SEO Entry"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save SEO Data"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main SEO Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Core Search Metadata</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="page_path" className="text-sm font-medium text-[var(--text-color)] opacity-90">Target Page Path *</label>
              <input
                id="page_path" name="page_path" required
                value={formData.page_path} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                placeholder="e.g. /about-us"
              />
              <p className="text-xs text-[var(--text-color)] opacity-50">The exact URL path this SEO configuration should apply to.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Meta Title</label>
              <input
                id="title" name="title"
                value={formData.title} onChange={handleChange}
                maxLength={60}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="Targeting ~60 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Meta Description</label>
              <textarea
                id="description" name="description" rows={3}
                value={formData.description} onChange={handleChange}
                maxLength={160}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                placeholder="Targeting ~150-160 characters..."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="keywords" className="text-sm font-medium text-[var(--text-color)] opacity-90">Keywords</label>
              <input
                id="keywords" name="keywords"
                value={formData.keywords} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="Comma separated keywords..."
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Open Graph (Facebook, LinkedIn)</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="og_title" className="text-sm font-medium text-[var(--text-color)] opacity-90">OG Title</label>
              <input
                id="og_title" name="og_title"
                value={formData.og_title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="Overrides Meta Title for social sharing"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="og_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">OG Description</label>
              <textarea
                id="og_description" name="og_description" rows={2}
                value={formData.og_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="og_image_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">OG Image URL</label>
              <input
                id="og_image_url" name="og_image_url" type="url"
                value={formData.og_image_url} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Twitter Cards</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="twitter_title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Twitter Title</label>
              <input
                id="twitter_title" name="twitter_title"
                value={formData.twitter_title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="twitter_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Twitter Description</label>
              <textarea
                id="twitter_description" name="twitter_description" rows={2}
                value={formData.twitter_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="twitter_image_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">Twitter Image URL</label>
              <input
                id="twitter_image_url" name="twitter_image_url" type="url"
                value={formData.twitter_image_url} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>
          </div>

        </div>

        {/* Sidebar Configuration Column */}
        <div className="space-y-6">
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Technical SEO</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="robots" className="text-sm font-medium text-[var(--text-color)] opacity-90">Robots Directive</label>
              <input
                id="robots" name="robots"
                value={formData.robots} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="index, follow"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="canonical_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">Canonical URL</label>
              <input
                id="canonical_url" name="canonical_url" type="url"
                value={formData.canonical_url} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="https://yourdomain.com/path"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="language" className="text-sm font-medium text-[var(--text-color)] opacity-90">Language (hreflang)</label>
              <input
                id="language" name="language"
                value={formData.language} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. en"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="author" className="text-sm font-medium text-[var(--text-color)] opacity-90">Author</label>
              <input
                id="author" name="author"
                value={formData.author} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="revisit_after" className="text-sm font-medium text-[var(--text-color)] opacity-90">Revisit After</label>
                <input
                  id="revisit_after" name="revisit_after"
                  value={formData.revisit_after} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="7 days"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="theme_color" className="text-sm font-medium text-[var(--text-color)] opacity-90">Theme Color</label>
                <input
                  id="theme_color" name="theme_color" type="color"
                  value={formData.theme_color || "#ffffff"} onChange={handleChange}
                  className="w-full h-[42px] px-1 py-1 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Structured Data</h2>

            <div className="space-y-1.5">
              <label htmlFor="structured_data" className="text-sm font-medium text-[var(--text-color)] opacity-90">JSON-LD Schema</label>
              <textarea
                id="structured_data" name="structured_data" rows={12}
                value={formData.structured_data} onChange={handleChange}
                className="w-full px-3 py-2 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-xs resize-y"
                placeholder='{ "@context": "https://schema.org", "@type": "Organization", ... }'
              />
              <p className="text-xs text-[var(--text-color)] opacity-50">Injects custom Schema.org markup to the page head.</p>
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
