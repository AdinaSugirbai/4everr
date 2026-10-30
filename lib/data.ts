// Уақытша үлгі деректер. Келесі аптада Prisma / API-ға ауыстырылады.
export const tests = [
  { topic: "HTML", level: "Middle", score: 92, time: "18:40", date: "29 қазан" },
  { topic: "JavaScript", level: "Junior", score: 64, time: "24:10", date: "26 қазан" },
  { topic: "CSS", level: "Middle", score: 85, time: "21:05", date: "22 қазан" },
  { topic: "Java", level: "Junior", score: 41, time: "29:55", date: "17 қазан" },
  { topic: "JavaScript", level: "Junior", score: 52, time: "27:30", date: "9 қазан" },
  { topic: "HTML", level: "Junior", score: 88, time: "12:20", date: "2 қазан" },
  { topic: "Java", level: "Middle", score: 73, time: "26:15", date: "30 қазан" },
];
export type AppStatus = "NEW" | "VIEWED" | "INVITED" | "REJECTED";
export const statusUi: Record<AppStatus, { label: string; cls: string }> = {
  NEW: { label: "Жаңа", cls: "c-i" }, VIEWED: { label: "Қаралды", cls: "c-w" },
  INVITED: { label: "Шақырылды", cls: "c-ok" }, REJECTED: { label: "Қабылданбады", cls: "c-b" },
};
export const applications: { title: string; meta: string; date: string; status: AppStatus }[] = [
  { title: "Junior Frontend әзірлеуші", meta: "Kaspi Lab · Астана · гибрид", date: "28 қазан", status: "NEW" },
  { title: "React тағылымдама", meta: "Chocofamily · қашықтан", date: "21 қазан", status: "VIEWED" },
  { title: "UI/UX дизайнер (Junior)", meta: "Beeline KZ · Алматы · офис", date: "14 қазан", status: "INVITED" },
  { title: "QA инженер", meta: "Technodom · Астана", date: "3 қазан", status: "REJECTED" },
];
export type Vac = { title: string; direction: string; city: string; level: string; format: string; from: string; to: string; desc: string; duties: string; reqs: string; skills: string };
export const emptyVac: Vac = { title: "", direction: "Frontend", city: "Астана", level: "Junior", format: "Гибрид", from: "250000", to: "400000", desc: "", duties: "", reqs: "", skills: "HTML, CSS, JavaScript, React" };
export const sampleVac: Vac = { ...emptyVac, title: "Junior Frontend әзірлеуші", desc: "Банк қосымшасының веб-интерфейстерін жасайтын командаға қосыласыз.", duties: "Макеттер бойынша беттер жасау\nReact компоненттерін жазу", reqs: "HTML, CSS, JS негіздері\nGit білу" };
