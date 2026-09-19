"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

gsap.registerPlugin(ScrollTrigger);

/* Same easing the `anchors` option uses for in-page hash links. */
const ANCHOR_EASING = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    /* Touch detection at mount — drives the touch-optimised config below.
     *
     * Touch is deliberately left NATIVE (smoothTouch: false, the default).
     * Native touch scrolls on the compositor thread, so the page stays
     * smooth even though the main thread is busy every frame (WebGL hero
     * shader + difference-blend groups + ScrollTrigger scrubs). Enabling
     * smoothTouch moves scrolling onto that busy main thread and the whole
     * page goes choppy on mobile — the regression we hit.
     *
     * The hero wordmark's scroll jitter is handled at the text level
     * (HeroWordmark.tsx) instead, so we never need to hijack touch. */
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    /* Locomotive Scroll v5 — built on Lenis. It owns the Lenis instance,
     * so this is a full swap of the direct `new Lenis(...)` the previous
     * build used; integrity of the tuned values below is unchanged.
     *
     * Ticker + update wiring mirrors the old build exactly:
     *   initCustomTicker → gsap.ticker runs the Lenis raf loop
     *   scrollCallback   → Lenis 'scroll' event → ScrollTrigger.update
     * so both pinned scrub sections (KeepScrolling, FinalCta) behave the
     * same, including `lagSmoothing(0)`. */
    gsap.ticker.lagSmoothing(0);

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

    /* GSAP pinning wraps the pinned section in a `.pin-spacer`; React
     * records the un-wrapped parent, so any route change that deletes
     * a pinned subtree throws NotFoundError: removeChild. Unwrapping
     * must happen BEFORE React's deletion commit — i.e. synchronously
     * in the interaction that navigates away, not in effect cleanup
     * (which runs after the commit). Every outbound navigation hook
     * calls this first. */
    const killAllTriggers = () => {
      ScrollTrigger.getAll()
        .slice()
        .forEach((trigger) => trigger.kill());
    };

    window.addEventListener("popstate", killAllTriggers, true);

    /* Cross-page section links ("/#success-stories", "/#faq" from the
     * /about and /services headers) navigate with Next and then
     * hard-jump to the hash. Intercept them BEFORE next/link's handler
     * (capture phase — Link's own handler runs on the element, ours on
     * document), route via the router, then hand the scroll to
     * locomotive so the landing matches the in-page anchor behaviour.
     *
     * The current page's Lenis keeps owning href="#foo" links untouched. */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      /* Own internal SPA links only ("#/...) and "/..."). Outbound,
       * mail, tel, download targets stay with the browser/owner. */
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

      /* Plain in-page hash ("#about"): Lenis anchors already
       * smooth-scrolls these — don't touch. */
      if (href.startsWith("#")) return;

      const hashIndex = href.indexOf("#");
      /* "/#about" → path "/", everything else needs a path segment
       * before the hash to count as a page link. */
      const targetPath = hashIndex === -1 ? href : href.slice(0, hashIndex);
      const targetId = hashIndex === -1 ? "" : href.slice(hashIndex);

      if (targetPath === pathname) {
        if (!targetId) return; // plain same-path link — leave to owner
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
        /* Same page + hash: we are NOT leaving, so the page's
         * ScrollTriggers (hero wordmark scrub, pinned sections…) must
         * keep living — killing them here froze every scroll animation
         * on the page (the wordmark stuck mid-journey). Same-page
         * anchor scrolls stay with locomotive. */
        history.pushState(null, "", targetId);
        scrollToTarget();
        return;
      }

      /* Leaving the page: unwrap pins first (see killAllTriggers). */
      killAllTriggers();

      if (targetId) {
        /* Cross-page — navigate first, then hand the scroll to
         * locomotive only AFTER ScrollTrigger has re-measured the next
         * page (pinned sections add spacer height that lands the target
         * at a different offset than the pre-refresh layout would
         * suggest). `refresh` fires on every ScrollTrigger cycle; tie
         * the scroll to the first one, with a timeout fallback. */
        let settled = false;
        const onRefresh = () => {
          if (settled) return;
          settled = true;
          ScrollTrigger.removeEventListener("refresh", onRefresh);
          scrollToTarget();
        };
        ScrollTrigger.addEventListener("refresh", onRefresh);

        router.push(`${targetPath}${targetId}`);
        /* Safety net if the target route has no ScrollTriggers at all. */
        window.setTimeout(onRefresh, 1200);
      } else {
        /* Cross-page plain link (no hash target) — just navigate; the
         * next page starts from the top by default. */
        router.push(targetPath);
      }
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", killAllTriggers, true);
      scroll.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [router, pathname]);

  return children;
}
