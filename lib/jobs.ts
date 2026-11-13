export type Job = { id: string; title: string; company: string; city: string; format: "office" | "remote" | "hybrid"; salary: string; level: string; tags: string[]; desc: string; reqs: string[] };
export const JOBS_KEY = "4everr:vacancies";
export const fmtLabel = { office: "Офис|Офис|Office", remote: "Қашықтан|Удалённо|Remote", hybrid: "Гибрид|Гибрид|Hybrid" };

export const seedJobs: Job[] = [
  { id: "j1", title: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", city: "Астана|Астана|Astana", format: "hybrid", salary: "300 000 – 400 000 ₸", level: "Junior", tags: ["HTML", "CSS", "React"],
    desc: "Командада қолданушы интерфейстерін жасайсыз.|Вы будете создавать пользовательские интерфейсы в команде.|You will build user interfaces within the team.",
    reqs: ["HTML, CSS, JavaScript", "React негіздері|Основы React|React basics", "Git"] },
  { id: "j2", title: "UI/UX дизайнер (Junior)|UI/UX дизайнер (Junior)|UI/UX Designer (Junior)", company: "Beeline KZ", city: "Алматы|Алматы|Almaty", format: "office", salary: "250 000 – 320 000 ₸", level: "Junior", tags: ["Figma", "UX"],
    desc: "Мобильді қосымшаның макеттерін жасайсыз.|Вы будете рисовать макеты мобильного приложения.|You will design mockups for a mobile app.",
    reqs: ["Figma", "Портфолио|Портфолио|Portfolio", "UX негіздері|Основы UX|UX basics"] },
  { id: "j3", title: "Python әзірлеуші (тағылымдама)|Python разработчик (стажёр)|Python Developer (Intern)", company: "Kolesa Group", city: "Алматы|Алматы|Almaty", format: "remote", salary: "200 000 – 250 000 ₸", level: "Intern", tags: ["Python", "SQL"],
    desc: "Ментормен бірге ішкі сервистер жасайсыз.|Вместе с ментором будете делать внутренние сервисы.|You will build internal services with a mentor.",
    reqs: ["Python", "SQL негіздері|Основы SQL|SQL basics", "Git"] },
  { id: "j4", title: "QA инженер|QA-инженер|QA Engineer", company: "Chocofamily", city: "Астана|Астана|Astana", format: "hybrid", salary: "280 000 – 350 000 ₸", level: "Junior", tags: ["QA", "Testing"],
    desc: "Веб-өнімдерді қолмен және автоматты тексересіз.|Вы будете тестировать веб-продукты вручную и автоматически.|You will test web products manually and automatically.",
    reqs: ["Тест-кейс жазу|Написание тест-кейсов|Writing test cases", "Bug tracker", "JavaScript негіздері|Основы JavaScript|JavaScript basics"] },
  { id: "j5", title: "Backend (Node.js) Junior|Backend (Node.js) Junior|Backend (Node.js) Junior", company: "Freedom Tech", city: "Астана|Астана|Astana", format: "office", salary: "350 000 – 450 000 ₸", level: "Junior", tags: ["Node.js", "API"],
    desc: "REST API әзірлеп, базамен жұмыс істейсіз.|Вы будете разрабатывать REST API и работать с базой.|You will develop REST APIs and work with databases.",
    reqs: ["JavaScript / Node.js", "REST", "SQL"] },
];
