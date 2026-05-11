import { supabase } from "@/lib/supabase";

export interface GlobalConfig {
  site_name: string;
  primary_color: string;
  show_hostel: boolean;
  faculty_sort_mode: "manual" | "alphabetical" | "rank";
  // ... other fields
}

export async function getGlobalConfig() {
  const { data } = await supabase.from("site_settings").select("*").single();
  return data;
}

export async function updateConfig(updates: Partial<GlobalConfig>) {
  const { data: session } = await supabase.auth.getSession();
  if (!session) return { error: "Unauthorized" };
  return await supabase.from("site_settings").update(updates).eq("id", updates.id);
}

