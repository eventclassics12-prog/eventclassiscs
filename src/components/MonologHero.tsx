"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import SterlingGateKineticNavigation from "./ui/sterling-gate-kinetic-navigation";
import { LiquidMetalBg } from "./LiquidMetalBg";
import { HeroWordmark } from "./HeroWordmark";
import type { SiteSettingsData } from "@/lib/cms";
import "./MonologHero.css";

/**
 * Hallmark · atmospheric · studied DNA from Monolog.
 *
 * Client component — framer-motion drives the load-in entrance.
 * Vertical regions + body-level fixed overlays:
 *   1. section: centred pitch (a single prose paragraph)
 *   2. section: bottom wordmark bar (reserves hero's bottom row)
 *
 *   Body-level fixed overlays (outside the section on purpose — see
 *   `.m-hero__nav` and `.m-hero__wordmark-blend` in MonologHero.css for
 *   the stacking-context reasoning):
 *   3. nav band (wordmark left overlay, links centre, sound + menu right)
 *   4. <SterlingGateKineticNavigation /> — fullscreen menu trigger pill,
 *      mounted in place of the previous "Let's close the gap" CTA so the
 *      hero chrome matches about/services/work verbatim.
 *   5. wordmark blend group (GSAP-scrubbed from bottom-centre → top-left
 *      as the hero scrolls out; settles as the sticky-header wordmark).
 *
 * Copy & link labels mirror the Monolog reference verbatim per the user's
 * brief — only the bottom wordmark text swaps to "eventclassics".
 *
 * The bottom wordmark is a `<HeroWordmark>` (client component). As the
 * hero scrolls out, it transforms from bottom-centre → top-left of the
 * viewport and becomes the sticky header wordmark.
 */

interface MonologHeroProps {
  /** Brand text used for both the nav wordmark and the bottom wordmark. */
  brand?: string;
  /** Nav centre links (defaults to the Monolog reference order). */
  navLinks?: ReadonlyArray<{ label: string; href: string }>;
  /** Headline paragraph. */
  para1?: string;
  /** Optional CMS site settings — passed to the fullscreen menu pill. */
  site?: SiteSettingsData | null;
}

