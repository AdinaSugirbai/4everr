export type AppStatus = "NEW" | "VIEWED" | "INTERVIEW" | "HIRED" | "REJECTED";
export type Application = {
  id: number; vacancyId: string; vacancy: string; company: string;
  name: string; email: string; position: string; city: string; phone: string; about: string; education: string;
  skills: { name: string; level: number }[]; photo: string; cover: string; date: string; status: AppStatus;
};
export const APPS_KEY = "4everr:apps";
export const appStatuses: AppStatus[] = ["NEW", "VIEWED", "INTERVIEW", "HIRED", "REJECTED"];
export const appLabel: Record<AppStatus, string> = { NEW: "Жаңа|Новая|New", VIEWED: "Қаралды|Просмотрена|Viewed", INTERVIEW: "Сұхбат|Собеседование|Interview", HIRED: "Қабылданды|Принят|Hired", REJECTED: "Бас тартылды|Отказ|Rejected" };
export const appCls: Record<AppStatus, string> = { NEW: "c-i", VIEWED: "c-w", INTERVIEW: "c-w", HIRED: "c-ok", REJECTED: "c-b" };

export const seedApps: Application[] = [
  { id: 1, vacancyId: "j1", vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", name: "Айдана Серікқызы", email: "aidana@mail.kz", position: "Junior Frontend", city: "Астана", phone: "+7 701 000 00 01", about: "Frontend үйреніп жатырмын, екі оқу жобасын жасадым.", education: "ЕНУ, Информатика", skills: [{ name: "HTML", level: 90 }, { name: "CSS", level: 80 }, { name: "React", level: 55 }], photo: "", cover: "Командаңызға қосылуға қуаныштымын.", date: "07.11.2026", status: "NEW" },
  { id: 2, vacancyId: "j4", vacancy: "QA инженер", company: "Chocofamily", name: "Нұрлан Әбілов", email: "nurlan@mail.kz", position: "QA Junior", city: "Алматы", phone: "+7 702 000 00 02", about: "Қолмен тестілеу курсын бітірдім, тест-кейс жазамын.", education: "КБТУ", skills: [{ name: "Testing", level: 75 }, { name: "SQL", level: 50 }], photo: "", cover: "Сапаға мұқият қараймын.", date: "06.11.2026", status: "VIEWED" },
  { id: 3, vacancyId: "j3", vacancy: "Python әзірлеуші (тағылымдама)", company: "Kolesa Group", name: "Dana Kim", email: "dana@mail.kz", position: "Python Intern", city: "Алматы", phone: "+7 705 000 00 03", about: "Python-да шағын боттар мен скрипттер жазамын.", education: "AITU", skills: [{ name: "Python", level: 70 }, { name: "Git", level: 60 }], photo: "", cover: "Тағылымдамаға қызығамын.", date: "05.11.2026", status: "INTERVIEW" },
];
