export type Stage = "NEW" | "VIEWED" | "INVITED" | "REJECTED";
export const stageLabel: Record<Stage, string> = {
  NEW: "Жаңа|Новая|New",
  VIEWED: "Қаралды|Просмотрена|Viewed",
  INVITED: "Шақырылды|Приглашён|Invited",
  REJECTED: "Қабылданбады|Отказ|Rejected",
};
export const stageCls: Record<Stage, string> = { NEW: "c-i", VIEWED: "c-w", INVITED: "c-ok", REJECTED: "c-b" };

export type Application = {
  id: number; vacancy: string; company: string; date: string; stage: Stage; letter: string; reply: string;
  name: string; role: string; match: number; skills: [string, number][]; tests: [string, number][];
};

export const myApps: Application[] = [
  { id: 1, vacancy: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", date: "28 қазан", stage: "NEW", letter: "Сәлеметсіз бе! HTML мен CSS-ті жақсы білемін, қазір React үйреніп жатырмын.|Здравствуйте! Хорошо знаю HTML и CSS, сейчас изучаю React.|Hello! I know HTML and CSS well, and I am currently learning React.", reply: "", name: "Әсел Жақсылық", role: "Junior Frontend", match: 82, skills: [], tests: [] },
  { id: 2, vacancy: "React тағылымдама|React стажировка|React Internship", company: "Chocofamily", date: "21 қазан", stage: "VIEWED", letter: "Тағылымдамада нақты жобамен жұмыс істегім келеді.|Хочу работать над реальным проектом во время стажировки.|I want to work on a real project during the internship.", reply: "", name: "Әсел Жақсылық", role: "Junior Frontend", match: 74, skills: [], tests: [] },
  { id: 3, vacancy: "UI/UX дизайнер (Junior)|UI/UX дизайнер (Junior)|UI/UX Designer (Junior)", company: "Beeline KZ", date: "14 қазан", stage: "INVITED", letter: "Figma-да макет жасай аламын, портфолиомды жібердім.|Умею делать макеты в Figma, отправил(а) портфолио.|I can design mockups in Figma and sent my portfolio.", reply: "Сәлем, Әсел! Сізді сұхбатқа шақырамыз: 12 қараша, 11:00, офис, Астана.|Привет, Асель! Приглашаем вас на собеседование: 12 ноября, 11:00, офис, Астана.|Hi Asel! We invite you for an interview: November 12, 11:00, office, Astana.", name: "Әсел Жақсылық", role: "Junior Frontend", match: 69, skills: [], tests: [] },
];

export const received: Application[] = [
  { id: 11, vacancy: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", date: "30 қазан", stage: "NEW", letter: "HTML мен CSS-ті жақсы білемін, React үйреніп жатырмын. Командада өскім келеді.|Хорошо знаю HTML и CSS, изучаю React. Хочу расти в команде.|I know HTML and CSS well and am learning React. I want to grow within a team.", reply: "", name: "Әсел Жақсылық", role: "Junior Frontend", match: 82, skills: [["HTML", 90], ["CSS", 85], ["JavaScript", 64], ["React", 30]], tests: [["HTML", 92], ["CSS", 85], ["JavaScript", 64]] },
  { id: 12, vacancy: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", date: "29 қазан", stage: "VIEWED", letter: "React-те екі оқу жобасын жасадым, код-ревьюге дайынмын.|Сделал(а) два учебных проекта на React, готов(а) к код-ревью.|I built two study projects in React and am ready for code review.", reply: "", name: "Данияр Серіков", role: "Frontend", match: 91, skills: [["HTML", 95], ["CSS", 90], ["JavaScript", 88], ["React", 80]], tests: [["HTML", 96], ["JavaScript", 89], ["React", 82]] },
  { id: 13, vacancy: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", date: "27 қазан", stage: "INVITED", letter: "Дизайннан кодқа ауысқым келеді, макетті дәл кодтай аламын.|Хочу перейти из дизайна в код, точно воссоздаю макеты.|I want to move from design to code and can replicate mockups precisely.", reply: "", name: "Мадина Оспанова", role: "UI әзірлеуші", match: 74, skills: [["HTML", 85], ["CSS", 92], ["JavaScript", 55], ["React", 40]], tests: [["HTML", 84], ["CSS", 93], ["JavaScript", 58]] },
  { id: 14, vacancy: "Junior Frontend әзірлеуші|Junior Frontend разработчик|Junior Frontend Developer", company: "Kaspi Lab", date: "25 қазан", stage: "REJECTED", letter: "Жұмыс іздеп жүрмін, тәжірибем аз.|Ищу работу, опыта пока немного.|I am looking for a job and have little experience so far.", reply: "", name: "Ерлан Төлеген", role: "Студент", match: 58, skills: [["HTML", 60], ["CSS", 50], ["JavaScript", 35], ["React", 10]], tests: [["HTML", 61], ["CSS", 52], ["JavaScript", 38]] },
];
