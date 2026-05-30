import supabase from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { Database } from "@/types/database";

// --- Types ---

export type InquiryStatus = "new" | "contacted" | "pending" | "admitted" | "rejected";

export type AdmissionInquiry = Database["public"]["Tables"]["admission_inquiries"]["Row"];
export type CreateInquiryInput = Database["public"]["Tables"]["admission_inquiries"]["Insert"];
export type UpdateInquiryInput = Database["public"]["Tables"]["admission_inquiries"]["Update"];

export interface AdmissionStatistics {
  totalInquiries: number;
  newInquiries: number;
  contactedInquiries: number;
  pendingInquiries: number;
  admittedInquiries: number;
  rejectedInquiries: number;
}

// --- Error Handling ---

/**
 * Safely serializes and logs admissions-related errors
 */
function handleAdmissionError(err: unknown, context: string): never {
  const serialized = err instanceof Error ? err.message : JSON.stringify(err);
  error(`Admissions Service Error [${context}]: ${serialized}`, { error: err });
  throw new Error(`Admissions Service Failure: ${serialized}`);
}

// --- Fetch Operations ---

/**
 * Retrieves all admission inquiries, ordered by newest first
 */
export async function getAdmissionInquiries(): Promise<AdmissionInquiry[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("admission_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAdmissionError(err, "getAdmissionInquiries");
  }
}

/**
 * Retrieves a specific admission inquiry by its UUID
 */
export async function getAdmissionInquiryById(id: string): Promise<AdmissionInquiry | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("admission_inquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleAdmissionError(err, `getAdmissionInquiryById(${id})`);
  }
}

// --- Mutation Operations ---

/**
 * Creates a new admission inquiry
 */
export async function createAdmissionInquiry(data: CreateInquiryInput): Promise<AdmissionInquiry> {
  try {
    // Ensure default status if not provided
    const payload = { ...data, status: data.status || "new" };

    const { data: created, error: dbError } = await supabase
      .from("admission_inquiries")
      .insert(payload)
      .select()
      .single();

    if (dbError) throw dbError;

    info(`Created new admission inquiry: ${created.student_name} (${created.id})`);
    return created;
  } catch (err) {
    handleAdmissionError(err, "createAdmissionInquiry");
  }
}

/**
 * Updates an existing admission inquiry
 */
export async function updateAdmissionInquiry(id: string, data: UpdateInquiryInput): Promise<AdmissionInquiry> {
  try {
    const { data: updated, error: dbError } = await supabase
      .from("admission_inquiries")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (dbError) throw dbError;

    info(`Updated admission inquiry: ${id}`);
    return updated;
  } catch (err) {
    handleAdmissionError(err, `updateAdmissionInquiry(${id})`);
  }
}

/**
 * Deletes an admission inquiry safely
 */
export async function deleteAdmissionInquiry(id: string): Promise<void> {
  try {
    const { error: dbError } = await supabase
      .from("admission_inquiries")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    warn(`Deleted admission inquiry: ${id}`);
  } catch (err) {
    handleAdmissionError(err, `deleteAdmissionInquiry(${id})`);
  }
}

// --- Status Updates ---

/**
 * Generic helper to update inquiry status
 */
export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<AdmissionInquiry> {
  info(`Updating inquiry ${id} status to: ${status}`);
  return updateAdmissionInquiry(id, { status });
}

export async function markInquiryNew(id: string): Promise<AdmissionInquiry> {
  return updateInquiryStatus(id, "new");
}

export async function markInquiryContacted(id: string): Promise<AdmissionInquiry> {
  return updateInquiryStatus(id, "contacted");
}

export async function markInquiryPending(id: string): Promise<AdmissionInquiry> {
  return updateInquiryStatus(id, "pending");
}

export async function markInquiryAdmitted(id: string): Promise<AdmissionInquiry> {
  return updateInquiryStatus(id, "admitted");
}

export async function markInquiryRejected(id: string): Promise<AdmissionInquiry> {
  return updateInquiryStatus(id, "rejected");
}

// --- Filters & Search ---

/**
 * Fetches inquiries by a specific status
 */
export async function getInquiriesByStatus(status: InquiryStatus): Promise<AdmissionInquiry[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("admission_inquiries")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAdmissionError(err, `getInquiriesByStatus(${status})`);
  }
}

export async function getNewInquiries(): Promise<AdmissionInquiry[]> {
  return getInquiriesByStatus("new");
}

export async function getPendingInquiries(): Promise<AdmissionInquiry[]> {
  return getInquiriesByStatus("pending");
}

