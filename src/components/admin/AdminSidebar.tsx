"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

// RBAC-ready navigation configuration
// Future integration: filter this array based on current user's session roles
type NavItem = {
  label: string;
  href: string;
  roles?: string[]; // e.g., ["super_admin", "content_editor"]
};

const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Pages", href: "/admin/pages" },
  { label: "Navigation", href: "/admin/navigation" },
  { label: "Homepage", href: "/admin/homepage" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Notices", href: "/admin/notices" },
  { label: "Faculty", href: "/admin/faculty" },
  { label: "Admissions", href: "/admin/admissions" },
  { label: "Departments", href: "/admin/departments" },
  { label: "Media", href: "/admin/media" },
  { label: "SEO", href: "/admin/seo" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
  { label: "Users", href: "/admin/users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const isActiveRoute = (href: string) => {
    // Exact match for dashboard, partial match for nested routes (e.g., /admin/pages/create)
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header & Toggle */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-[var(--surface-color)] border-b border-[var(--border-color)]">
        <span className="text-lg font-semibold text-[var(--text-color)]">
          CMS Admin
        </span>
        <button
          onClick={toggleSidebar}
          aria-expanded={isOpen}
          aria-controls="admin-sidebar"
          aria-label="Toggle navigation menu"
          className="p-2 -mr-2 text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        id="admin-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-[280px] md:w-[240px] lg:w-[280px]
          bg-[var(--surface-color)] border-r border-[var(--border-color)]
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Admin Navigation"
      >
        {/* Sidebar Header */}
        <div className="hidden md:flex items-center h-16 px-6 border-b border-[var(--border-color)] flex-shrink-0">
          <span className="text-xl font-bold tracking-tight text-[var(--text-color)]">
            Institutional CMS
          </span>
        </div>

        {/* Navigation Links container */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="px-3 space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const active = isActiveRoute(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                      ${
                        active
                          ? "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                      }
                    `}
                  >
                    {/* Future integration: Add specific lucide-react icons per item here */}
                    <span className="truncate">{item.label}</span>
                    
                    {/* Future integration: Notification/Analytics badges */}
                    {/* {item.label === "Notices" && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">3</span>} */}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer (e.g., User Profile / Quick Actions) */}
        <div className="p-4 border-t border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                AD
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-color)] truncate">
                Admin User
              </p>
              <p className="text-xs text-[var(--text-color)] opacity-60 truncate">
                System Administrator
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
