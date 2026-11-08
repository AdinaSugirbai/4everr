"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, pwOk } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import Modal from "@/components/Modal";
import PwRules from "@/components/PwRules";
import { bad, FieldErr } from "@/lib/ui";
import { toast } from "@/lib/fx";

export default function AccountPage() {
  const { user, update, changePassword, remove } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pe, setPe] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ old: "", nw: "", rep: "" });
  const [we, setWe] = useState<Record<string, string>>({});
  const [wTried, setWTried] = useState(false);
  const [del, setDel] = useState(false);
  const [dpw, setDpw] = useState("");
  const [de, setDe] = useState("");

  function saveProfile() {
    const er: Record<string, string> = {};
    if (name.trim().length < 2) er.name = "Атыңызды жазыңыз|Введите имя|Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) er.email = "Дұрыс email жазыңыз|Введите корректный email|Enter a valid email";
    if (Object.keys(er).length) { setPe(er); return; }
    const m = update(name, email);
    if (m) { setPe({ email: m }); return; }
    setPe({});
    toast(t("Профиль сақталды|Профиль сохранён|Profile saved"), "");
  }
  function savePw() {
    setWTried(true);
    const er: Record<string, string> = {};
    if (!pw.old) er.old = "Ескі құпиясөзді жазыңыз|Введите старый пароль|Enter the old password";
    if (!pwOk(pw.nw)) er.nw = "Құпиясөз талапқа сай емес|Пароль не соответствует требованиям|Password does not meet the rules";
    if (pw.rep !== pw.nw) er.rep = "Құпиясөздер сәйкес емес|Пароли не совпадают|Passwords do not match";
    if (Object.keys(er).length) { setWe(er); return; }
    const m = changePassword(pw.old, pw.nw);
    if (m) { setWe({ old: m }); return; }
    setWe({}); setWTried(false); setPw({ old: "", nw: "", rep: "" });
    toast(t("Құпиясөз өзгертілді|Пароль изменён|Password changed"), "");
  }
  function doDelete() {
    const m = remove(dpw);
    if (m) { setDe(m); return; }
    router.push("/start");
  }

  return (
    <div className="max-w-2xl mx-auto grid gap-5">
      <h1 className="font-bold text-2xl">{t("Аккаунт баптаулары|Настройки аккаунта|Account settings")}</h1>

      <div className="card p-5 grid gap-4">
        <h2 className="font-bold">{t("Профиль|Профиль|Profile")}</h2>
        <div><label htmlFor="an" className="font-semibold text-sm">{t("Аты-жөні|Имя и фамилия|Full name")}</label>
          <input id="an" className="inp mt-1" style={bad(pe.name)} value={name} onChange={(e) => setName(e.target.value)} /><FieldErr e={pe.name} /></div>
        <div><label htmlFor="ae" className="font-semibold text-sm">Email</label>
          <input id="ae" type="email" className="inp mt-1" style={bad(pe.email)} value={email} onChange={(e) => setEmail(e.target.value)} /><FieldErr e={pe.email} /></div>
        <button className="btn btn-p w-fit" onClick={saveProfile}>{t("Сақтау|Сохранить|Save")}</button>
      </div>

      <div className="card p-5 grid gap-4">
        <h2 className="font-bold">{t("Құпиясөзді өзгерту|Смена пароля|Change password")}</h2>
        <div><label htmlFor="o" className="font-semibold text-sm">{t("Ескі құпиясөз|Старый пароль|Old password")}</label>
          <input id="o" type="password" className="inp mt-1" style={bad(we.old)} value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} /><FieldErr e={we.old} /></div>
        <div><label htmlFor="nw" className="font-semibold text-sm">{t("Жаңа құпиясөз|Новый пароль|New password")}</label>
          <input id="nw" type="password" className="inp mt-1" style={bad(we.nw)} value={pw.nw} onChange={(e) => setPw({ ...pw, nw: e.target.value })} />
          <div className="mt-2"><PwRules pw={pw.nw} strict={wTried} /></div></div>
        <div><label htmlFor="rp" className="font-semibold text-sm">{t("Қайталаңыз|Повторите|Repeat")}</label>
          <input id="rp" type="password" className="inp mt-1" style={bad(we.rep)} value={pw.rep} onChange={(e) => setPw({ ...pw, rep: e.target.value })} /><FieldErr e={we.rep} /></div>
        <button className="btn btn-p w-fit" onClick={savePw}>{t("Құпиясөзді өзгерту|Изменить пароль|Change password")}</button>
      </div>

      <div className="card p-5 grid gap-3" style={{ borderColor: "var(--bt)" }}>
        <h2 className="font-bold" style={{ color: "var(--bt)" }}>{t("Қауіпті аймақ|Опасная зона|Danger zone")}</h2>
        <p className="text-sm text-mute">{t("Аккаунт пен резюме өшіріледі. Бұл әрекетті қайтару мүмкін емес.|Аккаунт и резюме будут удалены. Это действие необратимо.|Your account and resume will be deleted. This cannot be undone.")}</p>
        <button className="btn btn-s w-fit" style={{ color: "var(--bt)" }} onClick={() => { setDel(true); setDpw(""); setDe(""); }}>{t("Аккаунтты жою|Удалить аккаунт|Delete account")}</button>
      </div>

      <Modal open={del} onClose={() => setDel(false)} title={t("Аккаунтты жою|Удаление аккаунта|Delete account")}>
        <p className="text-sm text-mute">{t("Растау үшін құпиясөзіңізді жазыңыз.|Введите пароль для подтверждения.|Enter your password to confirm.")}</p>
        <div><input type="password" aria-label="password" className="inp" style={bad(de)} value={dpw} onChange={(e) => setDpw(e.target.value)} /><FieldErr e={de} /></div>
        <div className="flex gap-2">
          <button className="btn btn-s" style={{ color: "var(--bt)" }} onClick={doDelete}>{t("Иә, жою|Да, удалить|Yes, delete")}</button>
          <button className="btn btn-s" onClick={() => setDel(false)}>{t("Бас тарту|Отмена|Cancel")}</button>
        </div>
      </Modal>
    </div>
  );
}
