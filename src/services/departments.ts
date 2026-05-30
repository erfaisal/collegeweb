import supabase from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { revalidateDepartments } from "@/lib/cache";
import { Database } from "@/types/database";

// --- Types ---

export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type CreateDepartmentInput = Database["public"]["Tables"]["departments"]["Insert"];
export type UpdateDepartmentInput = Database["public"]["Tables"]["departments"]["Update"];

export interface DepartmentStatistics {
  totalDepartments: number;
  visibleDepartments: number;
  featuredDepartments: number;
}

export interface DepartmentSEO {
  title: string;
  description: string;
  keywords: string;
}

// --- Error Handling ---

/**
 * Safely serializes and logs department-related errors
 */
function handleDepartmentError(err: unknown, context: string): never {
  const serialized = err instanceof Error ? err.message : JSON.stringify(err);
  error(`Department Service Error [${context}]: ${serialized}`, { error: err });
  throw new Error(`Department Service Failure: ${serialized}`);
}

// --- Fetch Operations ---

/**
 * Retrieves all departments ordered by display_order
 */
export async function getDepartments(): Promise<Department[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleDepartmentError(err, "getDepartments");
  }
}

/**
 * Retrieves all visible departments
 */
export async function getVisibleDepartments(): Promise<Department[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("*")
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleDepartmentError(err, "getVisibleDepartments");
  }
}

/**
 * Retrieves all featured departments
 */
export async function getFeaturedDepartments(): Promise<Department[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("*")
      .eq("featured", true)
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleDepartmentError(err, "getFeaturedDepartments");
  }
}

/**
 * Retrieves a department by its UUID
 */
export async function getDepartmentById(id: string): Promise<Department | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleDepartmentError(err, `getDepartmentById(${id})`);
  }
}

/**
 * Retrieves a department by its unique slug
 * Returns null if missing
 */
export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("*")
      .eq("slug", slug)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleDepartmentError(err, `getDepartmentBySlug(${slug})`);
  }
}

// --- Mutation Operations ---

/**
 * Creates a new department
 */
export async function createDepartment(data: CreateDepartmentInput): Promise<Department> {
  try {
    const { data: created, error: dbError } = await supabase
      .from("departments")
      .insert(data)
      .select()
      .single();

    if (dbError) throw dbError;
    
    info(`Created new department: ${created.name} (${created.id})`);
    revalidateDepartments();
    
    return created;
  } catch (err) {
    handleDepartmentError(err, "createDepartment");
  }
}

/**
 * Updates an existing department
 */
export async function updateDepartment(id: string, data: UpdateDepartmentInput): Promise<Department> {
  try {
    const { data: updated, error: dbError } = await supabase
      .from("departments")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (dbError) throw dbError;

    info(`Updated department: ${id}`);
    revalidateDepartments();

    return updated;
  } catch (err) {
    handleDepartmentError(err, `updateDepartment(${id})`);
  }
}

/**
 * Deletes a department safely
 */
export async function deleteDepartment(id: string): Promise<void> {
  try {
    const { error: dbError } = await supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    warn(`Deleted department: ${id}`);
    revalidateDepartments();
  } catch (err) {
    handleDepartmentError(err, `deleteDepartment(${id})`);
  }
}

// --- State Toggles (Visibility & Featured) ---

/**
 * Sets a department's visibility to true
 */
export async function showDepartment(id: string): Promise<Department> {
  info(`Setting department visibility to true: ${id}`);
  return updateDepartment(id, { visible: true });
}

/**
 * Sets a department's visibility to false
 */
export async function hideDepartment(id: string): Promise<Department> {
  info(`Setting department visibility to false: ${id}`);
  return updateDepartment(id, { visible: false });
}

/**
 * Sets a department as featured
 */
export async function featureDepartment(id: string): Promise<Department> {
  info(`Featuring department: ${id}`);
  return updateDepartment(id, { featured: true });
}

/**
 * Removes a department from featured status
 */
export async function unfeatureDepartment(id: string): Promise<Department> {
  info(`Un-featuring department: ${id}`);
  return updateDepartment(id, { featured: false });
}

// --- Search & Ordering ---

/**
 * Searches departments by name, description, or HOD name
 */
