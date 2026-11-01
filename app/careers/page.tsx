import { Catalog } from "@/components/catalog";
import { Heading } from "@/components/ui";
export default function Page() {
  return (
    <>
      <Heading
        label="Career Navigator"
        title="Өзіңе жақын бағытты тап."
        description="Жеті бағыт. Әртүрлі мүмкіндіктер. Қызығушылығыңа сай алғашқы қадам."
      />
      <Catalog />
    </>
  );
}
