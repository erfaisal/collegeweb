"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";

// Service imports
import {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "@/services/gallery";
import { uploadMediaFile } from "@/services/media";

export interface GalleryItem {
  id?: string;
  title: string;
  image_url: string;
  category: string;
  tags: string;
  featured: boolean;
  visible: boolean;
  show_on_homepage: boolean;
  display_order: number;
  alt_text: string;
  seo_title: string;
  seo_description: string;
}

const defaultGalleryItem: GalleryItem = {
  title: "",
  image_url: "",
  category: "Campus",
  tags: "",
  featured: false,
  visible: true,
  show_on_homepage: false,
  display_order: 0,
  alt_text: "",
  seo_title: "",
  seo_description: "",
};

const CATEGORIES = ["All", "Campus", "Events", "Facilities", "Students", "Faculty", "Convocation", "Sports"];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState<GalleryItem>(defaultGalleryItem);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setIsLoading(true);
      const data = await getGalleryImages();
      const sortedData = (data || []).sort((a: GalleryItem, b: GalleryItem) => a.display_order - b.display_order);
      setItems(sortedData);
    } catch (error) {
      console.error("Failed to load gallery items:", error);
      showMessage("error", "Failed to load gallery items.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setFormData({ ...defaultGalleryItem, display_order: items.length });
    setView("form");
    setMessage(null);
  };

  const handleEdit = (item: GalleryItem) => {
    setFormData({ ...item });
    setView("form");
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gallery image? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      await deleteGalleryImage(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showMessage("success", "Image deleted successfully.");
    } catch (error) {
      console.error("Failed to delete image:", error);
      showMessage("error", "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const filteredIndex = index;
    // Map filtered index back to absolute index to ensure proper swapping
    const currentItem = filteredItems[filteredIndex];
    const targetItem = direction === "up" ? filteredItems[filteredIndex - 1] : filteredItems[filteredIndex + 1];

    if (!currentItem || !targetItem) return;

    const currentAbsIndex = items.findIndex(i => i.id === currentItem.id);
    const targetAbsIndex = items.findIndex(i => i.id === targetItem.id);

    const newItems = [...items];
    const tempOrder = newItems[currentAbsIndex].display_order;
    newItems[currentAbsIndex].display_order = newItems[targetAbsIndex].display_order;
    newItems[targetAbsIndex].display_order = tempOrder;

    // Swap in array for immediate UI response
    const temp = newItems[currentAbsIndex];
    newItems[currentAbsIndex] = newItems[targetAbsIndex];
    newItems[targetAbsIndex] = temp;

    // Resort
    newItems.sort((a, b) => a.display_order - b.display_order);
    setItems(newItems);

    try {
      if (currentItem.id && targetItem.id) {
        await Promise.all([
          updateGalleryImage(currentItem.id, { ...currentItem, display_order: newItems[targetAbsIndex].display_order }),
          updateGalleryImage(targetItem.id, { ...targetItem, display_order: newItems[currentAbsIndex].display_order })
        ]);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      showMessage("error", "Failed to save order.");
      fetchItems(); // revert
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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedMedia = await uploadMediaFile(file);
      if (uploadedMedia && uploadedMedia.url) {
        setFormData((prev) => ({ 
          ...prev, 
          image_url: uploadedMedia.url,
          title: prev.title || file.name.split('.')[0],
          alt_text: prev.alt_text || file.name.split('.')[0]
        }));
        showMessage("success", "Image uploaded successfully.");
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
    if (!formData.image_url) {
      showMessage("error", "Please upload or provide an image URL.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (formData.id) {
        const updated = await updateGalleryImage(formData.id, formData);
        setItems((prev) => prev.map((i) => (i.id === formData.id ? updated : i)).sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Gallery item updated.");
      } else {
        const created = await createGalleryImage(formData);
        setItems((prev) => [...prev, created].sort((a, b) => a.display_order - b.display_order));
        showMessage("success", "Gallery item added successfully.");
      }
      setView("list");
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      showMessage("error", "Failed to save item. Please verify your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = filterCategory === "All" 
    ? items 
    : items.filter(item => item.category === filterCategory);

  const renderList = () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Media Gallery
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage institutional photo albums, campus highlights, and event galleries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Filter gallery by category"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Image
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <svg className="w-12 h-12 text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 className="text-lg font-medium text-[var(--text-color)] mb-1">No images found</h3>
          <p className="text-sm text-[var(--text-color)] opacity-60 max-w-sm mb-6">
            {filterCategory === "All" ? "Your gallery is currently empty. Upload your first image to get started." : `No images found in the ${filterCategory} category.`}
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            Upload New Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredItems.map((item, index) => (
            <article 
              key={item.id} 
              className="group flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Image Thumbnail Preview */}
              <div className="relative aspect-[4/3] bg-black/5 dark:bg-white/5 overflow-hidden border-b border-[var(--border-color)]">
                <img 
                  src={item.image_url} 
                  alt={item.alt_text || item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-white text-gray-900 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm focus:outline-none"
                    aria-label="Edit image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button
                    onClick={() => item.id && handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-sm focus:outline-none disabled:opacity-50"
                    aria-label="Delete image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                  {item.featured && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Featured</span>
                  )}
                  {item.show_on_homepage && (
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Homepage</span>
                  )}
                  {!item.visible && (
                    <span className="px-2 py-0.5 bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Hidden</span>
                  )}
                </div>
              </div>

              {/* Details & Controls */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-[var(--text-color)] truncate flex-1" title={item.title}>
                    {item.title || "Untitled Image"}
                  </h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded text-[var(--text-color)] opacity-80 whitespace-nowrap">
                    {item.category}
                  </span>
                </div>
                
                <div className="mt-auto pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-color)] opacity-60 font-mono">
                    Order: {item.display_order}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleReorder(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-[var(--text-color)] opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded disabled:opacity-20 transition-all"
                      aria-label="Move image up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleReorder(index, "down")}
                      disabled={index === filteredItems.length - 1}
                      className="p-1 text-[var(--text-color)] opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded disabled:opacity-20 transition-all"
                      aria-label="Move image down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
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
            aria-label="Back to gallery"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)]">
              {formData.id ? "Edit Gallery Item" : "Add Gallery Image"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Image"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Editor Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Media File</h2>
            
            <div className="flex flex-col gap-4">
              {formData.image_url ? (
                <div className="relative aspect-video sm:aspect-[21/9] bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border-color)] overflow-hidden group">
                  <img 
                    src={formData.image_url} 
                    alt={formData.alt_text || "Preview"} 
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-black/[0.01] dark:bg-white/[0.01]">
                  <svg className="w-10 h-10 text-[var(--text-color)] opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-sm font-medium text-[var(--text-color)] mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-[var(--text-color)] opacity-60 mb-4">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-medium bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 text-[var(--text-color)]"
                  >
                    {isUploading ? "Uploading..." : "Select Image"}
                  </button>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label htmlFor="image_url" className="text-xs font-medium text-[var(--text-color)] opacity-80">Or provide image URL directly</label>
                <input
                  id="image_url" name="image_url" type="url"
                  value={formData.image_url} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Image Details</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-[var(--text-color)] opacity-90">Image Title *</label>
              <input
                id="title" name="title" required
                value={formData.title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="e.g. Annual Convocation Ceremony"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="alt_text" className="text-sm font-medium text-[var(--text-color)] opacity-90">Alt Text (Accessibility) *</label>
              <input
                id="alt_text" name="alt_text" required
                value={formData.alt_text} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="Describe the image for screen readers..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <label htmlFor="tags" className="text-sm font-medium text-[var(--text-color)] opacity-90">Tags (comma separated)</label>
                <input
                  id="tags" name="tags"
                  value={formData.tags} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  placeholder="campus, autumn, students"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Configuration */}
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
                <span className="text-sm font-medium text-[var(--text-color)]">Visible in Gallery</span>
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
                  <span className="text-sm font-medium text-[var(--text-color)]">Featured Image</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Highlights in gallery grid</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="show_on_homepage"
                    checked={formData.show_on_homepage} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--text-color)]">Show on Homepage</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Includes in homepage carousel</span>
                </div>
              </label>
            </div>

            <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
              <label htmlFor="display_order" className="text-sm font-medium text-[var(--text-color)] opacity-90 block mb-1.5">Display Order Number</label>
              <input
                id="display_order" name="display_order" type="number" min="0"
                value={formData.display_order} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>
          </div>

          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">SEO Details</h2>

            <div className="space-y-1.5">
              <label htmlFor="seo_title" className="text-sm font-medium text-[var(--text-color)] opacity-90">SEO Meta Title</label>
              <input
                id="seo_title" name="seo_title"
                value={formData.seo_title} onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="Fallback to regular title if empty"
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
