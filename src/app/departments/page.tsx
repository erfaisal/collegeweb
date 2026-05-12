import Image from "next/image";
import Link from "next/link";
import { getDepartments } from "@/services/departments";

export interface Department {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  hod_name: string;
  featured_image_url: string;
  visible: boolean;
  display_order: number;
}

export default async function DepartmentsPage() {
  let departments: Department[] = [];

  try {
    const data = await getDepartments();
    
    // Filter to show only visible departments and sort by display order ascending
    departments = (data || [])
      .filter((dept: Department) => dept.visible !== false)
      .sort((a: Department, b: Department) => (a.display_order || 0) - (b.display_order || 0));
  } catch (error) {
    console.error("Failed to load departments:", error);
  }

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Page Header */}
      <header className="py-16 sm:py-20 lg:py-24 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-gray-50">
            Academic Departments
          </h1>
          <p className="text-lg sm:text-xl opacity-70 max-w-3xl mx-auto leading-relaxed">
            Discover our diverse range of academic departments, designed to foster innovation, research, and excellence across various disciplines.
          </p>
        </div>
      </header>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Empty State Handling */}
        {departments.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
            <svg className="w-12 h-12 mx-auto text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Departments Not Found</h3>
            <p className="opacity-60 max-w-md mx-auto">
              Our academic department directory is currently being updated. Please check back later.
            </p>
          </div>
        )}

        {/* Departments Grid */}
        {departments.length > 0 && (
          <section className="cms-section" aria-labelledby="departments-grid-heading">
            <h2 id="departments-grid-heading" className="sr-only">List of Academic Departments</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
              {departments.map((dept) => (
                <article 
                  key={dept.id || dept.slug} 
                  className="cms-card group relative flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link href={`/departments/${dept.slug}`} className="flex flex-col h-full focus:outline-none">
                    
                    {/* Featured Image Container */}
                    <div className="relative aspect-[16/9] w-full bg-black/5 dark:bg-white/5 overflow-hidden border-b border-[var(--border-color)]">
                      {dept.featured_image_url ? (
                        <Image
                          src={dept.featured_image_url}
                          alt={`Featured image for ${dept.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                          <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                          </svg>
                        </div>
                      )}
                      {/* Subtle hover overlay */}
                      <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300"></div>
                    </div>

                    {/* Department Content */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      
                      {/* HOD Tag */}
                      {dept.hod_name && (
                        <div className="mb-4 flex items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            HOD: {dept.hod_name}
                          </span>
                        </div>
                      )}

                      <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {dept.name}
                      </h3>
                      
                      <p className="text-sm opacity-70 mb-8 line-clamp-3 leading-relaxed flex-1">
                        {dept.short_description || "Explore the academic programs, research initiatives, and faculty associated with this department."}
                      </p>

                      <div className="mt-auto pt-5 border-t border-[var(--border-color)] flex items-center justify-between">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                          Explore Department
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>

                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </main>
  );
}
