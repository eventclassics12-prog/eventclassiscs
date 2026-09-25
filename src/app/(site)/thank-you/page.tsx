import type { Metadata } from "next";
import Link from "next/link";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getGlobal, type PageThankYouData, type SiteSettingsData } from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";
import "./thank-you-page.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  return buildMetadata(site, {
    title: `Thank you — ${site?.brandName ?? "EVENTCLASSICS"}`,
    description: "Your message is on its way. We'll be in touch very soon.",
    path: "/thank-you",
    noIndex: true,
  });
}

export default async function ThankYouPage() {
  const [data, site] = await Promise.all([
    getGlobal<PageThankYouData>("page-thank-you"),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  const heading = data?.heading ?? "Thank you for contacting us.";
  const sub = data?.sub ?? "We'll get back to you very soon.";
  const ctaLabel = data?.ctaLabel ?? "Go to home";
  const ctaHref = data?.ctaHref ?? "/";

  return (
    <PageTransition>
      <ServicesHeader site={site} />

      <section
        className="thank-you-hero"
        aria-labelledby="thank-you-heading"
      >
        <div className="thank-you-hero__inner">
          <h1
            id="thank-you-heading"
            className="thank-you-hero__heading"
          >
            {heading}
          </h1>
          <p className="thank-you-hero__sub">{sub}</p>
          <Link href={ctaHref} className="thank-you-hero__cta">
            {ctaLabel}
          </Link>
        </div>
      </section>

      <Footer site={site} />
    </PageTransition>
  );
}
