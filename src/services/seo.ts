import { supabase } from "@/lib/supabase";
import type { SEOData, SEOPayload } from "@/types/seo";
import type { Metadata } from "next";

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetches SEO data for a specific page route.
 */
export async function getSEOByPath(page_path: string): Promise<SEOData | null> {
  try {
    const { data, error } = await supabase
      .from("seo")
      .select("*")
      .eq("page_path", page_path)
      .single();

    if (error) {
      // Ignore PGRST116 (No rows found) as it's a normal case for missing SEO data
      if (error.code !== "PGRST116") {
        console.error(`[getSEOByPath] Error fetching SEO for path ${page_path}:`, error.message);
      }
      return null;
    }

    return data as SEOData;
  } catch (err) {
    console.error(`[getSEOByPath] Unexpected error for path ${page_path}:`, err);
    return null;
  }
}

/**
 * Creates new SEO metadata for a page.
 */
export async function createSEOData(
  payload: SEOPayload
): Promise<ServiceResponse<SEOData>> {
  try {
    const { data, error } = await supabase
      .from("seo")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[createSEOData] Error creating SEO data:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as SEOData };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[createSEOData] Unexpected error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates existing SEO metadata.
 */
export async function updateSEOData(
  id: string,
  payload: Partial<SEOPayload>
): Promise<ServiceResponse<SEOData>> {
  try {
    const { data, error } = await supabase
      .from("seo")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[updateSEOData] Error updating SEO data ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as SEOData };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[updateSEOData] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deletes SEO metadata by its ID.
 */
export async function deleteSEOData(id: string): Promise<ServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from("seo")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[deleteSEOData] Error deleting SEO data ${id}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error(`[deleteSEOData] Unexpected error for ID ${id}:`, err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Generates production-safe fallback SEO values tailored for an institutional website.
 */
export function generateDefaultSEO(): Partial<SEOData> {
  return {
    title: "Lumina Institute of Technology",
    description: "Empowering the next generation of innovators, leaders, and healthcare professionals through excellence in education and research.",
    keywords: ["university", "college", "education", "research", "technology institute", "medical college", "higher education"],
    robots: "index, follow",
    theme_color: "#0f172a",
  };
}

/**
 * Converts internal SEOData into a Next.js 14 compatible Metadata object.
 */
export function buildMetadata(seoData: SEOData | null): Metadata {
  const defaultSEO = generateDefaultSEO();

  const title = seoData?.title || defaultSEO.title;
  const description = seoData?.description || defaultSEO.description;
  const keywords = seoData?.keywords || defaultSEO.keywords;

  const metadata: Metadata = {
    title: title,
    description: description,
    keywords: keywords,
    robots: seoData?.robots || defaultSEO.robots,
    alternates: seoData?.canonical_url ? { canonical: seoData.canonical_url } : undefined,
    themeColor: seoData?.theme_color || defaultSEO.theme_color,
    authors: seoData?.author ? [{ name: seoData.author }] : undefined,
  };

  // Construct Open Graph configuration
  if (seoData?.og_title || seoData?.og_description || seoData?.og_image_url) {
    metadata.openGraph = {
      title: seoData.og_title || title || undefined,
      description: seoData.og_description || description || undefined,
      images: seoData.og_image_url ? [{ url: seoData.og_image_url }] : undefined,
      type: "website",
    };
  }

  // Construct Twitter Cards configuration
  if (seoData?.twitter_title || seoData?.twitter_description || seoData?.twitter_image_url) {
    metadata.twitter = {
      card: "summary_large_image",
      title: seoData.twitter_title || title || undefined,
      description: seoData.twitter_description || description || undefined,
      images: seoData.twitter_image_url ? [seoData.twitter_image_url] : undefined,
    };
  }

  return metadata;
}

export type StructuredDataType = 
  | 'CollegeOrUniversity' 
  | 'MedicalOrganization' 
  | 'EducationalOrganization';

export interface StructuredDataParams {
  type: StructuredDataType;
  name: string;
  url: string;
  logoUrl?: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
}

/**
 * Generates JSON-LD structured data for institutional entities (University, Hospital, etc.).
 */
export function generateStructuredData(data: StructuredDataParams): Record<string, any> {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": data.type,
    name: data.name,
    url: data.url,
  };

  if (data.logoUrl) schema.logo = data.logoUrl;
  if (data.description) schema.description = data.description;
  if (data.telephone) schema.telephone = data.telephone;
  
  if (data.address) {
    schema.address = {
      "@type": "PostalAddress",
      ...data.address
    };
  }

  return schema;
}
