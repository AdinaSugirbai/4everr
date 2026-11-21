import { supabase } from "@/lib/supabase/client";
import { tests, surveys, type Test, type Survey } from "@/lib/quizdata";

export type AssessmentKind = "test" | "survey";
export type Assessment = Test | Survey;
export type AssessmentCatalog = Record<string, Assessment>;

type Override = { item_id: string; payload: Assessment | null; enabled: boolean };

export async function loadAssessmentCatalog(kind: AssessmentKind): Promise<AssessmentCatalog> {
  const defaults: AssessmentCatalog = { ...(kind === "test" ? tests : surveys) };
  const { data, error } = await supabase()
    .from("site_assessment_overrides")
    .select("item_id, payload, enabled")
    .eq("kind", kind);
  if (error) throw error;
  for (const row of (data ?? []) as Override[]) {
    if (!row.enabled || !row.payload) delete defaults[row.item_id];
    else defaults[row.item_id] = row.payload;
  }
  return defaults;
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

export async function deleteAssessment(kind: AssessmentKind, id: string) {
  const { error } = await supabase().from("site_assessment_overrides").upsert({
    kind,
    item_id: id,
    payload: null,
    enabled: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: "kind,item_id" });
  if (error) throw error;
}
