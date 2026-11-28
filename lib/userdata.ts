import { supabase } from "@/lib/supabase/client";
import type { Resume } from "@/lib/resume";

export type AppStatus = "NEW" | "VIEWED" | "INTERVIEW" | "HIRED" | "REJECTED";

export type AppRow = {
  id: string;
  job_id: string;
  resume_id: string | null;
  job_title: string;
  company: string;
  status: AppStatus;
  letter: string;
  created_at: string;
};

export type FavRow = { job_id: string; created_at: string };

export type ResumeRow = {
  id: string;
  candidate_id: string;
  title: string;
  content: Resume;
  is_primary: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicVacancy = {
  id: string;
  title: string;
  company: string;
  city: string;
  format: "office" | "remote" | "hybrid";
  salary: string;
  level: string;
  tags: string[];
  description: string;
  reqs: string[];
  status: string;
  created_at: string;
};

const VACANCY_FIELDS = "id, title, company, city, format, salary, level, tags, description, reqs, status, moderation, created_at, expires_at";

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase().auth.getUser();
  if (error || !data.user) throw new Error("Алдымен жүйеге кіріңіз");
  return data.user.id;
}

export async function fetchApplications(): Promise<AppRow[]> {
  const { data, error } = await supabase().from("applications")
    .select("id, job_id, resume_id, job_title, company, status, letter, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppRow[];
}

export async function fetchFavorites(): Promise<FavRow[]> {
  const { data, error } = await supabase().from("favorites")
    .select("job_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FavRow[];
}

export async function fetchResumes(): Promise<ResumeRow[]> {
  const { data, error } = await supabase().from("resumes")
    .select("id, candidate_id, title, content, is_primary, archived_at, created_at, updated_at")
    .is("archived_at", null)
    .order("is_primary", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ResumeRow[];
}

export async function createResume(title: string, content: Resume): Promise<ResumeRow> {
  const candidateId = await currentUserId();
  const existing = await fetchResumes();
  if (existing.length >= 5) throw new Error("Резюме саны 5-тен аспауы керек");
  const { data, error } = await supabase().from("resumes").insert({
    candidate_id: candidateId,
    title: title.trim(),
    content,
    is_primary: existing.length === 0,
  }).select("id, candidate_id, title, content, is_primary, archived_at, created_at, updated_at").single();
  if (error) throw error;
  return data as ResumeRow;
}

export async function updateResume(id: string, title: string, content: Resume): Promise<void> {
  await currentUserId();
  const { error } = await supabase().from("resumes").update({ title: title.trim(), content }).eq("id", id);
  if (error) throw error;
}

export async function archiveResume(id: string): Promise<void> {
  await currentUserId();
  const { error } = await supabase().from("resumes").update({ archived_at: new Date().toISOString(), is_primary: false }).eq("id", id);
  if (error) throw error;
}

export async function setPrimaryResume(id: string): Promise<void> {
  const { error } = await supabase().rpc("set_primary_resume", { target: id });
  if (error) throw error;
}

export async function fetchActiveVacancies(): Promise<PublicVacancy[]> {
  const { data, error } = await supabase().from("vacancies").select(VACANCY_FIELDS)
    .eq("status", "ACTIVE").eq("moderation", "APPROVED")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const today = Date.now();
  return (data ?? []).filter((row) => !row.expires_at || new Date(row.expires_at).getTime() >= today) as PublicVacancy[];
}

export async function fetchVacancy(id: string): Promise<PublicVacancy | null> {
  const { data, error } = await supabase().from("vacancies").select(VACANCY_FIELDS)
    .eq("id", id).eq("status", "ACTIVE").eq("moderation", "APPROVED").maybeSingle();
  if (error) throw error;
  if (!data || (data.expires_at && new Date(data.expires_at).getTime() < Date.now())) return null;
  return data as PublicVacancy;
}

export async function applyToJob(job: { id: string }, resumeId: string, letter: string): Promise<void> {
  if (!resumeId) throw new Error("Өтінімге резюме таңдаңыз");
  await currentUserId();
  const { error } = await supabase().from("applications").insert({
    job_id: job.id,
    resume_id: resumeId,
    letter: letter.trim(),
  });
  if (error) {
    if (error.code === "23505") throw new Error("Бұл вакансияға өтінім бұрын жіберілген");
    throw error;
  }
}

export async function setFavorite(jobId: string, on: boolean): Promise<void> {
  const candidateId = await currentUserId();
  const client = supabase();
  const result = on
    ? await client.from("favorites").upsert({ candidate_id: candidateId, job_id: jobId })
    : await client.from("favorites").delete().eq("candidate_id", candidateId).eq("job_id", jobId);
  if (result.error) throw result.error;
}
