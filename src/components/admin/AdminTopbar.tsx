"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import supabase from "@/lib/supabase";

export default function AdminTopbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Placeholder for future dynamic user data fetch
  const adminDetails = {
    name: "System Administrator",
    email: "admin@institution.edu",
    initials: "SA",
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.refresh();
      router.push("/admin/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--surface-color)] px-4 shadow-sm sm:px-6 lg:px-8 text-[var(--text-color)] transition-colors duration-200">
      
      {/* Left side: Breadcrumb & Context (Future Integration) */}
      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Trigger Placeholder */}
          <button 
            type="button" 
            className="md:hidden p-2 -ml-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb / Section Title */}
          <div className="hidden sm:flex items-center text-sm font-medium">
            <span className="opacity-60">Admin Portal</span>
            <svg className="w-4 h-4 mx-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile, Logout */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Future Integrations: Search & Notifications */}
        <div className="hidden sm:flex items-center gap-2 border-r border-[var(--border-color)] pr-4">
          <button 
            type="button" 
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search dashboard"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <button 
            type="button" 
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="View notifications"
          >
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--surface-color)]"></span>
          </button>
        </div>

        {/* Identity & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-right">
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">{adminDetails.name}</span>
              <span className="text-xs opacity-60 font-medium leading-tight">{adminDetails.email}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm select-none border border-indigo-200 dark:border-indigo-800">
              {adminDetails.initials}
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group flex items-center justify-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-red-100 dark:border-red-500/20"
            aria-label="Log out"
          >
            {isLoggingOut ? (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            )}
            <span className="hidden sm:inline-block">{isLoggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
        
      </div>
    </header>
  );
}
