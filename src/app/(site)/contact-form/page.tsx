import type { Metadata } from "next";
import { ServicesHeader } from "@/components/ServicesHeader";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getGlobal, type PageContactData, type SiteSettingsData } from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";
import "./contact-page.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getGlobal<SiteSettingsData>("site-settings");
  return buildMetadata(site, {
    title: `Contact — ${site?.brandName ?? "EVENTCLASSICS"}`,
    description:
      "Tell us about your project. We reply within one business day. Kolkata-based, working worldwide.",
    path: "/contact-form",
  });
}

/**
 * Dedicated /contact-form route — the single landing target for every
 * "Book a call" / "View Contact" CTA on the site.
 *
 * Layout mirrors the other subpages (`/about`, `/services`, `/work`):
 * standard nav → editorial intro → ContactSection → Footer. The form
 * itself is the same component mounted inline on the home page in
 * earlier iterations; keeping it as the section primitive lets us
 * reuse the brand-accent button, contact info, and feedback states
 * without forking markup.
 *
 * Intro copy and the form surface come from the `page-contact`
 * Payload global, with fallbacks to the original copy.
 */
export default async function ContactFormPage() {
  const [data, site] = await Promise.all([
    getGlobal<PageContactData>("page-contact"),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  const introHeading =
    data?.introHeading ?? "Let's build something worth remembering.";
  const introLede =
    data?.introLede ??
    "Briefs, questions, or a quick sanity check on an idea — pick whichever fits and we'll get back within one business day. For active engagements, write to us directly at";
  const introEmail = data?.introEmail ?? "info@eventclassics.in";

  return (
    <PageTransition>
      <ServicesHeader site={site} />

      <section className="contact-page-intro">
        <div className="contact-page-intro__inner">
          <h1 className="contact-page-intro__heading">{introHeading}</h1>
          <p className="contact-page-intro__lede">
            {introLede}{" "}
            <a href={`mailto:${introEmail}`}>{introEmail}</a>.
          </p>
        </div>
      </section>

      <ContactSection data={data} />

      <Footer site={site} />
    </PageTransition>
  );
}
