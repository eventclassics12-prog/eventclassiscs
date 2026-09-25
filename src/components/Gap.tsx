"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mediaUrl, type HomeGapData } from "@/lib/cms";
import "./Gap.css";

interface GapProps {
  data?: HomeGapData | null;
  copy?: string;
}

const DEFAULT_COPY =
  "Between what you've built and what the market thinks you've built.";
const DEFAULT_PHRASE_LEFT = "WE CLOSE";
const DEFAULT_PHRASE_RIGHT = "THE GAP";
const DEFAULT_IMAGE = "/gap.png";

const OVERFLOW_RATIO = 0.08;

export function Gap({ data, copy = DEFAULT_COPY }: GapProps) {
  const phraseLeft = data?.phraseLeft ?? DEFAULT_PHRASE_LEFT;
  const phraseRight = data?.phraseRight ?? DEFAULT_PHRASE_RIGHT;
  const imageSrc = mediaUrl(data?.image) ?? DEFAULT_IMAGE;
  const resolvedCopy = data?.copy ?? copy;

  const sectionRef = useRef<HTMLElement>(null);
  const leftPhraseRef = useRef<HTMLSpanElement>(null);
  const rightPhraseRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const leftPhrase = leftPhraseRef.current;
    const rightPhrase = rightPhraseRef.current;
    const image = imageRef.current;
    if (!section || !leftPhrase || !rightPhrase || !image) return;

    gsap.registerPlugin(ScrollTrigger);

    const measure = () => {
      const vw = window.innerWidth;
      const lw = leftPhrase.offsetWidth;
      const rw = rightPhrase.offsetWidth;
      const O = vw * OVERFLOW_RATIO;

      const leftFinalX = (vw - lw) / 2;
      const rightFinalX = (vw - rw) / 2;

      const leftTargetX = leftFinalX + O;
      const rightTargetX = rightFinalX - (vw - rw) - O;

      return { leftTargetX, rightTargetX };
    };

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      const snap = () => {
        const { leftTargetX, rightTargetX } = measure();
        gsap.set(leftPhrase, { x: leftTargetX, force3D: true });
        gsap.set(rightPhrase, { x: rightTargetX, force3D: true });
        gsap.set(image, { scale: 1, force3D: true });
      };
      snap();
      document.fonts?.ready.then(() => snap());
      return;
    }

    let timeline: gsap.core.Timeline | null = null;
    let resizeRaf = 0;

    const setupAnimation = () => {
      if (timeline) {
        timeline.scrollTrigger?.kill();
        timeline.kill();
        timeline = null;
      }

      const { leftTargetX, rightTargetX } = measure();

      gsap.set(leftPhrase, { x: 0, force3D: true });
      gsap.set(rightPhrase, { x: 0, force3D: true });
      gsap.set(image, { scale: 0.45, force3D: true });

      timeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        })
        .to(
          leftPhrase,
          { x: leftTargetX, ease: "none", force3D: true },
          0,
        )
        .to(
          rightPhrase,
          { x: rightTargetX, ease: "none", force3D: true },
          0,
        )
        .to(
          image,
          { scale: 1, ease: "none", force3D: true },
          0,
        );
    };

    setupAnimation();

    document.fonts?.ready.then(() => {
      setupAnimation();
      ScrollTrigger.refresh();
    });

    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          setupAnimation();
        }
        resizeRaf = 0;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (timeline) {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="gap" id="approach">
      <div className="gap__sticky">
        <div className="gap__display">
          <span className="gap__phrase-wrap gap__phrase-wrap--left">
            <span ref={leftPhraseRef} className="gap__phrase">
              {phraseLeft}
            </span>
          </span>
          <span className="gap__phrase-wrap gap__phrase-wrap--right">
            <span ref={rightPhraseRef} className="gap__phrase">
              {phraseRight}
            </span>
          </span>
        </div>

        <div className="gap__below">
          <div ref={imageRef} className="gap__image" aria-hidden="true">
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 60vw, 22vw"
              className="gap__image-img"
            />
          </div>

          <p className="gap__copy">{resolvedCopy}</p>
        </div>
      </div>
    </section>
  );
}

export default Gap;
