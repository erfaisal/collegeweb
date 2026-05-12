"use client";

import { useEffect, useState, FormEvent } from "react";

// Service imports (assuming these return Promises with appropriate types in a real app)
import { getSiteSettings, updateSiteSettings, getModuleSettings } from "@/services/settings";

interface SiteSettings {
  // Branding
  site_name: string;
  short_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  // Contact
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  // Hero
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  // Social
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  youtube_url: string;
  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  // Feature Toggles (Booleans)
  admissions_open: boolean;
  show_hospital: boolean;
  show_hostel: boolean;
  show_gallery: boolean;
  show_faculty: boolean;
  show_placements: boolean;
  show_research: boolean;
  show_testimonials: boolean;
  show_contact_form: boolean;
  [key: string]: string | boolean; // index signature for generic handlers
}

const defaultSettings: SiteSettings = {
  site_name: "", short_name: "", tagline: "", logo_url: "", favicon_url: "",
  address: "", city: "", state: "", country: "", postal_code: "", phone: "", email: "", whatsapp: "", website: "",
  hero_title: "", hero_subtitle: "", hero_image_url: "",
  facebook_url: "", instagram_url: "", twitter_url: "", linkedin_url: "", youtube_url: "",
  seo_title: "", seo_description: "", seo_keywords: "",
  admissions_open: false, show_hospital: false, show_hostel: false, show_gallery: false, show_faculty: false, show_placements: false, show_research: false, show_testimonials: false, show_contact_form: false,
};

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        setIsLoading(true);
        // Fetch both core settings and module toggles concurrently
        const [siteData, moduleData] = await Promise.all([
          getSiteSettings().catch(() => ({})),
          getModuleSettings().catch(() => ({}))
        ]);

        if (isMounted) {
          setFormData({
            ...defaultSettings,
            ...siteData,
            ...moduleData
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        if (isMounted) {
          setMessage({ type: "error", text: "Failed to load settings. Please try again." });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateSiteSettings(formData);
      setMessage({ type: "success", text: "Settings updated successfully." });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({ type: "error", text: "Failed to save settings. Please verify your connection and try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8 max-w-5xl">
        <div className="h-10 bg-black/10 dark:bg-white/10 rounded w-1/3"></div>
        <div className="h-64 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
        <div className="h-64 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
      </div>
    );
  }

  // Helper component for text inputs
  const TextInput = ({ label, name, type = "text", placeholder = "", multiline = false }: { label: string, name: keyof SiteSettings, type?: string, placeholder?: string, multiline?: boolean }) => (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={name as string} className="text-sm font-medium text-[var(--text-color)] opacity-90">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name as string}
          name={name as string}
          value={formData[name] as string}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40 resize-y"
        />
      ) : (
        <input
          id={name as string}
          name={name as string}
          type={type}
          value={formData[name] as string}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
        />
      )}
    </div>
  );

  // Helper component for toggles
  const ToggleInput = ({ label, name }: { label: string, name: keyof SiteSettings }) => (
    <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-[var(--border-color)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          name={name as string}
          checked={formData[name] as boolean}
          onChange={handleChange}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 transition-colors"></div>
        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
      </div>
      <span className="text-sm font-medium text-[var(--text-color)] opacity-90 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </label>
  );

  // Helper component for section cards
  const SectionCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <section className="bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 sm:p-6 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="text-lg font-semibold text-[var(--text-color)]">{title}</h2>
        <p className="text-sm text-[var(--text-color)] opacity-60 mt-1">{description}</p>
      </div>
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-6xl pb-12">
      
      {/* Sticky Header with Actions */}
      <header className="sticky top-0 z-20 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-[var(--background-color)]/95 backdrop-blur-sm border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-color)]">
            Platform Settings
          </h1>
          <p className="text-sm mt-1 text-[var(--text-color)] opacity-70">
            Manage global configuration, branding, and active modules.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Settings Column */}
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          
          <SectionCard 
            title="Institution Branding" 
            description="Core identity assets and naming used across the CMS."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <TextInput label="Site Name (Full)" name="site_name" placeholder="e.g. Oxford International University" />
              </div>
              <TextInput label="Short Name" name="short_name" placeholder="e.g. OIU" />
              <TextInput label="Tagline" name="tagline" placeholder="Empowering the future..." />
              <TextInput label="Logo URL" name="logo_url" placeholder="https://..." type="url" />
              <TextInput label="Favicon URL" name="favicon_url" placeholder="https://..." type="url" />
            </div>
          </SectionCard>

          <SectionCard 
            title="Hero Section Content" 
            description="Main landing page prominent banner configuration."
          >
            <div className="grid grid-cols-1 gap-5">
              <TextInput label="Hero Title" name="hero_title" placeholder="Welcome to our institution..." />
              <TextInput label="Hero Subtitle" name="hero_subtitle" multiline placeholder="A brief introduction highlighting core values." />
              <TextInput label="Hero Image URL" name="hero_image_url" placeholder="https://..." type="url" />
            </div>
          </SectionCard>

          <SectionCard 
            title="Contact Information" 
            description="Publicly displayed contact details for the institution."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <TextInput label="Street Address" name="address" multiline placeholder="123 Education Lane..." />
              </div>
              <TextInput label="City" name="city" />
              <TextInput label="State/Province" name="state" />
              <TextInput label="Country" name="country" />
              <TextInput label="Postal Code" name="postal_code" />
              <TextInput label="Phone Number" name="phone" type="tel" />
              <TextInput label="WhatsApp Number" name="whatsapp" type="tel" />
              <TextInput label="Email Address" name="email" type="email" />
              <TextInput label="Website URL" name="website" type="url" />
            </div>
          </SectionCard>

          <SectionCard 
            title="SEO Defaults" 
            description="Fallback search engine optimization tags."
          >
            <div className="grid grid-cols-1 gap-5">
              <TextInput label="Default Meta Title" name="seo_title" />
              <TextInput label="Default Meta Description" name="seo_description" multiline />
              <TextInput label="Default Meta Keywords" name="seo_keywords" placeholder="education, university, admissions..." />
            </div>
          </SectionCard>

        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6 sm:space-y-8">
          
          <SectionCard 
            title="Feature Toggles" 
            description="Enable or disable specific modules and sections."
          >
            <div className="flex flex-col space-y-3">
              <ToggleInput label="Admissions Open Banner" name="admissions_open" />
              <ToggleInput label="Hospital Module" name="show_hospital" />
              <ToggleInput label="Hostel Module" name="show_hostel" />
              <ToggleInput label="Gallery Section" name="show_gallery" />
              <ToggleInput label="Faculty Directory" name="show_faculty" />
              <ToggleInput label="Placements Section" name="show_placements" />
              <ToggleInput label="Research Portal" name="show_research" />
              <ToggleInput label="Testimonials" name="show_testimonials" />
              <ToggleInput label="Public Contact Form" name="show_contact_form" />
            </div>
          </SectionCard>

          <SectionCard 
            title="Social Media Links" 
            description="Urls for institution social profiles."
          >
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Facebook URL" name="facebook_url" type="url" placeholder="https://facebook.com/..." />
              <TextInput label="Instagram URL" name="instagram_url" type="url" placeholder="https://instagram.com/..." />
              <TextInput label="Twitter (X) URL" name="twitter_url" type="url" placeholder="https://twitter.com/..." />
              <TextInput label="LinkedIn URL" name="linkedin_url" type="url" placeholder="https://linkedin.com/..." />
              <TextInput label="YouTube URL" name="youtube_url" type="url" placeholder="https://youtube.com/..." />
            </div>
          </SectionCard>

        </div>
      </div>
    </form>
  );
}
