import type { Metadata } from "next";
import { Brands } from "@/components/Brands";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Gap } from "@/components/Gap";
import { KeepScrolling } from "@/components/KeepScrolling";
import { MonologHero } from "@/components/MonologHero";
import { PageTransition } from "@/components/PageTransition";
import { Services } from "@/components/Services";
import { Statement } from "@/components/Statement";
import { SuccessStories } from "@/components/SuccessStories";
import {
  getGlobal,
  type HomeBrandsData,
  type HomeFaqData,
  type HomeGapData,
  type HomeHeroData,
  type HomeKeepScrollingData,
  type HomeServicesData,
  type HomeStatementData,
  type HomeSuccessStoriesData,
  type SiteSettingsData,
} from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  /* The previous static title was "EVENTCLASSICS — Idea to Impact" — the
   * brand name in caps. The CMS brandName is "eventclassics.in"; using it
   * keeps the tab title in sync with the brand shown across the site. */
  const brandName = site?.brandName?.trim() || "EVENTCLASSICS";
  return buildMetadata(site, {
    title: site?.seoTitle?.trim() || `${brandName} — Idea to Impact`,
    description:
      site?.seoDescription?.trim() ||
      "Strategic brand-building firm. We close the gap between what you've built and what the market thinks you've built.",
    path: "/",
  });
}

export default async function Home() {
  const [
    site,
    hero,
    brands,
    statement,
    gap,
    keepScrolling,
    successStories,
    services,
    faq,
  ] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<HomeHeroData>("home-hero"),
    getGlobal<HomeBrandsData>("home-brands"),
    getGlobal<HomeStatementData>("home-statement"),
    getGlobal<HomeGapData>("home-gap"),
    getGlobal<HomeKeepScrollingData>("home-keep-scrolling"),
    getGlobal<HomeSuccessStoriesData>("home-success-stories"),
    getGlobal<HomeServicesData>("home-services"),
    getGlobal<HomeFaqData>("home-faq"),
  ]);

  return (
    <>
      <PageTransition>
        <MonologHero
          brand={hero?.brand ?? site?.brandName ?? undefined}
          navLinks={site?.navLinks ?? undefined}
          para1={hero?.headline ?? undefined}
          site={site}
        />
        <Brands data={brands} />
        <Statement data={statement} />
        <Gap data={gap} />
        <KeepScrolling data={keepScrolling} />
        <SuccessStories data={successStories} />
        <Services data={services} />
        <FAQ data={faq} />
        <Footer site={site} />
      </PageTransition>
    </>
  );
}
