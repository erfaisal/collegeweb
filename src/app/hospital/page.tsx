import Image from "next/image";
import { getHospitalDepartments } from "@/services/hospital";

export interface HospitalDepartment {
  id?: string;
  department_name: string;
  short_description: string;
  hod_name: string;
  opd_timings: string;
  emergency_contact: string;
  featured_image_url: string;
  facilities: string;
  services: string;
  visible: boolean;
  display_order: number;
}

export default async function HospitalPage() {
  let departments: HospitalDepartment[] = [];

  try {
    const data = await getHospitalDepartments();
    // Filter to show only visible departments and sort by display order ascending
    departments = (data || [])
      .filter((dept: HospitalDepartment) => dept.visible !== false)
      .sort((a: HospitalDepartment, b: HospitalDepartment) => (a.display_order || 0) - (b.display_order || 0));
  } catch (error) {
    console.error("Failed to load hospital departments:", error);
  }

  // Extract a general emergency contact if available from the priority departments
  const primaryEmergencyContact = departments.find(d => d.emergency_contact)?.emergency_contact || "+1 (800) EMERGENCY";

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-teal-500/30 font-sans">
      
      {/* Healthcare Hero Banner */}
      <header className="relative bg-teal-900 text-white overflow-hidden border-b border-[var(--border-color)]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <div className="cms-container relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-center">
          <span className="inline-flex items-center px-3 py-1 mb-6 text-sm font-bold tracking-wider uppercase text-teal-100 bg-teal-800/80 rounded-full border border-teal-500/30 backdrop-blur-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Institutional Healthcare
          </span>
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md">
            Advanced Clinical Services & Care
          </h1>
          <p className="text-lg sm:text-xl text-teal-50 max-w-3xl mx-auto leading-relaxed drop-shadow">
            Providing world-class medical facilities, expert healthcare professionals, and comprehensive clinical services dedicated to your well-being.
          </p>
        </div>
      </header>

      {/* Global Emergency Strip */}
      <div className="bg-red-600 text-white shadow-md relative z-20">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">24/7 Emergency & Trauma Care</h2>
              <p className="text-red-100 text-sm">Immediate medical assistance is always available.</p>
            </div>
          </div>
          <a href={`tel:${primaryEmergencyContact.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-red-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            Call {primaryEmergencyContact}
          </a>
        </div>
      </div>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Empty State */}
        {departments.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
            <svg className="w-12 h-12 mx-auto text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <h3 className="text-xl font-semibold mb-2">Departments Not Found</h3>
            <p className="opacity-60 max-w-md mx-auto">
              Our clinical departments and healthcare services directory is currently being updated. Please check back soon.
            </p>
          </div>
        )}

        {/* Clinical Departments Grid */}
        {departments.length > 0 && (
          <section className="cms-section" aria-labelledby="departments-heading">
            <div className="mb-12 text-center md:text-left border-b border-[var(--border-color)] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 id="departments-heading" className="cms-heading text-3xl sm:text-4xl font-bold mb-3">
                  Medical Departments
                </h2>
                <p className="text-[var(--text-color)] opacity-70 max-w-2xl text-lg">
                  Explore our specialized clinics, state-of-the-art facilities, and comprehensive healthcare programs.
                </p>
              </div>
              <div className="flex-shrink-0">
                {/* Future Integration: Global Appointment Button */}
                <button className="px-6 py-2.5 bg-black/[0.05] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-lg font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                  Patient Portal / Appointments &rarr;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
              {departments.map((dept) => (
                <article 
                  key={dept.id || dept.department_name} 
                  className="cms-card flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Department Image */}
                  <div className="relative aspect-[16/9] w-full bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)] overflow-hidden">
                    {dept.featured_image_url ? (
                      <Image
                        src={dept.featured_image_url}
                        alt={`Facility view of ${dept.department_name}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                        <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 13h-2v-3H6v-2h3V8h2v3h3v2h-3v3z"/></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Department Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-[var(--text-color)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {dept.department_name}
                      </h3>
                      {dept.hod_name && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20 whitespace-nowrap shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          HOD: {dept.hod_name}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[var(--text-color)] opacity-70 mb-6 leading-relaxed">
                      {dept.short_description || "Comprehensive clinical services dedicated to patient care and advanced medical treatments."}
                    </p>

                    <div className="mt-auto space-y-4 pt-4 border-t border-[var(--border-color)] text-sm">
                      {/* OPD Timings */}
                      <div className="flex items-start gap-3 text-[var(--text-color)] opacity-90">
                        <svg className="w-5 h-5 text-teal-500 dark:text-teal-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div>
                          <strong className="block font-semibold mb-0.5">OPD Timings</strong>
                          <span className="opacity-80">{dept.opd_timings || "Please contact department for timings"}</span>
                        </div>
                      </div>

                      {/* Department specific emergency contact */}
                      {dept.emergency_contact && (
                        <div className="flex items-start gap-3 text-[var(--text-color)] opacity-90">
                          <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          <div>
                            <strong className="block font-semibold mb-0.5">Direct Contact</strong>
                            <a href={`tel:${dept.emergency_contact.replace(/[^0-9+]/g, '')}`} className="opacity-80 hover:text-teal-600 dark:hover:text-teal-400 hover:underline">
                              {dept.emergency_contact}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expandable/Rich content preview if available */}
                    {(dept.services || dept.facilities) && (
                      <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                        <button className="text-sm font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform inline-flex items-center focus:outline-none">
                          View Treatments & Facilities
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Patient Resources CTA */}
      <section className="border-t border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] py-16 sm:py-20">
        <div className="cms-container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Patient Information & Resources</h2>
          <p className="text-lg opacity-70 mb-8 max-w-2xl mx-auto">
            Prepare for your visit. Access patient guidelines, admission procedures, health checkup packages, and visitor policies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-4 focus:ring-teal-500/50">
              Download Guidelines
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-[var(--background-color)] border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 font-bold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-teal-500/50">
              Health Packages
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
