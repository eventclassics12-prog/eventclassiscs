import type { Metadata } from "next";
import { ServicesHeader } from "@/components/ServicesHeader";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import "./contact-page.css";

export const metadata: Metadata = {
  title: "Contact — EVENTCLASSICS",
  description:
    "Tell us about your project. We reply within one business day. Kolkata-based, working worldwide.",
};

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
 */
export default function ContactFormPage() {
  return (
    <PageTransition>
      <ServicesHeader />

      <section className="contact-page-intro">
        <div className="contact-page-intro__inner">
          <h1 className="contact-page-intro__heading">
            Let&apos;s build something worth remembering.
          </h1>
          <p className="contact-page-intro__lede">
            Briefs, questions, or a quick sanity check on an idea — pick
            whichever fits and we&apos;ll get back within one business
            day. For active engagements, write to us directly at{" "}
            <a href="mailto:info@eventclassics.in">
              info@eventclassics.in
            </a>
            .
          </p>
        </div>
      </section>

      <ContactSection />

      <Footer />
    </PageTransition>
  );
}
