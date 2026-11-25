import { supabase } from "@/lib/supabase/client";
import type { Resume } from "@/lib/resume";

export type AppStatus =
  | "NEW"
  | "VIEWED"
  | "INTERVIEW"
  | "HIRED"
  | "REJECTED";

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

export type FavRow = {
  job_id: string;
  created_at: string;
};

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

async function currentUserId() {
  const { data, error } = await supabase().auth.getUser();

  if (error || !data.user) {
    throw new Error("Алдымен жүйеге кіріңіз");
  }

  return data.user.id;
}

export async function fetchApplications(): Promise<AppRow[]> {
  const { data, error } = await supabase()
    .from("applications")
    .select(
      "id, job_id, resume_id, job_title, company, status, letter, created_at",
    )
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

export async function fetchResumes(): Promise<ResumeRow[]> {
  const { data, error } = await supabase()
    .from("resumes")
    .select(
      "id, candidate_id, title, content, is_primary, archived_at, created_at, updated_at",
    )
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResumeRow[];
}

export async function createResume(title: string, content: Resume) {
  const candidateId = await currentUserId();

  const { data, error } = await supabase()
    .from("resumes")
    .insert({
      candidate_id: candidateId,
      title: title.trim(),
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ResumeRow;
}

export async function applyToJob(
  job: { id: string; title: string; company: string },
  resumeId: string,
  letter: string,
) {
  if (!resumeId) {
    throw new Error("Өтінімге резюме таңдаңыз");
  }

  const candidateId = await currentUserId();

  const { error } = await supabase()
    .from("applications")
    .insert({
      candidate_id: candidateId,
      job_id: job.id,
      resume_id: resumeId,
      job_title: job.title,
      company: job.company,
      letter: letter.trim(),
    });

  if (error) {
    if (error.code === "23505") {
      throw new Error("Бұл вакансияға өтінім бұрын жіберілген");
    }
    throw error;
  }
}

export async function setFavorite(jobId: string, on: boolean) {
  const candidateId = await currentUserId();
  const client = supabase();

  const result = on
    ? await client
        .from("favorites")
        .upsert({ candidate_id: candidateId, job_id: jobId })
    : await client
        .from("favorites")
        .delete()
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId);

  if (result.error) throw result.error;
}
