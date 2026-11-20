"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Log = { id: number; action: string; target_id: string | null; details: string | null; created_at: string };

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase()
      .from("admin_log")
      .select("id, action, target_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => (error ? setErr(error.message) : setLogs((data ?? []) as Log[])));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Әрекет журналы</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="divide-y divide-line rounded-2xl border border-line bg-sf">
        {logs.map((l) => (
          <div key={l.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
            <span className="text-ink">
              <b className="font-medium">{l.action}</b>
              {l.details ? ` → ${l.details}` : ""}
            </span>
            <span className="text-mute">{new Date(l.created_at).toLocaleString("kk-KZ")}</span>
          </div>
        ))}
        {logs.length === 0 && !err && <p className="px-4 py-6 text-mute">Журнал әзірге бос.</p>}
      </div>
    </div>
  );
}
