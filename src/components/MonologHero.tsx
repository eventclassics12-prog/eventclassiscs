"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import SterlingGateKineticNavigation from "./ui/sterling-gate-kinetic-navigation";
import { LiquidMetalBg } from "./LiquidMetalBg";
import { HeroWordmark } from "./HeroWordmark";
import type { SiteSettingsData } from "@/lib/cms";
import "./MonologHero.css";

interface MonologHeroProps {
  brand?: string;
  navLinks?: ReadonlyArray<{ label: string; href: string }>;
  para1?: string;
  site?: SiteSettingsData | null;
}

const DEFAULT_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "What We Do", href: "/services" },
  { label: "Our Work", href: "/work" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function MonologHero({
  brand = "eventclassics.in",
  navLinks = DEFAULT_LINKS,
  para1 = "Idea to Impact\n\nPROCESS. PRECISION. PERFORMANCE.",
  site,
}: MonologHeroProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <>
      <section className="m-hero" id="home">
        <LiquidMetalBg />

        <div className="m-hero__pitch">
          <div className="m-hero__para-blend">
            <motion.p
              className="m-hero__para"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: "easeInOut" }}
            >
              {para1.split("\n\n").map((line, i) => (
                <span
                  key={i}
                  className={`m-hero__para-line${
                    i > 0 ? " m-hero__para-line--tagline" : ""
                  }`}
                >
                  {line}
                </span>
              ))}
            </motion.p>
          </div>

          <motion.a
            className="m-hero__cta m-hero__bookcta"
            href="/contact-form"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6, ease: "easeInOut" }}
          >
            <span className="m-hero__cta-dot" aria-hidden="true" />
            <span className="m-hero__cta-label">Book A Call Now!</span>
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
          </motion.a>
        </div>

        <div className="m-hero__wordmark-bar" aria-hidden="true" />
      </section>

      <nav className="m-hero__nav" aria-label="Primary">
        <div className="m-hero__nav-brand" aria-hidden="true" />

        <ul className="m-hero__links" role="list">
          {navLinks.map((link, i) => (
            <motion.li
              key={link.label}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{
                delay: 0.55 + i * 0.07,
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <Link href={link.href}>{link.label}</Link>
            </motion.li>
          ))}
        </ul>

        <div className="m-hero__actions" />
      </nav>

      <SterlingGateKineticNavigation site={site} />

      <div className="m-hero__wordmark-blend" aria-hidden="true">
        <HeroWordmark text={brand} />
      </div>
    </>
  );
}

export default MonologHero;
