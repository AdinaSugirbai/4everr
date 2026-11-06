import ApplicantsTable from "@/components/ApplicantsTable";
import { received } from "@/lib/applications";

export default function EmployerApplicationsPage() {
  const fresh = received.filter((a) => a.stage === "NEW").length;
  return (
    <>
      <div className="mb-5">
        <h1 className="font-bold text-2xl">Келген өтінімдер</h1>
        <p className="text-sm text-mute mt-1">Junior Frontend әзірлеуші · Kaspi Lab · барлығы {received.length}, жаңасы {fresh}</p>
      </div>
      <ApplicantsTable />
    </>
  );
}
