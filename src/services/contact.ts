import supabase from "@/lib/supabase";
import { info, warn, error } from "@/lib/logger";
import { Database } from "@/types/database";

// --- Types ---

export type ContactStatus = "new" | "reviewed" | "replied" | "closed";

export type ContactInquiry = Database["public"]["Tables"]["contact_inquiries"]["Row"];
export type CreateContactInput = Database["public"]["Tables"]["contact_inquiries"]["Insert"];
export type UpdateContactInput = Database["public"]["Tables"]["contact_inquiries"]["Update"];

export interface ContactStatistics {
  totalInquiries: number;
  newInquiries: number;
  reviewedInquiries: number;
  repliedInquiries: number;
  closedInquiries: number;
}

// --- Error Handling ---

/**
 * Safely serializes and logs contact-related errors
 */
function handleContactError(err: unknown, context: string): never {
  const serialized = err instanceof Error ? err.message : JSON.stringify(err);
  error(`Contact Service Error [${context}]: ${serialized}`, { error: err });
  throw new Error(`Contact Service Failure: ${serialized}`);
}

// --- Fetch Operations ---

/**
 * Retrieves all contact inquiries, ordered by newest first
 */
export async function getContactInquiries(): Promise<ContactInquiry[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleContactError(err, "getContactInquiries");
  }
}

/**
 * Retrieves a specific contact inquiry by its UUID
 */
export async function getContactInquiryById(id: string): Promise<ContactInquiry | null> {
  try {
    const { data, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError && dbError.code !== "PGRST116") throw dbError;
    return data || null;
  } catch (err) {
    handleContactError(err, `getContactInquiryById(${id})`);
  }
}

/**
 * Retrieves a limited list of the most recent contact inquiries
 */
export async function getRecentContactInquiries(limit: number): Promise<ContactInquiry[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleContactError(err, `getRecentContactInquiries(${limit})`);
  }
}

// --- Mutation Operations ---

/**
 * Creates a new contact inquiry
 */
export async function createContactInquiry(data: CreateContactInput): Promise<ContactInquiry> {
  try {
    const payload = { ...data, status: data.status || "new" };

    const { data: created, error: dbError } = await supabase
      .from("contact_inquiries")
      .insert(payload)
      .select()
      .single();

    if (dbError) throw dbError;

    info(`Created new contact inquiry: ${created.name} (${created.id})`);
    return created;
  } catch (err) {
    handleContactError(err, "createContactInquiry");
  }
}

/**
 * Updates an existing contact inquiry
 */
export async function updateContactInquiry(id: string, data: UpdateContactInput): Promise<ContactInquiry> {
  try {
    const { data: updated, error: dbError } = await supabase
      .from("contact_inquiries")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (dbError) throw dbError;

    return updated;
  } catch (err) {
    handleContactError(err, `updateContactInquiry(${id})`);
  }
}

/**
 * Deletes a contact inquiry safely
 */
export async function deleteContactInquiry(id: string): Promise<void> {
  try {
    const { error: dbError } = await supabase
      .from("contact_inquiries")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    warn(`Deleted contact inquiry: ${id}`);
  } catch (err) {
    handleContactError(err, `deleteContactInquiry(${id})`);
  }
}

// --- Status Updates ---

/**
 * Generic helper to update contact inquiry status
 */
export async function updateContactInquiryStatus(id: string, status: ContactStatus): Promise<ContactInquiry> {
  info(`Updating contact inquiry ${id} status to: ${status}`);
  return updateContactInquiry(id, { status });
}

export async function markInquiryReviewed(id: string): Promise<ContactInquiry> {
  return updateContactInquiryStatus(id, "reviewed");
}

export async function markInquiryReplied(id: string): Promise<ContactInquiry> {
  return updateContactInquiryStatus(id, "replied");
}

export async function markInquiryClosed(id: string): Promise<ContactInquiry> {
  return updateContactInquiryStatus(id, "closed");
}

// --- Filters & Search ---

/**
 * Fetches inquiries by a specific status
 */
