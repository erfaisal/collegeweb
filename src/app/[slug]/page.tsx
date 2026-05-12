import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

// Service imports
import { getPageBySlug } from "@/services/pages";
import { getSEOByPath, buildMetadata } from "@/services/seo";

// Types
interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate dynamic metadata for the CMS page.
 * Merges page-specific SEO data with global SEO data.
 */
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;

  try {
    const page = await getPageBySlug(slug);

    // If page doesn't exist or is unpublished, return empty metadata (will 404 anyway)
    if (!page || !page.is_published) {
      return {};
    }

    const path = `/${slug}`;
    const seoData = await getSEOByPath(path);

    // Utilize the buildMetadata service to construct a standardized Metadata object
    return buildMetadata({
      title: seoData?.title || page.seo_title || page.title,
      description: seoData?.description || page.seo_description || page.short_description,
      keywords: seoData?.keywords || page.seo_keywords,
      openGraph: {
        images: page.featured_image_url ? [page.featured_image_url] : [],
      },
    });
  } catch (error) {
    console.error(`Failed to generate metadata for slug: ${slug}`, error);
    return {};
  }
}

/**
 * Dynamic CMS Page Server Component
 * Handles rendering of dynamic routes like /about-us, /admissions, etc.
 */
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch page data directly on the server
  let page;
  try {
    page = await getPageBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch page data for slug: ${slug}`, error);
    notFound();
  }

  // Handle 404 for missing or draft pages
  if (!page || !page.is_published) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      <article className="cms-container mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        
        {/* Page Header */}
        <header className="mb-10 sm:mb-14 text-center">
          <h1 className="cms-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6">
            {page.title}
          </h1>
          
          {page.short_description && (
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {page.short_description}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {page.featured_image_url && (
          <figure className="mb-12 sm:mb-16 overflow-hidden rounded-2xl shadow-xl border border-[var(--border-color)] bg-gray-100 dark:bg-gray-800">
            {/* Using standard img for external CMS URLs without requiring next.config.js domains setup */}
            <img
              src={page.featured_image_url}
              alt={`Featured image for ${page.title}`}
              className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 hover:scale-[1.02]"
              loading="eager"
            />
          </figure>
        )}

        {/* Page Content */}
        {/* Future Integration: Swap dangerouslySetInnerHTML with a custom block renderer for structured CMS data */}
        <section 
          className="cms-section prose prose-lg sm:prose-xl max-w-none dark:prose-invert 
                     prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                     prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-medium hover:prose-a:text-indigo-500
                     prose-img:rounded-xl prose-img:shadow-md
                     prose-blockquote:border-l-indigo-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
        
      </article>
    </main>
  );
}
