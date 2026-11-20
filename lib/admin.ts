import { supabase } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth";

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
