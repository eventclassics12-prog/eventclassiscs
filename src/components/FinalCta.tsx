"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mediaUrl, type PageServicesData } from "@/lib/cms";
import "./FinalCta.css";

interface FinalCtaProps {
  lines?: ReadonlyArray<string>;
  cta?: { label: string; href: string };
  data?: PageServicesData | null;
}

const DEFAULT_LINES = [
  "Your business has already done the hard part.",
  "You've built something worth noticing.",
  "Now make sure the market sees it.",
] as const;

const DEFAULT_CTA = { label: "Book a call", href: "/contact-form" };
const DEFAULT_KICKER = "Start a conversation";
const DEFAULT_IMAGE = "/cta-scale.jpg";

export function FinalCta({ lines, cta, data }: FinalCtaProps) {
  const resolvedLines: ReadonlyArray<string> =
    lines ??
    data?.finalCtaLines?.map((line) => line.text ?? "") ??
    DEFAULT_LINES;
  const ctaLabel = cta?.label ?? data?.finalCtaLabel ?? DEFAULT_CTA.label;
  const ctaHref = cta?.href ?? data?.finalCtaHref ?? DEFAULT_CTA.href;
  const kicker = data?.finalCtaKicker ?? DEFAULT_KICKER;
  const imageSrc = mediaUrl(data?.finalCtaImage) ?? DEFAULT_IMAGE;

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

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
          pinSpacing: true,
          scrub: isMobile ? 0.2 : true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        media,
        {
          clipPath: isMobile
            ? "inset(9% 8% 9% 8% round 12px)"
            : "inset(11% 14% 11% 14% round 14px)",
        },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          duration: 0.7,
        },
      );

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
            src={imageSrc}
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
            {resolvedLines.map((line, i) => (
              <span key={i} className="final-cta__line">
                {line}
              </span>
            ))}
          </p>

          <p className="final-cta__kicker">{kicker}</p>

          <a className="m-hero__cta final-cta__button" href={ctaHref}>
            <span className="m-hero__cta-label">{ctaLabel}</span>
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
