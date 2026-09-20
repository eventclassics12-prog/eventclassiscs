import type { Metadata } from "next";
import Link from "next/link";
import { ServicesHeader } from "@/components/ServicesHeader";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import "./thank-you-page.css";

export const metadata: Metadata = {
  title: "Thank you — EVENTCLASSICS",
  description: "Your message is on its way. We'll be in touch very soon.",
};

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
 */
export default function ThankYouPage() {
  return (
    <PageTransition>
      <ServicesHeader />

      <section
        className="thank-you-hero"
        aria-labelledby="thank-you-heading"
      >
        <div className="thank-you-hero__inner">
          <h1
            id="thank-you-heading"
            className="thank-you-hero__heading"
          >
            Thank you for contacting us.
          </h1>
          <p className="thank-you-hero__sub">
            We&apos;ll get back to you very soon.
          </p>
          <Link href="/" className="thank-you-hero__cta">
            Go to home
          </Link>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}
