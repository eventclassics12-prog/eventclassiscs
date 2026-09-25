import type { Metadata } from "next";
import { ServicesPage } from "@/components/ServicesPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import {
  getGlobal,
  type HomeServicesData,
  type PageServicesData,
  type SiteSettingsData,
} from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  const brand = site?.brandName ?? "EVENTCLASSICS";
  return buildMetadata(site, {
    title: `${brand} — Services`,
    description:
      "Brand identity, growth strategy, social media and content creation — connected as one brand system.",
    path: "/services",
  });
}

export default async function Services() {
  const [data, servicesData, site] = await Promise.all([
    getGlobal<PageServicesData>("page-services"),
    getGlobal<HomeServicesData>("home-services"),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  return (
    <PageTransition>
      <ServicesHeader currentPage="services" site={site} />
      <ServicesPage data={data} servicesData={servicesData} />
      <FinalCta data={data} />
      <Footer site={site} />
    </PageTransition>
  );
}
