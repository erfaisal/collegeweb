import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";

// Service imports
import { getDepartmentBySlug } from "@/services/departments";
import { getFacultyByDepartment } from "@/services/faculty";
import { getSEOByPath, buildMetadata } from "@/services/seo";

// Types
interface PageProps {
  params: {
    slug: string;
  };
}

interface Department {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  hod_name: string;
  featured_image_url: string;
  vision: string;
  mission: string;
  achievements: string;
  facilities: string;
  visible: boolean;
  seo_title: string;
  seo_description: string;
}

interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  image_url: string;
  visible: boolean;
}

/**
 * Generate dynamic metadata for the department page.
 */
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;

  try {
    const department: Department | null = await getDepartmentBySlug(slug);

    if (!department || !department.visible) {
      return {};
    }

    const path = `/departments/${slug}`;
    const seoData = await getSEOByPath(path).catch(() => null);

    return buildMetadata({
      title: seoData?.title || department.seo_title || `${department.name} Department`,
      description: seoData?.description || department.seo_description || department.short_description,
      keywords: seoData?.keywords,
      openGraph: {
        images: department.featured_image_url ? [department.featured_image_url] : [],
      },
    });
  } catch (error) {
    console.error(`Failed to generate metadata for department slug: ${slug}`, error);
    return {};
  }
}

/**
 * Dynamic Department Detail Server Component
 */
export default async function DepartmentDetailPage({ params }: PageProps) {
  const { slug } = params;

  let department: Department | null = null;
  let faculty: FacultyMember[] = [];

  try {
    department = await getDepartmentBySlug(slug);

    if (!department || !department.visible) {
      notFound();
    }

    // Fetch faculty using the department name as the identifier
    const fetchedFaculty = await getFacultyByDepartment(department.name).catch(() => []);
    faculty = fetchedFaculty.filter((f: FacultyMember) => f.visible !== false);
  } catch (error) {
    console.error(`Failed to fetch department data for slug: ${slug}`, error);
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Hero Banner Section */}
      <section className="relative w-full bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)]">
        {department.featured_image_url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={department.featured_image_url}
              alt={`Featured image for ${department.name}`}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-20 dark:opacity-30 mix-blend-multiply dark:mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-color)] to-transparent" />
          </div>
        )}
        
        <div className="cms-container relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            Academic Department
          </span>
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-sm text-gray-900 dark:text-gray-50">
            {department.name}
          </h1>
          {department.short_description && (
            <p className="text-lg sm:text-xl opacity-80 max-w-3xl mx-auto leading-relaxed">
              {department.short_description}
            </p>
          )}
        </div>
      </section>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-16 lg:space-y-24">
        
        {/* HOD & Overview Section */}
        <section className="cms-section grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16" aria-labelledby="overview-heading">
          <div className="lg:col-span-2 space-y-8">
            <h2 id="overview-heading" className="cms-heading text-2xl sm:text-3xl font-bold border-b border-[var(--border-color)] pb-4">
              Department Overview
            </h2>
            {/* Rich Text Description */}
            {department.description ? (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500"
                dangerouslySetInnerHTML={{ __html: department.description }}
              />
            ) : (
              <p className="opacity-70 italic">Detailed overview is currently being updated.</p>
            )}
          </div>

          {/* Sidebar: HOD Info */}
          <aside className="space-y-8">
            {department.hod_name && (
              <div className="cms-card p-6 sm:p-8 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-2">
                  Head of Department
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {department.hod_name}
                </p>
                <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm opacity-80 leading-relaxed">
                    Leading the {department.name} towards academic excellence and innovative research.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </section>

        {/* Vision & Mission */}
        {(department.vision || department.mission) && (
          <section className="cms-section grid grid-cols-1 md:grid-cols-2 gap-8" aria-label="Vision and Mission">
            {department.vision && (
              <div className="cms-card p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <h3 className="cms-heading text-2xl font-bold">Our Vision</h3>
                </div>
                <div 
                  className="prose dark:prose-invert opacity-80"
                  dangerouslySetInnerHTML={{ __html: department.vision }}
                />
              </div>
            )}
            
            {department.mission && (
              <div className="cms-card p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <h3 className="cms-heading text-2xl font-bold">Our Mission</h3>
                </div>
                <div 
                  className="prose dark:prose-invert opacity-80"
                  dangerouslySetInnerHTML={{ __html: department.mission }}
                />
              </div>
            )}
          </section>
        )}

        {/* Achievements & Facilities */}
        {(department.achievements || department.facilities) && (
          <section className="cms-section grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16" aria-label="Achievements and Facilities">
            {department.achievements && (
              <div className="space-y-6">
                <h3 className="cms-heading text-2xl font-bold border-b border-[var(--border-color)] pb-3">
                  Key Achievements
                </h3>
                <div 
                  className="prose dark:prose-invert max-w-none marker:text-indigo-500"
                  dangerouslySetInnerHTML={{ __html: department.achievements }}
                />
              </div>
            )}

            {department.facilities && (
              <div className="space-y-6">
                <h3 className="cms-heading text-2xl font-bold border-b border-[var(--border-color)] pb-3">
                  Labs & Facilities
                </h3>
                <div 
                  className="prose dark:prose-invert max-w-none marker:text-indigo-500"
                  dangerouslySetInnerHTML={{ __html: department.facilities }}
                />
              </div>
            )}
          </section>
        )}

        {/* Faculty Section */}
        <section className="cms-section" aria-labelledby="faculty-heading">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-8">
            <h2 id="faculty-heading" className="cms-heading text-2xl sm:text-3xl font-bold">
              Department Faculty
            </h2>
            <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-full text-sm font-medium opacity-70">
              {faculty.length} Members
            </span>
          </div>

          {faculty.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[var(--border-color)] rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
              <p className="opacity-60 font-medium">Faculty directory for this department is currently being updated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {faculty.map((member) => (
                <article 
                  key={member.id} 
                  className="cms-card group flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative aspect-[4/5] w-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={`Profile picture of ${member.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                        <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium text-xs uppercase tracking-wider mb-3">
                      {member.designation}
                    </p>
                    {member.qualification && (
                      <p className="text-sm opacity-70 line-clamp-2 mt-auto pt-4 border-t border-[var(--border-color)]">
                        {member.qualification}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
