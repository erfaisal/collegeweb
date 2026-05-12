/**
 * Defines standard media types, while allowing arbitrary strings for future scalability
 * in a dynamic centralized media library.
 */
export type MediaType =
  | 'image'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'document'
  | (string & {});

/**
 * Represents a centralized media asset within the CMS platform.
 * Designed to support images, videos, documents, and SEO optimization.
 */
export interface MediaFile {
  id: string;
  file_name: string;
  original_name: string;
  file_url: string;
  thumbnail_url: string | null;
  mime_type: string;
  file_size: number; // Stored in bytes
  file_extension: string;
  media_type: MediaType;
  
  // Metadata & SEO
  alt_text: string | null;
  caption: string | null;
  seo_title: string | null;
  seo_description: string | null;
  
  // Organization
  category: string | null;
  folder: string | null; // Represents a virtual folder structure (e.g., '/images/academics')
  tags: string[] | null;
  
  // Storage specifics
  uploaded_by: string | null; // User ID
  bucket_name: string;
  storage_path: string; // The specific path within the Supabase Storage bucket
  is_public: boolean;
  
  // Media-specific dimensions/details
  width: number | null; // For images and videos
  height: number | null; // For images and videos
  duration: number | null; // For audio and video (in seconds)
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Utility type for creating or updating a MediaFile via Supabase,
 * omitting auto-generated database fields.
 */
export type MediaFilePayload = Omit<
  MediaFile,
  'id' | 'created_at' | 'updated_at'
>;
