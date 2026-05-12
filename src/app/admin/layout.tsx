import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[var(--background-color)] text-[var(--text-color)] antialiased selection:bg-indigo-500/30">
      {/* 
        Admin Navigation/Sidebar Shell 
        Assumes AdminSidebar implements its own mobile collapse logic, 
        responsive widths (e.g., w-64 hidden md:flex), and touch-friendly targets.
      */}
      <aside className="relative z-40 flex-shrink-0 print:hidden">
        <AdminSidebar />
      </aside>

      {/* Main Administrative Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* 
          Future Integration Point: Admin Header Shell
          Designed to support RBAC indicators, breadcrumbs, audit logs, 
          global search, quick actions, and notification centers.
        */}
        {/* <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[var(--border-color,theme(colors.gray.200))] bg-[var(--background-color)]/80 backdrop-blur-sm" /> */}

        {/* Dashboard Content Area */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth focus:outline-none"
          id="admin-main-content"
          role="main"
          tabIndex={-1}
        >
          {/* 
            Responsive, overflow-safe container optimized for:
            - Data tables
            - Analytics charts
            - Complex forms
            - Mobile-friendly reading/spacing
          */}
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8 2xl:p-10 transition-all duration-300 ease-in-out">
            <div className="flex flex-col space-y-6 sm:space-y-8">
              {children}
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
}
