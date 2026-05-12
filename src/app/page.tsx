import Link from "next/link";
import { getHomepageSections } from "@/services/homepage-sections";
import { getSiteSettings } from "@/services/settings";

// Types
export interface HomepageSection {
  id: string;
  section_key: "hero" | "about" | "admissions" | "faculty" | "gallery" | "testimonials" | "hospital" | "hostel" | "research" | "placements" | string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  layout_type: "hero" | "split_left" | "split_right" | "centered" | "grid";
  display_order: number;
  is_active: boolean;
}

export interface SiteSettings {
  site_name: string;
  tagline?: string;
  admissions_open?: boolean;
}

/**
 * Renders the Hero section with a background image overlay and prominent CTA.
 */
function HeroSection({ section }: { section: HomepageSection }) {
  return (
    <section 
      aria-label={section.title}
      className="cms-section relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900"
    >
      {/* Background Image with Overlay */}
      {section.image_url && (
        <>
          <div className="absolute inset-0 z-0">
            <img
              src={section.image_url}
              alt="Hero Background"
              className="w-full h-full object-cover object-center opacity-60"
            />
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mix-blend-multiply" />
        </>
      )}

      {/* Hero Content */}
      <div className="cms-container relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center mt-16">
        {section.subtitle && (
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
            {section.subtitle}
          </span>
        )}
        <h1 className="cms-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-sm">
          {section.title}
        </h1>
        {section.description && (
          <p className="text-lg sm:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-sm font-light">
            {section.description}
          </p>
        )}
        {section.button_text && section.button_link && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={section.button_link}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 w-full sm:w-auto"
            >
              {section.button_text}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Renders a split layout section (Image on one side, text on the other).
 */
function SplitSection({ section, imageLeft }: { section: HomepageSection; imageLeft: boolean }) {
  return (
    <section 
      aria-labelledby={`heading-${section.id}`}
      className="cms-section py-20 sm:py-28 bg-[var(--background-color)]"
    >
      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col gap-12 lg:gap-16 items-center ${imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
          
          {/* Image Side */}
          {section.image_url && (
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] aspect-[4/3] group">
                <img
                  src={section.image_url}
                  alt={section.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Content Side */}
          <div className={`w-full ${section.image_url ? "lg:w-1/2" : "lg:w-full lg:max-w-3xl mx-auto text-center"} space-y-6 sm:space-y-8`}>
            <div>
              {section.subtitle && (
                <span className="block text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-2">
                  {section.subtitle}
                </span>
              )}
              <h2 id={`heading-${section.id}`} className="cms-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-color)] tracking-tight">
                {section.title}
              </h2>
            </div>
            
            {section.description && (
              <div className="text-lg text-[var(--text-color)] opacity-70 leading-relaxed space-y-4">
                <p>{section.description}</p>
              </div>
            )}

            {section.button_text && section.button_link && (
              <div className={!section.image_url ? "flex justify-center" : ""}>
                <Link
                  href={section.button_link}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  {section.button_text}
                  <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Renders a centered informative block.
 */
function CenteredSection({ section }: { section: HomepageSection }) {
  return (
    <section 
      aria-labelledby={`heading-${section.id}`}
      className="cms-section py-20 sm:py-24 bg-black/[0.02] dark:bg-white/[0.02] border-y border-[var(--border-color)]"
    >
      <div className="cms-container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div>
          {section.subtitle && (
            <span className="block text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-3">
              {section.subtitle}
            </span>
          )}
          <h2 id={`heading-${section.id}`} className="cms-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-color)] tracking-tight">
            {section.title}
          </h2>
        </div>
        
        {section.description && (
          <p className="text-lg sm:text-xl text-[var(--text-color)] opacity-70 leading-relaxed max-w-3xl mx-auto">
            {section.description}
          </p>
        )}

        {section.button_text && section.button_link && (
          <div className="pt-4">
            <Link
              href={section.button_link}
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
            >
              {section.button_text}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Section routing dispatcher based on layout_type
 */
function SectionRenderer({ section }: { section: HomepageSection }) {
  switch (section.layout_type) {
    case "hero":
      return <HeroSection section={section} />;
    case "split_left":
      return <SplitSection section={section} imageLeft={true} />;
    case "split_right":
      return <SplitSection section={section} imageLeft={false} />;
    case "centered":
    case "grid": // Grid can default to centered header block if no items are provided in section data
      return <CenteredSection section={section} />;
    default:
      // Fallback renderer
      return <SplitSection section={section} imageLeft={true} />;
  }
}

export default async function HomePage() {
  let sections: HomepageSection[] = [];
  let settings: SiteSettings | null = null;

  try {
    // Fetch data concurrently for performance optimization
    const [fetchedSections, fetchedSettings] = await Promise.all([
      getHomepageSections().catch(() => []),
      getSiteSettings().catch(() => null),
    ]);

    // Filter active sections and sort by display order
    sections = (fetchedSections || [])
      .filter((section: HomepageSection) => section.is_active)
      .sort((a: HomepageSection, b: HomepageSection) => a.display_order - b.display_order);
    
    settings = fetchedSettings;
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
  }

  // Graceful empty state handling
  if (!sections || sections.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-color)] text-[var(--text-color)] p-4">
        <h1 className="text-3xl font-bold mb-2">Welcome to {settings?.site_name || "Our Institution"}</h1>
        <p className="opacity-70 text-center max-w-md">
          Our homepage is currently being updated. Please check back later or access the navigation menu.
        </p>
      </main>
    );
  }

  return (
    <main className="w-full bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Optional: Global Alert Banner based on settings */}
      {settings?.admissions_open && (
        <div className="w-full bg-indigo-600 text-white px-4 py-2 text-center text-sm font-medium">
          <Link href="/admissions" className="hover:underline">
            Admissions for the current academic year are now open. Apply today &rarr;
          </Link>
        </div>
      )}

      {/* Dynamic Sections Renderer */}
      <div className="flex flex-col w-full">
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
      
    </main>
  );
}
