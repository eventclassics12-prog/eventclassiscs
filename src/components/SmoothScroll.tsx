"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

gsap.registerPlugin(ScrollTrigger);

const ANCHOR_EASING = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    // Drive Locomotive from the GSAP ticker so scroll position and ScrollTrigger
    // tweens advance in the same RAF — without this they desync and any scrub
    // tween (hero wordmark, statement letters, etc.) reads the scroll position
    // one frame off, which shows up as jitter on mobile.
    // Leave GSAP's default lagSmoothing(500, 33) in place so a dropped frame
    // interpolates instead of stuttering visibly.
    const scroll = new LocomotiveScroll({
      initCustomTicker: (render) => {
        gsap.ticker.add(render);
      },
      destroyCustomTicker: (render) => {
        gsap.ticker.remove(render);
      },
      scrollCallback: () => {
        ScrollTrigger.update();
      },
      lenisOptions: {
        // DO NOT enable syncTouch here.
        //
        // syncTouch: true was tried to smooth raw fractional native scrollY
        // (see the history on the HeroWordmark scrub modifiers). It made Lenis
        // preventDefault every touchmove and drive scroll itself, and on real
        // phones that broke the scroll-driven animations outright and dropped
        // the page to a laggy 60fps feel. Reverted to Lenis defaults: touch
        // scrolling stays native, and the sub-pixel jitter is handled at the
        // tween instead (HeroWordmark snaps x/y to whole pixels).
        //
        // With syncTouch off, `isSmooth` is false for touch, so Lenis sets
        // isScrolling = "native" and does not interpolate. Consequently
        // `duration` below only applies to wheel/desktop, and touchMultiplier
        // is inert — which is how it has always been on mobile.
        duration: isTouch ? 0.65 : 1.05,
        wheelMultiplier: isTouch ? 1 : 0.82,
        touchMultiplier: isTouch ? 1.4 : 1,
        stopInertiaOnNavigate: true,
        anchors: {
          duration: 1.6,
          easing: ANCHOR_EASING,
          offset: -72,
        },
      },
    });

    const killAllTriggers = () => {
      ScrollTrigger.getAll()
        .slice()
        .forEach((trigger) => trigger.kill());
    };

    window.addEventListener("popstate", killAllTriggers, true);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (!(href.startsWith("/") || href.startsWith("#"))) return;
      if (!href.startsWith("#")) {
        if (
          anchor.hasAttribute("target") ||
          anchor.getAttribute("download") !== null ||
          href.startsWith("//")
        ) {
          return;
        }
      }

      if (href.startsWith("#")) return;

      const hashIndex = href.indexOf("#");

      const targetPath = hashIndex === -1 ? href : href.slice(0, hashIndex);
      const targetId = hashIndex === -1 ? "" : href.slice(hashIndex);

      if (targetPath === pathname) {
        if (!targetId) return;
      }

      event.preventDefault();
      event.stopPropagation();

      const scrollToTarget = () => {
        const target = document.querySelector<HTMLElement>(targetId);
        if (!target) return;
        scroll.scrollTo(target, {
          offset: -72,
          duration: 1.6,
          easing: ANCHOR_EASING,
        });
      };

      if (targetPath === pathname) {
        history.pushState(null, "", targetId);
        scrollToTarget();
        return;
      }

      killAllTriggers();

      if (targetId) {
        let settled = false;
        const onRefresh = () => {
          if (settled) return;
          settled = true;
          ScrollTrigger.removeEventListener("refresh", onRefresh);
          scrollToTarget();
        };
        ScrollTrigger.addEventListener("refresh", onRefresh);

        router.push(`${targetPath}${targetId}`);

        window.setTimeout(onRefresh, 1200);
      } else {
        router.push(targetPath);
      }
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", killAllTriggers, true);
      scroll.destroy();
    };
  }, [router, pathname]);

  return children;
}
