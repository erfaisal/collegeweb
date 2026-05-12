"use client";

import { useEffect, useState, useRef, ChangeEvent, FormEvent } from "react";

// Service imports
import {
  getMediaFiles,
  uploadMediaFile,
  deleteMediaFile,
  updateMediaMetadata,
} from "@/services/media";

// Types
export interface MediaFile {
  id: string;
  url: string;
  file_name: string;
  media_type: "image" | "pdf" | string;
  category: string;
  file_size: number; // in bytes
  uploaded_date: string;
  alt_text: string;
  caption: string;
  tags: string;
  seo_title: string;
  seo_description: string;
}

const CATEGORIES = ["All", "General", "Gallery", "Admissions", "Faculty", "Documents", "Notices"];

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function AdminMediaPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    try {
      setIsLoading(true);
      const data = await getMediaFiles();
      setMediaFiles(data || []);
    } catch (error) {
      console.error("Failed to load media files:", error);
      showMessage("error", "Failed to load media library.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      // In a real scenario, you might loop through multiple files. Handling single for now.
      const newFile = await uploadMediaFile(files[0]);
      if (newFile) {
        setMediaFiles((prev) => [newFile, ...prev]);
        showMessage("success", "File uploaded successfully.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      showMessage("error", "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media file? This action is irreversible.")) return;

    try {
      setIsDeleting(id);
      await deleteMediaFile(id);
      setMediaFiles((prev) => prev.filter((file) => file.id !== id));
      if (selectedFile?.id === id) {
        setSelectedFile(null);
      }
      showMessage("success", "File deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage("error", "Failed to delete file.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateMetadata = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUpdating(true);
      const updatedFile = await updateMediaMetadata(selectedFile.id, selectedFile);
      setMediaFiles((prev) =>
        prev.map((file) => (file.id === selectedFile.id ? { ...file, ...updatedFile } : file))
      );
      showMessage("success", "Metadata updated successfully.");
    } catch (error) {
      console.error("Metadata update failed:", error);
      showMessage("error", "Failed to update metadata.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMetadataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedFile) return;
    const { name, value } = e.target;
    setSelectedFile({ ...selectedFile, [name]: value });
  };

  const filteredFiles = filterCategory === "All" 
    ? mediaFiles 
    : mediaFiles.filter(f => f.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--background-color)]">
      
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--border-color)] p-4 sm:px-6 lg:px-8 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-color)]">
              Media Library
            </h1>
            <p className="text-sm text-[var(--text-color)] opacity-70 mt-1">
              Manage images, documents, and other media assets.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Filter media by category"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
              aria-label="Upload media file hidden input"
            />
            
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}
      </header>

      {/* Main Content Area: Grid + Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Media Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]" />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-[var(--border-color)]">
                <svg className="w-10 h-10 text-[var(--text-color)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-[var(--text-color)] opacity-70 font-medium">No media files found</p>
              <p className="text-sm text-[var(--text-color)] opacity-50 mt-1">Upload a new file or adjust your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`group relative flex flex-col rounded-xl border bg-[var(--background-color)] overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedFile?.id === file.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-[var(--border-color)]'}`}
                >
                  <div className="aspect-square bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center overflow-hidden border-b border-[var(--border-color)]">
                    {file.media_type?.includes("image") ? (
                      <img 
                        src={file.url} 
                        alt={file.alt_text || file.file_name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        <svg className="w-12 h-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-2.5-.002v-4.505h-1.25v-1.485h3.75v5.992zm3.328-3.082v1.597h-1.25v-5.992h2.247c1.385 0 2.425 1.022 2.425 2.193 0 1.176-1.041 2.202-2.425 2.202h-.997zm0-2.906v1.4h.958c.61 0 1.1-.531 1.1-1.096 0-.568-.49-1.077-1.1-1.077h-.958l.001.773zm-6.248.88h-.83v1.895h-1.25v-5.992h2.253c1.31 0 2.247.925 2.247 2.048 0 1.127-.936 2.049-2.25 2.049h-.17zm-.83-2.613v1.205h.697c.56 0 1.003-.433 1.003-.984s-.442-1.004-1.003-1.004h-.697z"/></svg>
                        <span className="text-xs font-semibold text-[var(--text-color)] opacity-70 uppercase">PDF Document</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-[var(--text-color)] truncate" title={file.file_name}>
                      {file.file_name}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-xs text-[var(--text-color)] opacity-60">
                      <span>{formatBytes(file.file_size)}</span>
                      <span className="uppercase">{file.media_type?.split('/')[1] || file.media_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Edit Metadata Sidebar */}
        {selectedFile && (
          <aside className="w-full max-w-sm border-l border-[var(--border-color)] bg-[var(--background-color)] flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h2 className="text-base font-semibold text-[var(--text-color)]">File Details</h2>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-md text-[var(--text-color)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Close details panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {/* Preview */}
              <div className="w-full aspect-video bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden border border-[var(--border-color)] mb-6 flex items-center justify-center">
                {selectedFile.media_type?.includes("image") ? (
                  <img src={selectedFile.url} alt={selectedFile.alt_text || "Preview"} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[var(--text-color)] opacity-60 text-sm font-medium">Document Preview Not Available</span>
                )}
              </div>

              {/* Read-only Details */}
              <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-lg p-3 border border-[var(--border-color)] mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-color)] opacity-60">File name:</span>
                  <span className="text-[var(--text-color)] font-medium truncate ml-4 max-w-[150px]" title={selectedFile.file_name}>{selectedFile.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-color)] opacity-60">Uploaded:</span>
                  <span className="text-[var(--text-color)] font-medium">
                    {new Date(selectedFile.uploaded_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-color)] opacity-60">Size:</span>
                  <span className="text-[var(--text-color)] font-medium">{formatBytes(selectedFile.file_size)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-[var(--border-color)]">
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium">
                    Open original file &#8599;
                  </a>
                </div>
              </div>

              {/* Edit Form */}
              <form id="metadata-form" onSubmit={handleUpdateMetadata} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="alt_text" className="text-xs font-medium text-[var(--text-color)] opacity-90">Alt Text (Accessibility)</label>
                  <input
                    id="alt_text" name="alt_text"
                    value={selectedFile.alt_text || ""} onChange={handleMetadataChange}
                    className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="Describe the image..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="caption" className="text-xs font-medium text-[var(--text-color)] opacity-90">Caption</label>
                  <input
                    id="caption" name="caption"
                    value={selectedFile.caption || ""} onChange={handleMetadataChange}
                    className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category" className="text-xs font-medium text-[var(--text-color)] opacity-90">Category</label>
                  <select
                    id="category" name="category"
                    value={selectedFile.category || "General"} onChange={handleMetadataChange}
                    className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  >
                    {CATEGORIES.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tags" className="text-xs font-medium text-[var(--text-color)] opacity-90">Tags (comma separated)</label>
                  <input
                    id="tags" name="tags"
                    value={selectedFile.tags || ""} onChange={handleMetadataChange}
                    className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="campus, students, event"
                  />
                </div>

                <div className="pt-2 space-y-4 border-t border-[var(--border-color)] mt-4">
                  <h3 className="text-xs font-semibold text-[var(--text-color)] uppercase tracking-wider opacity-60">SEO Overrides</h3>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="seo_title" className="text-xs font-medium text-[var(--text-color)] opacity-90">SEO Title</label>
                    <input
                      id="seo_title" name="seo_title"
                      value={selectedFile.seo_title || ""} onChange={handleMetadataChange}
                      className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="seo_description" className="text-xs font-medium text-[var(--text-color)] opacity-90">SEO Description</label>
                    <textarea
                      id="seo_description" name="seo_description" rows={2}
                      value={selectedFile.seo_description || ""} onChange={handleMetadataChange}
                      className="w-full px-3 py-2 text-sm bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none resize-y"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selectedFile.id)}
                disabled={isDeleting === selectedFile.id}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting === selectedFile.id ? "Deleting..." : "Delete"}
              </button>
              
              <button
                type="submit"
                form="metadata-form"
                disabled={isUpdating}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
