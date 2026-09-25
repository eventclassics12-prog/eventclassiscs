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
    /* Post-submission confirmation — no value in search results. */
    noIndex: true,
  });
}

/**
 * /thank-you — confirmation route the contact form redirects to after a
 * successful submission (either a 200 from /api/zoho/leads or the 503
 * mailto fallback used while Zoho creds are unwired locally).
 *
 * Layout mirrors the other subpages: ServicesHeader → centered hero
 * → Footer. The hero is deliberately simpler than the home MonologHero
 * — no GSAP, no Three.js — so the confirmation stays a calm landing
 * after a high-intent action.
 *
 * `router.replace` (set in ContactSection) drops the empty form from
 * the history stack, so the browser's Back button takes the visitor
 * to wherever they were before they hit "Contact", not back to the
 * reset form.
 *
 * Copy comes from the `page-thank-you` Payload global, with fallbacks
 * to the original text.
 */
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
