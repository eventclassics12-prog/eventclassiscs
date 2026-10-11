import { mediaUrl } from "@/lib/cms";
import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import {
  getGlobal,
  type PageAboutData,
  type SiteSettingsData,
} from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [site, data] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageAboutData>("page-about"),
  ]);
  const brand = site?.brandName ?? "EVENTCLASSICS";
  return buildMetadata(site, {
    title: data?.seoTitle?.trim() || `${brand} — About Us`,
    description: data?.seoDescription?.trim() ||
      "A strategic brand-building partner for founders with momentum. Embedded, lean, output-oriented design from idea to impact.",
    image: mediaUrl(data?.ogImage),
    path: "/about",
  });
}

export default async function About() {
  const [data, site] = await Promise.all([
    getGlobal<PageAboutData>("page-about"),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  return (
    <PageTransition>
      <ServicesHeader currentPage="about" site={site} />
      <AboutPage data={data} />
      <Footer site={site} />
    </PageTransition>
  );
}
