"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, checkPassword, pwOk, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

type Mode = "register" | "signin";
type RegRole = Exclude<Role, "ADMIN">;

export default function StartPage() {
  const { t } = useI18n();
  const { user, ready, register, signin } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("register");
  const [role, setRole] = useState<RegRole>("CANDIDATE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rules = checkPassword(pw);

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === "ADMIN") router.replace("/admin/users");
    else if (user.role === "EMPLOYER") router.replace("/employer/applications");
    else router.replace("/profile");
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "register") {
      if (!name.trim()) {
        setError(t("Аты-жөніңізді жазыңыз|Введите имя|Enter your name"));
        return;
      }
      if (!pwOk(pw)) {
        setError(t("Құпиясөз талаптарға сай емес|Пароль не соответствует требованиям|Password does not meet the rules"));
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "register") {
        const r = await register(name.trim(), email.trim(), pw, role);
        if (r.error) setError(r.error);
        else setInfo(t("Аккаунт жасалды, кіріп жатырсыз...|Аккаунт создан, входим...|Account created, signing in..."));
      } else {
        const r = await signin(email.trim(), pw);
        if (r.error) setError(r.error);
      }
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-brand";
  const label = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-3xl font-bold text-ink">
        {t("ITalent платформасына қош келдіңіз|Добро пожаловать в ITalent|Welcome to ITalent")}
      </h1>
      <p className="mt-2 text-mute">
        {t("Аккаунт жасап, рөліңізді таңдаңыз.|Создайте аккаунт и выберите роль.|Create an account and pick your role.")}
      </p>

      <div className="mt-6 flex gap-2">
        {(["register", "signin"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); setInfo(null); }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              mode === m ? "bg-brand text-white" : "border border-line bg-sf text-ink"
            }`}
          >
            {m === "register" ? t("Тіркелу|Регистрация|Sign up") : t("Кіру|Вход|Sign in")}
          </button>
        ))}
      </div>

      {mode === "register" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {([
            { v: "CANDIDATE", title: t("Мен кандидатпын|Я кандидат|I am a candidate"), desc: t("Тест тапсырамын, резюме жасаймын|Прохожу тесты, создаю резюме|Take tests, build my resume") },
            { v: "EMPLOYER", title: t("Мен жұмыс берушімін|Я работодатель|I am an employer"), desc: t("Вакансия жариялаймын|Публикую вакансии|Post job openings") },
          ] as { v: RegRole; title: string; desc: string }[]).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setRole(o.v)}
              className={`rounded-2xl border p-5 text-left transition-colors ${
                role === o.v ? "border-brand bg-soft" : "border-line bg-sf hover:bg-soft"
              }`}
            >
              <p className="font-semibold text-ink">{o.title}</p>
              <p className="mt-1 text-sm text-mute">{o.desc}</p>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-line bg-sf p-6">
        {mode === "register" && (
          <div>
            <label htmlFor="fullname" className={label}>{t("Аты-жөні|Имя и фамилия|Full name")}</label>
            <input id="fullname" name="fullname" autoComplete="name" className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label htmlFor="password" className={label}>{t("Құпиясөз|Пароль|Password")}</label>
          <div className="relative">