const DEFAULT_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "What We Do", href: "/services" },
  { label: "Our Work", href: "/work" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function MonologHero({
  brand = "eventclassics.in",
  navLinks = DEFAULT_LINKS,
  para1 = "Idea to Impact\n\nPROCESS. PRECISION. PERFORMANCE.",
  site,
}: MonologHeroProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <>
      <section className="m-hero" id="home">
        {/* Shader background — pinned to the hero's bounding box
         * (position: absolute via .liquid-metal-bg), sits at z-index: -1
         * so the fixed nav (200) and wordmark (300) both render above it
         * while every in-flow descendant (the pitch) still paints above
         * the shader within the section's stacking context. */}
        <LiquidMetalBg />

        <div className="m-hero__pitch">
          {/* The paragraph keeps its difference-blend invert, but in its
           * OWN static wrapper (.m-hero__para-blend) rather than on the
           * pitch container — so the urgency CTA below can render its
           * true #E36336 palette outside any blend group. Blend lives on
           * a static, never-transformed div; the motion.p inside is the
           * animated child (same constraint as before, just narrowed). */}
          <div className="m-hero__para-blend">
            <motion.p
              className="m-hero__para"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: "easeInOut" }}
            >
              {/* Split para1 on a blank line so callers can pass a
               * two-line string ("Idea to Impact\n\nPROCESS. PRECISION.
               * PERFORMANCE.") and have it render as stacked lines with
               * the right vertical rhythm — see .m-hero__para-line in
               * MonologHero.css. */}
              {para1.split("\n\n").map((line, i) => (
                <span
                  key={i}
                  className={`m-hero__para-line${
                    i > 0 ? " m-hero__para-line--tagline" : ""
                  }`}
                >
                  {line}
                </span>
              ))}
            </motion.p>
          </div>

          {/* Urgency CTA — below the pitch, inside the shared .m-hero__cta
           * pill system (same geometry as the FAQ "Book a call" pill) so
           * all contact pills on the home page read as one component.
           * The pulsing dot is the urgency affordance. This pill renders
           * TRUE colour (#E36336 bg, white label) — it sits OUTSIDE any
           * difference blend group (the blend was narrowed to
           * .m-hero__para-blend above), so its saturated accent must not
           * be inverted. Solid opaque pill = readable over the shader's
           * dark and light regions alike. */}
          <motion.a
            className="m-hero__cta m-hero__bookcta"
            href="/contact-form"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6, ease: "easeInOut" }}
          >
            <span className="m-hero__cta-dot" aria-hidden="true" />
            <span className="m-hero__cta-label">Book A Call Now!</span>
            <span className="m-hero__cta-arrow" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </motion.a>
        </div>

        {/* In-flow spacer only — reserves the hero's bottom row height.
         * The actual fixed wordmark lives in .m-hero__wordmark-blend
         * below (outside the section) so its difference blend group
         * participates in the ROOT stacking context, not the hero's
         * (z-index: 10) — a blend group trapped inside the hero would
         * only ever invert against the hero's own interior. */}
        <div className="m-hero__wordmark-bar" aria-hidden="true" />
      </section>

      {/* Fixed nav — rendered OUTSIDE the hero section on purpose. The
       * nav is a container-level mix-blend-mode: difference group, and
       * a blend group blends only with the content behind it inside the
       * SAME stacking context. Kept inside .m-hero (z-index: 10) its
       * backdrop would be the hero's interior alone — the nav would
       * render raw white over every section past the hero. As a body
       * child it participates in the root stacking context, so the
       * header inverts against whichever section is actually behind it. */}
      <nav className="m-hero__nav" aria-label="Primary">
        {/* Left spacer — keeps the links visually centred in the
         * viewport between the fixed wordmark (left overlay) and the
         * actions (right). aria-hidden because the wordmark itself is
         * decorative (the page title conveys the brand). */}
        <div className="m-hero__nav-brand" aria-hidden="true" />

        <ul className="m-hero__links" role="list">
          {navLinks.map((link, i) => (
            <motion.li
              key={link.label}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{
                delay: 0.55 + i * 0.07,
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <Link href={link.href}>{link.label}</Link>
            </motion.li>
          ))}
        </ul>

        <div className="m-hero__actions" />
      </nav>

      {/* Fullscreen-menu trigger — fixed, OUTSIDE both the nav band and
       * <section class="m-hero"> for the same stacking-context reason the
       * nav lives at body level: the hero sets z-index: 10, which would
       * cap this pill's own z-index: 300 inside that stacking context and
       * let the nav (200) and pinned section visuals (e.g. .gap__display)
       * paint over it. As a body-level sibling it keeps its true 300.
       *
       * The component reuses the pill geometry the old CTA shared with the
       * nav band (2.75rem height, 999 px radius, paper bg, dark badge),
       * so swapping CTA → menu is a visual no-op on first paint — only
       * the affordance changes. The same component is what
       * ServicesHeader mounts on /about, /services and /work, so the home
       * page now ships identical chrome.
       *
       * Its entrance fade is driven from CSS in MonologHero.css (scoped
       * via `.m-hero ~ .stg-root .nav-close-btn`) so the 0.85 s delay that
       * used to live on the CTA's framer-motion transition is preserved
       * here without leaking into the about/services/work pages, where
       * the same pill rides inside <ServicesHeader> and must reveal with
       * the page transition instead. */}
      <SterlingGateKineticNavigation site={site} />

      {/* Fixed full-viewport blend group for the wordmark — rendered
       * outside the hero section for the same stacking-context reason
       * as the nav above (see .m-hero__wordmark-blend in
       * MonologHero.css for the blend/transform rationale). */}
      <div className="m-hero__wordmark-blend" aria-hidden="true">
        <HeroWordmark text={brand} />
      </div>
    </>
  );
}

export default MonologHero;
