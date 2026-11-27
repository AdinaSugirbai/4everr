import { supabase } from "@/lib/supabase/client";
import { tests, surveys, type Test, type Survey } from "@/lib/quizdata";

export type AssessmentKind = "test" | "survey";
export type Assessment = Test | Survey;
export type AssessmentCatalog = Record<string, Assessment>;
export type AssessmentEntry = { payload: Assessment; enabled: boolean };
export type AssessmentEntries = Record<string, AssessmentEntry>;

type Override = { item_id: string; payload: Assessment | null; enabled: boolean };

export async function loadAssessmentEntries(kind: AssessmentKind): Promise<AssessmentEntries> {
  const defaults: AssessmentCatalog = { ...(kind === "test" ? tests : surveys) };
  const entries: AssessmentEntries = Object.fromEntries(Object.entries(defaults).map(([id, payload]) => [id, { payload, enabled: true }]));
  const { data, error } = await supabase()
    .from("site_assessment_overrides")
    .select("item_id, payload, enabled")
    .eq("kind", kind);
  if (error) throw error;
  for (const row of (data ?? []) as Override[]) {
    const payload = row.payload ?? defaults[row.item_id];
    if (!payload) continue;
    entries[row.item_id] = { payload, enabled: row.enabled };
  }
  return entries;
}

export async function loadAssessmentCatalog(kind: AssessmentKind): Promise<AssessmentCatalog> {
  const entries = await loadAssessmentEntries(kind);
  return Object.fromEntries(Object.entries(entries).filter(([, entry]) => entry.enabled).map(([id, entry]) => [id, entry.payload]));
}

export async function saveAssessment(kind: AssessmentKind, id: string, payload: Assessment) {
  const { error } = await supabase().from("site_assessment_overrides").upsert({
    kind,
    item_id: id,
    payload,
    enabled: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "kind,item_id" });
  if (error) throw error;
}

export async function deleteAssessment(kind: AssessmentKind, id: string, payload: Assessment) {
  const { error } = await supabase().from("site_assessment_overrides").upsert({
    kind,
    item_id: id,
    payload,
    enabled: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: "kind,item_id" });
  if (error) throw error;
}
