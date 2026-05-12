import Image from "next/image";
import Link from "next/link";
import { getGalleryImages } from "@/services/gallery";

export interface GalleryItem {
  id?: string;
  title: string;
  image_url: string;
  category: string;
  featured: boolean;
  visible?: boolean;
  alt_text?: string;
  display_order?: number;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  let allImages: GalleryItem[] = [];

  try {
    const data = await getGalleryImages();
    // Filter to show only visible images and sort by display order
    allImages = (data || [])
      .filter((img: GalleryItem) => img.visible !== false)
      .sort((a: GalleryItem, b: GalleryItem) => (a.display_order || 0) - (b.display_order || 0));
  } catch (error) {
    console.error("Failed to load gallery images:", error);
  }

  // Extract unique categories for the filter UI
  const categories = ["All", ...Array.from(new Set(allImages.map((img) => img.category).filter(Boolean)))];
  const selectedCategory = searchParams?.category || "All";

  // Filter images based on selected category
  const filteredImages = allImages.filter(
    (img) => selectedCategory === "All" || img.category === selectedCategory
  );

  // Separate featured images (only highlight them if viewing 'All')
  const isAllCategory = selectedCategory === "All";
  const featuredImages = isAllCategory ? filteredImages.filter((img) => img.featured) : [];
  const regularImages = isAllCategory ? filteredImages.filter((img) => !img.featured) : filteredImages;

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30">
      
      {/* Gallery Header */}
      <header className="py-12 sm:py-16 lg:py-20 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)]">
        <div className="cms-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="cms-heading text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-50">
            Institutional Gallery
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto opacity-80">
            Explore our campus life, events, infrastructure, and the vibrant community that defines our institution.
          </p>
        </div>
      </header>

      <div className="cms-container mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Category Filter Navigation */}
        <nav 
          className="mb-10 sm:mb-16 flex overflow-x-auto pb-4 custom-scrollbar hide-scroll-indicator justify-start lg:justify-center gap-2 sm:gap-3"
          aria-label="Gallery Categories"
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <Link
                key={category}
                href={category === "All" ? "/gallery" : `/gallery?category=${encodeURIComponent(category)}`}
                className={`
                  whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                  ${isActive 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                    : "bg-[var(--background-color)] text-[var(--text-color)] border-[var(--border-color)] hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {category}
              </Link>
            );
          })}
        </nav>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
            <svg className="w-12 h-12 mx-auto text-[var(--text-color)] opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h3 className="text-xl font-semibold mb-2">No images available</h3>
            <p className="opacity-60 max-w-md mx-auto">
              We couldn't find any images for the selected category. Check back later for updates.
            </p>
            {selectedCategory !== "All" && (
              <Link href="/gallery" className="inline-block mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium">
                View All Categories
              </Link>
            )}
          </div>
        )}

        {/* Featured Section */}
        {featuredImages.length > 0 && (
          <section className="cms-section mb-16 lg:mb-24" aria-labelledby="featured-gallery-heading">
            <h2 id="featured-gallery-heading" className="sr-only">Featured Gallery Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {featuredImages.map((image, index) => (
                <figure 
                  key={image.id || `featured-${index}`} 
                  className={`cms-card group relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] cursor-pointer ${index === 0 && featuredImages.length % 2 !== 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-video sm:aspect-[4/3] lg:aspect-video'}`}
                  // Future: Add onClick handler here to trigger Lightbox
                >
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={index < 2}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80"></div>
                  
                  {/* Caption */}
                  <figcaption className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase text-white bg-indigo-600 rounded shadow-sm backdrop-blur-md">
                      Featured • {image.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md line-clamp-2">
                      {image.title}
                    </h3>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Standard Gallery Grid (Masonry-ready layout strategy) */}
        {regularImages.length > 0 && (
          <section className="cms-section" aria-labelledby="gallery-grid-heading">
            <h2 id="gallery-grid-heading" className="sr-only">Gallery Image Grid</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {regularImages.map((image, index) => (
                <figure 
                  key={image.id || `regular-${index}`} 
                  className="cms-card group relative aspect-[4/3] overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                  // Future: Add onClick handler here to trigger Lightbox passing image index
                >
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading={index > 8 ? "lazy" : "eager"}
                  />
                  
                  {/* Subtle Hover Overlay */}
                  <div className="absolute inset-0 bg-gray-900/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]"></div>
                  
                  {/* Hover Info */}
                  <figcaption className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="text-indigo-300 font-semibold text-xs tracking-wider uppercase mb-1 drop-shadow-md">
                      {image.category}
                    </span>
                    <h3 className="text-white font-medium text-base sm:text-lg leading-tight drop-shadow-md line-clamp-3">
                      {image.title}
                    </h3>
                    
                    {/* Future: Expand icon for Lightbox cue */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Future Integration: Infinite Scroll Loader / Pagination Trigger */}
            {/* <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                Load More Images
              </button>
            </div> */}
          </section>
        )}
        
      </div>
    </main>
  );
}
