"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { getNavbarNavigation } from "@/services/navigation";
import { useSettings } from "@/providers/SettingsProvider";

// Local type definition based on standard CMS schema to ensure strict typing
interface NavItem {
  id: string;
  label: string;
  href: string;
  open_in_new_tab: boolean;
  // Included for future mega-menu/dropdown scalability
  parent_id?: string | null;
  children?: NavItem[];
}

export default function Navbar() {
  const { settings, loading: isSettingsLoading } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoadingNav, setIsLoadingNav] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNavigation = async () => {
      try {
        setIsLoadingNav(true);
        const items = await getNavbarNavigation();
        if (isMounted && items) {
          setNavItems(items as NavItem[]);
        }
      } catch (error) {
        console.error("[Navbar] Error fetching navigation items:", error);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--navbar-background)] text-[var(--text-color)] shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex flex-shrink-0 items-center">
            <Link 
              href="/" 
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-md transition-cms"
              aria-label="Home"
            >
              {!isSettingsLoading && settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt={`${settings.site_name} Logo`}
                  className="h-10 w-auto object-contain"
                />
              )}
              <span className="text-xl font-bold tracking-tight text-[var(--primary-color)] transition-cms">
                {isSettingsLoading ? "Loading..." : settings?.site_name || "Institutional CMS"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Desktop Navigation">
            <ul className="ml-10 flex items-baseline space-x-6">
              {isLoadingNav ? (
                // Loading Skeleton
                [1, 2, 3, 4].map((i) => (
                  <li key={i} className="h-4 w-20 animate-pulse rounded bg-[var(--border-color)]" />
                ))
              ) : navItems.length > 0 ? (
                navItems.map((item) => (
                  <li key={item.id} className="relative group">
                    <Link
                      href={item.href}
                      target={item.open_in_new_tab ? "_blank" : "_self"}
                      rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                      className="px-3 py-2 text-sm font-medium text-[var(--text-color)] rounded-md transition-cms hover:bg-[var(--surface-color)] hover:text-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-[var(--muted-text-color)]">No navigation items</li>
              )}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-[var(--text-color)] transition-cms hover:bg-[var(--surface-color)] hover:text-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-color)]"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen border-b border-[var(--border-color)] opacity-100" : "max-h-0 opacity-0"
        }`}
        id="mobile-menu"
      >
        <nav className="space-y-1 bg-[var(--navbar-background)] px-2 pb-3 pt-2 sm:px-3" aria-label="Mobile Navigation">
          {isLoadingNav ? (
            <div className="space-y-4 px-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-[var(--border-color)]" />
              ))}
            </div>
          ) : navItems.length > 0 ? (
            navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                target={item.open_in_new_tab ? "_blank" : "_self"}
                rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                onClick={closeMobileMenu}
                className="block rounded-md px-3 py-2 text-base font-medium text-[var(--text-color)] transition-cms hover:bg-[var(--surface-color)] hover:text-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              >
                {item.label}
              </Link>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-[var(--muted-text-color)]">No navigation items</div>
          )}
        </nav>
      </div>
    </header>
  );
}
