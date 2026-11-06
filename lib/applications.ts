export type Stage = "NEW" | "VIEWED" | "INVITED" | "REJECTED";
export const stageLabel: Record<Stage, string> = { NEW: "Жаңа", VIEWED: "Қаралды", INVITED: "Шақырылды", REJECTED: "Қабылданбады" };
export const stageCls: Record<Stage, string> = { NEW: "c-i", VIEWED: "c-w", INVITED: "c-ok", REJECTED: "c-b" };

export type Application = {
  id: number; vacancy: string; company: string; date: string; stage: Stage; letter: string; reply: string;
  name: string; role: string; match: number; skills: [string, number][]; tests: [string, number][];
};

export const myApps: Application[] = [
  { id: 1, vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", date: "28 қазан", stage: "NEW", letter: "Сәлеметсіз бе! HTML мен CSS-ті жақсы білемін, қазір React үйреніп жатырмын.", reply: "", name: "Әсел Жақсылық", role: "Junior Frontend", match: 82, skills: [], tests: [] },
  { id: 2, vacancy: "React тағылымдама", company: "Chocofamily", date: "21 қазан", stage: "VIEWED", letter: "Тағылымдамада нақты жобамен жұмыс істегім келеді.", reply: "", name: "Әсел Жақсылық", role: "Junior Frontend", match: 74, skills: [], tests: [] },
  { id: 3, vacancy: "UI/UX дизайнер (Junior)", company: "Beeline KZ", date: "14 қазан", stage: "INVITED", letter: "Figma-да макет жасай аламын, портфолиомды жібердім.", reply: "Сәлем, Әсел! Сізді сұхбатқа шақырамыз: 12 қараша, 11:00, офис, Астана.", name: "Әсел Жақсылық", role: "Junior Frontend", match: 69, skills: [], tests: [] },
];

export const received: Application[] = [
  { id: 11, vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", date: "30 қазан", stage: "NEW", letter: "HTML мен CSS-ті жақсы білемін, React үйреніп жатырмын. Командада өскім келеді.", reply: "", name: "Әсел Жақсылық", role: "Junior Frontend", match: 82, skills: [["HTML", 90], ["CSS", 85], ["JavaScript", 64], ["React", 30]], tests: [["HTML", 92], ["CSS", 85], ["JavaScript", 64]] },
  { id: 12, vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", date: "29 қазан", stage: "VIEWED", letter: "React-те екі оқу жобасын жасадым, код-ревьюге дайынмын.", reply: "", name: "Данияр Серіков", role: "Frontend", match: 91, skills: [["HTML", 95], ["CSS", 90], ["JavaScript", 88], ["React", 80]], tests: [["HTML", 96], ["JavaScript", 89], ["React", 82]] },
  { id: 13, vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", date: "27 қазан", stage: "INVITED", letter: "Дизайннан кодқа ауысқым келеді, макетті дәл кодтай аламын.", reply: "", name: "Мадина Оспанова", role: "UI әзірлеуші", match: 74, skills: [["HTML", 85], ["CSS", 92], ["JavaScript", 55], ["React", 40]], tests: [["HTML", 84], ["CSS", 93], ["JavaScript", 58]] },
  { id: 14, vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", date: "25 қазан", stage: "REJECTED", letter: "Жұмыс іздеп жүрмін, тәжірибем аз.", reply: "", name: "Ерлан Төлеген", role: "Студент", match: 58, skills: [["HTML", 60], ["CSS", 50], ["JavaScript", 35], ["React", 10]], tests: [["HTML", 61], ["CSS", 52], ["JavaScript", 38]] },
];
