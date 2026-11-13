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
  { id: 1, vacancyId: "j1", vacancy: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", name: "Айдана Серікқызы", email: "aidana@mail.kz", position: "Junior Frontend", city: "Астана|Астана|Astana", phone: "+7 701 000 00 01",
    about: "Frontend үйреніп жатырмын, екі оқу жобасын жасадым.|Изучаю Frontend, сделала два учебных проекта.|I am learning Frontend and have built two study projects.",
    education: "ЕНУ, Информатика|ЕНУ, Информатика|ENU, Computer Science", skills: [{ name: "HTML", level: 90 }, { name: "CSS", level: 80 }, { name: "React", level: 55 }], photo: "",
    cover: "Командаңызға қосылуға қуаныштымын.|Буду рада присоединиться к вашей команде.|I would be happy to join your team.", date: "07.11.2026", status: "NEW" },
  { id: 2, vacancyId: "j4", vacancy: "QA инженер|QA-инженер|QA Engineer", company: "Chocofamily", name: "Нұрлан Әбілов", email: "nurlan@mail.kz", position: "QA Junior", city: "Алматы|Алматы|Almaty", phone: "+7 702 000 00 02",
    about: "Қолмен тестілеу курсын бітірдім, тест-кейс жазамын.|Окончил курс ручного тестирования, пишу тест-кейсы.|I finished a manual testing course and write test cases.",
    education: "КБТУ|КБТУ|KBTU", skills: [{ name: "Testing", level: 75 }, { name: "SQL", level: 50 }], photo: "",
    cover: "Сапаға мұқият қараймын.|Внимательно отношусь к качеству.|I pay close attention to quality.", date: "06.11.2026", status: "VIEWED" },
  { id: 3, vacancyId: "j3", vacancy: "Python әзірлеуші (тағылымдама)|Python разработчик (стажёр)|Python Developer (Intern)", company: "Kolesa Group", name: "Dana Kim", email: "dana@mail.kz", position: "Python Intern", city: "Алматы|Алматы|Almaty", phone: "+7 705 000 00 03",
    about: "Python-да шағын боттар мен скрипттер жазамын.|Пишу на Python небольших ботов и скрипты.|I write small bots and scripts in Python.",
    education: "AITU|AITU|AITU", skills: [{ name: "Python", level: 70 }, { name: "Git", level: 60 }], photo: "",
    cover: "Тағылымдамаға қызығамын.|Меня интересует стажировка.|I am interested in the internship.", date: "05.11.2026", status: "INTERVIEW" },
];
