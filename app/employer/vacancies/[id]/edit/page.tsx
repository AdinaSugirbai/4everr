import VacancyForm from "@/components/VacancyForm";
import { sampleVac } from "@/lib/data";
// Келесі аптада: id бойынша вакансияны Prisma-дан аламыз
export default function EditVacancyPage() { return <VacancyForm initial={sampleVac} />; }
