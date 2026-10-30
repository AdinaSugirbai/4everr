export type Career = {
  slug: string;
  title: string;
  description: string;
  skills: string[];
  icon: string;
};
export const careers: Career[] = [
  {
    slug: "frontend",
    title: "Frontend",
    description:
      "Веб-интерфейстерді жаса. Идеяны пайдаланушы көретін өнімге айналдыр.",
    skills: ["HTML", "CSS", "JavaScript"],
    icon: "⌘",
  },
  {
    slug: "backend",
    title: "Backend",
    description: "Қосымшаның ішкі логикасын құрып, деректер мен API-ды басқар.",
    skills: ["Java", "SQL", "API"],
    icon: "{ }",
  },
  {
    slug: "data-science",
    title: "Data Science",
    description: "Деректерден заңдылық тауып, пайдалы шешімдер ұсын.",
    skills: ["Python", "SQL", "Statistics"],
    icon: "∑",
  },
  {
    slug: "mobile",
    title: "Mobile",
    description: "Күнделікті өмірге қажет мобильді қосымшаларды жаса.",
    skills: ["Kotlin", "Swift", "Git"],
    icon: "▣",
  },
  {
    slug: "qa",
    title: "QA",
    description: "Өнім сапасын тексеріп, сенімді жұмыс істеуіне көмектес.",
    skills: ["Testing", "SQL", "Git"],
    icon: "✓",
  },
  {
    slug: "devops",
    title: "DevOps",
    description: "Инфрақұрылым мен өнімді жеткізу процесін автоматтандыр.",
    skills: ["Linux", "Docker", "CI/CD"],
    icon: "∞",
  },
  {
    slug: "ui-ux",
    title: "UI/UX",
    description: "Адамдарға түсінікті әрі ыңғайлы цифрлық тәжірибе жаса.",
    skills: ["Figma", "Research", "Prototype"],
    icon: "✳",
  },
];
export type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  level: string;
  format: string;
  salary: string;
  career: string;
  skills: string[];
};
export const jobs: Job[] = [
  {
    id: "1",
    title: "Junior Frontend Developer",
    company: "Steppe Studio",
    city: "Алматы",
    level: "Junior",
    format: "REMOTE",
    salary: "250 000 – 400 000 ₸",
    career: "frontend",
    skills: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: "2",
    title: "Java Backend Intern",
    company: "Qadam Tech",
    city: "Астана",
    level: "Intern",
    format: "HYBRID",
    salary: "150 000 – 220 000 ₸",
    career: "backend",
    skills: ["Java", "SQL", "Git"],
  },
  {
    id: "3",
    title: "Junior QA Engineer",
    company: "Ornek Digital",
    city: "Алматы",
    level: "Junior",
    format: "OFFICE",
    salary: "220 000 – 350 000 ₸",
    career: "qa",
    skills: ["Testing", "SQL", "Git"],
  },
  {
    id: "4",
    title: "UI/UX Designer Intern",
    company: "Steppe Studio",
    city: "Астана",
    level: "Intern",
    format: "REMOTE",
    salary: "180 000 – 250 000 ₸",
    career: "ui-ux",
    skills: ["Figma", "Research"],
  },
];
export const formats: Record<string, string> = {
  REMOTE: "Қашықтан",
  HYBRID: "Гибрид",
  OFFICE: "Кеңсе",
};
export const topics = ["HTML", "CSS", "JavaScript", "Java"] as const;
export type Topic = (typeof topics)[number];
export type Question = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  subtopic: string;
};
export const questions: Record<Topic, Question[]> = {
  HTML: [
    {
      text: "Қай элемент беттің негізгі тақырыбын білдіреді?",
      options: ["h1", "p", "span", "div"],
      correct: 0,
      explanation: "h1 — негізгі тақырыпты білдіретін семантикалық элемент.",
      subtopic: "Семантика",
    },
    {
      text: "Сілтеме бағытын қай атрибут көрсетеді?",
      options: ["src", "href", "alt", "type"],
      correct: 1,
      explanation: "href сілтеменің мекенжайын көрсетеді.",
      subtopic: "Сілтемелер",
    },
    {
      text: "Суреттің мәтіндік баламасы қай атрибутта жазылады?",
      options: ["title", "id", "alt", "class"],
      correct: 2,
      explanation:
        "alt суретті көре алмайтын пайдаланушыға мәтіндік балама береді.",
      subtopic: "Қолжетімділік",
    },
  ],
  CSS: [
    {
      text: "Flex контейнерді қалай қосамыз?",
      options: [
        "display: flex",
        "position: flex",
        "flex: true",
        "display: block",
      ],
      correct: 0,
      explanation: "display: flex элементті flex контейнерге айналдырады.",
      subtopic: "Flexbox",
    },
    {
      text: "Мәтіннің түсін қай қасиет өзгертеді?",
      options: ["background", "color", "font-size", "margin"],
      correct: 1,
      explanation: "color мәтін түсін анықтайды.",
      subtopic: "Қасиеттер",
    },
    {
      text: "Сыртқы шегіністі анықтайтын қасиет?",
      options: ["padding", "border", "margin", "gap"],
      correct: 2,
      explanation: "margin элемент шекарасының сыртындағы аралықты анықтайды.",
      subtopic: "Box model",
    },
  ],
  JavaScript: [
    {
      text: "Қайта тағайындалмайтын айнымалы қалай жарияланады?",
      options: ["const", "var", "static", "fixed"],
      correct: 0,
      explanation:
        "const айнымалыға басқа мәнді қайта тағайындауға жол бермейді.",
      subtopic: "Айнымалылар",
    },
    {
      text: "Массив соңына элемент қосатын әдіс?",
      options: ["pop", "push", "shift", "slice"],
      correct: 1,
      explanation: "push массив соңына элемент қосады.",
      subtopic: "Массивтер",
    },
    {
      text: "Қатаң теңдік операторы?",
      options: ["=", "==", "===", "!="],
      correct: 2,
      explanation: "=== мәндерді типті өзгертпей салыстырады.",
      subtopic: "Операторлар",
    },
  ],
  Java: [
    {
      text: "Java-дағы бүтін сан типі?",
      options: ["int", "string", "boolean", "void"],
      correct: 0,
      explanation: "int бүтін сандарды сақтайды.",
      subtopic: "Типтер",
    },
    {
      text: "Жаңа объект жасайтын кілт сөз?",
      options: ["class", "new", "this", "void"],
      correct: 1,
      explanation: "new кластың жаңа экземплярын жасайды.",
      subtopic: "Объектілер",
    },
    {
      text: "Қай коллекция бірегей элементтерді сақтайды?",
      options: ["List", "Queue", "Set", "ArrayList"],
      correct: 2,
      explanation: "Set қайталанатын элементтерге жол бермейді.",
      subtopic: "Коллекциялар",
    },
  ],
};
export const interestQuestions = [
  "Бос уақытыңда немен айналысқан ұнайды?",
  "Қандай тапсырма сені қызықтырады?",
  "Жаңа өнімде нені бірінші байқайсың?",
  "Қандай нәтижеге жеткің келеді?",
  "Командада қай іске жақынсың?",
  "Қандай мәселені шешер едің?",
  "Нені үйренуге дайынсың?",
  "Қай жұмыс саған қызығырақ?",
  "Жобаны қалай жақсартар едің?",
  "Қай құралды байқап көргің келеді?",
  "Қандай тәжірибе жинағың келеді?",
  "Алғашқы жобаң қандай болғанын қалайсың?",
];
export const interestOptions = [
  [
    "Интерфейс пен дизайн",
    "Веб-бетті құрастыру",
    "Пайдаланушы жолын зерттеу",
    "Прототип жасау",
  ],
  [
    "Логика мен жүйелер",
    "Сервер логикасын құру",
    "API жұмысын зерттеу",
    "Деректерді басқару",
  ],
  [
    "Деректер мен заңдылықтар",
    "Деректерді талдау",
    "Статистикамен жұмыс",
    "Болжам жасау",
  ],
  [
    "Сапа мен тұрақтылық",
    "Қателерді табу",
    "Тестілеуді жоспарлау",
    "Жүйені автоматтандыру",
  ],
];
export function recommend(answers: number[]) {
  const weights = [
    [3, 0, 0, 2, 0, 0, 3],
    [0, 3, 1, 2, 0, 2, 0],
    [0, 1, 3, 0, 1, 1, 0],
    [0, 1, 0, 0, 3, 3, 0],
  ];
  return careers
    .map((career, i) => ({
      career,
      percent: Math.round(
        (answers.reduce((s, a) => s + (weights[a]?.[i] ?? 0), 0) / 36) * 100,
      ),
    }))
    .sort((a, b) => b.percent - a.percent);
}
