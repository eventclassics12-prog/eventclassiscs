"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FinalCta.css";

/**
 * Hallmark · "Final CTA" section — image-unfold edition.
 *
 * Editorial close before the footer, Laurenti-style: as the section
 * scrolls in it is pinned and the moody ridge image unfolds from a
 * contained card (rounded clip) to a full-bleed canvas. The three-line
 * statement, kicker and CTA pill rise over the fully-unfolded image,
 * then the pin releases into the footer.
 *
 * The button re-uses the `.m-hero__cta` class for visual continuity
 * with the hero's pill; text keeps the global difference-blend so the
 * copy inverts cleanly against the dark photo in either direction.
 */

interface FinalCtaProps {
  /** Three editorial lines stacked above the CTA. */
  lines?: ReadonlyArray<string>;
  /** CTA label + href. */
  cta?: { label: string; href: string };
}

export function FinalCta({
  lines = [
    "Your business has already done the hard part.",
    "You've built something worth noticing.",
    "Now make sure the market sees it.",
  ],
  cta = { label: "Book a call", href: "/contact-form" },
}: FinalCtaProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* Reduced motion: no pin, no scrub — the section renders fully
     * unfolded with all content visible (built-in default state). */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const media = section.querySelector("[data-fc-media]");
    const content = section.querySelector("[data-fc-content]");
    if (!media || !content) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none", force3D: true },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: isMobile ? "+=100%" : "+=150%",
          pin: true,
          /* Body is flex-col; ScrollTrigger auto-disables pin spacing
           * under a flex parent, which would leave the scrub no room. */
          pinSpacing: true,
          /* Desktop: 1:1 scroll → progress (the KeepScrolling build's
           * finding that scrub windows read as lag). Mobile: short
           * window to damp uneven native touch scroll events. */
          scrub: isMobile ? 0.2 : true,
          anticipatePin: 1,
        },
      });

      /* Phase 1 — unfold: rounded contained card expands to full-bleed.
       * clip-path animates on the compositor; no layout thrash mid-scrub.
       *
       * fromTo with explicit identical-structure strings: reading the CSS
       * computed start back through GSAP's clipPath parser produced a
       * mis-paired interpolation (the two horizontal insets diverged,
       * making the mask slide left). Providing both ends verbatim keeps
       * the value mapping symmetric. */
      tl.fromTo(
        media,
        {
          /* Matches the `.final-cta__media` clip-path in FinalCta.css;
           * keep the two in sync if the contained frame moves. */
          clipPath: isMobile
            ? "inset(9% 8% 9% 8% round 12px)"
            : "inset(11% 14% 11% 14% round 14px)",
        },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          duration: 0.7,
        },
      );

      /* Phase 2 — content rises over the full-bleed image. */
      tl.from(content, { opacity: 0, y: 60, duration: 0.3 }, 0.62);
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="final-cta" id="final-cta">
      <div className="final-cta__stage">
        <div className="final-cta__media" data-fc-media aria-hidden="true">
          <Image
            src="/cta-scale.jpg"
            alt=""
            fill
            sizes="100vw"
            className="final-cta__img"
            priority
          />
          <div className="final-cta__scrim" />
        </div>

        <div className="final-cta__inner" data-fc-content>
          <p className="final-cta__copy">
            {lines.map((line, i) => (
              <span key={i} className="final-cta__line">
                {line}
              </span>
            ))}
          </p>

          <p className="final-cta__kicker">Start a conversation</p>

          <a className="m-hero__cta final-cta__button" href={cta.href}>
            <span className="m-hero__cta-label">{cta.label}</span>
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
          </a>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
