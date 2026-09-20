"use client";

/*
 * Sterling Gate — kinetic fullscreen navigation.
 *
 * Mounted inside ServicesHeader in place of the CTA pill: the trigger
 * reuses the pill's exact geometry (2.75rem height, arrow badge) so the
 * header band keeps its proportions, and the GSAP-animated fullscreen
 * overlay carries the primary navigation.
 *
 * Adaptation notes (existing design system wins over stock styling):
 * - Monochrome ink/paper tokens only — the stock indigo/violet shape
 *   fills were re-tinted to ink alphas.
 * - Links are real Next.js routes; navigation closes the overlay.
 * - Scroll locks while open; Escape and overlay click close it.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import "./sterling-gate-kinetic-navigation.css";

if (typeof window !== "undefined" && !gsap.parseEase("main")) {
  try {
    CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
  } catch {
    /* CustomEase unavailable — timeline falls back to defaults below */
  }
}
gsap.defaults({ ease: gsap.parseEase("main") ? "main" : "power2.out", duration: 0.7 });

const MENU_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  shape: string;
  fade?: boolean;
}> = [
  { label: "Home", href: "/", shape: "1" },
  { label: "About Us", href: "/about", shape: "2" },
  { label: "What We Do", href: "/services", shape: "3" },
  { label: "Our Work", href: "/work", shape: "4" },
  { label: "FAQ", href: "/#faq", shape: "5", fade: true },
];

/* The terminal CTA at the bottom of the menu overlay. Mirrors the
 * "Book a call with us" pill in the FAQ support column (see FAQ.tsx +
 * the shared `.m-hero__cta` utility in MonologHero.css) so the contact
 * affordance reads as the same component across the site.
 *
 * `#book` is the same anchor the FAQ CTA targets — it scrolls to the
 * FAQ's support column when no dedicated booking form exists yet. The
 * href can be swapped to a real /book route once one ships.
 *
 * Reuses the pill geometry (--cta-h, 999 px radius, 8 px arrow badge
 * inset) but NOT the shared `.m-hero__cta` class — that class carries
 * `mix-blend-mode: difference` to invert cleanly against arbitrary
 * section backgrounds, and the menu overlay is paper-toned, so a
 * paper-bg difference-blended pill would invert to black and swallow
 * its own dark label. The menu CTA therefore uses solid colours
 * (dark fill + light text — the inverse of the menu's own palette). */
const MENU_CTA = {
  label: "Book a call with us",
  href: "#book",
} as const;

