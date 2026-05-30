import { supabase } from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import type { MediaFile } from "@/types/database"; // Assuming `MediaFile` is the type for the 'media_files' table

/**
 * Common response type for service operations.
 * Allows for consistent handling of success, data, and errors.
 */
export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string; // Optional: For more granular error identification
};

/**
 * Details returned after a successful file upload.
 */
export type UploadedFileDetails = {
  filename: string;
  path: string; // The full storage path in the bucket
  publicUrl: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileExtension: string;
};

/**
 * Standard error handler for media operations.
 * Logs the error and returns a consistent ServiceResponse.
 */
export function handleMediaError(
  functionName: string,
  err: unknown,
  customMessage?: string
): ServiceResponse<null> {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorCode = (err as any)?.code || "UNKNOWN_ERROR"; // Supabase errors often have a 'code'
  error(`[${functionName}] ${customMessage || 'Operation failed'}:`, errorMessage);
  return {
    success: false,
    error: customMessage || errorMessage,
    errorCode,
  };
}

/**
 * Determines the file extension from a filename or path.
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/**
 * Generates a unique, production-safe filename.
 * Prepends a timestamp and optionally a prefix, then sanitizes the original filename.
 */
export function generateUniqueFilename(
  originalFilename: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalFilename);
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, "") // Remove original extension
    .replace(/[^a-zA-Z0-9.\-_]/g, "") // Sanitize filename
    .toLowerCase();

  const uniqueBase = prefix ? `${prefix}-${baseName}` : baseName;

  return `${timestamp}-${uniqueBase}${extension ? `.${extension}` : ""}`;
}

/**
 * Generates the full storage path within a bucket, including folder.
 */
export function generateStoragePath(
  filename: string,
  folder: string | null | undefined
): string {
  const sanitizedFolder = folder ? `${folder.replace(/^\/|\/$/g, "")}/` : "";
  return `${sanitizedFolder}${filename}`;
}

/**
 * Generates a public URL for a file stored in a Supabase public bucket.
 * This is primarily for files stored in public buckets.
 */
export function getPublicFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads a single file to Supabase Storage.
 */
export async function uploadMediaFile(
  file: File,
  bucket: string,
  folder?: string
): Promise<ServiceResponse<UploadedFileDetails>> {
  try {
    const uniqueFilename = generateUniqueFilename(file.name);
    const storagePath = generateStoragePath(uniqueFilename, folder);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: false, // Do not overwrite existing files
      });

    if (uploadError) {
      return handleMediaError(
        "uploadMediaFile",
        uploadError,
        `Failed to upload file to storage: ${uniqueFilename}`
      );
    }

    const publicUrl = getPublicFileUrl(bucket, storagePath);

    const uploadedDetails: UploadedFileDetails = {
      filename: uniqueFilename,
      path: storagePath,
      publicUrl,
      bucket,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      fileExtension: getFileExtension(file.name),
    };

    info(`[uploadMediaFile] Successfully uploaded: ${publicUrl}`);
    return { success: true, data: uploadedDetails };
  } catch (err) {
    return handleMediaError("uploadMediaFile", err);
  }
}

/**
 * Uploads multiple files in parallel to Supabase Storage.
 * Handles partial failures by returning results for all attempts.
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  folder?: string
): Promise<ServiceResponse<Array<ServiceResponse<UploadedFileDetails>>>> {
  if (!files || files.length === 0) {
    return { success: true, data: [], error: "No files provided for upload." };
  }

  info(`[uploadMultipleFiles] Attempting to upload ${files.length} files to bucket '${bucket}'...`);

  const uploadPromises = files.map((file) =>
    uploadMediaFile(file, bucket, folder)
  );

  const results = await Promise.all(uploadPromises);

  const successfulUploads = results.filter((r) => r.success).length;
  const failedUploads = results.length - successfulUploads;

  if (failedUploads > 0) {
    warn(
      `[uploadMultipleFiles] Completed with ${successfulUploads} successes and ${failedUploads} failures.`
    );
    return {
      success: false,
      error: `Partial upload failure: ${failedUploads} out of ${files.length} files failed to upload.`,
      data: results,
    };
  }

  info(
    `[uploadMultipleFiles] Successfully uploaded all ${files.length} files.`
  );
  return { success: true, data: results };
}

/**
 * Deletes a file from Supabase Storage.
 */
export async function deleteMediaFile(
  bucket: string,
  path: string
): Promise<ServiceResponse<null>> {
  try {
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) {
      return handleMediaError(
        "deleteMediaFile",
        deleteError,
        `Failed to delete file from storage: ${path}`
      );
    }

    info(`[deleteMediaFile] Successfully deleted file: ${path}`);
    return { success: true };
  } catch (err) {
    return handleMediaError("deleteMediaFile", err);
  }
}

/**
 * Copies a file within Supabase Storage.
 */