export async function getAdmittedInquiries(): Promise<AdmissionInquiry[]> {
  return getInquiriesByStatus("admitted");
}

/**
 * Searches admission inquiries by multiple text fields
 */
export async function searchAdmissionInquiries(query: string): Promise<AdmissionInquiry[]> {
  try {
    if (!query.trim()) return [];

    const safeQuery = `%${query.trim()}%`;
    const { data, error: dbError } = await supabase
      .from("admission_inquiries")
      .select("*")
      .or(`student_name.ilike.${safeQuery},email.ilike.${safeQuery},phone.ilike.${safeQuery},course.ilike.${safeQuery}`)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleAdmissionError(err, `searchAdmissionInquiries(${query})`);
  }
}

// --- Statistics & Metrics ---

/**
 * Retrieves holistic statistics for the CRM dashboard
 */
export async function getAdmissionStatistics(): Promise<AdmissionStatistics> {
  try {
    const [totalRes, newRes, contactedRes, pendingRes, admittedRes, rejectedRes] = await Promise.all([
      supabase.from("admission_inquiries").select("id", { count: "exact", head: true }),
      supabase.from("admission_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("admission_inquiries").select("id", { count: "exact", head: true }).eq("status", "contacted"),
      supabase.from("admission_inquiries").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("admission_inquiries").select("id", { count: "exact", head: true }).eq("status", "admitted"),
      supabase.from("admission_inquiries").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);

    if (totalRes.error) throw totalRes.error;

    return {
      totalInquiries: totalRes.count || 0,
      newInquiries: newRes.count || 0,
      contactedInquiries: contactedRes.count || 0,
      pendingInquiries: pendingRes.count || 0,
      admittedInquiries: admittedRes.count || 0,
      rejectedInquiries: rejectedRes.count || 0,
    };
  } catch (err) {
    handleAdmissionError(err, "getAdmissionStatistics");
  }
}

/**
 * Returns the conversion rate percentage (Admitted / Total)
 */
export async function getAdmissionConversionRate(): Promise<number> {
  try {
    const stats = await getAdmissionStatistics();
    if (stats.totalInquiries === 0) return 0;

    const rate = (stats.admittedInquiries / stats.totalInquiries) * 100;
    return parseFloat(rate.toFixed(2));
  } catch (err) {
    handleAdmissionError(err, "getAdmissionConversionRate");
  }
}

// --- Export Helper ---

/**
 * Returns a formatted array of admissions suitable for CSV export
 */
export async function exportAdmissions(): Promise<Record<string, string | number | null>[]> {
  try {
    const inquiries = await getAdmissionInquiries();
    
    return inquiries.map((inquiry) => ({
      ID: inquiry.id,
      "Student Name": inquiry.student_name,
      Email: inquiry.email,
      Phone: inquiry.phone,
      Course: inquiry.course,
      Status: inquiry.status.toUpperCase(),
      "Message Length": inquiry.message?.length || 0,
      "Date Submitted": new Date(inquiry.created_at).toISOString(),
    }));
  } catch (err) {
    handleAdmissionError(err, "exportAdmissions");
  }
}

// --- Future Compatibility Placeholders ---

/**
 * TODO: Integrate with CRM Counselor assignment system
 * Will assign a specific staff member to handle the inquiry
 */
export async function assignCounselor(inquiryId: string, counselorId: string): Promise<void> {
  warn(`assignCounselor is not yet implemented (Inquiry: ${inquiryId}, Counselor: ${counselorId})`);
}

/**
 * TODO: Integrate with Email Automation System (SendGrid/Resend)
 * Will send automated follow-up emails based on status
 */
export async function sendEmailFollowUp(inquiryId: string, templateId: string): Promise<void> {
  warn(`sendEmailFollowUp is not yet implemented (Inquiry: ${inquiryId}, Template: ${templateId})`);
}

/**
 * TODO: Integrate with WhatsApp Business API (Twilio/Meta)
 * Will send automated WhatsApp status updates to the prospective student
 */
export async function sendWhatsAppFollowUp(inquiryId: string, messageTemplate: string): Promise<void> {
  warn(`sendWhatsAppFollowUp is not yet implemented (Inquiry: ${inquiryId})`);
}

/**
 * TODO: Integrate with Calendar System (Google Calendar/Outlook)
 * Will schedule a video or in-person counseling session
 */
export async function scheduleCounseling(inquiryId: string, date: string): Promise<void> {
  warn(`scheduleCounseling is not yet implemented (Inquiry: ${inquiryId}, Date: ${date})`);
}
