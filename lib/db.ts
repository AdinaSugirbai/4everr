import { supabase } from "@/lib/supabase/client";

export type CompanyInfo = {
  id: string;
  name: string;
  industry: string;
  city: string;
  size: string;
  website: string;
  about: string;
  phone: string;
  bin: string;
  verified: boolean;
  verificationRequestedAt: string | null;
  verificationReference: string;
  verificationNotes: string;
};

export type CompanyDraft = Pick<CompanyInfo, "name" | "industry" | "city" | "size" | "website" | "about" | "phone" | "bin">;
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type DbJob = {
  id: string;
  employerId: string;
  title: string;
  company: string;
  city: string;
  format: "office" | "remote" | "hybrid";
  salary: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryTax: string;
  level: string;
  direction: string | null;
  tags: string[];
  description: string;
  requirements: string[];
  experience: string;
  employment: string;
  address: string;
  questions: string[];
  status: string;
  moderation: ModerationStatus;
  expiresAt: string | null;
  views: number;
  createdAt: string;
};

export type NewJob = Omit<DbJob, "id" | "employerId" | "company" | "status" | "moderation" | "expiresAt" | "views" | "createdAt"> & {
  company?: string;
};

type CompanyRow = {
  id: string; company_name: string | null; company_industry: string | null; city: string | null;
  company_size: string | null; company_website: string | null; company_about: string | null;
  contact_phone: string | null; bin: string | null; verified: boolean | null;
  verification_requested_at: string | null; verification_reference: string | null; verification_notes: string | null;
};

function toCompany(row: CompanyRow): CompanyInfo {
  return {
    id: row.id,
    name: row.company_name ?? "",
    industry: row.company_industry ?? "",
    city: row.city ?? "",
    size: row.company_size ?? "",
    website: row.company_website ?? "",
    about: row.company_about ?? "",
    phone: row.contact_phone ?? "",
    bin: row.bin ?? "",
    verified: Boolean(row.verified),
    verificationRequestedAt: row.verification_requested_at,
    verificationReference: row.verification_reference ?? "",
    verificationNotes: row.verification_notes ?? "",
  };
}

export async function fetchCompany(userId: string): Promise<CompanyInfo> {
  const { data, error } = await supabase().from("profiles")
    .select("id, company_name, company_industry, city, company_size, company_website, company_about, contact_phone, bin, verified, verification_requested_at, verification_reference, verification_notes")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return toCompany(data as CompanyRow);
}

export async function updateCompany(userId: string, company: CompanyDraft) {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error("Өз компанияңыздың деректерін ғана өзгерте аласыз");
  const { error } = await supabase().rpc("update_my_company_profile", {
    p_name: company.name.trim(),
    p_industry: company.industry.trim(),
    p_city: company.city.trim(),
    p_size: company.size.trim(),
    p_website: company.website.trim(),
    p_about: company.about.trim(),
    p_phone: company.phone.trim(),
    p_bin: company.bin.replace(/\D/g, ""),
  });
  if (error) throw error;
}

export async function requestCompanyVerification() {
  const { error } = await supabase().rpc("request_my_employer_verification");
  if (error) throw error;
}

export async function fetchDirections(): Promise<string[]> {
  const { data, error } = await supabase().from("it_directions").select("name").order("position");
  if (error) throw error;
  return (data ?? []).map((row) => row.name as string);
}

function toJob(row: Record<string, unknown>): DbJob {
  return {
    id: String(row.id),
    employerId: String(row.employer_id ?? ""),
    title: String(row.title ?? ""),
    company: String(row.company ?? ""),
    city: String(row.city ?? ""),
    format: (row.format as DbJob["format"]) ?? "office",
    salary: String(row.salary ?? ""),
    salaryFrom: row.salary_from == null ? null : Number(row.salary_from),
    salaryTo: row.salary_to == null ? null : Number(row.salary_to),
    salaryTax: String(row.salary_tax ?? "GROSS"),
    level: String(row.level ?? ""),
    direction: row.direction == null ? null : String(row.direction),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    description: String(row.description ?? ""),
    requirements: Array.isArray(row.reqs) ? row.reqs.map(String) : [],
    experience: String(row.experience ?? "NONE"),
    employment: String(row.employment ?? "FULL"),
    address: String(row.address ?? ""),
    questions: Array.isArray(row.questions) ? row.questions.map(String) : [],
    status: String(row.status ?? "ACTIVE"),
    moderation: (row.moderation as ModerationStatus) ?? "PENDING",
    expiresAt: row.expires_at == null ? null : String(row.expires_at),
    views: Number(row.views ?? 0),
    createdAt: String(row.created_at ?? ""),
  };
}

