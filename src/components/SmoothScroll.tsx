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

    // Leave GSAP's default lagSmoothing(500, 33) in place — on mobile the JS thread
    // drops frames, and disabling smoothing turns every miss into visible jank.
    const scroll = new LocomotiveScroll({
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
