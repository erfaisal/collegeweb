import Image from "next/image";
import { getHostels } from "@/services/hostels";

export interface Hostel {
  id?: string;
  hostel_name: string;
  hostel_type: string;
  short_description: string;
  capacity: number;
  warden_name: string;
  featured_image_url: string;
  facilities: string;
  visible: boolean;
  display_order: number;
}

export default async function HostelsPage() {
  let hostels: Hostel[] = [];

  try {
    const data = await getHostels();
    
    // Filter visible hostels and sort by display_order ascending
    hostels = (data || [])
      .filter((h: Hostel) => h.visible !== false)
      .sort((a: Hostel, b: Hostel) => (a.display_order || 0) - (b.display_order || 0));
  } catch (error) {
    console.error("Failed to load hostels:", error);
  }

  // Group hostels by type (e.g., boys, girls, international, staff)
  const groupedHostels = hostels.reduce((acc, hostel) => {
    const type = hostel.hostel_type?.toLowerCase() || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(hostel);
    return acc;
  }, {} as Record<string, Hostel[]>);

  // Format type labels nicely
  const formatTypeLabel = (type: string) => {
    switch (type) {
      case "boys": return "Boys Hostels";
      case "girls": return "Girls Hostels";
      case "international": return "International Accommodation";
      case "staff": return "Staff Quarters";
      default: return "Other Accommodations";
    }
  };

  const hostelTypes = Object.keys(groupedHostels).sort();

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Page Header */}
      <header className="py-16 sm:py-20 lg:py-24 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            Campus Life
          </span>
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-gray-50">
            Residential Facilities
          </h1>
          <p className="text-lg sm:text-xl opacity-70 max-w-3xl mx-auto leading-relaxed">
            Experience a secure, comfortable, and vibrant living environment. Our hostels are designed to be your home away from home, fostering a strong sense of community and academic focus.
          </p>
        </div>
      </header>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Empty State */}
        {hostels.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
            <svg className="w-12 h-12 mx-auto text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Accommodations Not Found</h3>
            <p className="opacity-60 max-w-md mx-auto">
              Our residential facilities directory is currently being updated. Please check back later.
            </p>
          </div>
        )}

        {/* Dynamic Hostel Sections by Category */}
        <div className="space-y-20 lg:space-y-24">
          {hostelTypes.map((type) => (
            <section key={type} className="cms-section" aria-labelledby={`heading-${type}`}>
              <div className="flex items-center gap-4 mb-8 sm:mb-12 border-b border-[var(--border-color)] pb-4">
                <h2 id={`heading-${type}`} className="cms-heading text-2xl sm:text-3xl font-bold capitalize">
                  {formatTypeLabel(type)}
                </h2>
                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-full text-sm font-medium opacity-70">
                  {groupedHostels[type].length} Facilities
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                {groupedHostels[type].map((hostel) => (
                  <article 
                    key={hostel.id || hostel.hostel_name}
                    className="cms-card group flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Featured Image */}
                    <figure className="relative aspect-[16/9] w-full bg-black/5 dark:bg-white/5 overflow-hidden border-b border-[var(--border-color)]">
                      {hostel.featured_image_url ? (
                        <Image
                          src={hostel.featured_image_url}
                          alt={`View of ${hostel.hostel_name}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                          <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300"></div>
                      
                      {/* Capacity Badge */}
                      {hostel.capacity > 0 && (
                        <div className="absolute top-4 right-4 bg-[var(--background-color)]/90 backdrop-blur-sm border border-[var(--border-color)] px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          <span className="text-sm font-bold text-[var(--text-color)]">{hostel.capacity} Beds</span>
                        </div>
                      )}
                    </figure>

                    {/* Content */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-3 text-[var(--text-color)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {hostel.hostel_name}
                      </h3>
                      
                      <p className="text-[var(--text-color)] opacity-70 mb-6 line-clamp-3 leading-relaxed">
                        {hostel.short_description || "Experience comfortable living with dedicated facilities, high security, and an environment conducive to academic excellence."}
                      </p>

                      <div className="mt-auto space-y-5">
                        {/* Warden Info */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)]">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold tracking-wider uppercase text-[var(--text-color)] opacity-50">Chief Warden</p>
                            <p className="font-semibold text-[var(--text-color)]">{hostel.warden_name || "Assigned Warden"}</p>
                          </div>
                        </div>

                        {/* Facilities Summary */}
                        {hostel.facilities && (
                          <div className="border-t border-[var(--border-color)] pt-5">
                            <h4 className="text-sm font-bold tracking-wider uppercase text-[var(--text-color)] opacity-50 mb-3">Key Facilities</h4>
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none opacity-80 line-clamp-3 marker:text-indigo-500"
                              dangerouslySetInnerHTML={{ __html: hostel.facilities }}
                            />
                          </div>
                        )}
                        
                        {/* Future Call to Action Placement */}
                        <div className="pt-2">
                          <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center focus:outline-none">
                            View Facility Details
                            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Global Institutional Facilities Banner */}
        {hostels.length > 0 && (
          <section className="mt-24 cms-card bg-indigo-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
              <svg width="404" height="384" fill="none" viewBox="0 0 404 384"><defs><pattern id="d3eb07ae-5182-43e6-857d-35c643af9034" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" fill="currentColor"></rect></pattern></defs><rect width="404" height="384" fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)"></rect></svg>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Standard Campus Amenities</h2>
                <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                  All our residential facilities are equipped with standardized modern amenities to ensure the safety, health, and comfort of every resident.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "24/7 Enhanced Security",
                    "High-Speed Wi-Fi Access",
                    "Nutritious Mess Facilities",
                    "Recreational Common Rooms",
                    "On-Campus Medical Support",
                    "Laundry Services"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-indigo-100">
                      <svg className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-start lg:items-center justify-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <svg className="w-12 h-12 text-indigo-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <h3 className="text-xl font-bold mb-2">Ready to move in?</h3>
                <p className="text-indigo-100 text-center mb-6">Explore the hostel allocation process and apply for accommodation alongside your academic admission.</p>
                <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 w-full sm:w-auto">
                  Hostel Application Guide
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