export function SterlingGateKineticNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Shape hover: the right-hand ambient art swaps per hovered link.
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const ctx = gsap.context(() => {
      const menuItems = container.querySelectorAll<HTMLElement>(
        ".menu-list-item[data-shape]"
      );
      const shapesContainer = container.querySelector(".ambient-background-shapes");

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute("data-shape");
        const shape = shapesContainer?.querySelector(
          `.bg-shape-${shapeIndex}`
        );
        if (!shape) return;

        const shapeEls = shape.querySelectorAll(".shape-element");

        const onEnter = () => {
          shapesContainer
            ?.querySelectorAll(".bg-shape")
            .forEach((s) => s.classList.remove("active"));
          shape.classList.add("active");

          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, rotation: -10 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "back.out(1.7)",
              overwrite: "auto",
            }
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => shape.classList.remove("active"),
            overwrite: "auto",
          });
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);

        (item as unknown as { _cleanup?: () => void })._cleanup = () => {
          item.removeEventListener("mouseenter", onEnter);
          item.removeEventListener("mouseleave", onLeave);
        };
      });
    }, container);

    return () => {
      ctx.revert();
      container
        .querySelectorAll<HTMLElement>(".menu-list-item[data-shape]")
        .forEach(
          (item) =>
            (item as unknown as { _cleanup?: () => void })._cleanup?.()
        );
    };
  }, []);

  // Open / close animation. One persistent timeline ref: on unmount we
  // kill the running tween (no gsap.context here — a .revert() on each
  // effect cleanup wipes the open timeline's inline styles, which made
  // the close animation invisible).
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const navWrap = containerRef.current.querySelector(".nav-overlay-wrapper");
    const menu = containerRef.current.querySelector(".menu-content");
    const overlay = containerRef.current.querySelector(".overlay");
    const bgPanels = containerRef.current.querySelectorAll(".backdrop-layer");
    const menuLinks = containerRef.current.querySelectorAll(".nav-link");
    const fadeTargets = containerRef.current.querySelectorAll(
      "[data-menu-fade]"
    );
    const menuCta = containerRef.current.querySelector(".menu-cta");
    const menuButton = containerRef.current.querySelector(".nav-close-btn");
    const menuButtonTexts = menuButton?.querySelectorAll("p") ?? [];
    const menuButtonIcon = menuButton?.querySelector(".menu-button-icon");
    if (!navWrap || !menu || !overlay || !menuButtonIcon) return;

    timelineRef.current?.kill();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    if (isMenuOpen) {
      navWrap.setAttribute("data-nav", "open");

      tl.set(navWrap, { display: "block" })
        .set(menu, { xPercent: 0 }, "<")
        .fromTo(
          menuButtonTexts,
          { yPercent: 0 },
          { yPercent: -100, stagger: 0.2 }
        )
        .fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, "<")

        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
        .fromTo(
          bgPanels,
          { xPercent: 101 },
          { xPercent: 0, stagger: 0.12, duration: 0.575 },
          "<"
        )
        .fromTo(
          menuLinks,
          { yPercent: 140, rotate: 10 },
          { yPercent: 0, rotate: 0, stagger: 0.05 },
          "<+=0.35"
        );

      /* Terminal CTA — joins the link stagger but with a shorter
       * translate distance and no rotation, so it reads as a button
       * landing into place rather than an editorial link sliding in.
       * Placed right after the last link to land just after the
       * stagger finishes. */
      if (menuCta) {
        tl.fromTo(
          menuCta,
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5 },
          "<+=0.05"
        );
      }

      if (fadeTargets.length) {
        tl.fromTo(
          fadeTargets,
          { autoAlpha: 0, yPercent: 50 },
          { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: "all" },
          "<+=0.2"
        );
      }
    } else {
      // NOTE: `data-nav` is intentionally NOT flipped to "closed" at the
      // top of this branch the way the open branch sets it to "open".
      // Any CSS that targets `.nav-overlay-wrapper[data-nav="open"]`
      // (see the homepage wordmark-blend override in MonologHero.css,
      // which drops the morphing wordmark behind the menu panel) needs
      // the open flag to stay set for the FULL close sweep — otherwise
      // the wordmark snaps back on top of the menu the instant the user
      // clicks close, while the backdrop layers are still sliding off.
      // We flip the flag inside the timeline's final .call() below,
      // after display:none has been written — which is the moment the
      // overlay is actually gone and the wordmark is allowed to return.

      // Mirror of the open sequence, played backwards: the badge flips,
      // the links drop back out with reversed stagger, the backdrop
      // layers sweep off from 'end', and the dark page-tint is released
      // last so the exit stays visible against a light canvas.
      tl.to(menuButtonTexts, { yPercent: 0, stagger: 0.2 })
        .to(menuButtonIcon, { rotate: 0 }, "<")
        .to(
          fadeTargets,
          { autoAlpha: 0, yPercent: 50, stagger: { each: 0.04, from: "end" } },
          "<"
        )
        .to(
          menuLinks,
          { yPercent: 140, rotate: 10, stagger: { each: 0.05, from: "end" } },
          "<+=0.05"
        );

      /* Terminal CTA — drops out and fades in parallel with the link
       * reverse stagger (same "<" alignment, no extra delay). The
       * arrow rotation is tweened in reverse too so the close mirror
       * is consistent with the open sequence. */
      if (menuCta) {
        tl.to(
          menuCta,
          { yPercent: 60, opacity: 0, duration: 0.4 },
          "<"
        );
      }

      tl.to(
        bgPanels,
          {
            xPercent: -101,
            stagger: { each: 0.12, from: "end" },
            duration: 0.575,
          },
          "<+=0.3"
        )
        .to(menu, { xPercent: -120 }, "<")
        /* Overlay tint fades IN PARALLEL with the panel sweep ("<" =
         * same start as the panel slide) instead of after it. It used
         * to be released last (">+0.15"), which left a translucent
         * black film hanging over the page for ~0.5 s after the panels
         * were already gone — read as a lingering black shadow. */
        .to(overlay, { autoAlpha: 0, duration: 0.575 }, "<")
        .set(bgPanels, { xPercent: 0 })
        .set(menu, { xPercent: 0 })
        .set(navWrap, { display: "none" })
        .call(() => navWrap.setAttribute("data-nav", "closed"));
    }

    return () => {
      tl.kill();
    };
  }, [isMenuOpen]);

  // Scroll lock + Escape.
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div ref={containerRef} className="stg-root">
      <button
        type="button"
        className="nav-close-btn"
        aria-expanded={isMenuOpen}
        aria-haspopup="dialog"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        onClick={toggleMenu}
      >
        <span className="menu-button-text">
          <p className="p-large">Menu</p>
          <p className="p-large" aria-hidden="true">
            Close
          </p>
        </span>
        <span className="icon-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 16 16"
            fill="none"
            className="menu-button-icon"
            aria-hidden="true"
          >
            <path
              d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
              fill="currentColor"
            />
            <path
              d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
              fill="currentColor"
            />
            <path d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z" fill="currentColor" />
            <path d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z" fill="currentColor" />
            <path d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z" fill="currentColor" />
            <path d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z" fill="currentColor" />
          </svg>
        </span>
      </button>

      <section className="fullscreen-menu-container">
        <div data-nav="closed" className="nav-overlay-wrapper">
          <div className="overlay" onClick={closeMenu} />
          <nav className="menu-content" aria-label="Fullscreen">
            <div className="menu-bg">
              {/* Two backdrop layers only. The third (darkest, 13 %
               * foreground-mixed "first" layer) used to live here as the
               * first-in / last-out panel of the open/close stagger, but
               * it added visual noise that read as a third teardown step
               * on close without earning its weight on open — removed.
               * `bgPanels` queries `.querySelectorAll(".backdrop-layer")`
               * and now picks up exactly these two. */}
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />

              <div className="ambient-background-shapes" aria-hidden="true">
                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="80" cy="120" r="40" fill="currentColor" fillOpacity="0.08" />
                  <circle className="shape-element" cx="300" cy="80" r="60" fill="currentColor" fillOpacity="0.05" />
                  <circle className="shape-element" cx="200" cy="300" r="80" fill="currentColor" fillOpacity="0.045" />
                  <circle className="shape-element" cx="350" cy="280" r="30" fill="currentColor" fillOpacity="0.08" />
                </svg>

                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M0 200 Q100 100, 200 200 T 400 200"
                    stroke="currentColor" strokeOpacity="0.11"
                    strokeWidth="60"
                    fill="none"
                  />
                  <path
                    className="shape-element"
                    d="M0 280 Q100 180, 200 280 T 400 280"
                    stroke="currentColor" strokeOpacity="0.07"
                    strokeWidth="40"
                    fill="none"
                  />
                </svg>

                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.22" />
                  <circle className="shape-element" cx="150" cy="50" r="8" fill="currentColor" fillOpacity="0.17" />
                  <circle className="shape-element" cx="250" cy="50" r="8" fill="currentColor" fillOpacity="0.15" />
                  <circle className="shape-element" cx="350" cy="50" r="8" fill="currentColor" fillOpacity="0.22" />
                  <circle className="shape-element" cx="100" cy="150" r="12" fill="currentColor" fillOpacity="0.15" />
                  <circle className="shape-element" cx="200" cy="150" r="12" fill="currentColor" fillOpacity="0.12" />
                  <circle className="shape-element" cx="300" cy="150" r="12" fill="currentColor" fillOpacity="0.15" />
                  <circle className="shape-element" cx="50" cy="250" r="10" fill="currentColor" fillOpacity="0.12" />
                  <circle className="shape-element" cx="150" cy="250" r="10" fill="currentColor" fillOpacity="0.22" />
                  <circle className="shape-element" cx="250" cy="250" r="10" fill="currentColor" fillOpacity="0.17" />
                  <circle className="shape-element" cx="350" cy="250" r="10" fill="currentColor" fillOpacity="0.12" />
                  <circle className="shape-element" cx="100" cy="350" r="6" fill="currentColor" fillOpacity="0.22" />
                  <circle className="shape-element" cx="200" cy="350" r="6" fill="currentColor" fillOpacity="0.17" />
                  <circle className="shape-element" cx="300" cy="350" r="6" fill="currentColor" fillOpacity="0.12" />
                </svg>

                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
                    fill="currentColor" fillOpacity="0.07"
                  />
                  <path
                    className="shape-element"
                    d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
                    fill="currentColor" fillOpacity="0.045"
                  />
                </svg>

                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                  <line className="shape-element" x1="0" y1="100" x2="300" y2="400" stroke="currentColor" strokeOpacity="0.09" strokeWidth="30" />
                  <line className="shape-element" x1="100" y1="0" x2="400" y2="300" stroke="currentColor" strokeOpacity="0.07" strokeWidth="25" />
                  <line className="shape-element" x1="200" y1="0" x2="400" y2="200" stroke="currentColor" strokeOpacity="0.06" strokeWidth="20" />
                </svg>
              </div>
            </div>

            <div className="menu-content-wrapper">
              <ul className="menu-list" role="list">
                {MENU_LINKS.map((link) => (
                  <li
                    key={link.label}
                    className="menu-list-item"
                    data-shape={link.shape}
                  >
                    <Link href={link.href} className="nav-link" onClick={closeMenu}>
                      {link.fade ? (
                        <p className="nav-link-text" data-menu-fade>
                          {link.label}
                        </p>
                      ) : (
                        <p className="nav-link-text">{link.label}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Terminal CTA — in the flex flow right below the link
               * list (see CSS note: absolute bottom-corner pinning was
               * removed because the pill collided with the list on
               * short viewports). `closeMenu` fires alongside the
               * anchor navigation so the menu plays its close sweep
               * instead of jumping to the section while still pinned. */}
              <div className="menu-cta-wrap">
                <a
                  className="menu-cta"
                  href={MENU_CTA.href}
                  onClick={closeMenu}
                >
                  <span className="menu-cta-label">{MENU_CTA.label}</span>
                  <span className="menu-cta-arrow" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
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
          </nav>
        </div>
      </section>
    </div>
  );
}

export default SterlingGateKineticNavigation;
