// Уақытша үлгі деректер. Келесі аптада Prisma / API-ға ауыстырылады.
// Мәтін форматы: қазақша|русский|English
export const tests = [
  { topic: "HTML", level: "Middle", score: 92, time: "18:40", date: "29 қазан" },
  { topic: "JavaScript", level: "Junior", score: 64, time: "24:10", date: "26 қазан" },
  { topic: "CSS", level: "Middle", score: 85, time: "21:05", date: "22 қазан" },
  { topic: "Java", level: "Junior", score: 41, time: "29:55", date: "17 қазан" },
  { topic: "JavaScript", level: "Junior", score: 52, time: "27:30", date: "9 қазан" },
  { topic: "HTML", level: "Junior", score: 88, time: "12:20", date: "2 қазан" },
];
export type AppStatus = "NEW" | "VIEWED" | "INVITED" | "REJECTED";
export const statusUi: Record<AppStatus, { label: string; cls: string }> = {
  NEW: { label: "Жаңа", cls: "c-i" }, VIEWED: { label: "Қаралды", cls: "c-w" },
  INVITED: { label: "Шақырылды", cls: "c-ok" }, REJECTED: { label: "Қабылданбады", cls: "c-b" },
};
export const applications: { title: string; meta: string; date: string; status: AppStatus }[] = [
  { title: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", meta: "Kaspi Lab · Астана · гибрид|Kaspi Lab · Астана · гибрид|Kaspi Lab · Astana · hybrid", date: "28 қазан", status: "NEW" },
  { title: "React тағылымдама|React стажировка|React Internship", meta: "Chocofamily · қашықтан|Chocofamily · удалённо|Chocofamily · remote", date: "21 қазан", status: "VIEWED" },
  { title: "UI/UX дизайнер (Junior)|UI/UX дизайнер (Junior)|UI/UX Designer (Junior)", meta: "Beeline KZ · Алматы · офис|Beeline KZ · Алматы · офис|Beeline KZ · Almaty · office", date: "14 қазан", status: "INVITED" },
  { title: "QA инженер|QA-инженер|QA Engineer", meta: "Technodom · Астана|Technodom · Астана|Technodom · Astana", date: "3 қазан", status: "REJECTED" },
];
export type Vac = { title: string; direction: string; city: string; level: string; format: string; from: string; to: string; desc: string; duties: string; reqs: string; skills: string };
export const emptyVac: Vac = { title: "", direction: "Frontend", city: "Астана", level: "Junior", format: "Гибрид", from: "250000", to: "400000", desc: "", duties: "", reqs: "", skills: "HTML, CSS, JavaScript, React" };
export const sampleVac: Vac = { ...emptyVac, title: "Junior Frontend әзірлеуші", desc: "Банк қосымшасының веб-интерфейстерін жасайтын командаға қосыласыз.", duties: "Макеттер бойынша беттер жасау\nReact компоненттерін жазу", reqs: "HTML, CSS, JS негіздері\nGit білу" };
export const savedJobs = [
  { id: 2, title: "React тағылымдама|React стажировка|React Internship", company: "Chocofamily", city: "қашықтан|удалённо|remote", level: "Тағылымдама", salary: 150000 },
  { id: 3, title: "Web әзірлеуші (Junior)|Web-разработчик (Junior)|Web Developer (Junior)", company: "Technodom", city: "Астана|Астана|Astana", level: "Junior", salary: 280000 },
  { id: 4, title: "UI/UX дизайнер|UI/UX дизайнер|UI/UX Designer", company: "Beeline KZ", city: "Алматы|Алматы|Almaty", level: "Junior", salary: 300000 },
  { id: 6, title: "Backend әзірлеуші (Node.js)|Backend-разработчик (Node.js)|Backend Developer (Node.js)", company: "Freedom Finance", city: "Астана|Астана|Astana", level: "Middle", salary: 450000 },
];
export const vacancies = [
  { id: 1, title: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", city: "Астана|Астана|Astana", level: "Junior" },
  { id: 2, title: "React тағылымдама|React стажировка|React Internship", company: "Chocofamily", city: "қашықтан|удалённо|remote", level: "Тағылымдама" },
  { id: 3, title: "Web әзірлеуші (Junior)|Web-разработчик (Junior)|Web Developer (Junior)", company: "Technodom", city: "Астана|Астана|Astana", level: "Junior" },
  { id: 4, title: "UI/UX дизайнер|UI/UX дизайнер|UI/UX Designer", company: "Beeline KZ", city: "Алматы|Алматы|Almaty", level: "Junior" },
  { id: 5, title: "QA инженер|QA-инженер|QA Engineer", company: "Kolesa Group", city: "Алматы|Алматы|Almaty", level: "Middle" },
  { id: 6, title: "Backend әзірлеуші (Node.js)|Backend-разработчик (Node.js)|Backend Developer (Node.js)", company: "Freedom Finance", city: "Астана|Астана|Astana", level: "Middle" },
];
