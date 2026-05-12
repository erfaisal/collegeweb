"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from "react";

// Service imports
import { getActiveTheme, updateTheme } from "@/services/theme";
import { uploadMediaFile } from "@/services/media";

export interface ThemeSettings {
  id?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  muted_text_color: string;
  navbar_background: string;
  footer_background: string;
  font_family: string;
  heading_font_family: string;
  button_radius: string;
  card_radius: string;
  logo_url: string;
  favicon_url: string;
  dark_mode_enabled: boolean;
}

const defaultTheme: ThemeSettings = {
  primary_color: "#4f46e5",
  secondary_color: "#6b7280",
  accent_color: "#f59e0b",
  background_color: "#ffffff",
  surface_color: "#f9fafb",
  text_color: "#111827",
  muted_text_color: "#6b7280",
  navbar_background: "#ffffff",
  footer_background: "#1f2937",
  font_family: "Inter, sans-serif",
  heading_font_family: "Inter, sans-serif",
  button_radius: "0.5rem",
  card_radius: "1rem",
  logo_url: "",
  favicon_url: "",
  dark_mode_enabled: false,
};

const THEME_PRESETS: Record<string, Partial<ThemeSettings>> = {
  medical: {
    primary_color: "#0d9488", // Teal
    secondary_color: "#3b82f6", // Blue
    accent_color: "#f43f5e", // Rose
    background_color: "#ffffff",
    surface_color: "#f0fdfa",
    text_color: "#0f172a",
    navbar_background: "#ffffff",
    font_family: "system-ui, sans-serif",
    button_radius: "9999px",
  },
  engineering: {
    primary_color: "#ea580c", // Orange
    secondary_color: "#475569", // Slate
    accent_color: "#eab308", // Yellow
    background_color: "#f8fafc",
    surface_color: "#ffffff",
    text_color: "#1e293b",
    navbar_background: "#1e293b",
    font_family: "Roboto, sans-serif",
    button_radius: "0.25rem",
  },
  university: {
    primary_color: "#1e3a8a", // Navy
    secondary_color: "#b45309", // Gold
    accent_color: "#991b1b", // Crimson
    background_color: "#ffffff",
    surface_color: "#f3f4f6",
    text_color: "#111827",
    navbar_background: "#1e3a8a",
    font_family: "Georgia, serif",
    heading_font_family: "Georgia, serif",
    button_radius: "0.375rem",
  },
  school: {
    primary_color: "#2563eb", // Blue
    secondary_color: "#16a34a", // Green
    accent_color: "#dc2626", // Red
    background_color: "#ffffff",
    surface_color: "#f8fafc",
    text_color: "#1e293b",
    navbar_background: "#ffffff",
    font_family: "Nunito, sans-serif",
    button_radius: "1rem",
  },
  modern_dark: {
    primary_color: "#8b5cf6", // Violet
    secondary_color: "#3b82f6", // Blue
    accent_color: "#10b981", // Emerald
    background_color: "#0f172a",
    surface_color: "#1e293b",
    text_color: "#f8fafc",
    muted_text_color: "#94a3b8",
    navbar_background: "#0f172a",
    footer_background: "#020617",
    dark_mode_enabled: true,
  },
};

