"use client";

import { useState, useEffect, FormEvent, useRef } from "react";

// Service imports (assumed implementations)
import { getSiteSettings } from "@/services/settings";
import { createContactInquiry } from "@/services/contact";

interface SiteSettings {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
}

const COUNTRY_CODES = [
  { code: "+1", label: "USA/CAN" },
  { code: "+44", label: "UK" },
  { code: "+91", label: "IND" },
  { code: "+61", label: "AUS" },
  { code: "+971", label: "UAE" },
  { code: "+65", label: "SGP" },
];

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_code: "+1",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSiteSettings();
        setSettings(data || {});
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneCodeSelect = (code: string) => {
    setFormData((prev) => ({ ...prev, phone_code: code }));
    setIsPhoneDropdownOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setStatus("submitting");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: `${formData.phone_code} ${formData.phone}`,
        subject: formData.subject,
        message: formData.message,
      };

      await createContactInquiry(payload);
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone_code: "+1",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setErrorMessage("Failed to send your message. Please try again or use our direct contact details.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Contact Hero Banner */}
      <section className="relative cms-section py-16 sm:py-24 bg-indigo-900 border-b border-[var(--border-color)] overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="cms-container relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase text-indigo-200 bg-indigo-800/50 rounded-full border border-indigo-500/30 backdrop-blur-sm">
            Get In Touch
          </span>
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-md">
            We're Here to Help
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Whether you have questions about admissions, programs, or institutional facilities, our dedicated team is ready to assist you.
          </p>
        </div>
      </section>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Contact Info & Emergency */}
          <div className="lg:w-1/3 space-y-10">
            
            {/* Institutional Contact Info */}
            <section className="space-y-6">
              <h2 className="cms-heading text-2xl font-bold border-b border-[var(--border-color)] pb-3">Contact Information</h2>
              
              {isLoadingSettings ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
                  <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
                  <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--border-color)]"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-color)] mb-1">Main Campus</h3>
                      <p className="text-[var(--text-color)] opacity-70 text-sm leading-relaxed">
                        {settings?.address || "123 University Avenue"}<br />
                        {settings?.city ? `${settings.city}, ` : "Innovation District, "}
                        {settings?.state || "State"} {settings?.postal_code || "10001"}<br />
                        {settings?.country || "Country"}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-color)] mb-1">Phone & WhatsApp</h3>
                      <p className="text-sm">
                        <a href={`tel:${settings?.phone?.replace(/[^0-9+]/g, '')}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline block mb-0.5">
                          {settings?.phone || "+1 (800) 123-4567"}
                        </a>
                        {settings?.whatsapp && (
                          <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center">
                            WhatsApp Us &rarr;
                          </a>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-color)] mb-1">Email Connect</h3>
                      <p className="text-sm">
                        <a href={`mailto:${settings?.email || 'info@institution.edu'}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline block">
                          {settings?.email || "info@institution.edu"}
                        </a>
                        <span className="text-[var(--text-color)] opacity-60 mt-0.5 block">Response within 24 hours</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Emergency Contacts */}
            <section className="cms-card p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h2 className="text-lg font-bold text-red-800 dark:text-red-300">Emergency Contacts</h2>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center border-b border-red-200 dark:border-red-800/50 pb-2">
                  <span className="font-semibold text-red-900 dark:text-red-200">Campus Security</span>
                  <a href="tel:100" className="text-red-700 dark:text-red-400 hover:underline font-bold">+1 (800) 911-0000</a>
                </li>
                <li className="flex justify-between items-center border-b border-red-200 dark:border-red-800/50 pb-2">
                  <span className="font-semibold text-red-900 dark:text-red-200">Hospital / Ambulance</span>
                  <a href="tel:101" className="text-red-700 dark:text-red-400 hover:underline font-bold">+1 (800) 911-1111</a>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-semibold text-red-900 dark:text-red-200">IT Helpdesk</span>
                  <a href="tel:102" className="text-red-700 dark:text-red-400 hover:underline font-bold">+1 (800) 911-2222</a>
                </li>
              </ul>
            </section>

            {/* Social Links */}
            <section className="space-y-4">
              <h3 className="font-bold text-[var(--text-color)]">Connect Socially</h3>
              <div className="flex gap-4">
                {/* Fallbacks provided if settings missing */}
                {(settings?.facebook_url || true) && (
                  <a href={settings?.facebook_url || "#"} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                  </a>
                )}
                {(settings?.twitter_url || true) && (
                  <a href={settings?.twitter_url || "#"} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors" aria-label="Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                  </a>
                )}
                {(settings?.linkedin_url || true) && (
                  <a href={settings?.linkedin_url || "#"} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors" aria-label="LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                )}
                {(settings?.instagram_url || true) && (
                  <a href={settings?.instagram_url || "#"} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-colors" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:w-2/3">
            <div className="cms-card bg-[var(--background-color)] border border-[var(--border-color)] rounded-3xl shadow-xl overflow-hidden p-8 sm:p-10 lg:p-12">
              
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center text-center py-16 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-50 dark:border-emerald-900/50">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-[var(--text-color)]">Message Sent Successfully!</h3>
                  <p className="opacity-70 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    Thank you, {formData.name}. We've received your inquiry and our support team will get back to you within 1-2 business days.
                  </p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-8 border-b border-[var(--border-color)] pb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Send us a Message</h2>
                    <p className="opacity-70 text-sm">Please fill out the form below and we will direct your inquiry to the appropriate department.</p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-semibold opacity-90">Full Name *</label>
                      <input
                        id="name" name="name" type="text" required
                        value={formData.name} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-semibold opacity-90">Email Address *</label>
                      <input
                        id="email" name="email" type="email" required
                        value={formData.email} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                        placeholder="johndoe@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-sm font-semibold opacity-90">Phone Number *</label>
                      <div className="flex relative">
                        {/* Custom Country Code Dropdown */}
                        <div className="relative flex-shrink-0 z-20">
                          <button
                            type="button"
                            onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
                            className="h-full px-4 py-3 bg-black/[0.04] dark:bg-white/[0.04] border border-r-0 border-[var(--border-color)] rounded-l-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-medium flex items-center justify-between min-w-[100px]"
                            aria-haspopup="listbox"
                            aria-expanded={isPhoneDropdownOpen}
                          >
                            <span>{formData.phone_code}</span>
                            <svg className={`w-4 h-4 ml-2 transition-transform opacity-60 ${isPhoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </button>

                          {isPhoneDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setIsPhoneDropdownOpen(false)}></div>
                              <ul 
                                className="absolute z-20 top-full left-0 mt-2 w-48 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto"
                                role="listbox"
                              >
                                {COUNTRY_CODES.map((item) => (
                                  <li key={item.code} role="option" aria-selected={formData.phone_code === item.code}>
                                    <button
                                      type="button"
                                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex justify-between items-center ${formData.phone_code === item.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 font-medium' : ''}`}
                                      onClick={() => handlePhoneCodeSelect(item.code)}
                                    >
                                      <span className="font-mono">{item.code}</span>
                                      <span className="opacity-60 text-xs">{item.label}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>

                        <input
                          id="phone" name="phone" type="tel" required
                          value={formData.phone} onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-r-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                          placeholder="1234567890"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="text-sm font-semibold opacity-90">Subject / Category *</label>
                      <input
                        id="subject" name="subject" type="text" required
                        value={formData.subject} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                        placeholder="e.g. General Inquiry, Admissions, Technical Issue"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-sm font-semibold opacity-90">Your Message *</label>
                    <textarea
                      id="message" name="message" rows={5} required
                      value={formData.message} onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-y placeholder:opacity-40"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full sm:w-auto cms-button inline-flex items-center justify-center px-10 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 mt-4"
                  >
                    {status === "submitting" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </>
                    ) : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map / Location Section */}
      <section className="bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--border-color)] relative h-96 w-full overflow-hidden">
        {/* Placeholder for Map. Future Integration: Render Google Maps Iframe using settings.address */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          <div className="text-center p-6 bg-[var(--background-color)] rounded-xl border border-[var(--border-color)] shadow-sm max-w-sm backdrop-blur-sm bg-opacity-80">
            <svg className="w-10 h-10 mx-auto mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <h3 className="font-bold text-[var(--text-color)] mb-1">Campus Location Map</h3>
            <p className="text-sm opacity-70">Map integration placeholder. Configure your API key to display the interactive map for {settings?.city || 'your campus'}.</p>
          </div>
        </div>
      </section>

    </main>
  );
}
