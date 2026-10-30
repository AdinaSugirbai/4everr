"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { careers, formats } from "@/lib/data";
import { Activity, Post } from "@/lib/workspace";
import { useWorkspace } from "@/lib/use-workspace";
import { Notice } from "./ui";
import { Shell, PageTop, Missing } from "./workspace-shell";
const emptyPost: Post = {
  id: "",
  title: "",
  company: "",
  career: "frontend",
  format: "REMOTE",
  city: "",
  salary: "",
  description: "",
  status: "DRAFT",
  updatedAt: "",
};
export function PostEditor({ postId }: { postId?: string }) {
  const { data, ready } = useWorkspace();
  if (!ready)
    return (
      <Shell>
        <p role="status" className="py-10">
          Жүктелуде...
        </p>
      </Shell>
    );
  const initialPost = postId
    ? data.posts.find((p) => p.id === postId)
    : emptyPost;
  if (!initialPost) return <Missing />;
  return (
    <PostForm key={postId || "new"} postId={postId} initialPost={initialPost} />
  );
}
function PostForm({
  postId,
  initialPost,
}: {
  postId?: string;
  initialPost: Post;
}) {
  const router = useRouter();
  const { data, save, error } = useWorkspace();
  const [form, setForm] = useState<Post>(initialPost),
    [saving, setSaving] = useState(false);
  function update<K extends keyof Post>(key: K, value: Post[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }
  function submit(status: Post["status"]) {
    if (saving) return;
    setSaving(true);
    const now = new Date().toISOString(),
      id = postId || crypto.randomUUID();
    const next: Post = {
      ...form,
      id,
      title: form.title.trim(),
      company: form.company.trim(),
      city: form.city.trim(),
      description: form.description.trim(),
      status,
      updatedAt: now,
    };
    const event: Activity = {
      id: crypto.randomUUID(),
      postId: id,
      title: next.title,
      action: status === "PENDING" ? "REVIEW" : postId ? "UPDATE" : "CREATE",
      date: now,
      status,
    };
    if (
      save({
        posts: postId
          ? data.posts.map((p) => (p.id === id ? next : p))
          : [next, ...data.posts],
        activities: [event, ...data.activities],
      })
    )
      router.push("/posts/" + id + "?saved=1");
    else setSaving(false);
  }

  return (
    <Shell>
      <PageTop
        eyebrow={postId ? "Постты өңдеу" : "Жаңа мүмкіндік"}
        title={postId ? "Постты жаңарт." : "Келесі талантқа жол аш."}
        description="Вакансия туралы анық әрі түсінікті ақпарат жаз."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit("PENDING");
        }}
      >
        <div className="grid xl:grid-cols-[1.6fr_1fr] gap-5 items-start">
          <div className="grid gap-5">
            <section className="card">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-soft rounded-lg text-xs w-8 h-8 grid place-items-center">
                  01
                </span>
                <h2 className="text-lg!">Негізгі ақпарат</h2>
              </div>
              <label className="input-label">
                Пост атауы <span className="sr-only">міндетті</span>
                <input
                  name="title"
                  required
                  pattern=".*\S.*"
                  maxLength={100}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Мысалы, Junior Frontend Developer"
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="input-label">
                  Компания
                  <input
                    required
                    pattern=".*\S.*"
                    maxLength={80}
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Компания атауы"
                  />
                </label>
                <label className="input-label">
                  IT бағыты
                  <select
                    value={form.career}
                    onChange={(e) => update("career", e.target.value)}
                  >
                    {careers.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="input-label">
                  Жұмыс форматы
                  <select
                    value={form.format}
                    onChange={(e) => update("format", e.target.value)}
                  >
                    {Object.entries(formats).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="input-label">
                  Қала
                  <input
                    required
                    pattern=".*\S.*"
                    value={form.city}
                    maxLength={60}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Алматы"
                  />
                </label>
              </div>
              <label className="input-label mb-0!">
                Жалақы диапазоны{" "}
                <span className="text-muted text-xs">
                  Міндетті емес · айына, теңгемен
                </span>
                <input
                  maxLength={60}
                  value={form.salary}
                  onChange={(e) => update("salary", e.target.value)}
                  placeholder="250 000 – 400 000 ₸"
                />
              </label>
            </section>
            <section className="card">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-soft rounded-lg text-xs w-8 h-8 grid place-items-center">
                  02
                </span>
                <h2 className="text-lg!">Пост мазмұны</h2>
              </div>
              <label className="input-label mb-2!">
                Сипаттама
                <textarea
                  required
                  name="description"
                  rows={9}
                  minLength={20}
                  maxLength={3000}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Міндеттер, қажетті дағдылар және жұмыс шарттары туралы жаз..."
                />
              </label>
              <div className="flex justify-between text-[11px] text-muted gap-3">
                <span>Кемінде 20 таңба. Тек мәтін.</span>
                <span>{form.description.length}/3000</span>
              </div>
            </section>
          </div>
          <aside className="xl:sticky xl:top-6">
            <section className="live-preview rounded-2xl border border-line bg-soft p-6">
              <div className="flex justify-between gap-3 mb-7">
                <span className="eyebrow">Алдын ала қарау</span>
                <span className="text-lime">◉</span>
              </div>
              <span className="text-xs text-muted wrap-anywhere">
                {form.company || "Компания атауы"}
              </span>
              <h3 className="text-2xl tracking-tight my-4 wrap-anywhere">
                {form.title || "Пост атауы осында көрінеді"}
              </h3>
              <p className="text-xs mb-5 wrap-anywhere">
                {form.city || "Қала"} · {formats[form.format]}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="chip">
                  {careers.find((c) => c.slug === form.career)?.title}
                </span>
                <span className="chip">Вакансия</span>
              </div>
              <p className="text-sm line-clamp-4 whitespace-pre-line wrap-anywhere">
                {form.description ||
                  "Сипаттамаңның қысқа нұсқасы осы жерде көрсетіледі."}
              </p>
              <p className="mt-6 pt-5 border-t border-line text-ink font-medium text-sm wrap-anywhere">
                {form.salary || "Жалақы көрсетілмеген"}
              </p>
            </section>
            <div className="p-5">
              <h3 className="text-sm mb-2">Жақсы посттың үш белгісі</h3>
              <p className="text-xs leading-6">
                ✓ Нақты атау мен міндеттер
                <br />✓ Түсінікті талаптар
                <br />✓ Ашық жұмыс шарттары
              </p>
            </div>
          </aside>
        </div>
        <div className="flex flex-wrap gap-3 justify-between items-center py-6 border-t border-line mt-6">
          <Link
            className="btn"
            href={postId ? "/posts/" + postId : "/dashboard"}
          >
            Бас тарту
          </Link>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="btn"
              type="submit"
              onClick={(e) => {
                const target = e.currentTarget.form;
                if (target?.reportValidity()) {
                  e.preventDefault();
                  submit("DRAFT");
                }
              }}
            >
              Жоба ретінде сақтау
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Сақталуда..." : "Тексеруге дайындау →"}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-[#a23829]" role="alert">
            {error}
          </p>
        )}
        <Notice>
          Бұл UI демо: сақтау тек осы браузерде жүреді. «Тексеруге дайындау»
          күйді өзгертеді; нақты модерацияға жібермейді.
        </Notice>
      </form>
    </Shell>
  );
}