export async function copyMediaFile(
  sourceBucket: string,
  sourcePath: string,
  destinationBucket: string,
  destinationPath: string
): Promise<ServiceResponse<string>> {
  try {
    const { data, error: copyError } = await supabase.storage
      .from(sourceBucket)
      .copy(sourcePath, destinationPath, {
        destinationBucket,
      });

    if (copyError) {
      return handleMediaError(
        "copyMediaFile",
        copyError,
        `Failed to copy file from ${sourcePath} to ${destinationPath}`
      );
    }

    info(`[copyMediaFile] Successfully copied file from ${sourcePath} to ${destinationPath}`);
    return { success: true, data: data?.path };
  } catch (err) {
    return handleMediaError("copyMediaFile", err);
  }
}

/**
 * Moves a file by copying it to the new location and then deleting the original.
 */
export async function moveMediaFile(
  sourceBucket: string,
  sourcePath: string,
  destinationBucket: string,
  destinationPath: string
): Promise<ServiceResponse<null>> {
  try {
    // Step 1: Copy the file
    const copyResult = await copyMediaFile(
      sourceBucket,
      sourcePath,
      destinationBucket,
      destinationPath
    );
    if (!copyResult.success) {
      return { success: false, error: copyResult.error };
    }

    // Step 2: Delete the original file
    const deleteResult = await deleteMediaFile(sourceBucket, sourcePath);
    if (!deleteResult.success) {
      // Log a warning if deletion fails, but the copy was successful.
      // Depending on requirements, this might need to revert the copy or alert.
      warn(
        `[moveMediaFile] Failed to delete original file after successful copy: ${sourcePath}. Manual cleanup may be required. Error: ${deleteResult.error}`
      );
      // For a "move" operation, if deletion fails, the move isn't complete, so we return failure.
      return { success: false, error: `Original file deletion failed after copy: ${deleteResult.error}` };
    }

    info(`[moveMediaFile] Successfully moved file from ${sourcePath} to ${destinationPath}`);
    return { success: true };
  } catch (err) {
    return handleMediaError("moveMediaFile", err);
  }
}

/**
 * Lists files within a Supabase Storage bucket, optionally filtered by folder.
 * Returns Supabase's StorageFile[] type.
 */
export async function listMediaFiles(
  bucket: string,
  folder?: string
): Promise<ServiceResponse<any[]>> {
  try {
    const { data, error: listError } = await supabase.storage
      .from(bucket)
      .list(folder || "", {
        limit: 100, // Adjust as needed, pagination might be required for large folders
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      return handleMediaError(
        "listMediaFiles",
        listError,
        `Failed to list files in bucket '${bucket}' folder '${folder || ""}'`
      );
    }

    info(`[listMediaFiles] Successfully listed ${data?.length || 0} files in bucket '${bucket}' folder '${folder || ""}'.`);
    return { success: true, data: data || [] };
  } catch (err) {
    return handleMediaError("listMediaFiles", err);
  }
}

/**
 * Saves (inserts or updates) metadata for a media file in the 'media_files' table.
 */
export async function saveMediaMetadata(
  metadata: Omit<MediaFile, "id" | "created_at" | "updated_at">
): Promise<ServiceResponse<MediaFile>> {
  try {
    const { data, error: dbError } = await supabase
      .from("media_files")
      .insert([metadata])
      .select()
      .single();

    if (dbError) {
      return handleMediaError(
        "saveMediaMetadata",
        dbError,
        `Failed to save media metadata for ${metadata.filename}`
      );
    }

    info(`[saveMediaMetadata] Successfully saved metadata for: ${data?.filename}`);
    return { success: true, data: data as MediaFile };
  } catch (err) {
    return handleMediaError("saveMediaMetadata", err);
  }
}

/**
 * Fetches all media files metadata from the 'media_files' table.
 */
export async function getMediaFiles(): Promise<ServiceResponse<MediaFile[]>> {
  try {
    const { data, error: dbError } = await supabase
      .from("media_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      return handleMediaError("getMediaFiles", dbError, "Failed to fetch all media files metadata");
    }

    info(`[getMediaFiles] Successfully fetched ${data?.length || 0} media files.`);
    return { success: true, data: data as MediaFile[] };
  } catch (err) {
    return handleMediaError("getMediaFiles", err);
  }
}

/**
 * Fetches a single media file metadata by its ID.
 */
export async function getMediaFileById(
  id: string
): Promise<ServiceResponse<MediaFile | null>> {
  try {
    const { data, error: dbError } = await supabase
      .from("media_files")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") { // No rows found
        info(`[getMediaFileById] No media file found with ID: ${id}`);
        return { success: true, data: null };
      }
      return handleMediaError(
        "getMediaFileById",
        dbError,
        `Failed to fetch media file with ID: ${id}`
      );
    }

    info(`[getMediaFileById] Successfully fetched media file: ${data?.filename}`);
    return { success: true, data: data as MediaFile };
  } catch (err) {
    return handleMediaError("getMediaFileById", err);
  }
}

