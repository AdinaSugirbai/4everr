import { CareerDetail } from "@/components/career-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CareerDetail id={slug} roadmap />;
}