async function getInquiriesByStatus(status: ContactStatus): Promise<ContactInquiry[]> {
  try {
    const { data, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleContactError(err, `getInquiriesByStatus(${status})`);
  }
}

export async function getNewContactInquiries(): Promise<ContactInquiry[]> {
  return getInquiriesByStatus("new");
}

export async function getReviewedContactInquiries(): Promise<ContactInquiry[]> {
  return getInquiriesByStatus("reviewed");
}

export async function getClosedContactInquiries(): Promise<ContactInquiry[]> {
  return getInquiriesByStatus("closed");
}

/**
 * Searches contact inquiries by multiple text fields
 */
export async function searchContactInquiries(query: string): Promise<ContactInquiry[]> {
  try {
    if (!query.trim()) return [];

    const safeQuery = `%${query.trim()}%`;
    const { data, error: dbError } = await supabase
      .from("contact_inquiries")
      .select("*")
      .or(`name.ilike.${safeQuery},email.ilike.${safeQuery},subject.ilike.${safeQuery},message.ilike.${safeQuery}`)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    return data || [];
  } catch (err) {
    handleContactError(err, `searchContactInquiries(${query})`);
  }
}

// --- Statistics & Metrics ---

/**
 * Retrieves holistic statistics for the contact dashboard
 */
export async function getContactStatistics(): Promise<ContactStatistics> {
  try {
    const [
      totalRes, 
      newRes, 
      reviewedRes, 
      repliedRes, 
      closedRes
    ] = await Promise.all([
      supabase.from("contact_inquiries").select("id", { count: "exact", head: true }),
      supabase.from("contact_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("contact_inquiries").select("id", { count: "exact", head: true }).eq("status", "reviewed"),
      supabase.from("contact_inquiries").select("id", { count: "exact", head: true }).eq("status", "replied"),
      supabase.from("contact_inquiries").select("id", { count: "exact", head: true }).eq("status", "closed"),
    ]);

    if (totalRes.error) throw totalRes.error;

    return {
      totalInquiries: totalRes.count || 0,
      newInquiries: newRes.count || 0,
      reviewedInquiries: reviewedRes.count || 0,
      repliedInquiries: repliedRes.count || 0,
      closedInquiries: closedRes.count || 0,
    };
  } catch (err) {
    handleContactError(err, "getContactStatistics");
  }
}

/**
 * Returns the contact response rate percentage (Replied + Closed / Total)
 */
export async function getContactResponseRate(): Promise<number> {
  try {
    const stats = await getContactStatistics();
    if (stats.totalInquiries === 0) return 0;

    const responded = stats.repliedInquiries + stats.closedInquiries;
    const rate = (responded / stats.totalInquiries) * 100;
    return parseFloat(rate.toFixed(2));
  } catch (err) {
    handleContactError(err, "getContactResponseRate");
  }
}

// --- Export Helper ---

/**
 * Returns a formatted array of contact inquiries suitable for CSV export
 */
export async function exportContactInquiries(): Promise<Record<string, string | number>[]> {
  try {
    const inquiries = await getContactInquiries();
    
    return inquiries.map((inquiry) => ({
      ID: inquiry.id,
      Name: inquiry.name,
      Email: inquiry.email,
      Phone: inquiry.phone || "N/A",
      Subject: inquiry.subject || "N/A",
      Status: inquiry.status.toUpperCase(),
      "Message Length": inquiry.message ? inquiry.message.length : 0,
      "Date Submitted": new Date(inquiry.created_at).toISOString(),
    }));
  } catch (err) {
    handleContactError(err, "exportContactInquiries");
  }
}

// --- Future Compatibility Placeholders ---

/**
 * TODO: Integrate with support ticketing systems (e.g., Zendesk, Jira)
 * Will assign a specific support agent to the inquiry
 */
export async function assignSupportAgent(inquiryId: string, agentId: string): Promise<void> {
  warn(`assignSupportAgent is not yet implemented (Inquiry: ${inquiryId}, Agent: ${agentId})`);
}

/**
 * TODO: Integrate with Email Automation System (SendGrid/Resend)
 * Will send automated email replies to the contact inquiry
 */
export async function sendEmailReply(inquiryId: string, emailContent: string): Promise<void> {
  warn(`sendEmailReply is not yet implemented (Inquiry: ${inquiryId})`);
}

/**
 * TODO: Integrate with WhatsApp Business API (Twilio/Meta)
 * Will send automated WhatsApp updates if a phone number was provided
 */
export async function sendWhatsAppReply(inquiryId: string, messageTemplate: string): Promise<void> {
  warn(`sendWhatsAppReply is not yet implemented (Inquiry: ${inquiryId})`);
}

/**
 * TODO: Integrate with advanced Support Ticketing
 * Converts a standard contact form submission into a trackable support ticket
 */
export async function createSupportTicket(inquiryId: string): Promise<void> {
  warn(`createSupportTicket is not yet implemented (Inquiry: ${inquiryId})`);
}
