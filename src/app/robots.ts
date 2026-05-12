import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Base URL for the application, fallback to standard production URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.institution.edu";

  // Check if we are in a production environment to prevent staging sites from being indexed
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      // Allow crawling of all public routes, CMS pages, and specific directories
      allow: [
        "/",
        "/about",
        "/admissions",
        "/gallery",
        "/faculty",
        "/departments",
        "/hostels",
        "/hospital",
        "/contact",
        "/notices"
      ],
      // Explicitly block operational, admin, and protected API routes
      disallow: [
        "/admin",
        "/admin/*",
        "/api/*",
        "/private/*",
        "/*?search=", // Prevent indexing of search query permutations
        "/*?filter="  // Prevent indexing of filtered views
      ],
    },
    // Dynamically point to the generated sitemap
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
