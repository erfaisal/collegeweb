import supabase from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { revalidateFaculty } from "@/lib/cache";
import { Database } from "@/types/database";

// --- Types ---

export type FacultyMember = Database["public"]["Tables"]["faculty_members"]["Row"];
export type CreateFacultyInput = Database["public"]["Tables"]["faculty_members"]["Insert"];
export type UpdateFacultyInput = Database["public"]["Tables"]["faculty_members"]["Update"];

export interface FacultyStatistics {
  totalFaculty: number;
  visibleFaculty: number;
  featuredFaculty: number;
  departmentCount: number;
}

export interface FacultySEO {
  title: string;
  description: string;
}

// --- Error Handling ---

/**
 * Safely serializes and logs faculty-related errors
 */
function handleFacultyError(err: unknown, context: string): never {
  const serialized = err instanceof Error ? err.message : JSON.stringify(err);
  error(`Faculty Service Error [${context}]: ${serialized}`, { error: err });
  throw new Error(`Faculty Service Failure: ${serialized}`);
}

// --- Fetch Operations ---

/**
 * Retrieves all faculty members ordered by display_order
 */
export async function getFacultyMembers(): Promise<FacultyMember[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleFacultyError(err, "getFacultyMembers");
  }
}

/**
 * Retrieves all visible faculty members
 */
export async function getVisibleFacultyMembers(): Promise<FacultyMember[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleFacultyError(err, "getVisibleFacultyMembers");
  }
}

/**
 * Retrieves all featured faculty members
 */
export async function getFeaturedFacultyMembers(): Promise<FacultyMember[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .eq("featured", true)
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleFacultyError(err, "getFeaturedFacultyMembers");
  }
}

/**
 * Retrieves a faculty member by their UUID
 */
export async function getFacultyMemberById(id: string): Promise<FacultyMember | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleFacultyError(err, `getFacultyMemberById(${id})`);
  }
}

/**
 * Retrieves a faculty member by their unique slug
 * Returns null if missing
 */
export async function getFacultyMemberBySlug(slug: string): Promise<FacultyMember | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .eq("slug", slug)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleFacultyError(err, `getFacultyMemberBySlug(${slug})`);
  }
}

/**
 * Retrieves all faculty members for a specific department
 */
export async function getFacultyByDepartment(departmentId: string): Promise<FacultyMember[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .eq("department_id", departmentId)
      .order("display_order", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleFacultyError(err, `getFacultyByDepartment(${departmentId})`);
  }
}

// --- Mutation Operations ---

/**
 * Creates a new faculty member
 */
export async function createFacultyMember(data: CreateFacultyInput): Promise<FacultyMember> {
  try {
    const { data: created, error: dbError } = await supabase
      .from("faculty_members")
      .insert(data)
      .select()
      .single();

    if (dbError) throw dbError;
    
    info(`Created new faculty member: ${created.name} (${created.id})`);
    revalidateFaculty();
    
    return created;
  } catch (err) {
    handleFacultyError(err, "createFacultyMember");
  }
}

/**
 * Updates an existing faculty member
 */
export async function updateFacultyMember(id: string, data: UpdateFacultyInput): Promise<FacultyMember> {
  try {
    const { data: updated, error: dbError } = await supabase
      .from("faculty_members")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (dbError) throw dbError;

    info(`Updated faculty member: ${id}`);
    revalidateFaculty();

    return updated;
  } catch (err) {
    handleFacultyError(err, `updateFacultyMember(${id})`);
  }
}

/**
 * Deletes a faculty member safely
 */
export async function deleteFacultyMember(id: string): Promise<void> {
  try {
    const { error: dbError } = await supabase
      .from("faculty_members")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    warn(`Deleted faculty member: ${id}`);
    revalidateFaculty();
  } catch (err) {
    handleFacultyError(err, `deleteFacultyMember(${id})`);
  }
}

// --- State Toggles (Visibility & Featured) ---

/**
 * Sets a faculty member's visibility to true
 */
export async function showFacultyMember(id: string): Promise<FacultyMember> {
  info(`Setting faculty member visibility to true: ${id}`);
  return updateFacultyMember(id, { visible: true });
}

/**
 * Sets a faculty member's visibility to false
 */
export async function hideFacultyMember(id: string): Promise<FacultyMember> {
  info(`Setting faculty member visibility to false: ${id}`);
  return updateFacultyMember(id, { visible: false });
}

/**
 * Sets a faculty member as featured
 */
export async function featureFacultyMember(id: string): Promise<FacultyMember> {
  info(`Featuring faculty member: ${id}`);
  return updateFacultyMember(id, { featured: true });
}

/**
 * Removes a faculty member from featured status
 */
export async function unfeatureFacultyMember(id: string): Promise<FacultyMember> {
  info(`Un-featuring faculty member: ${id}`);
  return updateFacultyMember(id, { featured: false });
}

// --- Search & Ordering ---

/**
 * Searches faculty members by name, designation, qualification, or specialization
 */