export async function searchDepartments(query: string): Promise<Department[]> {
  try {
    if (!query.trim()) return [];
    
    const safeQuery = `%${query.trim()}%`;
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("*")
      .or(`name.ilike.${safeQuery},description.ilike.${safeQuery},hod_name.ilike.${safeQuery}`)
      .order("name", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleDepartmentError(err, `searchDepartments(${query})`);
  }
}

/**
 * Updates the display order of a department
 */
export async function updateDepartmentOrder(id: string, displayOrder: number): Promise<Department> {
  return updateDepartment(id, { display_order: displayOrder });
}

// --- Helpers & Utilities ---

/**
 * Checks if a proposed slug is available (unique)
 */
export async function isDepartmentSlugAvailable(slug: string): Promise<boolean> {
  try {
    const { count, error: dbError } = await supabase
      .from("departments")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);

    if (dbError) throw dbError;
    return count === 0;
  } catch (err) {
    handleDepartmentError(err, `isDepartmentSlugAvailable(${slug})`);
  }
}

/**
 * Duplicates an existing department with a unique slug
 */
export async function duplicateDepartment(id: string): Promise<Department> {
  try {
    const existing = await getDepartmentById(id);
    if (!existing) {
      throw new Error("Source department not found for duplication");
    }

    // Omit standard unique/generated fields
    const { id: _id, created_at: _created, ...baseData } = existing;

    const copyData: CreateDepartmentInput = {
      ...baseData,
      name: `${baseData.name} (Copy)`,
      slug: `${baseData.slug}-copy-${Date.now()}`,
      visible: false, // Default to hidden when duplicated
      featured: false,
    };

    info(`Duplicating department: ${id} -> ${copyData.slug}`);
    return await createDepartment(copyData);
  } catch (err) {
    handleDepartmentError(err, `duplicateDepartment(${id})`);
  }
}

// --- Statistics & Aggregations ---

/**
 * Retrieves holistic statistics about the department system
 */
export async function getDepartmentStatistics(): Promise<DepartmentStatistics> {
  try {
    const [totalRes, visibleRes, featuredRes] = await Promise.all([
      supabase.from("departments").select("id", { count: "exact", head: true }),
      supabase.from("departments").select("id", { count: "exact", head: true }).eq("visible", true),
      supabase.from("departments").select("id", { count: "exact", head: true }).eq("featured", true),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (visibleRes.error) throw visibleRes.error;
    if (featuredRes.error) throw featuredRes.error;

    return {
      totalDepartments: totalRes.count || 0,
      visibleDepartments: visibleRes.count || 0,
      featuredDepartments: featuredRes.count || 0,
    };
  } catch (err) {
    handleDepartmentError(err, "getDepartmentStatistics");
  }
}

// --- Academic Helpers ---

/**
 * Retrieves a consolidated directory summary of all departments
 */
export async function getDepartmentDirectory(): Promise<Partial<Department>[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("id, name, slug, short_description, hod_name")
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleDepartmentError(err, "getDepartmentDirectory");
  }
}

/**
 * Retrieves a consolidated contact list of all departments
 */
export async function getDepartmentContacts(): Promise<Partial<Department>[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("departments")
      .select("id, name, hod_name, email, phone")
      .eq("visible", true)
      .order("name", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleDepartmentError(err, "getDepartmentContacts");
  }
}

// --- SEO Helpers ---

/**
 * Generates SEO metadata for a department's page
 */
export function buildDepartmentSEO(department: Department): DepartmentSEO {
  const title = department.seo_title || `${department.name} | Department Directory`;
  const description = department.seo_description || department.short_description || `Learn about the ${department.name}, including programs, faculty, and research opportunities.`;
  
  // Basic keyword generation based on name
  const keywords = `${department.name}, department, academics, ${department.hod_name ? department.hod_name + ',' : ''} faculty, education, courses`;

  return { title, description, keywords };
}

// --- Future Compatibility Placeholders ---

/**
 * TODO: Integrate with LMS/ERP Courses Module
 * Will fetch interconnected courses for a specific department
 */
export async function departmentCourses(departmentId: string): Promise<void> {
  warn(`departmentCourses is not yet implemented (Requested ID: ${departmentId})`);
}

/**
 * TODO: Integrate with Institutional Research Portal
 * Will aggregate research projects, grants, and labs associated with the department
 */
export async function departmentResearch(departmentId: string): Promise<void> {
  warn(`departmentResearch is not yet implemented (Requested ID: ${departmentId})`);
}

/**
 * TODO: Integrate with Accreditation/Compliance System
 * Will retrieve certifications, NBA/NAAC ratings, or equivalent for the department
 */
export async function departmentAccreditation(departmentId: string): Promise<void> {
  warn(`departmentAccreditation is not yet implemented (Requested ID: ${departmentId})`);
}
