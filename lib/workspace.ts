export type PostStatus = "DRAFT" | "PENDING";
export type Post = {
  id: string;
  title: string;
  company: string;
  career: string;
  format: string;
  city: string;
  salary: string;
  description: string;
  status: PostStatus;
  updatedAt: string;
};
export type Activity = {
  id: string;
  postId: string;
  title: string;
  action: "CREATE" | "UPDATE" | "REVIEW";
  date: string;
  status: PostStatus;
};
export type Workspace = { posts: Post[]; activities: Activity[] };
const stamp = "2026-10-28T10:00:00+05:00";
export const initialWorkspace: Workspace = {
  posts: [
    {
      id: "demo-frontend",
      title: "Junior Frontend Developer",
      company: "Steppe Studio",
      career: "frontend",
      format: "REMOTE",
      city: "Алматы",
      salary: "250 000 – 400 000 ₸",
      description:
        "Жаңа интерфейстерді құрастыруға және қолданыстағы компоненттерді жақсартуға қатыс.\n\nМіндеттер:\n• React компоненттерін әзірлеу\n• Мобильді интерфейстерді бейімдеу\n• Командамен бірге кодты тексеру\n\nҚажетті дағдылар: HTML, CSS, JavaScript. Оқу жобалары бар үміткерлерді де қарастырамыз.",
      status: "PENDING",
      updatedAt: stamp,
    },
    {
      id: "demo-qa",
      title: "QA Engineer Intern",
      company: "Steppe Studio",
      career: "qa",
      format: "HYBRID",
      city: "Астана",
      salary: "150 000 – 220 000 ₸",
      description:
        "Командаға өнім сапасын жақсартуға көмектесетін тағылымдамашы іздейміз.\n\nТест сценарийлерін дайындау, қателерді сипаттау және командалық талқылауға қатысу.",
      status: "DRAFT",
      updatedAt: stamp,
    },
  ],
  activities: [
    {
      id: "tx-003",
      postId: "demo-frontend",
      title: "Junior Frontend Developer",
      action: "REVIEW",
      date: "2026-10-28T11:30:00+05:00",
      status: "PENDING",
    },
    {
      id: "tx-002",
      postId: "demo-qa",
      title: "QA Engineer Intern",
      action: "CREATE",
      date: "2026-10-28T10:45:00+05:00",
      status: "DRAFT",
    },
    {
      id: "tx-001",
      postId: "demo-frontend",
      title: "Junior Frontend Developer",
      action: "CREATE",
      date: stamp,
      status: "DRAFT",
    },
  ],
};
export const workspaceKey = "4everr-ui-workspace-v1";
export const actionLabels: Record<Activity["action"], string> = {
  CREATE: "Пост жасалды",
  UPDATE: "Пост өңделді",
  REVIEW: "Тексеруге дайындалды",
};
export function readWorkspace(): Workspace {
  try {
    const s = localStorage.getItem(workspaceKey);
    if (s) {
      const d = JSON.parse(s) as Workspace;
      if (Array.isArray(d.posts) && Array.isArray(d.activities)) return d;
    }
  } catch {}
  return initialWorkspace;
}
export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("kk-KZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Qyzylorda",
  }).format(new Date(value));
}
