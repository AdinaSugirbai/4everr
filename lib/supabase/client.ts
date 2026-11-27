import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
export const hasSupabaseConfig = Boolean(
  projectUrl.startsWith("https://") && publicKey.length > 30 && !/placeholder|your[-_ ]/i.test(publicKey),
);

let client: SupabaseClient | null = null;
export const supabase = () => {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase баптауы жоқ. .env.local файлына project URL мен anon public key қосып, серверді қайта іске қосыңыз.");
  }
  client ??= createBrowserClient(projectUrl, publicKey);
  return client;
};
