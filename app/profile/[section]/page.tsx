"use client";
import { notFound, useParams } from "next/navigation";
import SectionShell from "@/components/SectionShell";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import TestsSection from "@/components/sections/TestsSection";
import ApplicationsSection from "@/components/sections/ApplicationsSection";
import SavedSection from "@/components/sections/SavedSection";
import { isSection, type SectionSlug } from "@/lib/sections";

const views: Record<SectionSlug, React.ComponentType> = {
  about: AboutSection,
  skills: SkillsSection,
  tests: TestsSection,
  applications: ApplicationsSection,
  saved: SavedSection,
};

export default function ProfileSectionPage() {
  const { section } = useParams<{ section: string }>();
  if (!isSection(section)) notFound();
  const View = views[section];
  return (
    <SectionShell slug={section}>
      <View />
    </SectionShell>
  );
}
