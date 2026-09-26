"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeStatementData } from "@/lib/cms";
import "./Statement.css";

interface StatementProps {
  data?: HomeStatementData | null;
  stat?: string;
  statCaption?: string;
  paragraphs?: ReadonlyArray<string>;
  bylineName?: string;
  bylineRole?: string;
  bylineInitials?: string;
}

const DEFAULT_PARAGRAPHS: ReadonlyArray<string> = [
  "Great founders don't usually have an ambition problem.",
  "They have the product. They have the people. They have the proof.",
  "But somewhere between what they've built and what the market sees, something gets lost.",
  "The story gets lost. The positioning gets crowded. The brand starts looking smaller than the business behind it.",
  "Most agencies fix the surface.",
  "Between what you've built and what the market thinks you've built.",
];

export function Statement({
  data,
  stat = "10+",
  statCaption = "From disruptive creative businesses to consumer-first companies.",
  paragraphs = DEFAULT_PARAGRAPHS,
  bylineName = "Pamal Mondal",
  bylineRole = "Strategic Brand-Building Firm",
  bylineInitials = "P",
}: StatementProps) {
  const resolvedStat = data?.stat ?? stat;
  const resolvedStatCaption = data?.statCaption ?? statCaption;
  const resolvedParagraphs =
    data?.paragraphs && data.paragraphs.length > 0
      ? data.paragraphs.map((p) => p.text ?? "")
      : paragraphs;
  const resolvedBylineName = data?.bylineName ?? bylineName;
  const resolvedBylineRole = data?.bylineRole ?? bylineRole;
  const resolvedBylineInitials = data?.bylineInitials ?? bylineInitials;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: per-letter scrubbed reveal (the intended editorial effect).
      // scrub: 0.5 gives GSAP a half-second lerp window to interpolate dropped
      // scroll frames instead of snapping per scroll event.
      mm.add("(min-width: 769px)", () => {
        gsap.fromTo(
          ".statement__letter",
          { opacity: 0.1 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.035,
            scrollTrigger: {
              trigger: ".statement__copy",
              start: "top center",
              end: "top top",
              scrub: 0.5,
            },
          },
        );
      });

      // Mobile: animate whole paragraphs instead of ~300 individual letter spans.
      // Each frame was touching hundreds of opacity values; this collapses that
      // to one write per paragraph.
      mm.add("(max-width: 768px)", () => {
        gsap.fromTo(
          ".statement__copy",
          { opacity: 0.1 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.15,
            scrollTrigger: {
              trigger: ".statement__copy",
              start: "top center",
              end: "top top",
              scrub: 0.5,
            },
          },
        );
      });
    }, document.querySelector(".statement") ?? undefined);

    return () => ctx.revert();
  }, []);

  return (
    <section className="statement" id="about">
      <div className="statement__inner">
        <div className="statement__left-column">
          <div className="statement__left">
            <div className="statement__stat">{resolvedStat}</div>
            <p className="statement__caption">{resolvedStatCaption}</p>
          </div>
        </div>

        <div className="statement__right">
          {resolvedParagraphs.map((p, i) => (
            <p key={i} className="statement__copy" aria-label={p}>
              {splitChars(p)}
            </p>
          ))}
        </div>

        <div className="statement__byline">
          <div className="statement__avatar" aria-hidden="true">
            {resolvedBylineInitials}
          </div>
          <div className="statement__byline-text">
            <div className="statement__byline-name">{resolvedBylineName}</div>
            <div className="statement__byline-role">{resolvedBylineRole}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Statement;

function splitChars(text: string): ReactNode {
  return text.split("").map((char, i) => (
    <span key={i} className="statement__letter">
      {char}
    </span>
  ));
}
