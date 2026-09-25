import type { Metadata } from "next";
import { ServicesHeader } from "@/components/ServicesHeader";
import { WorkPage } from "@/components/WorkPage";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getGlobal, type PageWorkData, type SiteSettingsData } from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  return buildMetadata(site, {
    title: `Our Work — ${site?.brandName ?? "Event Classics"}`,
    description:
      "Case studies from IQVIA, Manipal Hospitals, Redmonk Wellness and Team Taurus — brand systems, content and platforms that shipped.",
    path: "/work",
  });
}

export default async function Work() {
  const [data, site] = await Promise.all([
    getGlobal<PageWorkData>("page-work"),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  return (
    <PageTransition>
      <ServicesHeader currentPage="work" site={site} />
      <WorkPage data={data} />
      <Footer site={site} />
    </PageTransition>
  );
}
