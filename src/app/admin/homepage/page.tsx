"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

// Service imports
import {
  getAllHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  toggleHomepageSection,
  updateHomepageSectionOrder,
  getHomepagePreset,
} from "@/services/homepage-sections";

export interface HomepageSection {
  id?: string;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
  image_url: string;
  button_text: string;
  button_link: string;
  layout_type: string;
  background_style: string;
  visible: boolean;
  enabled: boolean;
  display_order: number;
  module_key: string;
  animation_style: string;
}

const defaultSection: HomepageSection = {
  section_key: "",
  title: "",
  subtitle: "",
  description: "",
  content: "",
  image_url: "",
  button_text: "",
  button_link: "",
  layout_type: "centered",
  background_style: "default",
  visible: true,
  enabled: true,
  display_order: 0,
  module_key: "",
  animation_style: "none",
};

const PRESETS = [
  { value: "medical_college", label: "Medical College" },
  { value: "engineering_college", label: "Engineering College" },
  { value: "university", label: "University" },
  { value: "school", label: "School" },
];

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<HomepageSection>(defaultSection);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      setIsLoading(true);
      const data = await getAllHomepageSections();
      const sortedData = (data || []).sort((a: HomepageSection, b: HomepageSection) => a.display_order - b.display_order);
      setSections(sortedData);
    } catch (error) {
      console.error("Failed to load homepage sections:", error);
      showMessage("error", "Failed to load homepage sections.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateNew = () => {
    setFormData({ ...defaultSection, display_order: sections.length });
    setView("form");
    setMessage(null);
  };

  const handleEdit = (section: HomepageSection) => {
    setFormData({ ...section });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this section? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      await deleteHomepageSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      showMessage("success", "Section deleted successfully.");
    } catch (error) {
      console.error("Failed to delete section:", error);
      showMessage("error", "Failed to delete section.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleHomepageSection(id, !currentStatus);
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !currentStatus, visible: !currentStatus } : s))
      );
      showMessage("success", `Section ${!currentStatus ? "enabled" : "disabled"}.`);
    } catch (error) {
      console.error("Failed to toggle section status:", error);
      showMessage("error", "Failed to update section status.");
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === sections.length - 1)) return;

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap display orders
    const tempOrder = newSections[index].display_order;
    newSections[index].display_order = newSections[targetIndex].display_order;
    newSections[targetIndex].display_order = tempOrder;

    // Swap positions in array for immediate UI update
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);

    try {
      if (newSections[index].id && newSections[targetIndex].id) {
        await updateHomepageSectionOrder([
          { id: newSections[index].id!, display_order: newSections[index].display_order },
          { id: newSections[targetIndex].id!, display_order: newSections[targetIndex].display_order }
        ]);
      }
    } catch (error) {
      console.error("Failed to persist order:", error);
      showMessage("error", "Failed to save the new order.");
      fetchSections(); // Revert on failure
    }
  };

  const handleApplyPreset = async () => {
    if (!selectedPreset) return;
    if (!window.confirm(`Are you sure you want to apply the ${selectedPreset.replace('_', ' ')} preset? This will overwrite your current layout.`)) return;

    try {
      setIsLoadingPreset(true);
      const presetData = await getHomepagePreset(selectedPreset);
      if (presetData) {
        setSections(presetData.sort((a: HomepageSection, b: HomepageSection) => a.display_order - b.display_order));
        showMessage("success", "Preset applied successfully.");
      }
    } catch (error) {
      console.error("Failed to apply preset:", error);
      showMessage("error", "Failed to apply preset layout.");
    } finally {
      setIsLoadingPreset(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (formData.id) {
        const updated = await updateHomepageSection(formData.id, formData);
        setSections((prev) => prev.map((s) => (s.id === formData.id ? updated : s)).sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Section updated successfully.");
      } else {
        const created = await createHomepageSection(formData);
        setSections((prev) => [...prev, created].sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Section created successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save section:", error);
      showMessage("error", "Failed to save section. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Homepage Builder
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage the content, layout, and ordering of your landing page sections.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-[var(--border-color)]">
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="px-3 py-1.5 text-sm bg-transparent text-[var(--text-color)] outline-none"
            >
              <option value="">Select Layout Preset...</option>
              {PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>{preset.label}</option>
              ))}
            </select>
            <button
              onClick={handleApplyPreset}
              disabled={!selectedPreset || isLoadingPreset}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--background-color)] border border-[var(--border-color)] rounded shadow-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
            >
              {isLoadingPreset ? "Applying..." : "Apply"}
            </button>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Section
          </button>
        </div>
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
                <th className="px-6 py-4 font-medium">Section Name</th>
                <th className="px-6 py-4 font-medium">Layout Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {sections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-color)] opacity-60">
                    No homepage sections found. Apply a preset or add a new section.
                  </td>
                </tr>
              ) : (
                sections.map((section, index) => (
                  <tr key={section.id || index} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center justify-center w-8">
                        <button 
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          className="text-[var(--text-color)] opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity"
                          aria-label="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                        </button>
                        <span className="text-xs font-mono text-[var(--text-color)]">{section.display_order}</span>
                        <button 
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === sections.length - 1}
                          className="text-[var(--text-color)] opacity-40 hover:opacity-100 disabled:opacity-20 transition-opacity"
                          aria-label="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text-color)]">{section.title || section.section_key}</span>
                        <span className="text-xs text-[var(--text-color)] opacity-60 mt-0.5">Key: {section.section_key}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-md text-[var(--text-color)]">
                        {section.layout_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => section.id && handleToggleStatus(section.id, section.enabled)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${section.enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'}`}
                      >
                        {section.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(section)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => section.id && handleDelete(section.id)}
                          disabled={deletingId === section.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingId === section.id ? 'Deleting...' : 'Delete'}
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
              {formData.id ? "Edit Homepage Section" : "Create New Section"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            {isSaving ? "Saving..." : "Save Section"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Core Content</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Section Title *</label>
                <input
                  id="title" name="title" required
                  value={formData.title} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Welcome to Our Institution"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="subtitle" className="text-sm font-medium text-[var(--text-color)] opacity-90">Subtitle / Kicker</label>
                <input
                  id="subtitle" name="subtitle"
                  value={formData.subtitle} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Excellence in Education"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-[var(--text-color)] opacity-90">Brief Description</label>
                <textarea
                  id="description" name="description" rows={3}
                  value={formData.description} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                  placeholder="Short paragraph summarizing the section..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="content" className="text-sm font-medium text-[var(--text-color)] opacity-90">Extended HTML Content</label>
                <textarea
                  id="content" name="content" rows={6}
                  value={formData.content} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm resize-y"
                  placeholder="<p>Detailed content if layout supports it...</p>"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Media & Actions</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="image_url" className="text-sm font-medium text-[var(--text-color)] opacity-90">Section Image/Background URL</label>
              <input
                id="image_url" name="image_url" type="url"
                value={formData.image_url} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="button_text" className="text-sm font-medium text-[var(--text-color)] opacity-90">Call to Action (CTA) Text</label>
                <input
                  id="button_text" name="button_text"
                  value={formData.button_text} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. Apply Now"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="button_link" className="text-sm font-medium text-[var(--text-color)] opacity-90">CTA Link Target</label>
                <input
                  id="button_link" name="button_link"
                  value={formData.button_link} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="e.g. /admissions"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Configuration</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="section_key" className="text-sm font-medium text-[var(--text-color)] opacity-90">Section Identifier Key *</label>
              <input
                id="section_key" name="section_key" required
                value={formData.section_key} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                placeholder="e.g. hero, about, features"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="module_key" className="text-sm font-medium text-[var(--text-color)] opacity-90">Dynamic Module Key</label>
              <input
                id="module_key" name="module_key"
                value={formData.module_key} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                placeholder="e.g. dynamic_admissions"
              />
            </div>

            <div className="space-y-4 pt-3 border-t border-[var(--border-color)]">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="enabled"
                  checked={formData.enabled} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-[var(--text-color)]">Section Enabled</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" name="visible"
                  checked={formData.visible} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-[var(--text-color)]">Visible to Public</span>
              </label>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Design & Layout</h2>

            <div className="space-y-1.5">
              <label htmlFor="layout_type" className="text-sm font-medium text-[var(--text-color)] opacity-90">Layout Architecture</label>
              <select
                id="layout_type" name="layout_type"
                value={formData.layout_type} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                <option value="hero">Full Hero Banner</option>
                <option value="split_left">Split (Image Left)</option>
                <option value="split_right">Split (Image Right)</option>
                <option value="centered">Centered Content</option>
                <option value="grid">Multi-column Grid</option>
                <option value="carousel">Interactive Carousel</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="background_style" className="text-sm font-medium text-[var(--text-color)] opacity-90">Background Style</label>
              <select
                id="background_style" name="background_style"
                value={formData.background_style} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                <option value="default">Default Background</option>
                <option value="muted">Muted/Gray</option>
                <option value="primary">Primary Brand Color</option>
                <option value="dark">Dark Theme Variant</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="animation_style" className="text-sm font-medium text-[var(--text-color)] opacity-90">Entrance Animation</label>
              <select
                id="animation_style" name="animation_style"
                value={formData.animation_style} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              >
                <option value="none">None</option>
                <option value="fade_in">Fade In</option>
                <option value="slide_up">Slide Up</option>
                <option value="zoom_in">Zoom In</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="display_order" className="text-sm font-medium text-[var(--text-color)] opacity-90">Sort Order Base</label>
              <input
                id="display_order" name="display_order" type="number" min="0"
                value={formData.display_order} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
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
