import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="py-20">
      <span className="eyebrow">404</span>
      <h1 className="my-6">Бет табылмады.</h1>
      <p className="mb-7">Мекенжайды тексер немесе басты бетке орал.</p>
      <ButtonLink primary href="/">
        Басты бет
      </ButtonLink>
    </div>
  );
}
