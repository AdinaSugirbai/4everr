import { supabase } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth";

export type AppStatus = "NEW" | "VIEWED" | "INTERVIEW" | "HIRED" | "REJECTED";

export async function updateProfileName(id: string, name: string) {
  const { error } = await supabase().rpc("admin_update_profile_name", {
    target: id,
    new_name: name.trim(),
  });
  if (error) throw error;
}

export type ProfileDetails = {
  name: string;
  phone: string;
  city: string;
  companyName: string;
  companyAbout: string;
  contactPhone: string;
  bin: string;
};

export async function updateProfileDetails(id: string, profile: ProfileDetails) {
  const { error } = await supabase().rpc("admin_update_profile_details", {
    target: id,
    p_name: profile.name.trim(),
    p_phone: profile.phone.trim(),
    p_city: profile.city.trim(),
    p_company_name: profile.companyName.trim(),
    p_company_about: profile.companyAbout.trim(),
    p_contact_phone: profile.contactPhone.trim(),
    p_bin: profile.bin.trim(),
  });
  if (error) throw error;
}

export async function archiveUser(id: string, reason: string) {
  const { error } = await supabase().rpc("admin_archive_user", {
    target: id,
    reason: reason.trim(),
  });
  if (error) throw error;
}

export async function restoreUser(id: string) {
  const { error } = await supabase().rpc("admin_restore_user", { target: id });
  if (error) throw error;
}

export async function adminReviewEmployer(id: string, verified: boolean, reference: string, notes: string) {
  const { error } = await supabase().rpc("admin_review_employer", {
    target: id,
    is_verified: verified,
    p_reference: reference.trim(),
    p_notes: notes.trim(),
  });
  if (error) throw error;
}

export async function setRole(id: string, role: Role) {
  const { error } = await supabase().rpc("admin_set_role", { target: id, new_role: role });
  if (error) throw error;
}

export async function setBanned(id: string, banned: boolean) {
  const { error } = await supabase().rpc("admin_set_banned", { target: id, is_banned: banned });
  if (error) throw error;
}

export async function setAppStatus(id: string, status: AppStatus) {
  const { error } = await supabase().rpc("admin_set_app_status", { target: id, new_status: status });
  if (error) throw error;
}

export async function getStats() {
  const { data, error } = await supabase().rpc("admin_stats");
  if (error) throw error;
  return data as Record<string, number>;
}

export async function deleteApplication(id: string) {
  const { error } = await supabase().rpc("admin_delete_application", { target: id });
  if (error) throw error;
}

/** Sets a user password through the authenticated server route. */
export async function setUserPassword(userId: string, password: string) {
  const res = await fetch("/api/admin/set-password", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "failed");
  }
}
