"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, type Role } from "@/lib/auth";

const cards: { r: Role; t: string; d: string }[] = [
  { r: "CANDIDATE", t: "Мен кандидатпын", d: "Тест тапсырамын, резюме жасаймын, вакансияларға өтінім беремін" },
  { r: "EMPLOYER", t: "Мен жұмыс берушімін", d: "Вакансия жариялаймын, өтінімдерді қарап, ұсыныс жіберемін" },
];

export default function StartPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (name.trim().length < 2 || !email.includes("@")) { setErr("Атыңызды және дұрыс email жазыңыз"); return; }
    login({ name: name.trim(), email: email.trim(), role });
    router.push(role === "EMPLOYER" ? "/employer" : "/profile");
  }

  return (
    <div className="max-w-xl mx-auto grid gap-5">
      <div><h1 className="font-bold text-3xl">4everr-ге қош келдіңіз</h1><p className="text-mute mt-1">Алдымен өз рөліңізді таңдаңыз.</p></div>
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <button key={c.r} onClick={() => setRole(c.r)} aria-pressed={role === c.r} className="card p-5 text-left" style={role === c.r ? { borderColor: "var(--brand)", background: "var(--soft)" } : undefined}>
            <p className="font-bold">{c.t}</p><p className="text-sm text-mute mt-1">{c.d}</p>
          </button>
        ))}
      </div>
      <div className="card p-5 grid gap-4">
        <div><label htmlFor="n" className="font-semibold text-sm">Аты-жөні</label><input id="n" className="inp mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label htmlFor="e" className="font-semibold text-sm">Email</label><input id="e" type="email" className="inp mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {err && <p className="text-sm" style={{ color: "var(--bt)" }}>{err}</p>}
        <button className="btn btn-p" onClick={submit}>{role === "EMPLOYER" ? "Жұмыс беруші ретінде кіру" : "Кандидат ретінде кіру"}</button>
        <p className="text-xs text-mute">Бұл демо-тіркелу: деректер тек осы браузерде сақталады.</p>
      </div>
    </div>
  );
}
