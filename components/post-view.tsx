"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { careers, formats } from "@/lib/data";
import { dateLabel } from "@/lib/workspace";
import { useWorkspace } from "@/lib/use-workspace";
import { Notice } from "./ui";
import { Shell, Badge, Missing } from "./workspace-shell";
import { PostEditor } from "./post-editor";
export function PostView({ id }: { id: string }) {
  const { data, ready } = useWorkspace(),
    params = useSearchParams();
  if (params.get("edit") === "1") return <PostEditor key={id} postId={id} />;
  if (!ready)
    return (
      <Shell>
        <p role="status" className="py-10">
          Жүктелуде...
        </p>
      </Shell>
    );
  const post = data.posts.find((p) => p.id === id);
  if (!post) return <Missing />;
  const career = careers.find((c) => c.slug === post.career);
  return (
    <Shell>
      <div className="flex justify-between gap-4 items-center mb-7">
        <Link
          href="/dashboard"
          className="min-h-11 inline-flex items-center text-sm"
        >
          ← Менің посттарым
        </Link>
        <Badge status={post.status} />
      </div>
      {params.get("saved") === "1" && (
        <div
          role="status"
          className="save-toast rounded-xl bg-soft border border-line p-4 mb-6 text-sm"
        >
          ✓ Өзгерістер осы браузерде сақталды.
        </div>
      )}
      <div className="grid xl:grid-cols-[1.7fr_1fr] gap-5 items-start">
        <article className="card post-article p-6! sm:p-8!">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-soft w-11 h-11 grid place-items-center text-xl">
              {post.company[0]}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink! wrap-anywhere">{post.company}</p>
              <p className="text-[11px]">Вакансия посты · Демо</p>
            </div>
          </div>
          <h1 className="text-3xl! sm:text-4xl! leading-tight mt-7 mb-5 wrap-anywhere">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="chip">{post.city}</span>
            <span className="chip">{formats[post.format]}</span>
            <span className="chip">{career?.title}</span>
          </div>
          <p className="text-xl text-ink! mt-7 mb-8 wrap-anywhere">
            {post.salary || "Жалақы көрсетілмеген"}
          </p>
          <div className="border-t border-line pt-7">
            <h2 className="text-xl! mb-5">Мүмкіндік туралы</h2>
            <p className="whitespace-pre-line text-sm wrap-anywhere">
              {post.description}
            </p>
          </div>
          <div className="border-t border-line mt-8 pt-6">
            <p className="text-xs">
              Соңғы өзгеріс: {dateLabel(post.updatedAt)}
            </p>
          </div>
        </article>
        <aside className="grid gap-4">
          <section className="card bg-forest! text-white border-forest!">
            <span className="eyebrow text-lime!">Постты басқару</span>
            <h2 className="text-2xl! my-5">Әр бөлшек маңызды.</h2>
            <p className="text-[#d1dec8]! text-sm mb-6">
              Мәтінді, жұмыс шарттарын және басқа мәліметтерді жаңарта аласың.
            </p>
            <Link
              className="btn btn-light w-full"
              href={"/posts/" + id + "?edit=1"}
            >
              Постты өңдеу →
            </Link>
          </section>
          <section className="card">
            <h3 className="text-base mb-5">Пост ақпараты</h3>
            <dl className="text-xs grid gap-4">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Күйі</dt>
                <dd>{post.status === "DRAFT" ? "Жоба" : "Тексеруге дайын"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Бағыты</dt>
                <dd>{career?.title}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Көрінуі</dt>
                <dd>Тек осы браузерде</dd>
              </div>
            </dl>
          </section>
          <Link className="btn" href="/dashboard">
            Әрекеттер тарихын көру →
          </Link>
        </aside>
      </div>
      <Notice>
        Бұл пост жалпы вакансиялар тізімінде жарияланбайды. Нақты жариялау,
        модерация және рөлдер сервермен біріктіру кезінде қосылады.
      </Notice>
    </Shell>
  );
}
