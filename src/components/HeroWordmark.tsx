"use client";

import { useEffect, useRef, useState } from "react";
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

interface HeroWordmarkProps {
  text?: string;
  data?: HomeHeroData | null;
}

const DEFAULT_BRAND = "eventclassics.in";

export function HeroWordmark({ text, data }: HeroWordmarkProps) {
  const resolvedText = text ?? data?.brand ?? DEFAULT_BRAND;
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsActive(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const settleMs = resolvedText.length * 20 + 250;
    const timer = setTimeout(() => setSettled(true), settleMs);
    return () => clearTimeout(timer);
  }, [isActive, resolvedText]);

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

      const initialFontSize = parseFloat(getComputedStyle(wordmark).fontSize);
      if (!isFinite(initialFontSize) || initialFontSize <= 0) return;
      const targetScale = TARGET_FONT_SIZE / initialFontSize;

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
          headerTargetY = Math.max(
            0,
            (navHeight - finalWordmarkHeight) / 2,
          );
        }
      }

      const startRect = wordmark.getBoundingClientRect();
      // Round to integer pixels. getBoundingClientRect returns floats
      // (e.g. x=12.5); writing a fractional transform forces sub-pixel
      // rasterization on the GPU each frame, which is one of the causes
      // of mobile jitter in scrub tweens.
      gsap.set(wordmark, {
        x: Math.round(startRect.left),
        y: Math.round(startRect.top),
        scale: 1,
        force3D: true,
      });

      const hero = document.querySelector<HTMLElement>(".m-hero");
      if (!hero) return;

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      tween = gsap.to(wordmark, {
        x: headerPadX,
        y: headerTargetY,
        scale: targetScale,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: isMobile ? 0.2 : true,
        },
      });

      const sizeBlendGroup = () => {
        const group = document.querySelector<HTMLElement>(
          ".m-hero__wordmark-blend",
        );
        if (!group || !wordmark.isConnected) return;
        const w = wordmark.offsetWidth;
        const h = wordmark.offsetHeight;
        const rect = wordmark.getBoundingClientRect();
        const startX = rect.left;
        const startY = rect.top;
        const finalW = w * targetScale;
        const finalH = h * targetScale;
        const left = Math.max(0, Math.min(startX, headerPadX) - BLUR_OVERSCAN);
        const top = Math.max(
          0,
          Math.min(startY, headerTargetY) - BLUR_OVERSCAN,
        );
        const right = Math.max(startX + w, headerPadX + finalW) + BLUR_OVERSCAN;
        const bottom =
          Math.max(startY + h, headerTargetY + finalH) + BLUR_OVERSCAN;
        group.style.left = `${left}px`;
        group.style.top = `${top}px`;
        group.style.width = `${Math.max(1, right - left)}px`;
        group.style.height = `${Math.max(1, bottom - top)}px`;
      };
      sizeBlendGroup();
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
  }, []);

  return (
    <div ref={wordmarkRef} className="m-hero__wordmark-display">
      <span className="m-hero__wordmark-load" aria-label={resolvedText}>
        {Array.from(resolvedText).map((character, index) => (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            className={`m-hero__wordmark-letter${isActive ? " m-hero__wordmark-letter--active" : ""}${settled ? " m-hero__wordmark-letter--settled" : ""}`}
            style={{ transitionDelay: isActive ? `${index * 20}ms` : "0ms" }}
          >
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </span>
    </div>
  );
}

export default HeroWordmark;
