"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./circular-text.css";

/**
 * Lightswind UI · Circular Text — two concentric kinetic rings of
 * individual letter spans, scrubbed by scroll.
 *
 *   p 0     · fragment: letters sit on their polar orbits + random
 *             offsets (deltaX/deltaY, rotation ±45°), faded, scrambled.
 *   p 0→0.5 · assembly: offsets collapse to 0, rings snap into crisp
 *             legible circular phrases while counter-rotating
 *             (inner +120°, outer −90°).
 *   p 0.5→1 · fly-through: both rings scale massively outward (4.5×+),
 *             inner ring fades to 0, outer ring flies past the screen
 *             edges while still rotating.
 *
 * Architecture: each letter is a two-layer stack. The OUTER slot has no
 * transform and is driven by GSAP (scatter offsets in px, no %-parsing
 * conflicts). The INNER char carries a static orbital transform
 * (rotate(θ) translateY(-r)) baked at render time.
 */

interface CircularTextProps {
  innerSentence?: string;
  outerSentence?: string;
}

interface RingConfig {
  radius: number;
  /** Ring rotation across assembly (deg). */
  assembleSpin: number;
  /** Extra spin while flying out (deg). */
  exitSpin: number;
  /** Final scale of the fly-through. */
  exitScale: number;
  /** Fade this ring out during expansion. */
  exitFade: boolean;
}

/* Deterministic PRNG so the scramble is stable across renders. */
function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Letter = {
  ch: string;
  rotation: number;
  radius: number;
  tone: string;
  key: string;
};

/* Static per-letter geometry: char i sits at angle (i/n)·2π on its
 * orbit, rotated angle + 90° so the baseline stays tangent and faces
 * outwards. Build executed at render — SSR-safe. */
function buildLetters(sentence: string, radius: number): Letter[] {
  const letters = sentence.split("");
  const n = letters.length || 1;
  return letters.map((ch, i) => {
    const angle = (i / n) * Math.PI * 2;
    return {
      ch,
      rotation: Math.round((angle * 180) / Math.PI) + 90,
      radius,
      tone: "",
      key: `${radius}-${i}-${ch}`,
    };
  });
}

export default function CircularText({
  innerSentence = "Round and round the letters go, where they stop, you'll know.",
  outerSentence = "Round and round the letters go, where they stop, you'll know.",
}: CircularTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRingRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<HTMLDivElement>(null);

  const innerRing = useMemo<RingConfig>(
    () => ({
      radius: 185,
      assembleSpin: 120,
      exitSpin: 70,
      exitScale: 4.5,
      exitFade: true,
    }),
    [],
  );

  const outerRing = useMemo<RingConfig>(
    () => ({
      radius: 320,
      assembleSpin: -90,
      exitSpin: -60,
      exitScale: 6,
      exitFade: false,
    }),
    [],
  );

  const innerLetters = useMemo(
    () => buildLetters(innerSentence, innerRing.radius),
    [innerSentence, innerRing],
  );

  const outerLetters = useMemo(
    () => buildLetters(outerSentence, outerRing.radius),
    [outerSentence, outerRing],
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const inner = innerRingRef.current;
    const outer = outerRingRef.current;
    if (!wrapper || !stage || !inner || !outer) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return; // letters keep the assembled static pose

      const rings = [
        {
          el: inner,
          sel: ".circular-text__ring--inner .circular-text__slot",
          config: innerRing,
        },
        {
          el: outer,
          sel: ".circular-text__ring--outer .circular-text__slot",
          config: outerRing,
        },
      ];

      /* Fragmented initial state: random offsets layered on top of the
       * orbital slots — GSAP owns these transforms, the char's static
       * orbit transform stays untouched underneath. */
      const rand = mulberry32(7);
      rings.forEach((ring) => {
        const slots = gsap.utils.toArray<HTMLElement>(ring.sel, stage);
        slots.forEach((slot) => {
          gsap.set(slot, {
            x: (rand() - 0.5) * 80,
            y: (rand() - 0.5) * 80,
            rotation: (rand() - 0.5) * 90,
            opacity: 1,
          });
        });
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /* Centre logo: fades in slowly while the letters assemble and
       * stay fully visible during the fly-through. */
      timeline.fromTo(
        ".circular-text__logo img",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power1.inOut" },
        0.45,
      );

      /* Stage 1 → 2 · assembly: offsets collapse to zero while the
       * rings counter-rotate into crisp legible phrases. Letters ride
       * the ring rotation, so base slots do not need per-letter tweens
       * for x/y — only the scatter layer resolves. */
      rings.forEach((ring) => {
        const slots = gsap.utils.toArray<HTMLElement>(ring.sel, stage);
        slots.forEach((slot) => {
          timeline.to(
            slot,
            { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.5 },
            0,
          );
        });
        timeline.to(
          ring.el,
          { rotation: ring.config.assembleSpin, duration: 1 },
          0,
        );
      });

      /* Stage 2 → 3 · radical expansion / fly-through. */
      rings.forEach((ring) => {
        timeline.to(
          ring.el,
          {
            scale: ring.config.exitScale,
            rotation: ring.config.assembleSpin + ring.config.exitSpin,
            opacity: ring.config.exitFade ? 0 : 1,
            duration: 0.5,
            ease: "power2.in",
          },
          0.5,
        );

        if (ring.config.exitFade) {
          const slots = gsap.utils.toArray<HTMLElement>(ring.sel, stage);
          slots.forEach((slot) => {
            timeline.to(
              slot,
              { opacity: 0, duration: 0.3, ease: "power1.in" },
              0.6,
            );
          });
        }
      });
    }, wrapper);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [innerLetters, outerLetters, innerRing, outerRing]);

  return (
    <div className="circular-text" ref={wrapperRef}>
      <div className="circular-text__stage" ref={stageRef}>
        {/* EC mark — the original logo image, fading in on scroll. */}
        <div className="circular-text__logo" aria-hidden="true">
          <img src="/logos/ec-mark.png" alt="" />
        </div>

        <div
          className="circular-text__ring circular-text__ring--inner"
          ref={innerRingRef}
          aria-hidden="true"
        >
          {innerLetters.map((l) => (
            <span key={l.key} className="circular-text__slot">
              <span
                className={`circular-text__char ${l.tone}`.trim()}
                style={{
                  transform: `translate(-50%, -50%) rotate(${l.rotation}deg) translateY(${-l.radius}px)`,
                }}
              >
                {l.ch}
              </span>
            </span>
          ))}
        </div>

        <div
          className="circular-text__ring circular-text__ring--outer"
          ref={outerRingRef}
          aria-hidden="true"
        >
          {outerLetters.map((l) => (
            <span key={l.key} className="circular-text__slot">
              <span
                className={`circular-text__char ${l.tone}`.trim()}
                style={{
                  transform: `translate(-50%, -50%) rotate(${l.rotation}deg) translateY(${-l.radius}px)`,
                }}
              >
                {l.ch}
              </span>
            </span>
          ))}
        </div>

        <p className="sr-only">
          {innerSentence} {outerSentence}
        </p>

      </div>
    </div>
  );
}
