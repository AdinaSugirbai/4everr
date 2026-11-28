"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminLoading from "@/components/AdminLoading";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { loadAssessmentEntries } from "@/lib/assessments";
import type { Role } from "@/lib/auth";

type UserRow = { id: string; name: string; email: string; role: Role; banned: boolean; created_at: string };
type Stat = { label: string; value: number; hint: string };
type Sort = "newest" | "oldest" | "name" | "role";
const PAGE_SIZE = 20;
const roleText: Record<Role, string> = {
  CANDIDATE: "Кандидат|Кандидат|Candidate",
  EMPLOYER: "Жұмыс беруші|Работодатель|Employer",
  ADMIN: "Әкімші|Администратор|Admin",
};

export default function AdminDashboard() {
  const { t, lang } = useI18n();
  const [stats, setStats] = useState<Stat[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    const client = supabase();
    let request = client.from("profiles")
      .select("id, name, email, role, banned, created_at", { count: "exact" })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (role !== "ALL") request = request.eq("role", role);
    const safeQuery = query.trim().replace(/[^\p{L}\p{N}@._+\-\s]/gu, " ").replace(/\s+/g, " ");
    if (safeQuery) request = request.or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`);
    if (sort === "name") request = request.order("name", { ascending: true });
    else if (sort === "role") request = request.order("role", { ascending: true }).order("created_at", { ascending: false });
    else request = request.order("created_at", { ascending: sort === "oldest" });
    const { data, error, count: total } = await request;
    if (error) throw error;
    setUsers((data ?? []) as UserRow[]);
    setCount(total ?? 0);
  }, [page, query, role, sort]);

  const loadStats = useCallback(async () => {
    const db = supabase();
    const head = { count: "exact" as const, head: true };
    const [allUsers, candidates, employers, verified, blockedUsers, pendingEmployers, activeVacancies, pendingVacancies, allApplications, newApplications, directions, tests, surveys, recentUsers] = await Promise.all([
      db.from("profiles").select("id", head),
      db.from("profiles").select("id", head).eq("role", "CANDIDATE"),
      db.from("profiles").select("id", head).eq("role", "EMPLOYER"),
      db.from("profiles").select("id", head).eq("role", "EMPLOYER").eq("verified", true),
      db.from("profiles").select("id", head).eq("banned", true),
      db.from("profiles").select("id", head).eq("role", "EMPLOYER").eq("verified", false).not("verification_requested_at", "is", null),
      db.from("vacancies").select("id", head).eq("status", "ACTIVE").eq("moderation", "APPROVED"),
      db.from("vacancies").select("id", head).eq("moderation", "PENDING"),
      db.from("applications").select("id", head),
      db.from("applications").select("id", head).eq("status", "NEW"),
      db.from("it_directions").select("id", head),
      loadAssessmentEntries("test"),
      loadAssessmentEntries("survey"),
      db.from("profiles").select("id", head).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    ]);
    const countOf = (result: { count: number | null; error: { message: string } | null }) => {
      if (result.error) throw new Error(result.error.message);
      return result.count ?? 0;
    };
    setStats([
      { label: "Тіркелген аккаунттар|Зарегистрированные аккаунты|Registered accounts", value: countOf(allUsers), hint: "Барлық рөлдер|Все роли|All roles" },
      { label: "Кандидаттар|Кандидаты|Candidates", value: countOf(candidates), hint: "Кандидат рөлі|Роль кандидата|Candidate role" },
      { label: "Жұмыс берушілер|Работодатели|Employers", value: countOf(employers), hint: `${countOf(verified)} · ${t("расталған|подтверждены|verified")}` },
      { label: "Компанияны тексеру кезегі|Компании на проверке|Companies awaiting verification", value: countOf(pendingEmployers), hint: "Жұмыс беруші өтінімдері|Заявки работодателей|Employer requests" },
      { label: "Бұғатталған аккаунттар|Заблокированные аккаунты|Blocked accounts", value: countOf(blockedUsers), hint: "Әкімші тексеруі қажет|Требуют внимания администратора|Need admin attention" },
      { label: "Соңғы 30 күндегі тіркелім|Регистрации за 30 дней|Sign-ups in last 30 days", value: countOf(recentUsers), hint: "Жаңа аккаунттар|Новые аккаунты|New accounts" },
      { label: "Белсенді вакансиялар|Активные вакансии|Active vacancies", value: countOf(activeVacancies), hint: "Жарияланған|Опубликованные|Published" },
      { label: "Тексерілетін вакансиялар|Вакансии на проверке|Vacancies awaiting review", value: countOf(pendingVacancies), hint: "Модерация кезегінде|В очереди модерации|In moderation queue" },
      { label: "Өтінімдер|Заявки|Applications", value: countOf(allApplications), hint: `${countOf(newApplications)} · ${t("жаңа|новые|new")}` },
      { label: "IT бағыттары|IT-направления|IT directions", value: countOf(directions), hint: "Сайттағы бағыттар|Направления сайта|Site categories" },
      { label: "Белсенді тесттер|Активные тесты|Active tests", value: Object.values(tests).filter((entry) => entry.enabled).length, hint: "Тест материалдары|Материалы тестов|Test items" },
      { label: "Белсенді сауалнамалар|Активные опросы|Active surveys", value: Object.values(surveys).filter((entry) => entry.enabled).length, hint: "Сауалнама материалдары|Материалы опросов|Survey items" },
    ]);
  }, [t]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadUsers()
      .catch((e) => { if (active) setError((e as Error).message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadUsers]);

  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    loadStats()
      .catch((e) => { if (active) setError((e as Error).message); })
      .finally(() => { if (active) setStatsLoading(false); });
    return () => { active = false; };
  }, [loadStats]);

  const maxPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const locale = lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US";
  const field = "inp min-w-0";

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-ink">{t("Әкімші панелі|Панель администратора|Admin overview")}</h1><p className="mt-1 text-sm text-mute">{t("Аккаунттар мен сайт көрсеткіштері|Аккаунты и показатели сайта|Accounts and site activity")}</p></div>
        <Link href="/admin/profile" className="btn btn-s">{t("Әкімші профилі|Профиль администратора|Admin profile")}</Link>
      </header>

      {error && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}
      {(loading || statsLoading) && <AdminLoading />}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label={t("Жалпы статистика|Общая статистика|Overall statistics")}>
        {stats.map((item) => <article key={item.label} className="rounded-2xl border border-line bg-sf p-4"><p className="text-xs text-mute">{t(item.label)}</p><p className="mt-2 text-3xl font-bold text-brand">{item.value.toLocaleString(locale)}</p><p className="mt-1 text-xs text-mute">{t(item.hint)}</p></article>)}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold text-ink">{t("Тіркелген қолданушылар|Зарегистрированные пользователи|Registered users")} ({count})</h2><p className="mt-1 text-sm text-mute">{t("Толық профиль мен аккаунт статистикасын ашу үшін тізімнен таңдаңыз.|Откройте профиль и статистику, выбрав пользователя в списке.|Select an account to open its profile and statistics.")}</p></div>
          <Link href="/admin/users" className="btn btn-s">{t("Барлығын басқару|Управлять всеми|Manage all")}</Link>
        </div>
        <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
          <input className={field} value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder={t("Аты немесе email бойынша іздеу|Поиск по имени или email|Search name or email")} aria-label={t("Іздеу|Поиск|Search")} />
          <select className={field} value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }} aria-label={t("Рөл бойынша сүзу|Фильтр по роли|Filter by role")}>
            <option value="ALL">{t("Барлық рөл|Все роли|All roles")}</option>
            <option value="CANDIDATE">{t(roleText.CANDIDATE)}</option><option value="EMPLOYER">{t(roleText.EMPLOYER)}</option><option value="ADMIN">{t(roleText.ADMIN)}</option>
          </select>
          <select className={field} value={sort} onChange={(e) => { setSort(e.target.value as Sort); setPage(0); }} aria-label={t("Сұрыптау|Сортировка|Sort")}>
            <option value="newest">{t("Жаңадан ескіге|Сначала новые|Newest first")}</option><option value="oldest">{t("Ескіден жаңаға|Сначала старые|Oldest first")}</option><option value="name">{t("Аты бойынша|По имени|By name")}</option><option value="role">{t("Рөлі бойынша|По роли|By role")}</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-mute"><tr><th className="px-4 py-3">{t("Қолданушы|Пользователь|Account")}</th><th className="px-4 py-3">{t("Рөлі|Роль|Role")}</th><th className="px-4 py-3">{t("Күйі|Статус|Status")}</th><th className="px-4 py-3">{t("Тіркелген күні|Дата регистрации|Joined")}</th></tr></thead>
            <tbody>
              {users.map((user) => <tr key={user.id} className="border-b border-line last:border-0 hover:bg-soft/50"><td className="px-4 py-3"><Link href={`/admin/users/${user.id}`} className="block rounded focus-visible:outline-2 focus-visible:outline-brand"><span className="font-semibold text-ink">{user.name || t("Аты көрсетілмеген|Имя не указано|Name not set")}</span><span className="block text-xs text-mute">{user.email}</span></Link></td><td className="px-4 py-3 text-ink">{t(roleText[user.role])}</td><td className="px-4 py-3"><span className={`chip ${user.banned ? "c-b" : "c-ok"}`}>{user.banned ? t("Бұғатталған|Заблокирован|Blocked") : t("Белсенді|Активен|Active")}</span></td><td className="px-4 py-3 text-mute">{user.created_at ? new Date(user.created_at).toLocaleDateString(locale) : "—"}</td></tr>)}
              {!loading && users.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-mute">{t("Қолданушы табылмады.|Пользователи не найдены.|No users found.")}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm"><span className="text-mute">{page + 1} / {maxPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 0} className="btn btn-s" onClick={() => setPage((n) => Math.max(0, n - 1))}>{t("Артқа|Назад|Previous")}</button><button type="button" disabled={page + 1 >= maxPages} className="btn btn-s" onClick={() => setPage((n) => Math.min(maxPages - 1, n + 1))}>{t("Келесі|Далее|Next")}</button></div></div>
      </section>
    </div>
  );
}
