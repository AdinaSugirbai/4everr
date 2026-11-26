import { supabase } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth";

export type AppStatus = "NEW" | "VIEWED" | "INTERVIEW" | "HIRED" | "REJECTED";

export async function updateProfileName(id: string, name: string) {
  const { error } = await supabase().rpc("admin_update_profile_name", { target: id, new_name: name.trim() });
  if (error) throw error;
}
export async function updateVacancy(id: string, fields: { title: string; company: string; city: string; salary: string; level: string }) {
  const { error } = await supabase().rpc("admin_update_vacancy", {
    target: id,
    new_title: fields.title.trim(),
    new_company: fields.company.trim(),
    new_city: fields.city.trim(),
    new_salary: fields.salary.trim(),
    new_level: fields.level.trim(),
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
export async function deleteUser(id: string) {
  const { error } = await supabase().rpc("admin_delete_user", { target: id });
  if (error) throw error;
}
export async function setVacancyStatus(id: string, status: "ACTIVE" | "PAUSED") {
  const { error } = await supabase().rpc("admin_set_vacancy_status", { target: id, new_status: status });
  if (error) throw error;
}
export async function deleteVacancy(id: string) {
  const { error } = await supabase().rpc("admin_delete_vacancy", { target: id });
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

/**
 * Sets a new password for another user. The old password cannot be read: Supabase stores only a hash.
 * The browser sends the admin's session cookie; the server checks the role and does the change.
 * Throws an Error whose message is an error code (see PW_ERRORS in app/admin/users/page.tsx).
 */
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
    
export async function updateUser(id: string, name: string, phone: string, city: string) {
  const { error } = await supabase().rpc("admin_update_user", { target: id, p_name: name, p_phone: phone, p_city: city });
  if (error) throw error;
}
  }
}
