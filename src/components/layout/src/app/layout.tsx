import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * PublicLayout serves as the primary wrapper for all institutional public-facing pages.
 * It manages the global structural integrity of the site, ensuring that the 
 * dynamic Navbar and Footer are consistently rendered with theme-aware styling.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-color)] text-[var(--text-color)] transition-colors duration-300 ease-in-out">
      {/* Announcement Banner Placeholder:
        Scalable entry point for critical institutional alerts or site-wide notices 
      */}
      
      {/* Dynamic Navbar: Handles site-wide navigation and institutional branding */}
      <Navbar />

      {/* Main Content Area: 
        Ensures the footer stays at the bottom on short pages (flex-1) 
        and handles responsive width constraints.
      */}
      <main className="flex-1 flex flex-col w-full overflow-x-hidden focus:outline-none" id="main-content" role="main">
        {/* Standardized spacing for public pages. 
          The 'children' represent modular page segments like the Hero, Admissions, etc. 
        */}
        {children}
      </main>

      {/* Dynamic Footer: Institutional contact info, social links, and quick navigation */}
      <Footer />

      {/* Accessibility Tooling Placeholder: 
        Entry point for future accessibility widgets or 'back to top' buttons 
      */}
    </div>
  );
}
