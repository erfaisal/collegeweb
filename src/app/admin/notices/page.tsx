"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";

// Service imports
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "@/services/notices";
import { uploadMediaFile } from "@/services/media";

// Types
export interface Notice {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  pdf_url: string;
  featured_image_url: string;
  category: string;
  tags: string;
  publish_date: string;
  expiry_date: string;
  featured: boolean;
  visible: boolean;
  seo_title: string;
  seo_description: string;
}

const defaultNotice: Notice = {
  title: "",
  slug: "",
  short_description: "",
  content: "",
  pdf_url: "",
  featured_image_url: "",
  category: "General",
  tags: "",
  publish_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm format
  expiry_date: "",
  featured: false,
  visible: true,
  seo_title: "",
  seo_description: "",
};

const CATEGORIES = ["All", "General", "Academic", "Admissions", "Examination", "Events", "Urgent"];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<Notice>(defaultNotice);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState<{ pdf: boolean; image: boolean }>({ pdf: false, image: false });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNoticesData();
  }, []);

  async function fetchNoticesData() {
    try {
      setIsLoading(true);
      const data = await getNotices();
      // Sort by publish date descending
      const sortedData = (data || []).sort((a: Notice, b: Notice) => 
        new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
      );
      setNotices(sortedData);
    } catch (error) {
      console.error("Failed to load notices:", error);
      showMessage("error", "Failed to load notices.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setFormData({
      ...defaultNotice,
      publish_date: new Date().toISOString().slice(0, 16),
    });
    setView("form");
    setMessage(null);
  };

  const handleEdit = (notice: Notice) => {
    // Format dates for datetime-local input
    const formattedNotice = {
      ...notice,
      publish_date: notice.publish_date ? new Date(notice.publish_date).toISOString().slice(0, 16) : "",
      expiry_date: notice.expiry_date ? new Date(notice.expiry_date).toISOString().slice(0, 16) : "",
    };
    setFormData(formattedNotice);
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      showMessage("success", "Notice deleted successfully.");
    } catch (error) {
      console.error("Failed to delete notice:", error);
      showMessage("error", "Failed to delete notice.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTitleBlur = () => {
    if (!formData.id && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: "pdf" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(prev => ({ ...prev, [type]: true }));
      const uploadedMedia = await uploadMediaFile(file);
      
      if (uploadedMedia && uploadedMedia.url) {
        if (type === "pdf") {
          setFormData(prev => ({ ...prev, pdf_url: uploadedMedia.url }));
        } else {
          setFormData(prev => ({ ...prev, featured_image_url: uploadedMedia.url }));
        }
        showMessage("success", `${type.toUpperCase()} uploaded successfully.`);
      }
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      showMessage("error", `Failed to upload ${type}.`);
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
      if (type === "pdf" && pdfInputRef.current) pdfInputRef.current.value = "";
      if (type === "image" && imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Ensure dates are valid ISO strings before saving
      const payload = {
        ...formData,
        publish_date: formData.publish_date ? new Date(formData.publish_date).toISOString() : new Date().toISOString(),
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : "",
      };

      if (formData.id) {
        const updated = await updateNotice(formData.id, payload);
        setNotices((prev) => prev.map((n) => (n.id === formData.id ? updated : n)).sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()));
        showMessage("success", "Notice updated successfully.");
      } else {
        const created = await createNotice(payload);
        setNotices((prev) => [created, ...prev].sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()));
        showMessage("success", "Notice created successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save notice:", error);
      showMessage("error", "Failed to save notice. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (notice.short_description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || notice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Institutional Notices
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage circulars, announcements, alerts, and public notices.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Notice
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex w-full sm:w-auto gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Filter by category"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 w-full sm:w-64 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Search notices"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/[0.01] dark:bg-white/[0.01] border-b border-[var(--border-color)] text-[var(--text-color)] opacity-80">
              <tr>
                <th className="px-6 py-4 font-medium">Notice Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Publish Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No notices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => {
                  const isExpired = notice.expiry_date && new Date(notice.expiry_date) < new Date();
                  const isScheduled = new Date(notice.publish_date) > new Date();

                  return (
                    <tr key={notice.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-sm">
                          <span className="font-semibold text-[var(--text-color)] truncate" title={notice.title}>
                            {notice.featured && <span className="text-amber-500 mr-1" title="Featured">★</span>}
                            {notice.title}
                          </span>
                          <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5 truncate">{notice.short_description || notice.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[var(--text-color)]">
                          {notice.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <time dateTime={notice.publish_date} className="text-[var(--text-color)] opacity-90">
                          {new Date(notice.publish_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </time>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!notice.visible ? (
                            <span className="text-xs border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">Hidden</span>
                          ) : isExpired ? (
                            <span className="text-xs border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded">Expired</span>
                          ) : isScheduled ? (
                            <span className="text-xs border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded">Scheduled</span>
                          ) : (
                            <span className="text-xs border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded">Active</span>
                          )}
                          {notice.pdf_url && <span className="text-xs border border-[var(--border-color)] px-2 py-0.5 rounded text-[var(--text-color)] opacity-70">PDF</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors focus:outline-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => notice.id && handleDelete(notice.id)}
                            disabled={deletingId === notice.id}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 focus:outline-none"
                          >
                            {deletingId === notice.id ? 'Deleting...' : 'Delete'}
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
              {formData.id ? "Edit Notice" : "Create New Notice"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Notice"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Notice Content</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Notice Title *</label>
              <input
                id="title" name="title" required
                value={formData.title} onChange={handleChange} onBlur={handleTitleBlur}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. Schedule for Mid-Term Examinations"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-medium text-[var(--text-color)] opacity-90">URL Slug *</label>
              <input
                id="slug" name="slug" required
                value={formData.slug} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="short_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Short Description / Excerpt</label>
              <textarea
                id="short_description" name="short_description" rows={2}
                value={formData.short_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="content" className="text-sm font-medium text-[var(--text-color)] opacity-90">Detailed Content (HTML)</label>
              <textarea
                id="content" name="content" rows={8}
                value={formData.content} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                placeholder="<p>Full details of the notice...</p>"
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Attachments & Media</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PDF Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--text-color)] opacity-90">Document Attachment (PDF)</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="url" name="pdf_url"
                    value={formData.pdf_url} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="Enter URL or upload..."
                  />
                  <input
                    type="file" ref={pdfInputRef} onChange={(e) => handleFileUpload(e, "pdf")}
                    className="hidden" accept="application/pdf"
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={isUploading.pdf}
                    className="px-4 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {isUploading.pdf ? "Uploading..." : "Upload PDF"}
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--text-color)] opacity-90">Featured Image</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="url" name="featured_image_url"
                    value={formData.featured_image_url} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="Enter URL or upload..."
                  />
                  <input
                    type="file" ref={imageInputRef} onChange={(e) => handleFileUpload(e, "image")}
                    className="hidden" accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading.image}
                    className="px-4 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {isUploading.image ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Visibility & Status</h2>

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
                <span className="text-sm font-medium text-[var(--text-color)]">Publish to Public</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="featured"
                    checked={formData.featured} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--text-color)]">Featured Notice</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Pins to top / Highlights</span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Metadata & Dates</h2>

            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium text-[var(--text-color)] opacity-90">Category</label>
              <select
                id="category" name="category"
                value={formData.category} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                {CATEGORIES.filter(c => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="publish_date" className="text-sm font-medium text-[var(--text-color)] opacity-90">Publish Date & Time *</label>
              <input
                id="publish_date" name="publish_date" type="datetime-local" required
                value={formData.publish_date} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="expiry_date" className="text-sm font-medium text-[var(--text-color)] opacity-90">Expiry Date & Time</label>
              <input
                id="expiry_date" name="expiry_date" type="datetime-local"
                value={formData.expiry_date || ""} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
              <p className="text-xs text-[var(--text-color)] opacity-50">Leave blank if notice never expires.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-sm font-medium text-[var(--text-color)] opacity-90">Tags</label>
              <input
                id="tags" name="tags"
                value={formData.tags} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="Comma separated..."
              />
            </div>
          </div>
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">SEO Overrides</h2>

            <div className="space-y-1.5">
              <label htmlFor="seo_title" className="text-sm font-medium text-[var(--text-color)] opacity-90">SEO Title</label>
              <input
                id="seo_title" name="seo_title"
                value={formData.seo_title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seo_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">SEO Description</label>
              <textarea
                id="seo_description" name="seo_description" rows={3}
                value={formData.seo_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
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