/**
 * Updates the metadata properties of a specific media file.
 */
export async function updateMediaMetadata(
  id: string,
  payload: Partial<Omit<MediaFile, 'id' | 'created_at' | 'updated_at'>>
): Promise<ServiceResponse<MediaFile>> {
  try {
    const { data, error: dbError } = await supabase
      .from("media_files")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return handleMediaError(
        "updateMediaMetadata",
        dbError,
        `Failed to update metadata for ID ${id}`
      );
    }

    info(`[updateMediaMetadata] Successfully updated metadata for ID ${id}.`);
    return { success: true, data: data as MediaFile };
  } catch (err) {
    return handleMediaError("updateMediaMetadata", err);
  }
}


/**
 * Deletes a media file's metadata record from the 'media_files' table.
 */
export async function deleteMediaMetadata(
  id: string
): Promise<ServiceResponse<null>> {
  try {
    const { error: dbError } = await supabase
      .from("media_files")
      .delete()
      .eq("id", id);

    if (dbError) {
      return handleMediaError(
        "deleteMediaMetadata",
        dbError,
        `Failed to delete media metadata for ID: ${id}`
      );
    }

    info(`[deleteMediaMetadata] Successfully deleted metadata for ID: ${id}`);
    return { success: true };
  } catch (err) {
    return handleMediaError("deleteMediaMetadata", err);
  }
}

/**
 * Checks if a file is an image based on its MIME type or extension.
 * Supported: jpg, jpeg, png, webp.
 */
export function isImageFile(file: File | string): boolean {
  const mimeType = typeof file === "string" ? file : file.type;
  const extension = typeof file === "string" ? getFileExtension(file) : getFileExtension(file.name);

  return (
    mimeType.startsWith("image/") &&
    ["jpg", "jpeg", "png", "webp"].includes(extension)
  );
}

/**
 * Checks if a file is a PDF based on its MIME type or extension.
 */
export function isPdfFile(file: File | string): boolean {
  const mimeType = typeof file === "string" ? file : file.type;
  const extension = typeof file === "string" ? getFileExtension(file) : getFileExtension(file.name);

  return mimeType === "application/pdf" || extension === "pdf";
}

/**
 * Checks if a file's type is included in the allowed list.
 * `allowedTypes` can be MIME types (e.g., "image/jpeg") or extensions (e.g., "jpg").
 */
export function isAllowedFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  const mimeType = file.type;
  const extension = getFileExtension(file.name);

  return allowedTypes.some(
    (allowedType) =>
      allowedType.toLowerCase() === mimeType.toLowerCase() ||
      allowedType.toLowerCase() === extension.toLowerCase()
  );
}

/**
 * Validates if a file's size is within the specified maximum limit.
 * `maxSizeMB` is in megabytes.
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * TODO: Placeholder for generating a thumbnail.
 * This would typically involve an edge function, a serverless function,
 * or an external service (e.g., Cloudinary, Imgix) triggered on upload.
 */
export async function generateThumbnail(
  bucket: string,
  path: string
): Promise<ServiceResponse<string | null>> {
  warn(`[generateThumbnail] Thumbnail generation not implemented for ${path}.`);
  // Example placeholder for future implementation:
  // const thumbnailPath = await triggerThumbnailGenerationService(bucket, path);
  // return { success: true, data: thumbnailPath };
  return { success: false, error: "Thumbnail generation not implemented yet." };
}

/**
 * TODO: Placeholder for optimizing an image (e.g., compression, resizing).
 * This would typically involve an edge function, a serverless function,
 * or an external service triggered on upload.
 */
export async function optimizeImage(
  bucket: string,
  path: string
): Promise<ServiceResponse<string | null>> {
  warn(`[optimizeImage] Image optimization not implemented for ${path}.`);
  // Example placeholder for future implementation:
  // const optimizedPath = await triggerImageOptimizationService(bucket, path);
  // return { success: true, data: optimizedPath };
  return { success: false, error: "Image optimization not implemented yet." };
}

/**
 * TODO: Placeholder for a virus scan of an uploaded file.
 * This is crucial for enterprise security and would likely involve sending the
 * file to a dedicated scanning service (e.g., ClamAV, AWS Rekognition for malware).
 */
export async function virusScan(
  bucket: string,
  path: string
): Promise<ServiceResponse<boolean>> {
  warn(`[virusScan] Virus scanning not implemented for ${path}.`);
  // Example placeholder for future implementation:
  // const scanResult = await sendFileToVirusScanService(bucket, path);
  // return { success: true, data: scanResult.isClean };
  return {
    success: false,
    error: "Virus scanning not implemented yet.",
    data: false,
  };
}