import { mediaUrl } from "@/lib/cms";
import type { Metadata } from "next";
import { ServicesHeader } from "@/components/ServicesHeader";
import { ContactIntro } from "@/components/ContactIntro";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getGlobal, type PageContactData, type SiteSettingsData } from "@/lib/cms-server";
import { buildMetadata } from "@/lib/seo";
import "./contact-page.css";

export async function generateMetadata(): Promise<Metadata> {
  const [site, data] = await Promise.all([
    getGlobal<SiteSettingsData>("site-settings"),
    getGlobal<PageContactData>("page-contact"),
  ]);
  return buildMetadata(site, {
    title: data?.seoTitle?.trim() || `Contact — ${site?.brandName ?? "EVENTCLASSICS"}`,
    description: data?.seoDescription?.trim() ||
      "Tell us about your project. We reply within one business day. Kolkata-based, working worldwide.",
    image: mediaUrl(data?.ogImage),
    path: "/contact-form",
  });
}

export default async function ContactFormPage() {
  const [data, site] = await Promise.all([
    getGlobal<PageContactData>("page-contact"),
    getGlobal<SiteSettingsData>("site-settings"),
  ]);

  const introHeading =
    data?.introHeading ?? "Let's build something worth remembering.";
  const introLede =
    data?.introLede ??
    "Briefs, questions, or a quick sanity check on an idea — pick whichever fits and we'll get back within one business day. For active engagements, write to us directly at info@eventclassics.in.";
  const introEmail = data?.introEmail ?? "info@eventclassics.in";

  return (
    <PageTransition>
      <ServicesHeader site={site} />

      <section className="contact-page-intro">
        <div className="contact-page-intro__inner">
          <h1 className="contact-page-intro__heading">{introHeading}</h1>
          <p className="contact-page-intro__lede">
            <ContactIntro text={introLede} email={introEmail} />
          </p>
        </div>
      </section>

      <ContactSection data={data} />

      <Footer site={site} />
    </PageTransition>
  );
}
