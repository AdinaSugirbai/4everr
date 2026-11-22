import { supabase } from "@/lib/supabase/client";

export type AppStatus = "NEW" | "VIEWED" | "INTERVIEW" | "HIRED" | "REJECTED";
export type AppRow = {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  status: AppStatus;
  letter: string;
  created_at: string;
};
export type FavRow = { job_id: string; created_at: string };

async function currentUserId() {
  const { data } = await supabase().auth.getUser();
  if (!data.user) throw new Error("Алдымен жүйеге кіріңіз");
  return data.user.id;
}

export async function fetchApplications(): Promise<AppRow[]> {
  const { data, error } = await supabase()
    .from("applications")
    .select("id, job_id, job_title, company, status, letter, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppRow[];
}

export async function fetchFavorites(): Promise<FavRow[]> {
  const { data, error } = await supabase()
    .from("favorites")
    .select("job_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FavRow[];
}

export async function applyToJob(job: { id: string; title: string; company: string }, letter: string) {
  const uid = await currentUserId();
  const { error } = await supabase().from("applications").insert({
    candidate_id: uid,
    job_id: job.id,
    job_title: job.title,
    company: job.company,
    letter,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Бұл вакансияға өтінім бұрын жіберілген");
    throw error;
  }
}

export async function setFavorite(jobId: string, on: boolean) {
  const uid = await currentUserId();
  const client = supabase();
  const res = on
    ? await client.from("favorites").upsert({ candidate_id: uid, job_id: jobId })
    : await client.from("favorites").delete().eq("candidate_id", uid).eq("job_id", jobId);
  if (res.error) throw res.error;
}
export type PublicVacancy = {
  id: string;
  title: string;
  company: string;
  city: string;
  format: string;
  salary: string;
  level: string;
  tags: string[];
  description: string;
  status: "ACTIVE" | "PAUSED";
  created_at: string;
};

export async function fetchActiveVacancies(): Promise<PublicVacancy[]> {
  const { data, error } = await supabase()
    .from("vacancies")
    .select("id, title, company, city, format, salary, level, tags, description, status, created_at")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PublicVacancy[];
}

export async function fetchVacancy(id: string): Promise<PublicVacancy | null> {
  const { data, error } = await supabase()
    .from("vacancies")
    .select("id, title, company, city, format, salary, level, tags, description, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as PublicVacancy | null;
}