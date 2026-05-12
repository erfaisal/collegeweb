import { MetadataRoute } from "next";

// Service imports
import { getAllPages } from "@/services/pages";
import { getNotices } from "@/services/notices";
import { getDepartments } from "@/services/departments";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the application, fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.institution.edu";

  // Fetch all necessary data concurrently, failing gracefully if a service is down
  const [pages, notices, departments] = await Promise.all([
    getAllPages().catch(() => []),
    getNotices().catch(() => []),
    getDepartments().catch(() => []),
  ]);

  // Define static routes and their metadata
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/admissions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faculty`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/departments`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hostels`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hospital`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/notices`,
      // Use the latest notice date if available, otherwise current date
      lastModified: notices.length > 0 && notices[0]?.created_at ? new Date(notices[0].created_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Map dynamic CMS pages
  const dynamicPages: MetadataRoute.Sitemap = pages
    .filter((page: any) => page?.slug && page?.visible !== false)
    .map((page: any) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  // Map dynamic Department pages
  const departmentPages: MetadataRoute.Sitemap = departments
    .filter((dept: any) => dept?.slug && dept?.visible !== false)
    .map((dept: any) => ({
      url: `${baseUrl}/departments/${dept.slug}`,
      lastModified: dept.updated_at ? new Date(dept.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  // Map dynamic Notice pages
  const noticePages: MetadataRoute.Sitemap = notices
    .filter((notice: any) => notice?.slug || notice?.id)
    .map((notice: any) => ({
      url: `${baseUrl}/notices/${notice.slug || notice.id}`,
      lastModified: notice.updated_at ? new Date(notice.updated_at) : new Date(),
      changeFrequency: "yearly", // Notices usually don't change once published
      priority: 0.6,
    }));

  // Combine and return all sitemap entries
  return [
    ...staticRoutes,
    ...departmentPages,
    ...dynamicPages,
    ...noticePages,
  ];
}
