"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeHeroData } from "@/lib/cms";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "DOMContentLoaded,resize",
  });
}

const HEADER_PAD_X_FALLBACK = 20;
const HEADER_TARGET_Y_FALLBACK = 16;
const TARGET_FONT_SIZE = 24;
const BLUR_OVERSCAN = 12;

/**
 * Read an element's START geometry with GSAP's own transform out of the way.
 *
 * The wordmark's position lives in an inline `transform` written by GSAP, and
 * that inline value overrides the stylesheet's start position. Measuring the
 * live rect therefore returns the *animated* position, not the start — so any
 * second run of setupAnimation (it re-runs on every innerWidth change, i.e.
 * orientation change) installed GSAP's own output as the tween's FROM.
 * Measured on the live site, that collapsed the travel from 772px to -0.1px
 * and the wordmark stopped travelling to the header entirely.
 *
 * Clearing the inline value falls back to the stylesheet transform, which is
 * exactly the intended start. offsetHeight forces the reflow that makes
 * getBoundingClientRect see the cleared state rather than a cached one.
 */
function measureStartPosition(el: HTMLElement) {
  const previous = el.style.transform;
  el.style.transform = "";
  void el.offsetHeight;
  const rect = el.getBoundingClientRect();
  const left = rect.left;
  const top = rect.top;
  el.style.transform = previous;
  void el.offsetHeight;
  return { left, top };
}

// Entrance timing.
//
// The staircase came from the ratio between these two, not from the cost of
// the animation. The site-wide --ease-out (cubic-bezier(0.16, 1, 0.3, 1))
// finishes ~80% of a letter's travel in the first ~15% of its duration, so at
// duration/stagger = 11 each letter snapped home in ~2 frames while a dozen
// others had not started yet — a literal staircase. The letters must overlap
// into a travelling ramp instead, so duration has to be a large multiple of
// the stagger: 240/14 ≈ 17, which keeps ~17 letters mid-flight at once.
// LETTER_STAGGER_MS feeds the per-letter delay AND the settle timeout, which
// must be derived from the LAST letter's end, not a guessed buffer.
const LETTER_STAGGER_MS = 14;
const LETTER_DURATION_MS = 240;
const SETTLE_BUFFER_MS = 120;

interface WordmarkMetrics {
  wordmark: HTMLDivElement;
  fontSize: number;
  targetScale: number;
  headerPadX: number;
  headerTargetY: number;
}

interface HeroWordmarkProps {
  text?: string;
  data?: HomeHeroData | null;
}

const DEFAULT_BRAND = "eventclassics.in";

