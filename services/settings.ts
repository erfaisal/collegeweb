import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  primary_color: string;
  primary_dark: string;
  primary_light: string;
  logo_url: string;
  show_hostel: boolean;
  show_staff: boolean;
  show_notices: boolean;
  show_gallery_on_home: boolean;
  faculty_sort_mode: "manual" | "alphabetical" | "rank";
  staff_sort_mode: "manual" | "alphabetical" | "rank";
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).single();
  if (error) return null;
  return data;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{success: boolean, error?: string}> {
  try {
    const { error } = await supabase.from("site_settings").update(settings).eq("id", settings.id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
