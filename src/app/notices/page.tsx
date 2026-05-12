import Link from "next/link";
import { getNotices } from "@/services/notices";

export interface Notice {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  pdf_url?: string;
  featured_image_url?: string;
  category: string;
  publish_date: string;
  featured: boolean;
  visible: boolean;
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string };
}) {
  let allNotices: Notice[] = [];
  
  try {
    const data = await getNotices();
    // Filter only visible public notices and sort by newest first
    allNotices = (data || [])
      .filter((n: Notice) => n.visible)
      .sort((a: Notice, b: Notice) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  } catch (error) {
    console.error("Failed to load notices:", error);
  }

  // Derive available categories for the filter dropdown
  const availableCategories = ["All", ...Array.from(new Set(allNotices.map((n) => n.category).filter(Boolean)))];

  // Apply server-side filtering based on searchParams
  const query = searchParams?.q?.toLowerCase() || "";
  const selectedCategory = searchParams?.category || "All";

  const filteredNotices = allNotices.filter((notice) => {
    const matchesSearch = 
      notice.title.toLowerCase().includes(query) || 
      (notice.short_description || "").toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "All" || notice.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredNotices = filteredNotices.filter((n) => n.featured);
  const regularNotices = filteredNotices.filter((n) => !n.featured);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Page Header */}
      <header className="py-12 sm:py-16 lg:py-20 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="cms-heading text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Public Notices
          </h1>
          <p className="text-lg sm:text-xl opacity-70 max-w-2xl mx-auto">
            Stay updated with the latest institutional circulars, announcements, and important alerts.
          </p>
        </div>
      </header>

      <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search & Filter Section */}
        <section className="mb-12">
          <form 
            method="GET" 
            action="/notices"
            className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-black/[0.01] dark:bg-white/[0.01] shadow-sm"
          >
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 opacity-40 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search notices by keyword..."
                className="w-full pl-10 pr-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] placeholder:opacity-50 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                aria-label="Search notices"
              />
            </div>
            
            <select
              name="category"
              defaultValue={selectedCategory}
              className="px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow min-w-[200px]"
              aria-label="Filter by category"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Filter
            </button>
          </form>
        </section>

        {/* Empty State */}
        {filteredNotices.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
            <svg className="w-12 h-12 mx-auto opacity-20 text-[var(--text-color)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 5H20a2 2 0 012 2v12a2 2 0 01-2 2z"></path></svg>
            <h3 className="text-xl font-semibold mb-2">No notices found</h3>
            <p className="opacity-60 max-w-md mx-auto">
              We couldn't find any notices matching your current search criteria. Please try adjusting your filters or search term.
            </p>
            {(query || selectedCategory !== "All") && (
              <Link href="/notices" className="inline-block mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium">
                Clear Filters
              </Link>
            )}
          </div>
        )}

        {/* Featured Notices Section */}
        {featuredNotices.length > 0 && (
          <section className="cms-section mb-16 lg:mb-24" aria-labelledby="featured-notices-heading">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--border-color)] pb-4">
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <h2 id="featured-notices-heading" className="cms-heading text-2xl sm:text-3xl font-bold">
                Featured Highlights
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredNotices.map((notice) => (
                <article key={notice.id} className="cms-card group flex flex-col bg-[var(--background-color)] border-2 border-indigo-500/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-10"></div>
                  
                  {notice.featured_image_url && (
                    <div className="relative h-48 w-full overflow-hidden bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)]">
                      <img 
                        src={notice.featured_image_url} 
                        alt={notice.title} 
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {notice.category}
                      </span>
                      <time dateTime={notice.publish_date} className="text-xs font-medium opacity-60">
                        {formatDate(notice.publish_date)}
                      </time>
                    </div>

                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Link href={`/notices/${notice.slug}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true"></span>
                        {notice.title}
                      </Link>
                    </h3>
                    
                    <p className="opacity-70 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                      {notice.short_description}
                    </p>

                    {notice.pdf_url && (
                      <div className="mt-auto relative z-20">
                        <a 
                          href={notice.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                          View PDF Document
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Regular Notices Archive Section */}
        {regularNotices.length > 0 && (
          <section className="cms-section" aria-labelledby="all-notices-heading">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--border-color)] pb-4">
              <h2 id="all-notices-heading" className="cms-heading text-2xl sm:text-3xl font-bold">
                {featuredNotices.length > 0 ? "Latest Notices" : "All Notices"}
              </h2>
              <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-full text-sm font-medium opacity-80">
                {regularNotices.length} items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {regularNotices.map((notice) => (
                <article key={notice.id} className="cms-card group flex flex-col bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                  
                  {notice.featured_image_url && (
                    <div className="relative h-40 w-full overflow-hidden bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)]">
                      <img 
                        src={notice.featured_image_url} 
                        alt={notice.title} 
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide uppercase bg-black/5 dark:bg-white/5 border border-[var(--border-color)]">
                        {notice.category}
                      </span>
                      <time dateTime={notice.publish_date} className="text-xs font-medium opacity-60">
                        {formatDate(notice.publish_date)}
                      </time>
                    </div>

                    <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Link href={`/notices/${notice.slug}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true"></span>
                        {notice.title}
                      </Link>
                    </h3>
                    
                    <p className="opacity-70 text-sm mb-5 line-clamp-2 flex-1">
                      {notice.short_description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between relative z-20">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Read More &rarr;
                      </span>
                      {notice.pdf_url && (
                        <a 
                          href={notice.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-[var(--text-color)] opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all"
                          title="Download PDF"
                          aria-label={`Download PDF for ${notice.title}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Placeholder for Future Implementation */}
            {regularNotices.length >= 12 && (
              <div className="mt-12 flex justify-center">
                <button className="px-6 py-2.5 border-2 border-[var(--border-color)] bg-transparent text-[var(--text-color)] rounded-lg font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Load More Notices
                </button>
              </div>
            )}
          </section>
        )}
        
      </div>
    </main>
  );
}
