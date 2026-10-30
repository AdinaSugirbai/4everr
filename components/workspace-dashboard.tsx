"use client";
import Link from "next/link";
import { useState } from "react";
import { careers, formats } from "@/lib/data";
import { actionLabels, dateLabel } from "@/lib/workspace";
import { useWorkspace } from "@/lib/use-workspace";
import { ButtonLink, Notice } from "./ui";
import { Counter, WorkspaceWelcome } from "./motion";
import { Shell, PageTop, Badge } from "./workspace-shell";
export function Dashboard() {
  const { data, ready, error } = useWorkspace(),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("ALL");
  const activities = data.activities.filter(
    (a) =>
      (filter === "ALL" || a.action === filter) &&
      (a.title + " " + actionLabels[a.action])
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <Shell>
      <PageTop
        eyebrow="Жеке кабинет · Жұмыс беруші"
        title="Қош келдің, Адина."
        description="Посттарың, соңғы әрекеттерің және келесі қадамың — бір жерде."
      >
        <ButtonLink primary href="/posts/new">
          Пост жасау
        </ButtonLink>
      </PageTop>
      <WorkspaceWelcome />
      <div className="metric-grid grid sm:grid-cols-3 gap-3 mb-8">
        {[
          [
            "Барлық посттар",
            data.posts.length,
            "Жұмыс кеңістігіңдегі жазбалар",
          ],
          [
            "Тексеруге дайын",
            data.posts.filter((p) => p.status === "PENDING").length,
            "UI-дегі дайындық күйі",
          ],
          [
            "Сақталған жобалар",
            data.posts.filter((p) => p.status === "DRAFT").length,
            "Кейін жалғастыруға болады",
          ],
        ].map(([title, value, note], i) => (
          <div className={`card metric-card metric-${i}`} key={title}>
            <p className={`text-xs ${i === 0 ? "text-[#d1dec8]!" : ""}`}>
              {title}
            </p>
            <strong className="block text-4xl font-normal my-4">
              {ready ? <Counter value={Number(value)} /> : "—"}
            </strong>
            <div className="metric-trace" aria-hidden="true">
              {[25, 45, 32, 62, 40, 75, 60, 92, 70, 100, 85, 115].map(
                (h, j) => (
                  <i key={j} style={{ height: h / 3 }} />
                ),
              )}
            </div>
            <p
              className={`text-[11px] leading-5 ${i === 0 ? "text-[#d1dec8]!" : ""}`}
            >
              {note}
            </p>
          </div>
        ))}
      </div>
      <section>
        <div className="section-head mt-0!">
          <h2 className="text-xl!">Менің посттарым</h2>
          <span className="chip">Вакансия посттары</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {ready &&
            data.posts.slice(0, 4).map((p) => (
              <article className="card studio-post-card" key={p.id}>
                <div className="post-visual" aria-hidden="true">
                  <span>{p.career === "frontend" ? "</>" : "✳"}</span>
                  <small>
                    {careers
                      .find((c) => c.slug === p.career)
                      ?.title.toUpperCase()}
                  </small>
                  <i>→</i>
                </div>
                <div className="flex justify-between gap-3 items-center">
                  <span className="text-[11px] text-muted">{p.company}</span>
                  <Badge status={p.status} />
                </div>
                <h3 className="text-lg mt-5 mb-2">{p.title}</h3>
                <p className="text-xs">
                  {p.city} · {formats[p.format]}
                </p>
                <div className="flex gap-4 mt-5">
                  <Link
                    className="text-sm min-h-11 inline-flex items-center"
                    href={"/posts/" + p.id}
                  >
                    Постты көру →
                  </Link>
                  <Link
                    className="text-sm text-muted min-h-11 inline-flex items-center"
                    href={"/posts/" + p.id + "?edit=1"}
                  >
                    Өңдеу
                  </Link>
                </div>
              </article>
            ))}
        </div>
      </section>
      <section className="card activity-panel mt-7">
        <div className="flex flex-wrap justify-between gap-3 mb-2">
          <div>
            <h2 className="text-xl!">Транзакциялар тарихы</h2>
            <p className="text-xs mt-2">
              Пост жасау, өңдеу және тексеруге дайындау журналы
            </p>
          </div>
          <span className="chip self-start">
            {data.activities.length} әрекет
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 my-5">
          <input
            aria-label="Тарихтан іздеу"
            placeholder="Пост атауы бойынша іздеу..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="sm:max-w-48"
            aria-label="Әрекет сүзгісі"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Барлық әрекет</option>
            {Object.entries(actionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-left text-xs">
            <thead className="text-muted border-y border-line bg-paper">
              <tr>
                {["Әрекет / Пост", "Күні", "Күйі", ""].map((s, i) => (
                  <th key={i} scope="col" className="font-normal p-3">
                    {s || <span className="sr-only">Пост сілтемесі</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ready &&
                activities.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-line last:border-0"
                    data-testid="history-row"
                  >
                    <td className="p-3">
                      <strong className="block font-medium mb-1.5">
                        {actionLabels[a.action]}
                      </strong>
                      <span className="text-muted">{a.title}</span>
                    </td>
                    <td className="p-3 text-muted">{dateLabel(a.date)}</td>
                    <td className="p-3">
                      <Badge status={a.status} />
                    </td>
                    <td className="p-3">
                      <Link
                        aria-label={"Постты ашу: " + a.title}
                        className="min-h-11 min-w-11 inline-grid place-items-center rounded-full hover:bg-soft"
                        href={"/posts/" + a.postId}
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden grid gap-3">
          {ready &&
            activities.map((a) => (
              <article className="border-t border-line pt-4" key={a.id}>
                <div className="flex flex-wrap justify-between gap-3">
                  <strong className="font-medium text-sm">
                    {actionLabels[a.action]}
                  </strong>
                  <Badge status={a.status} />
                </div>
                <p className="text-xs my-2">{a.title}</p>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[11px] text-muted">
                    {dateLabel(a.date)}
                  </span>
                  <Link
                    className="min-h-11 inline-flex items-center text-xs"
                    href={"/posts/" + a.postId}
                  >
                    Ашу →
                  </Link>
                </div>
              </article>
            ))}
        </div>
        {ready && !activities.length && (
          <p role="status" className="text-sm text-center py-8">
            Тарихтан ештеңе табылмады. Іздеу шарттарын өзгертіп көр.
          </p>
        )}
        {!ready && <p role="status">Жүктелуде...</p>}
      </section>
      <Notice>
        Демо кабинет: «Адина» — интерфейс үлгісіндегі пайдаланушы. Посттар мен
        тарих тек осы браузерде сақталады. Модераторға ештеңе жіберілмейді.
      </Notice>
      {error && <p role="alert">{error}</p>}
    </Shell>
  );
}
