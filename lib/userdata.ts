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

export type ResumeData = {
  name: string;
  email: string;
  position: string;
  city: string;
  phone: string;
  about: string;
  education: string;
  skills: unknown;
  photo: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export async function applyToJob(
  job: { id: string; title: string; company: string },
  letter: string,
  resume: ResumeData,
) {
  const uid = await currentUserId();
  const { error } = await supabase().from("applications").insert({
    candidate_id: uid,
    job_id: job.id,
    vacancy_id: UUID_RE.test(job.id) ? job.id : null,
    job_title: job.title,
    company: job.company,
    letter,
    cover: letter,
    name: resume.name,
    email: resume.email,
    position: resume.position,
    city: resume.city,
    phone: resume.phone,
    about: resume.about,
    education: resume.education,
    skills: resume.skills,
    photo: resume.photo,
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