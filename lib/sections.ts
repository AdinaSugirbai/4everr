export type SectionSlug = "about" | "skills" | "tests" | "applications" | "saved";

export const sections: { slug: SectionSlug; title: string; desc: string; icon: string }[] = [
  { slug: "about", icon: "👤", title: "Резюме|Резюме|Resume", desc: "Өзім туралы, білімім және байланыс|Обо мне, образование и контакты|About me, education and contacts" },
  { slug: "skills", icon: "🛠️", title: "Дағдылар|Навыки|Skills", desc: "Дағдылар деңгейі бойынша|Навыки по уровням|Skills grouped by level" },
  { slug: "tests", icon: "📝", title: "Тест нәтижелері|Результаты тестов|Test results", desc: "Барлық тест нәтижелері және статистика|Все результаты тестов и статистика|All test results and statistics" },
  { slug: "applications", icon: "📨", title: "Өтінімдерім|Мои отклики|My applications", desc: "Жіберілген өтініштер және олардың күйі|Отправленные отклики и их статус|Sent applications and their status" },
  { slug: "saved", icon: "⭐", title: "Таңдаулылар|Избранное|Saved jobs", desc: "Сақталған вакансиялар|Сохранённые вакансии|Jobs you saved" },
];

export const isSection = (s: string): s is SectionSlug => sections.some((x) => x.slug === s);
export const sectionHref = (s: SectionSlug) => `/profile/${s}`;

// Деректер кілттері: жобада басқаша болса, тек осы жерді түзетіңіз
export const DATA_KEYS = {
  results: (email: string) => `4everr:results:${email}`,
  saved: (email: string) => `4everr:saved:${email}`,
};

export const fmtDate = (s: string, lang: string) => {
  const d = new Date(s);
  if (isNaN(+d)) return s;
  return d.toLocaleDateString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long" });
};