export function HeroWordmark({ text, data }: HeroWordmarkProps) {
  const resolvedText = text ?? data?.brand ?? DEFAULT_BRAND;
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const settledRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [settled, setSettled] = useState(false);

  const measureTargets = useCallback((): WordmarkMetrics | null => {
    const wordmark = wordmarkRef.current;
    if (!wordmark) return null;

    const fontSize = parseFloat(getComputedStyle(wordmark).fontSize);
    if (!isFinite(fontSize) || fontSize <= 0) return null;
    const targetScale = TARGET_FONT_SIZE / fontSize;

    const nav = document.querySelector<HTMLElement>(".m-hero__nav");
    let headerPadX = HEADER_PAD_X_FALLBACK;
    let headerTargetY = HEADER_TARGET_Y_FALLBACK;
    if (nav) {
      const navStyle = getComputedStyle(nav);
      const navPadLeft = parseFloat(navStyle.paddingLeft);
      if (isFinite(navPadLeft)) headerPadX = navPadLeft;

      const navHeight = nav.getBoundingClientRect().height;
      const finalWordmarkHeight = wordmark.offsetHeight * targetScale;
      if (isFinite(navHeight) && navHeight > 0) {
        headerTargetY = Math.max(0, (navHeight - finalWordmarkHeight) / 2);
      }
    }

    return { wordmark, fontSize, targetScale, headerPadX, headerTargetY };
  }, []);

  // Two box modes, because the union box is inherently viewport-sized.
  //
  // "journey" unions where the wordmark STARTS (bottom of the viewport) with
  // where it ENDS (the header), because the scrub tween travels that whole
  // distance. That union is ~390x830 on a phone no matter when you compute
  // it, so sizing it early bought nothing — the measured box was still
  // 384x825. It is only needed once the wordmark actually starts moving.
  //
  // "entrance" fits just the wordmark's current rect plus the letter rise,
  // ~374x73. During the entrance the wordmark is stationary and only the
  // letters move, so this is all the difference blend ever needs to cover.
  // Shrinking the box is visually a no-op: the layer has no background and
  // only the glyphs are opaque, so transparent area contributes nothing to a
  // difference blend.
  const applyBlendBox = useCallback(
    (metrics: WordmarkMetrics, mode: "entrance" | "journey") => {
      const { wordmark, targetScale, headerPadX, headerTargetY, fontSize } =
        metrics;
      const group = document.querySelector<HTMLElement>(
        ".m-hero__wordmark-blend",
      );
      if (!group || !wordmark.isConnected) return;

      const rect = wordmark.getBoundingClientRect();
      const pad = BLUR_OVERSCAN;

      let left: number;
      let top: number;
      let right: number;
      let bottom: number;

      if (mode === "entrance") {
        const rise = Math.round(0.5 * fontSize);
        left = Math.max(0, rect.left - pad);
        top = Math.max(0, rect.top - pad);
        right = rect.right + pad;
        bottom = rect.bottom + rise + pad;
      } else {
        const w = wordmark.offsetWidth;
        const h = wordmark.offsetHeight;
        const startX = rect.left;
        const startY = rect.top;
        const finalW = w * targetScale;
        const finalH = h * targetScale;
        left = Math.max(0, Math.min(startX, headerPadX) - pad);
        top = Math.max(0, Math.min(startY, headerTargetY) - pad);
        right = Math.max(startX + w, headerPadX + finalW) + pad;
        bottom = Math.max(startY + h, headerTargetY + finalH) + pad;
      }

      group.style.left = `${left}px`;
      group.style.top = `${top}px`;
      group.style.width = `${Math.max(1, right - left)}px`;
      group.style.height = `${Math.max(1, bottom - top)}px`;
    },
    [],
  );

  const applyLetterMetrics = useCallback((metrics: WordmarkMetrics) => {
    // Pin the entrance rise to whole pixels. 0.5em at the mobile size of
    // ~48.75px resolves to 24.375px, so the glyph destination lands off the
    // raster grid and every moving letter re-rasterizes weight-800 glyphs
    // mid-transition — that shimmer is the "jitter" half of the staircase.
    metrics.wordmark.style.setProperty(
      "--letter-rise",
      `${Math.round(0.5 * metrics.fontSize)}px`,
    );
    metrics.wordmark.style.setProperty(
      "--letter-duration",
      `${LETTER_DURATION_MS}ms`,
    );
  }, []);

  // Runs BEFORE the entrance rAF below (React flushes effects in declaration
  // order, and this one is declared first), so the tight entrance box is in
  // place before any letter starts moving. `.m-hero__wordmark-blend` defaults
  // to `inset: 0`, and the letters start at opacity 0, so switching it to the
  // entrance box here is visually a no-op that removes a full-viewport
  // difference blend from every frame of the animation.
  useEffect(() => {
    const apply = () => {
      const metrics = measureTargets();
      if (!metrics) return;
      applyLetterMetrics(metrics);
      applyBlendBox(metrics, "entrance");
    };

    apply();
    const fontsReady = typeof document !== "undefined" && document.fonts?.ready;
    if (fontsReady) fontsReady.then(apply);
  }, [measureTargets, applyLetterMetrics, applyBlendBox]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsActive(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    // Exact end of the sequence: the last letter's delay plus its duration.
    // Deriving this from the same constants the delays use means changing
    // either can never leave `--settled` landing mid-rise (which would cut
    // letters off as a hard snap).
    const lastDelay = Math.max(0, resolvedText.length - 1) * LETTER_STAGGER_MS;
    const settleMs = lastDelay + LETTER_DURATION_MS + SETTLE_BUFFER_MS;
    const timer = setTimeout(() => {
      settledRef.current = true;
      setSettled(true);
    }, settleMs);
    return () => clearTimeout(timer);
  }, [isActive, resolvedText]);

  // Once the entrance is over the letters hold still, so the box can grow to
  // the full journey union ahead of the scrub tween. Doing this on `settled`
  // rather than on mount keeps the tight box for the whole entrance.
  useEffect(() => {
    if (!settled) return;
    const metrics = measureTargets();
    if (!metrics) return;
    applyBlendBox(metrics, "journey");
  }, [settled, measureTargets, applyBlendBox]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || !rawHref.startsWith("/")) return;
      let url: URL;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      const el = wordmarkRef.current;
      if (el) {
        el.style.transition = "none";
        el.style.opacity = "0";
      }
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  useEffect(() => {
    const wordmark = wordmarkRef.current;
    if (!wordmark) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    let tween: gsap.core.Tween | null = null;
    let resizeRaf = 0;

    const setupAnimation = () => {
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
        tween = null;
      }

      const metrics = measureTargets();
      if (!metrics) return;
      const { wordmark: wm, targetScale, headerPadX, headerTargetY } = metrics;

      // The start rect MUST be read with GSAP's own transform stripped, or a
      // re-run of this function measures its own output and the tween range
      // collapses to nothing. See measureStartPosition.
      const startRect = measureStartPosition(wm);
      // Round to integer pixels. getBoundingClientRect returns floats
      // (e.g. x=12.5); writing a fractional transform forces sub-pixel
      // rasterization on the GPU each frame, which is one of the causes
      // of mobile jitter in scrub tweens.
      gsap.set(wm, {
        x: Math.round(startRect.left),
        y: Math.round(startRect.top),
        scale: 1,
        force3D: true,
      });

      const hero = document.querySelector<HTMLElement>(".m-hero");
      if (!hero) return;

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      tween = gsap.to(wm, {
        x: headerPadX,
        y: headerTargetY,
        scale: targetScale,
        ease: "none",
        force3D: true,
        // NO modifiers here. Three were tried and measured:
        //   modifiers: { x: Math.round, y: Math.round } -> SILENTLY KILLED THE
        //     TWEEN. The wordmark froze at matrix(1,0,0,1,18,795) and never
        //     travelled to the header at any scroll position.
        //   roundProps: "x,y" -> a no-op; x/y came out byte-identical with and
        //     without it.
        //   a 0.001 scale snap -> changed no measurable frame cost and only
        //     added a staircase to the motion.
        // Sub-pixel scaling is handled at the layer instead, via
        // `will-change: transform` on .m-hero__wordmark-display, which tells
        // Chromium to rasterize the glyph run once and GPU-scale it rather
        // than re-rasterizing weight-800 text at every new scale.
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          // A numeric scrub is REQUIRED on mobile, not optional. Lenis does not
          // interpolate touch scrolling at all (syncTouch is off, so it bails out
          // and native scroll runs), so raw fractional scrollY reaches this
          // tween. This low-pass is the only thing standing between that noise
          // and visible vibration. scrub: true was tried and made slow scrolling
          // jitter badly; syncTouch in SmoothScroll was tried as an alternative
          // input-layer fix and broke the mobile animations entirely.
          scrub: isMobile ? 0.5 : true,
        },
      });

      applyLetterMetrics(metrics);
      // fonts.ready can land while the entrance is still running, so this must
      // not expand the box out from under the letters. Read the ref rather
      // than `settled` so adding it to the deps can't rebuild the tween.
      applyBlendBox(metrics, settledRef.current ? "journey" : "entrance");
    };

    const fontsReady =
      typeof document !== "undefined" && document.fonts?.ready;
    if (fontsReady) {
      fontsReady.then(() => {
        setupAnimation();
        ScrollTrigger.refresh();
      });
    } else {
      setupAnimation();
    }

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
      if (tween) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
    };
  }, [measureTargets, applyLetterMetrics, applyBlendBox]);

  return (
    <div ref={wordmarkRef} className="m-hero__wordmark-display">
      <span className="m-hero__wordmark-load" aria-label={resolvedText}>
        {Array.from(resolvedText).map((character, index) => (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            className={`m-hero__wordmark-letter${isActive ? " m-hero__wordmark-letter--active" : ""}${settled ? " m-hero__wordmark-letter--settled" : ""}`}
            style={{
              transitionDelay: isActive
                ? `${index * LETTER_STAGGER_MS}ms`
                : "0ms",
            }}
          >
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </span>
    </div>
  );
}

export default HeroWordmark;
