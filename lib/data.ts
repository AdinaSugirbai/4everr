// Уақытша үлгі деректер. Келесі аптада Prisma / API-ға ауыстырылады.
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
  { title: "Junior Frontend әзірлеуші", meta: "Kaspi Lab · Астана · гибрид", date: "28 қазан", status: "NEW" },
  { title: "React тағылымдама", meta: "Chocofamily · қашықтан", date: "21 қазан", status: "VIEWED" },
  { title: "UI/UX дизайнер (Junior)", meta: "Beeline KZ · Алматы · офис", date: "14 қазан", status: "INVITED" },
  { title: "QA инженер", meta: "Technodom · Астана", date: "3 қазан", status: "REJECTED" },
];
export type Vac = { title: string; direction: string; city: string; level: string; format: string; from: string; to: string; desc: string; duties: string; reqs: string; skills: string };
export const emptyVac: Vac = { title: "", direction: "Frontend", city: "Астана", level: "Junior", format: "Гибрид", from: "250000", to: "400000", desc: "", duties: "", reqs: "", skills: "HTML, CSS, JavaScript, React" };
export const sampleVac: Vac = { ...emptyVac, title: "Junior Frontend әзірлеуші", desc: "Банк қосымшасының веб-интерфейстерін жасайтын командаға қосыласыз.", duties: "Макеттер бойынша беттер жасау\nReact компоненттерін жазу", reqs: "HTML, CSS, JS негіздері\nGit білу" };
export const savedJobs = [
  { id: 2, title: "React тағылымдама", company: "Chocofamily", city: "қашықтан", level: "Тағылымдама", salary: 150000 },
  { id: 3, title: "Web әзірлеуші (Junior)", company: "Technodom", city: "Астана", level: "Junior", salary: 280000 },
  { id: 4, title: "UI/UX дизайнер", company: "Beeline KZ", city: "Алматы", level: "Junior", salary: 300000 },
  { id: 6, title: "Backend әзірлеуші (Node.js)", company: "Freedom Finance", city: "Астана", level: "Middle", salary: 450000 },
];
export const vacancies = [
  { id: 1, title: "Junior Frontend әзірлеуші", company: "Kaspi Lab", city: "Астана", level: "Junior" },
  { id: 2, title: "React тағылымдама", company: "Chocofamily", city: "қашықтан", level: "Тағылымдама" },
  { id: 3, title: "Web әзірлеуші (Junior)", company: "Technodom", city: "Астана", level: "Junior" },
  { id: 4, title: "UI/UX дизайнер", company: "Beeline KZ", city: "Алматы", level: "Junior" },
  { id: 5, title: "QA инженер", company: "Kolesa Group", city: "Алматы", level: "Middle" },
  { id: 6, title: "Backend әзірлеуші (Node.js)", company: "Freedom Finance", city: "Астана", level: "Middle" },
];
