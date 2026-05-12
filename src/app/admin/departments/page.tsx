"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";

// Service imports
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/departments";
import { uploadMediaFile } from "@/services/media";

export interface Department {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  hod_name: string;
  featured_image_url: string;
  vision: string;
  mission: string;
  achievements: string;
  facilities: string;
  visible: boolean;
  display_order: number;
  seo_title: string;
  seo_description: string;
}

const defaultDepartment: Department = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  hod_name: "",
  featured_image_url: "",
  vision: "",
  mission: "",
  achievements: "",
  facilities: "",
  visible: true,
  display_order: 0,
  seo_title: "",
  seo_description: "",
};

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<Department>(defaultDepartment);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      setIsLoading(true);
      const data = await getDepartments();
      const sortedData = (data || []).sort((a: Department, b: Department) => a.display_order - b.display_order);
      setDepartments(sortedData);
    } catch (error) {
      console.error("Failed to load departments:", error);
      showMessage("error", "Failed to load academic departments.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setFormData({ ...defaultDepartment, display_order: departments.length });
    setView("form");
    setMessage(null);
  };

  const handleEdit = (dept: Department) => {
    setFormData({ ...dept });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department? This action cannot be undone and may affect faculty assignments.")) return;

    try {
      setDeletingId(id);
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showMessage("success", "Department deleted successfully.");
    } catch (error) {
      console.error("Failed to delete department:", error);
      showMessage("error", "Failed to delete department.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleNameBlur = () => {
    if (!formData.id && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedMedia = await uploadMediaFile(file);
      if (uploadedMedia && uploadedMedia.url) {
        setFormData((prev) => ({ ...prev, featured_image_url: uploadedMedia.url }));
        showMessage("success", "Featured image uploaded successfully.");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      showMessage("error", "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (formData.id) {
        const updated = await updateDepartment(formData.id, formData);
        setDepartments((prev) => prev.map((d) => (d.id === formData.id ? updated : d)).sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Department updated successfully.");
      } else {
        const created = await createDepartment(formData);
        setDepartments((prev) => [...prev, created].sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Department created successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save department:", error);
      showMessage("error", "Failed to save department. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === departments.length - 1)) return;

    const newDepartments = [...departments];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    const tempOrder = newDepartments[index].display_order;
    newDepartments[index].display_order = newDepartments[targetIndex].display_order;
    newDepartments[targetIndex].display_order = tempOrder;

    const temp = newDepartments[index];
    newDepartments[index] = newDepartments[targetIndex];
    newDepartments[targetIndex] = temp;

    setDepartments(newDepartments);

    try {
      if (newDepartments[index].id && newDepartments[targetIndex].id) {
        await Promise.all([
          updateDepartment(newDepartments[index].id as string, { display_order: newDepartments[index].display_order }),
          updateDepartment(newDepartments[targetIndex].id as string, { display_order: newDepartments[targetIndex].display_order })
        ]);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      showMessage("error", "Failed to save the new order.");
      fetchDepartments(); // Revert on failure
    }
  };

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Academic Departments
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage institutional departments, HOD information, and academic landing pages.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Department
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
                <th className="px-6 py-4 font-medium w-20">Order</th>
                <th className="px-6 py-4 font-medium">Department Name</th>
                <th className="px-6 py-4 font-medium">Head of Department</th>
                <th className="px-6 py-4 font-medium">Visibility</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No departments found. Click "Add Department" to get started.
                  </td>
                </tr>
              ) : (
                departments.map((dept, index) => (
                  <tr key={dept.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center justify-center w-8">
                        <button 
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          className="text-[var(--text-color)] opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity focus:outline-none"
                          aria-label="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                        </button>
                        <span className="text-xs font-mono text-[var(--text-color)]">{dept.display_order}</span>
                        <button 
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === departments.length - 1}
                          className="text-[var(--text-color)] opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity focus:outline-none"
                          aria-label="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text-color)]">{dept.name}</span>
                        <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">/{dept.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-color)] opacity-90">
                      {dept.hod_name || <span className="opacity-50 italic">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      {dept.visible ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => dept.id && handleDelete(dept.id)}
                          disabled={deletingId === dept.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 focus:outline-none"
                        >
                          {deletingId === dept.id ? 'Deleting...' : 'Delete'}
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
              {formData.id ? "Edit Department" : "Add New Department"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Department"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Core Information</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[var(--text-color)] opacity-90">Department Name *</label>
              <input
                id="name" name="name" required
                value={formData.name} onChange={handleChange} onBlur={handleNameBlur}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. Department of Computer Science"
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
              <label htmlFor="hod_name" className="text-sm font-medium text-[var(--text-color)] opacity-90">Head of Department (HOD)</label>
              <input
                id="hod_name" name="hod_name"
                value={formData.hod_name} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. Dr. John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="short_description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Short Description</label>
              <textarea
                id="short_description" name="short_description" rows={2}
                value={formData.short_description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                placeholder="Brief summary for department cards..."
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Detailed Content</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Full Description (HTML)</label>
              <textarea
                id="description" name="description" rows={6}
                value={formData.description} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                placeholder="<p>Comprehensive overview of the department...</p>"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="vision" className="text-sm font-medium text-[var(--text-color)] opacity-90">Department Vision</label>
                <textarea
                  id="vision" name="vision" rows={4}
                  value={formData.vision} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mission" className="text-sm font-medium text-[var(--text-color)] opacity-90">Department Mission</label>
                <textarea
                  id="mission" name="mission" rows={4}
                  value={formData.mission} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="achievements" className="text-sm font-medium text-[var(--text-color)] opacity-90">Key Achievements (HTML)</label>
              <textarea
                id="achievements" name="achievements" rows={4}
                value={formData.achievements} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                placeholder="<ul><li>Accredited by...</li></ul>"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="facilities" className="text-sm font-medium text-[var(--text-color)] opacity-90">Labs & Facilities (HTML)</label>
              <textarea
                id="facilities" name="facilities" rows={4}
                value={formData.facilities} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                placeholder="<ul><li>State-of-the-art AI lab...</li></ul>"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Featured Media</h2>
            
            <div className="flex flex-col gap-4">
              {formData.featured_image_url ? (
                <div className="relative aspect-video rounded-lg border border-[var(--border-color)] overflow-hidden group bg-black/5 dark:bg-white/5">
                  <img src={formData.featured_image_url} alt="Department Featured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image_url: "" }))}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-center p-4 bg-black/[0.02] dark:bg-white/[0.02]">
                  <svg className="w-8 h-8 text-[var(--text-color)] opacity-30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-xs text-[var(--text-color)] opacity-60">No image selected</p>
                </div>
              )}
              
              <input
                type="file" ref={imageInputRef} onChange={handleImageUpload}
                className="hidden" accept="image/*"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="w-full px-4 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-[var(--text-color)]"
              >
                {isUploading ? "Uploading..." : "Upload Cover Image"}
              </button>

              <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                <label htmlFor="featured_image_url" className="text-xs font-medium text-[var(--text-color)] opacity-80">Or enter image URL</label>
                <input
                  id="featured_image_url" name="featured_image_url" type="url"
                  value={formData.featured_image_url} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Visibility & Ordering</h2>

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
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--text-color)]">Department Active</span>
                <span className="text-xs text-[var(--text-color)] opacity-60">Visible on public directories</span>
              </div>
            </label>

            <div className="pt-4 border-t border-[var(--border-color)] space-y-1.5">
              <label htmlFor="display_order" className="text-sm font-medium text-[var(--text-color)] opacity-90">Display Order</label>
              <input
                id="display_order" name="display_order" type="number" min="0"
                value={formData.display_order} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">SEO Configuration</h2>

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
