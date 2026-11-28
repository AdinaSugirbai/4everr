import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Same rules as pwOk() in lib/auth.tsx. Repeated here because lib/auth.tsx is a client module.
function passwordOk(p: string) {
  return p.length >= 6 && /\p{L}/u.test(p) && /\d/.test(p) && /[^\p{L}\d\s]/u.test(p);
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let body: { userId?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }
  const userId = typeof body.userId === "string" ? body.userId : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!userId || !passwordOk(password)) return fail("bad_request", 400);

  // 1. The caller must be a signed-in admin. The session comes from the browser cookie.
  const server = await supabaseServer();
  const { data: auth } = await server.auth.getUser();
  if (!auth.user) return fail("unauthorized", 401);
  const { data: me } = await server.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (me?.role !== "ADMIN") return fail("forbidden", 403);
  if (userId === auth.user.id) return fail("self", 400);

  // 2. The service-role key is needed only here, on the server.
  const admin = supabaseAdmin();
  if (!admin) return fail("no_service_key", 500);

  // 3. The target must exist and must not be an admin.
  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!target) return fail("not_found", 404);
  if (target.role === "ADMIN") return fail("target_admin", 403);

  // 4. Set the new password. Supabase keeps only a hash, so the old password is never revealed.
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return fail("failed", 500);

  await admin.from("admin_log").insert({
    admin_id: auth.user.id,
    action: "RESET_PASSWORD",
    target_id: userId,
    details: "password set by admin",
  });
  return NextResponse.json({ ok: true });
}
