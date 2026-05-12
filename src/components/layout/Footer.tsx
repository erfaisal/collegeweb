"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MapPin, 
  Phone, 
  Mail 
} from "lucide-react";
import { getFooterNavigation } from "@/services/navigation";
import { useSettings } from "@/providers/SettingsProvider";

// Local type definition based on standard CMS schema
interface NavItem {
  id: string;
  label: string;
  href: string;
  open_in_new_tab?: boolean;
}

export default function Footer() {
  const { settings, loading: isSettingsLoading } = useSettings();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoadingNav, setIsLoadingNav] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNavigation = async () => {
      try {
        setIsLoadingNav(true);
        // Assuming getFooterNavigation fetches items where show_in_footer = true
        const items = await getFooterNavigation();
        if (isMounted && items) {
          setNavItems(items as NavItem[]);
        }
      } catch (error) {
        console.error("[Footer] Error fetching footer navigation:", error);
      } finally {
        if (isMounted) {
          setIsLoadingNav(false);
        }
      }
    };

    fetchNavigation();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--footer-background)] text-[var(--text-color)] border-t border-[var(--border-color)] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Branding & Description */}
          <div className="flex flex-col space-y-4">
            {isSettingsLoading ? (
              <div className="h-8 w-48 animate-pulse rounded bg-[var(--border-color)]" />
            ) : (
              <Link 
                href="/" 
                className="inline-block focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-md transition-cms"
              >
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={`${settings.site_name} Logo`}
                    className="h-12 w-auto object-contain mb-2"
                  />
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-[var(--primary-color)]">
                    {settings?.site_name || "Institutional CMS"}
                  </span>
                )}
              </Link>
            )}

            <div className="text-sm leading-relaxed text-[var(--muted-text-color)]">
              {isSettingsLoading ? (
                <div className="space-y-2 mt-2">
                  <div className="h-3 w-full animate-pulse rounded bg-[var(--border-color)]" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-[var(--border-color)]" />
                  <div className="h-3 w-4/6 animate-pulse rounded bg-[var(--border-color)]" />
                </div>
              ) : (
                <p>{settings?.site_description || "Empowering the next generation with world-class education and excellence."}</p>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[var(--primary-color)]">Quick Links</h3>
            <nav aria-label="Footer Navigation">
              <ul className="space-y-2.5">
                {isLoadingNav ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="h-4 w-32 animate-pulse rounded bg-[var(--border-color)]" />
                  ))
                ) : navItems.length > 0 ? (
                  navItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        target={item.open_in_new_tab ? "_blank" : "_self"}
                        rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                        className="text-sm font-medium text-[var(--muted-text-color)] transition-cms hover:text-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[var(--muted-text-color)]">No links available</li>
                )}
              </ul>
            </nav>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[var(--primary-color)]">Contact Us</h3>
            <address className="not-italic space-y-3 text-sm text-[var(--muted-text-color)]">
              {isSettingsLoading ? (
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-[var(--border-color)]" />
                  <div className="h-4 w-48 animate-pulse rounded bg-[var(--border-color)]" />
                  <div className="h-4 w-56 animate-pulse rounded bg-[var(--border-color)]" />
                </div>
              ) : (
                <>
                  {settings?.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 shrink-0 text-[var(--accent-color)] mt-0.5" aria-hidden="true" />
                      <span>{settings.address}</span>
                    </div>
                  )}
                  {settings?.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-[var(--accent-color)]" aria-hidden="true" />
                      <a 
                        href={`tel:${settings.contact_phone.replace(/[^0-9+]/g, '')}`} 
                        className="transition-cms hover:text-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-sm"
                      >
                        {settings.contact_phone}
                      </a>
                    </div>
                  )}
                  {settings?.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 shrink-0 text-[var(--accent-color)]" aria-hidden="true" />
                      <a 
                        href={`mailto:${settings.contact_email}`} 
                        className="transition-cms hover:text-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-sm"
                      >
                        {settings.contact_email}
                      </a>
                    </div>
                  )}
                  {!settings?.address && !settings?.contact_phone && !settings?.contact_email && (
                    <p>Contact information is currently unavailable.</p>
                  )}
                </>
              )}
            </address>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[var(--primary-color)]">Connect With Us</h3>
            {isSettingsLoading ? (
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-[var(--border-color)]" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {settings?.social_facebook && (
                  <a
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-color)] text-[var(--muted-text-color)] transition-cms hover:bg-[var(--accent-color)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings?.social_twitter && (
                  <a
                    href={settings.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-color)] text-[var(--muted-text-color)] transition-cms hover:bg-[var(--accent-color)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {settings?.social_linkedin && (
                  <a
                    href={settings.social_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-color)] text-[var(--muted-text-color)] transition-cms hover:bg-[var(--accent-color)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {settings?.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-color)] text-[var(--muted-text-color)] transition-cms hover:bg-[var(--accent-color)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {!settings?.social_facebook && !settings?.social_twitter && !settings?.social_linkedin && !settings?.social_instagram && (
                  <p className="text-sm text-[var(--muted-text-color)]">Social links coming soon.</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer Bottom / Copyright */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted-text-color)] text-center md:text-left">
            &copy; {currentYear} {isSettingsLoading ? "Lumina CMS" : settings?.site_name || "Lumina CMS"}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--muted-text-color)]">
            <Link 
              href="/privacy-policy" 
              className="transition-cms hover:text-[var(--accent-color)] focus:outline-none focus:underline"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-[var(--border-color)]">|</span>
            <Link 
              href="/terms-of-service" 
              className="transition-cms hover:text-[var(--accent-color)] focus:outline-none focus:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
