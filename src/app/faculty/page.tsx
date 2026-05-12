import Image from "next/image";
import Link from "next/link";
import { getFacultyMembers } from "@/services/faculty";

export interface FacultyMember {
  id?: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  image_url: string;
  specialization: string;
  experience_years: number;
  featured: boolean;
  visible: boolean;
  display_order: number;
  slug?: string; // For future detail page
}

export default async function FacultyPage() {
  let facultyData: FacultyMember[] = [];

  try {
    const rawData = await getFacultyMembers();
    // Filter visible and sort by display_order ascending
    facultyData = (rawData || [])
      .filter((member: FacultyMember) => member.visible !== false)
      .sort((a: FacultyMember, b: FacultyMember) => (a.display_order || 0) - (b.display_order || 0));
  } catch (error) {
    console.error("Failed to fetch faculty members:", error);
  }

  // Separate featured leadership from regular faculty
  const leadership = facultyData.filter((member) => member.featured);
  const regularFaculty = facultyData.filter((member) => !member.featured);

  // Group regular faculty by department
  const facultyByDepartment = regularFaculty.reduce((acc, member) => {
    const dept = member.department || "Other";
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, FacultyMember[]>);

  const departments = Object.keys(facultyByDepartment).sort();

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Directory Header */}
      <header className="py-16 sm:py-20 lg:py-24 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Our Faculty & Leadership
          </h1>
          <p className="text-lg sm:text-xl opacity-70 max-w-3xl mx-auto leading-relaxed">
            Meet the distinguished scholars, researchers, and educators dedicated to fostering academic excellence and driving innovation across our institution.
          </p>
        </div>
      </header>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Empty State */}
        {facultyData.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
            <svg className="w-12 h-12 mx-auto text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <h3 className="text-xl font-semibold mb-2">Directory is Empty</h3>
            <p className="opacity-60 max-w-md mx-auto">
              Faculty profiles are currently being updated. Please check back later to view our academic staff directory.
            </p>
          </div>
        )}

        {/* Featured Leadership Section */}
        {leadership.length > 0 && (
          <section className="cms-section mb-20 lg:mb-28" aria-labelledby="leadership-heading">
            <div className="flex flex-col items-center mb-12 text-center">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2">
                Administration
              </span>
              <h2 id="leadership-heading" className="cms-heading text-3xl sm:text-4xl font-bold">
                Institutional Leadership
              </h2>
              <div className="w-24 h-1 bg-indigo-600/20 dark:bg-indigo-400/20 mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-center">
              {leadership.map((member) => (
                <FacultyCard key={member.id || member.name} member={member} isFeatured={true} />
              ))}
            </div>
          </section>
        )}

        {/* Department-based Faculty Listing */}
        {departments.length > 0 && (
          <div className="space-y-20 lg:space-y-28">
            {departments.map((dept) => (
              <section key={dept} className="cms-section" aria-labelledby={`dept-${dept.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="flex items-center gap-4 mb-8 sm:mb-10 pb-4 border-b border-[var(--border-color)]">
                  <h2 id={`dept-${dept.replace(/\s+/g, '-').toLowerCase()}`} className="cms-heading text-2xl sm:text-3xl font-bold">
                    {dept}
                  </h2>
                  <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-full text-sm font-medium opacity-70">
                    {facultyByDepartment[dept].length} Members
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {facultyByDepartment[dept].map((member) => (
                    <FacultyCard key={member.id || member.name} member={member} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

/**
 * Reusable Faculty Card Component
 */
function FacultyCard({ member, isFeatured = false }: { member: FacultyMember; isFeatured?: boolean }) {
  // Future Detail Page Link Fallback
  const profileLink = member.slug ? `/faculty/${member.slug}` : "#";
  const LinkWrapper = member.slug ? Link : 'div';

  return (
    <article className={`cms-card group flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${isFeatured ? 'shadow-md border-indigo-500/20 dark:border-indigo-400/20' : 'shadow-sm hover:-translate-y-1'}`}>
      <LinkWrapper href={profileLink as any} className="flex flex-col h-full focus:outline-none">
        
        {/* Profile Image Container */}
        <div className="relative aspect-[4/5] w-full bg-black/5 dark:bg-white/5 overflow-hidden">
          {member.image_url ? (
            <Image
              src={member.image_url}
              alt={`Profile picture of ${member.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
              <svg className="w-20 h-20 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          )}
          
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300"></div>
          
          {isFeatured && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm backdrop-blur-md">
              Leadership
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
              {member.name}
            </h3>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm leading-snug">
              {member.designation}
            </p>
          </div>

          <div className="space-y-3 mt-auto pt-4 border-t border-[var(--border-color)] text-sm opacity-80 flex-1">
            {member.qualification && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6"></path></svg>
                <span className="line-clamp-2" title={member.qualification}>{member.qualification}</span>
              </div>
            )}
            
            {member.specialization && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="line-clamp-2" title={member.specialization}>{member.specialization}</span>
              </div>
            )}

            {(member.experience_years > 0) && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{member.experience_years}+ Years Experience</span>
              </div>
            )}
          </div>

          {/* Future Integration Marker: View Profile Link */}
          {member.slug && (
            <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                View Full Profile
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </span>
            </div>
          )}
        </div>

      </LinkWrapper>
    </article>
  );
}
