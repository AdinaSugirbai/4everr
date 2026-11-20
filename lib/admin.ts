import { supabase } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth";

export type AppStatus = "NEW" | "VIEWED" | "INTERVIEW" | "HIRED" | "REJECTED";

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