const JOB_FIELDS = "id, employer_id, title, company, city, format, salary, salary_from, salary_to, salary_tax, level, direction, tags, description, reqs, experience, employment, address, questions, status, moderation, expires_at, views, created_at";

export async function createJob(userId: string, job: NewJob) {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error("Жүйеге қайта кіріп көріңіз");
  const { data: company, error: companyError } = await supabase().from("profiles")
    .select("role, verified, banned")
    .eq("id", userId)
    .single();
  if (companyError) throw companyError;
  if (company.role !== "EMPLOYER" || company.banned || !company.verified) {
    throw new Error("Компания расталмайынша вакансия жариялай алмайсыз");
  }

  const { error } = await supabase().from("vacancies").insert({
    title: job.title.trim(),
    company: job.company?.trim() ?? "",
    city: job.city.trim(),
    format: job.format,
    salary: job.salary,
    salary_from: job.salaryFrom,
    salary_to: job.salaryTo,
    salary_tax: job.salaryTax,
    level: job.level,
    direction: job.direction,
    tags: job.tags,
    description: job.description,
    reqs: job.requirements,
    experience: job.experience,
    employment: job.employment,
    address: job.address,
    questions: job.questions,
    employer_id: userId,
    moderation: "PENDING",
    status: "ACTIVE",
  });
  if (error) throw error;
}

export async function fetchMyJobs(userId: string): Promise<DbJob[]> {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error("Өз вакансияларыңызды ғана қарай аласыз");
  const { data, error } = await supabase().from("vacancies").select(JOB_FIELDS)
    .eq("employer_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => toJob(row as Record<string, unknown>));
}

export async function fetchReceivedApplications(userId: string): Promise<{ vacancyId: string; status: string }[]> {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error("Өтінімдерге қол жеткізу жоқ");
  const { data, error } = await supabase().from("applications").select("job_id, status")
    .eq("employer_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => ({ vacancyId: String(row.job_id), status: String(row.status) }));
}

/** Employer deletion is reversible: hide the vacancy from public lists and keep its history. */
export async function deleteMyJob(id: string) {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || !auth.user) throw new Error("Алдымен жүйеге кіріңіз");
  const { error } = await supabase().from("vacancies").update({ status: "PAUSED" })
    .eq("id", id).eq("employer_id", auth.user.id);
  if (error) throw error;
}

export async function fetchMyJob(id: string, userId: string): Promise<DbJob> {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error("Вакансияға қол жеткізу жоқ");
  const { data, error } = await supabase().from("vacancies").select(JOB_FIELDS)
    .eq("id", id).eq("employer_id", userId).single();
  if (error) throw error;
  return toJob(data as Record<string, unknown>);
}

export async function updateMyJob(id: string, userId: string, job: NewJob) {
  const { data: auth, error: authError } = await supabase().auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error("Вакансияны өзгертуге рұқсат жоқ");
  const { error } = await supabase().from("vacancies").update({
    title: job.title.trim(), city: job.city.trim(), format: job.format, salary: job.salary,
    salary_from: job.salaryFrom, salary_to: job.salaryTo, salary_tax: job.salaryTax,
    level: job.level, direction: job.direction, tags: job.tags, description: job.description,
    reqs: job.requirements, experience: job.experience, employment: job.employment,
    address: job.address, questions: job.questions,
  }).eq("id", id).eq("employer_id", userId);
  if (error) throw error;
}
