"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Palette, 
  Settings, 
  Eye, 
  Users, 
  Phone, 
  Building2, 
  Loader2, 
  CheckCircle2, 
  Save, 
  Image as ImageIcon 
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Assuming SiteSettings is exported from this path as specified.
// interface SiteSettings {
//   siteName: string; tagline: string; logoUrl: string;
//   primaryColor: string; primaryDarkColor: string; primaryLightColor: string;
//   showHostel: boolean; showNonTeachingStaff: boolean; showNotices: boolean; showHomeGallery: boolean;
//   facultySorting: 'Manual' | 'Alphabetical' | 'By Rank';
//   staffSorting: 'Manual' | 'Alphabetical' | 'By Rank';
//   contactEmail: string; contactPhone: string;
// }
import { getSiteSettings, updateSiteSettings, type SiteSettings } from '@/services/settings';

const defaultSettings: SiteSettings = {
  siteName: 'Institute Name',
  tagline: 'Empowering the Future',
  logoUrl: '',
  primaryColor: '#3b82f6',
  primaryDarkColor: '#1d4ed8',
  primaryLightColor: '#dbeafe',
  showHostel: true,
  showNonTeachingStaff: true,
  showNotices: true,
  showHomeGallery: true,
  facultySorting: 'Manual',
  staffSorting: 'Manual',
  contactEmail: 'contact@institute.edu',
  contactPhone: '+1 234 567 8900'
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const initPage = async () => {
      // 1. Check Authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }

      // 2. Fetch Settings
      try {
        const fetchedSettings = await getSiteSettings();
        if (fetchedSettings) {
          setSettings({ ...defaultSettings, ...fetchedSettings });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      setToastMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setToastMessage("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
          <p className="text-sm font-medium">Loading Platform Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-900">Platform Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Changes</>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Form */}
      <form onSubmit={handleSave} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Identity Section */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Identity & Branding</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="e.g., Global Engineering College"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={settings.tagline}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="e.g., Excellence in Education"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      name="logoUrl"
                      value={settings.logoUrl}
                      onChange={handleChange}
                      className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Info Section */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Phone className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Contact Information</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Global Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Global Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Sorting Preferences */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Directory Sorting</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Faculty Sorting</label>
                  <select
                    name="facultySorting"
                    value={settings.facultySorting}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Alphabetical">Alphabetical</option>
                    <option value="By Rank">By Rank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Staff Sorting</label>
                  <select
                    name="staffSorting"
                    value={settings.staffSorting}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Alphabetical">Alphabetical</option>
                    <option value="By Rank">By Rank</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Theme Section */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Theme Colors</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Live Preview Area */}
                <div 
                  className="rounded-lg p-5 border shadow-sm relative overflow-hidden transition-all duration-300"
                  style={{ 
                    borderColor: settings.primaryLightColor,
                    backgroundColor: `${settings.primaryLightColor}20` // adding transparency
                  }}
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Eye className="h-3 w-3" /> Preview
                  </div>
                  <div className="mt-2">
                    <h3 
                      className="text-lg font-bold transition-colors duration-300" 
                      style={{ color: settings.primaryDarkColor }}
                    >
                      {settings.siteName || 'Platform Name'}
                    </h3>
                    <p className="text-sm mt-1 mb-4 text-slate-600">{settings.tagline || 'Your tagline here'}</p>
                    <button 
                      type="button" 
                      className="px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition-colors duration-300"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      Sample Primary Button
                    </button>
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Primary', name: 'primaryColor', value: settings.primaryColor },
                    { label: 'Dark', name: 'primaryDarkColor', value: settings.primaryDarkColor },
                    { label: 'Light', name: 'primaryLightColor', value: settings.primaryLightColor },
                  ].map((color) => (
                    <div key={color.name}>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{color.label}</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 shadow-sm shrink-0">
                          <input
                            type="color"
                            name={color.name}
                            value={color.value}
                            onChange={handleChange}
                            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          name={color.name}
                          value={color.value}
                          onChange={handleChange}
                          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Module Visibility Toggles */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Eye className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Module Visibility</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {[
                  { label: 'Hostel Module', name: 'showHostel', value: settings.showHostel, desc: 'Manage accommodations and mess' },
                  { label: 'Non-Teaching Staff', name: 'showNonTeachingStaff', value: settings.showNonTeachingStaff, desc: 'Display staff directory to users' },
                  { label: 'Notices & Circulars', name: 'showNotices', value: settings.showNotices, desc: 'Public board for announcements' },
                  { label: 'Home Gallery', name: 'showHomeGallery', value: settings.showHomeGallery, desc: 'Image carousel on landing page' },
                ].map((module) => (
                  <div key={module.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{module.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{module.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        name={module.name} 
                        checked={module.value} 
                        onChange={handleChange} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>
            
          </div>
        </div>
      </form>

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
    }
