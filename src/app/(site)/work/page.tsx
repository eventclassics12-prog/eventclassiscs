import { mediaUrl } from "@/lib/cms";
import type { Metadata } from "next";
import { ServicesHeader } from "@/components/ServicesHeader";
import { WorkPage } from "@/components/WorkPage";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getGlobal, type PageWorkData, type SiteSettingsData } from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [site, data] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageWorkData>("page-work"),
  ]);
  return buildMetadata(site, {
    title: data?.seoTitle?.trim() || `Our Work — ${site?.brandName ?? "Event Classics"}`,
    description: data?.seoDescription?.trim() || data?.heroLede?.trim() ||
      "Explore selected brand systems, content and platforms from our studio.",
    image: mediaUrl(data?.ogImage),
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