export default function AdminThemePage() {
  const [formData, setFormData] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"logo_url" | "favicon_url" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTheme();
  }, []);

  async function fetchTheme() {
    try {
      setIsLoading(true);
      const data = await getActiveTheme();
      if (data) {
        setFormData((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error);
      showMessage("error", "Failed to load theme settings.");
    } finally {
      setIsLoading(false);
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyPreset = (presetKey: keyof typeof THEME_PRESETS) => {
    if (window.confirm("Applying a preset will overwrite your current color and typography settings. Continue?")) {
      setFormData((prev) => ({
        ...prev,
        ...THEME_PRESETS[presetKey],
      }));
      showMessage("success", `Applied ${presetKey.replace("_", " ")} preset.`);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, fieldName: "logo_url" | "favicon_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldName);
      const uploadedMedia = await uploadMediaFile(file);
      if (uploadedMedia && uploadedMedia.url) {
        setFormData((prev) => ({ ...prev, [fieldName]: uploadedMedia.url }));
        showMessage("success", "Image uploaded successfully.");
      }
    } catch (error) {
      console.error(`Failed to upload ${fieldName}:`, error);
      showMessage("error", "Failed to upload image.");
    } finally {
      setUploadingField(null);
      if (fieldName === "logo_url" && logoInputRef.current) logoInputRef.current.value = "";
      if (fieldName === "favicon_url" && faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateTheme(formData);
      showMessage("success", "Theme settings saved successfully. Changes may take a moment to propagate globally.");
    } catch (error) {
      console.error("Failed to save theme settings:", error);
      showMessage("error", "Failed to save theme settings. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
        <div className="h-10 bg-black/10 dark:bg-white/10 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-black/5 dark:bg-white/5 rounded-xl"></div>
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const ColorInput = ({ name, label }: { name: keyof ThemeSettings; label: string }) => (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 p-1.5 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg shadow-sm">
        <input
          id={name} name={name} type="color"
          value={formData[name] as string} onChange={handleChange}
          className="w-10 h-10 rounded border-0 cursor-pointer p-0 bg-transparent"
        />
        <input
          type="text"
          name={name}
          value={formData[name] as string}
          onChange={handleChange}
          className="flex-1 bg-transparent border-none focus:outline-none text-sm font-mono uppercase text-[var(--text-color)]"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 max-w-7xl mx-auto">
      <header className="sticky top-0 z-20 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[var(--background-color)]/95 backdrop-blur-sm border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Appearance & Theme
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Customize the global look and feel of your institutional platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            {isSaving ? "Publishing Changes..." : "Publish Theme"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'}`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ) : (
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Core Design Settings */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Quick Presets */}
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-color)] mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
              Theme Presets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.keys(THEME_PRESETS).map((presetKey) => (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => handleApplyPreset(presetKey as keyof typeof THEME_PRESETS)}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group"
                >
                  <div className="flex gap-1 mb-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: THEME_PRESETS[presetKey].primary_color }}></div>
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: THEME_PRESETS[presetKey].secondary_color }}></div>
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: THEME_PRESETS[presetKey].accent_color }}></div>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-color)] capitalize opacity-70 group-hover:opacity-100 transition-opacity">
                    {presetKey.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-color)] mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Global Color Palette
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <ColorInput name="primary_color" label="Primary Brand" />
              <ColorInput name="secondary_color" label="Secondary Brand" />
              <ColorInput name="accent_color" label="Accent / Highlight" />
              <ColorInput name="background_color" label="Page Background" />
              <ColorInput name="surface_color" label="Card Surface" />
              <ColorInput name="navbar_background" label="Navbar Background" />
              <ColorInput name="footer_background" label="Footer Background" />
              <ColorInput name="text_color" label="Main Text" />
              <ColorInput name="muted_text_color" label="Muted Text" />
            </div>
          </div>

          {/* Typography & Radii */}
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-color)] mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Typography & Geometry
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label htmlFor="font_family" className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider">Base Font Family</label>
                <select
                  id="font_family" name="font_family"
                  value={formData.font_family} onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                >
                  <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                  <option value="Roboto, sans-serif">Roboto (Technical Sans)</option>
                  <option value="system-ui, sans-serif">System UI (Native)</option>
                  <option value="Nunito, sans-serif">Nunito (Friendly Sans)</option>
                  <option value="Georgia, serif">Georgia (Classic Serif)</option>
                  <option value="'Merriweather', serif">Merriweather (Modern Serif)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="heading_font_family" className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider">Heading Font Family</label>
                <select
                  id="heading_font_family" name="heading_font_family"
                  value={formData.heading_font_family} onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                >
                  <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                  <option value="Roboto, sans-serif">Roboto (Technical Sans)</option>
                  <option value="system-ui, sans-serif">System UI (Native)</option>
                  <option value="Georgia, serif">Georgia (Classic Serif)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Elegant Serif)</option>
                  <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech Sans)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="button_radius" className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider">Button Border Radius</label>
                <select
                  id="button_radius" name="button_radius"
                  value={formData.button_radius} onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                >
                  <option value="0px">None (Square)</option>
                  <option value="0.25rem">Small (4px)</option>
                  <option value="0.5rem">Medium (8px)</option>
                  <option value="0.75rem">Large (12px)</option>
                  <option value="9999px">Full (Pill)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="card_radius" className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider">Card Border Radius</label>
                <select
                  id="card_radius" name="card_radius"
                  value={formData.card_radius} onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                >
                  <option value="0px">None (Square)</option>
                  <option value="0.5rem">Small (8px)</option>
                  <option value="1rem">Medium (16px)</option>
                  <option value="1.5rem">Large (24px)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Branding & Environment */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Logo & Favicon */}
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
            <h2 className="text-lg font-bold text-[var(--text-color)] flex items-center">
              <svg className="w-5 h-5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Brand Identity
            </h2>
            
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider block">Primary Logo</label>
              
              <div className="p-4 border-2 border-dashed border-[var(--border-color)] rounded-xl bg-black/[0.02] dark:bg-white/[0.02] flex flex-col items-center justify-center text-center">
                {formData.logo_url ? (
                  <div className="relative group mb-4 w-full h-24 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
                    <img src={formData.logo_url} alt="Site Logo" className="max-h-full max-w-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: "" }))}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-[var(--text-color)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                )}
                
                <input
                  type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, "logo_url")}
                  className="hidden" accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingField === "logo_url"}
                  className="w-full px-4 py-2 text-sm font-bold bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {uploadingField === "logo_url" ? "Uploading..." : "Upload Logo"}
                </button>
              </div>
              <input
                type="url" value={formData.logo_url} onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder:opacity-40"
                placeholder="Or paste image URL"
              />
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
              <label className="text-xs font-semibold text-[var(--text-color)] opacity-80 uppercase tracking-wider block">Favicon</label>
              
              <div className="p-4 border-2 border-dashed border-[var(--border-color)] rounded-xl bg-black/[0.02] dark:bg-white/[0.02] flex flex-col items-center justify-center text-center">
                {formData.favicon_url ? (
                  <div className="relative group mb-4 w-16 h-16 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
                    <img src={formData.favicon_url} alt="Site Favicon" className="max-h-full max-w-full object-contain p-1" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, favicon_url: "" }))}
                        className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[var(--text-color)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                )}
                
                <input
                  type="file" ref={faviconInputRef} onChange={(e) => handleImageUpload(e, "favicon_url")}
                  className="hidden" accept="image/x-icon,image/png,image/svg+xml"
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingField === "favicon_url"}
                  className="w-full px-4 py-2 text-sm font-bold bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {uploadingField === "favicon_url" ? "Uploading..." : "Upload Favicon"}
                </button>
              </div>
            </div>

          </div>

          {/* Environment Settings */}
          <div className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-color)] mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              Environment
            </h2>

            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox" name="dark_mode_enabled"
                    checked={formData.dark_mode_enabled} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--text-color)]">Enforce Dark Mode</span>
                  <span className="text-xs text-[var(--text-color)] opacity-60">Overrides user system preferences</span>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