export async function searchFaculty(query: string): Promise<FacultyMember[]> {
  try {
    if (!query.trim()) return [];
    
    const safeQuery = `%${query.trim()}%`;
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("*")
      .or(`name.ilike.${safeQuery},designation.ilike.${safeQuery},qualification.ilike.${safeQuery},specialization.ilike.${safeQuery}`)
      .order("name", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleFacultyError(err, `searchFaculty(${query})`);
  }
}

/**
 * Updates the display order of a faculty member
 */
export async function updateFacultyOrder(id: string, displayOrder: number): Promise<FacultyMember> {
  return updateFacultyMember(id, { display_order: displayOrder });
}

// --- Helpers & Utilities ---

/**
 * Checks if a proposed slug is available (unique)
 */
export async function isFacultySlugAvailable(slug: string): Promise<boolean> {
  try {
    const { count, error: dbError } = await supabase
      .from("faculty_members")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);

    if (dbError) throw dbError;
    return count === 0;
  } catch (err) {
    handleFacultyError(err, `isFacultySlugAvailable(${slug})`);
  }
}

/**
 * Duplicates an existing faculty member with a unique slug
 */
export async function duplicateFacultyMember(id: string): Promise<FacultyMember> {
  try {
    const existing = await getFacultyMemberById(id);
    if (!existing) {
      throw new Error("Source faculty member not found for duplication");
    }

    // Omit standard unique/generated fields
    const { id: _id, created_at: _created, ...baseData } = existing;

    const copyData: CreateFacultyInput = {
      ...baseData,
      name: `${baseData.name} (Copy)`,
      slug: `${baseData.slug}-copy-${Date.now()}`,
      visible: false, // Default to hidden when duplicated
      featured: false,
    };

    info(`Duplicating faculty member: ${id} -> ${copyData.slug}`);
    return await createFacultyMember(copyData);
  } catch (err) {
    handleFacultyError(err, `duplicateFacultyMember(${id})`);
  }
}

// --- Statistics & Aggregations ---

/**
 * Retrieves holistic statistics about the faculty system
 */
export async function getFacultyStatistics(): Promise<FacultyStatistics> {
  try {
    const [totalRes, visibleRes, featuredRes, deptsRes] = await Promise.all([
      supabase.from("faculty_members").select("id", { count: "exact", head: true }),
      supabase.from("faculty_members").select("id", { count: "exact", head: true }).eq("visible", true),
      supabase.from("faculty_members").select("id", { count: "exact", head: true }).eq("featured", true),
      supabase.from("faculty_members").select("department_id"),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (visibleRes.error) throw visibleRes.error;
    if (featuredRes.error) throw featuredRes.error;
    if (deptsRes.error) throw deptsRes.error;

    // Calculate unique departments
    const uniqueDepartments = new Set(
      deptsRes.data?.map(f => f.department_id).filter(Boolean)
    ).size;

    return {
      totalFaculty: totalRes.count || 0,
      visibleFaculty: visibleRes.count || 0,
      featuredFaculty: featuredRes.count || 0,
      departmentCount: uniqueDepartments,
    };
  } catch (err) {
    handleFacultyError(err, "getFacultyStatistics");
  }
}

/**
 * Calculates the total combined experience years of all faculty
 */
export async function getFacultyExperienceYears(): Promise<number> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("experience_years")
      .not("experience_years", "is", null);

    if (dbError) throw dbError;

    return data.reduce((sum, item) => sum + (item.experience_years || 0), 0);
  } catch (err) {
    handleFacultyError(err, "getFacultyExperienceYears");
  }
}

/**
 * Retrieves a consolidated email directory of faculty
 */
export async function getFacultyEmailDirectory(): Promise<Partial<FacultyMember>[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("faculty_members")
      .select("id, name, email, department_id, designation")
      .not("email", "is", null)
      .order("name", { ascending: true });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleFacultyError(err, "getFacultyEmailDirectory");
  }
}

/**
 * Generates SEO metadata for a faculty member's profile page
 */
export function buildFacultySEO(faculty: FacultyMember): FacultySEO {
  const title = `${faculty.name} | ${faculty.designation} | Faculty Directory`;
  const fallbackDesc = `Profile of ${faculty.name}, serving as ${faculty.designation}${faculty.specialization ? ` with a specialization in ${faculty.specialization}` : ""}.`;
  
  const description = faculty.biography 
    ? (faculty.biography.length > 155 ? `${faculty.biography.substring(0, 155)}...` : faculty.biography)
    : fallbackDesc;

  return { title, description };
}

// --- Future Compatibility Placeholders ---

/**
 * TODO: Implement approval workflow for multi-tenant / robust RBAC CMS setups
 * Will manage faculty profile publishing state
 */
export async function approveFaculty(): Promise<void> {
  warn("approveFaculty is not yet implemented");
}

/**
 * TODO: Integrate with Institutional Research Portal
 * Will aggregate ORCID, Google Scholar, and internal grant data
 */
export async function facultyResearchProfile(): Promise<void> {
  warn("facultyResearchProfile is not yet implemented");
}

/**
 * TODO: Integrate with Publications Module
 * Will fetch interconnected publications for a specific faculty member
 */
export async function facultyPublications(): Promise<void> {
  warn("facultyPublications is not yet implemented");
}
