export type Skill = { name: string; level: number };
export type Resume = { photo: string; position: string; city: string; phone: string; about: string; education: string; skills: Skill[] };
export const emptyResume: Resume = { photo: "", position: "", city: "", phone: "", about: "", education: "", skills: [] };
export const resumeKey = (email: string) => "4everr:resume:" + email;
export type RErr = Partial<Record<keyof Resume, string>>;

export function validateResume(r: Resume): RErr {
  const e: RErr = {};
  if (!r.photo) e.photo = "Сурет жүктеңіз|Загрузите фото|Upload a photo";
  if (r.position.trim().length < 2) e.position = "Лауазымды жазыңыз|Укажите должность|Enter a position";
  if (r.city.trim().length < 2) e.city = "Қаланы жазыңыз|Укажите город|Enter a city";
  if (!/^\+?[0-9\s()-]{10,18}$/.test(r.phone.trim())) e.phone = "Телефонды дұрыс жазыңыз|Введите корректный телефон|Enter a valid phone";
  if (r.about.trim().length < 30) e.about = "Кемінде 30 таңба жазыңыз|Минимум 30 символов|At least 30 characters";
  if (r.education.trim().length < 3) e.education = "Білімді жазыңыз|Укажите образование|Enter your education";
  if (r.skills.length < 1) e.skills = "Кемінде 1 дағды қосыңыз|Добавьте минимум 1 навык|Add at least 1 skill";
  return e;
}
