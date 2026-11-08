"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, pwOk, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import PwRules from "@/components/PwRules";
import { bad, FieldErr } from "@/lib/ui";

const cards: { r: Role; t: string; d: string }[] = [
  { r: "CANDIDATE", t: "Мен кандидатпын|Я кандидат|I am a candidate", d: "Тест тапсырамын, резюме жасаймын, вакансияларға өтінім беремін|Прохожу тесты, создаю резюме, откликаюсь на вакансии|Take tests, build a resume, apply to jobs" },
  { r: "EMPLOYER", t: "Мен жұмыс берушімін|Я работодатель|I am an employer", d: "Вакансия жариялаймын, өтінімдерді қарап, ұсыныс жіберемін|Публикую вакансии, смотрю заявки, отправляю предложения|Post jobs, review applications, send offers" },
];

export default function StartPage() {
  const { register, signin } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [role, setRole] = useState<Role>("CANDIDATE");
  const [f, setF] = useState({ name: "", email: "", pw: "" });  
  const [e, setE] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: ev.target.value });
  const reg = mode === "register";

  function submit() {
    setTried(true);
    const er: Record<string, string> = {};
    if (reg && f.name.trim().length < 2) er.name = "Атыңызды жазыңыз|Введите имя|Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = "Дұрыс email жазыңыз|Введите корректный email|Enter a valid email";
    if (reg) {
      if (!pwOk(f.pw)) er.pw = "Құпиясөз талапқа сай емес|Пароль не соответствует требованиям|Password does not meet the rules";
      if (f.pw2 !== f.pw) er.pw2 = "Құпиясөздер сәйкес емес|Пароли не совпадают|Passwords do not match";
    } else if (!f.pw) er.pw = "Құпиясөзді жазыңыз|Введите пароль|Enter your password";
    setE(er);
    if (Object.keys(er).length) return;
    const r = reg ? register(f.name, f.email, f.pw, role) : signin(f.email, f.pw);
    if (r.error) { setE({ form: r.error }); return; }
    router.push(r.role === "EMPLOYER" ? "/employer/applications" : "/profile");
  }

  return (
    <div className="max-w-xl mx-auto grid gap-5">
      <div>
        <h1 className="font-bold text-3xl">{t("4everr-ге қош келдіңіз|Добро пожаловать в 4everr|Welcome to 4everr")}</h1>
        <p className="text-mute mt-1">{reg ? t("Аккаунт жасап, рөліңізді таңдаңыз.|Создайте аккаунт и выберите роль.|Create an account and pick your role.") : t("Аккаунтыңызға кіріңіз.|Войдите в свой аккаунт.|Sign in to your account.")}</p>
      </div>
      <div className="flex gap-2">
        <button className={"btn " + (reg ? "btn-p" : "btn-s")} onClick={() => { setMode("register"); setE({}); setTried(false); }}>{t("Тіркелу|Регистрация|Sign up")}</button>
        <button className={"btn " + (!reg ? "btn-p" : "btn-s")} onClick={() => { setMode("login"); setE({}); setTried(false); }}>{t("Кіру|Вход|Sign in")}</button>
      </div>
      {reg && (
        <div className="grid sm:grid-cols-2 gap-3">
          {cards.map((c) => (
            <button key={c.r} onClick={() => setRole(c.r)} aria-pressed={role === c.r} className="card p-5 text-left" style={role === c.r ? { borderColor: "var(--brand)", background: "var(--soft)" } : undefined}>
              <p className="font-bold">{t(c.t)}</p><p className="text-sm text-mute mt-1">{t(c.d)}</p>
            </button>
          ))}
        </div>
      )}
      <div className="card p-5 grid gap-4">
        {reg && (
          <div><label htmlFor="n" className="font-semibold text-sm">{t("Аты-жөні|Имя и фамилия|Full name")}</label>
            <input id="n" className="inp mt-1" style={bad(e.name)} aria-invalid={!!e.name} value={f.name} onChange={set("name")} /><FieldErr e={e.name} /></div>
        )}
        <div><label htmlFor="e" className="font-semibold text-sm">Email</label>
          <input id="e" type="email" className="inp mt-1" style={bad(e.email)} aria-invalid={!!e.email} value={f.email} onChange={set("email")} /><FieldErr e={e.email} /></div>
        <div><label htmlFor="p" className="font-semibold text-sm">{t("Құпиясөз|Пароль|Password")}</label>
          <input id="p" type="password" className="inp mt-1" style={bad(e.pw)} aria-invalid={!!e.pw} value={f.pw} onChange={set("pw")} />
          {reg ? <div className="mt-2"><PwRules pw={f.pw} strict={tried} /></div> : <FieldErr e={e.pw} />}</div>
        {reg && (
          <div><label htmlFor="p2" className="font-semibold text-sm">{t("Құпиясөзді қайталаңыз|Повторите пароль|Repeat password")}</label>
            <input id="p2" type="password" className="inp mt-1" style={bad(e.pw2)} aria-invalid={!!e.pw2} value={f.pw2} onChange={set("pw2")} /><FieldErr e={e.pw2} /></div>
        )}
        <FieldErr e={e.form} />
        <button className="btn btn-p" onClick={submit}>{reg ? t("Тіркелу|Зарегистрироваться|Create account") : t("Кіру|Войти|Sign in")}</button>
        <p className="text-xs text-mute">{t("Бұл демо: деректер тек осы браузерде сақталады.|Это демо: данные хранятся только в этом браузере.|This is a demo: data stays in this browser only.")}</p>
      </div>
    </div>
  );
}
