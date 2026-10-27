"use client";

import Image from "next/image";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { mediaUrl, type HomeServicesData } from "@/lib/cms";
import "./Services.css";

interface Service {
  name: string;
  kicker: string;
  description: string;
  subItems: ReadonlyArray<string>;
  image: string;
  imageLabel: string;
}

interface ServicesProps {
  data?: HomeServicesData | null;
}

export const SERVICES: ReadonlyArray<Service> = [
  {
    name: "Brand Identity & Positioning",
    kicker: "Be known for something.",
    description:
      "Defining what you own, who it matters to and why anyone should choose you.",
    subItems: ["Research", "Position", "Identity", "Brand System"],
    image: "/services/brand-identity.png",
    imageLabel: "BRAND IDENTITY",
  },
  {
    name: "Growth Strategy & Market Intelligence",
    kicker: "Stop guessing.",
    description:
      "Turning audience behavior, competitor movements and market signals into decisions you can actually execute.",
    subItems: ["Research", "Intelligence", "Roadmap", "Execution"],
    image: "/services/growth-strategy.png",
    imageLabel: "GROWTH STRATEGY",
  },
  {
    name: "Social Media & Audience Growth",
    kicker: "Attention is not the goal.",
    description:
      "Building content and campaigns that turn attention into audience, audience into action and action into growth.",
    subItems: ["Content", "Distribution", "Campaigns", "Performance"],
    image: "/services/social-media.png",
    imageLabel: "SOCIAL MEDIA",
  },
  {
    name: "Content Creation & Production",
    kicker: "Short. Crisp. Raw.",
    description:
      "Turning strategy into content that feels relevant to the platform and different from everything around it.",
    subItems: ["Intelligence", "Concept", "Production", "Optimisation"],
    image: "/services/content-creation.png",
    imageLabel: "CONTENT CREATION",
  },
];

const FALLBACK_INTRO =
  "We don’t sell services.\nWe connect the pieces that make a brand work.";
const FALLBACK_LABEL = "What we can help with";

export function Services({ data }: ServicesProps) {
  const introLines = (data?.intro ?? FALLBACK_INTRO).split("\n");
  const label = data?.label ?? FALLBACK_LABEL;
  const reduce = useReducedMotion() ?? false;

  const services: Service[] =
    data?.services != null
      ? data.services.map((s) => {
          return {
            name: s.name ?? "",
            kicker: s.kicker ?? "",
            description: s.description ?? "",
            subItems:
              s.subItems != null
                ? s.subItems.map((item) => item.value ?? "")
                : [],
            image: mediaUrl(s.image) ?? "",
            imageLabel: s.imageLabel ?? "",
          };
        })
      : SERVICES.map((s) => ({ ...s, subItems: [...s.subItems] }));

  // Default to the first service expanded so the copy column and stage are
  // balanced on initial load; clicking the active primary tile returns to the
  // 2x2 overview grid while keeping the last active service copy visible.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number>(0);
  // CMS media can point at a file that is no longer in storage; fall back to
  // the bundled asset for that discipline instead of showing an empty tile.
  const [imageFallbacks, setImageFallbacks] = useState<
    Record<string, string>
  >({});

  // The tiles are absolutely positioned, so their geometry is measured from
  // the stage and animated explicitly — a CSS grid plus `layout` animations
  // fights itself when the grid area changes.
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ width: 0, height: 0, gap: 12 });

  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(element).columnGap) || 12;
      setStage({ width: rect.width, height: rect.height, gap });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const contentIndex =
    selectedIndex ?? Math.min(lastActiveIndex, services.length - 1);

  const transition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 190, damping: 26, mass: 0.9 };

  // Expanded layout: one primary tile on top, three secondary tiles below.
  const smallHeight = (stage.height - stage.gap) * 0.32;
  const primaryHeight = stage.height - stage.gap - smallHeight;
  const smallWidth = (stage.width - 2 * stage.gap) / 3;
  // Collapsed layout: an even 2 x 2 grid.
  const gridWidth = (stage.width - stage.gap) / 2;
  const gridHeight = (stage.height - stage.gap) / 2;

  /** Position + size of a tile for the current layout. */
  const geometryFor = (index: number) => {
    if (selectedIndex == null) {
      const column = index % 2;
      const row = Math.floor(index / 2);
      return {
        x: column * (gridWidth + stage.gap),
        y: row * (gridHeight + stage.gap),
        width: gridWidth,
        height: gridHeight,
      };
    }

    if (index === selectedIndex) {
      return { x: 0, y: 0, width: stage.width, height: primaryHeight };
    }

    const column = services
      .slice(0, index)
      .filter((_service, j) => j !== selectedIndex).length;

    return {
      x: column * (smallWidth + stage.gap),
      y: primaryHeight + stage.gap,
      width: smallWidth,
      height: smallHeight,
    };
  };

  const handleSelect = (index: number) => {
    setLastActiveIndex(index);
    setSelectedIndex((previous) => (previous === index ? null : index));
  };

  return (
    <section className="services" id="services">
      <div className="services__inner">
        <div className="services__copy">
          <div className="services__copy-top">
            <header className="services__label-row">
              <span className="services__dot" aria-hidden="true" />
              <span className="services__label-text">{label}</span>
            </header>

            <h2 className="services__intro">
              {introLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h2>
          </div>

          <div className="services__descriptions">
            {services.map((active, index) => (
              <div
                key={`${active.name}-${index}`}
                className={`services__description ${index === contentIndex ? "services__description--active" : ""}`}
                aria-hidden={index !== contentIndex}
              >
                <div className="services__description-meta">
                  <span className="services__description-index">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(services.length).padStart(2, "0")}
                  </span>
                  <span className="services__description-category">
                    {active.imageLabel || active.name}
                  </span>
                </div>

                <strong className="services__description-title">
                  {active.name}
                </strong>
                <em className="services__kicker">{active.kicker}</em>
                <span className="services__description-body">
                  {active.description}
                </span>

                {active.subItems.length > 0 && (
                  <ul className="services__subitems" aria-label="Deliverables">
                    {active.subItems.map((item) => (
                      <li key={item} className="services__subitem">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="services__stage"
          ref={stageRef}
        >
          {services.map((service, i) => {
            const isPrimary = selectedIndex === i;
            const isCurrent = contentIndex === i;
            const tileSrc = imageFallbacks[service.name] ?? service.image;

            return (
              <motion.button
                key={service.name}
                type="button"
                className={`services__tile ${
                  isPrimary ? "services__tile--primary" : ""
                } ${isCurrent ? "services__tile--current" : ""}`}
                initial={false}
                animate={geometryFor(i)}
                aria-pressed={isPrimary}
                aria-label={`Show ${service.name}`}
                onClick={() => handleSelect(i)}
                transition={transition}
              >
                {tileSrc && (
                  <Image
                    src={tileSrc}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 90vw, 45vw"
                    style={{ objectFit: "cover" }}
                    onError={() => {
                      const fallback = SERVICES[i]?.image;
                      if (!fallback || fallback === tileSrc) return;
                      setImageFallbacks((previous) => ({
                        ...previous,
                        [service.name]: fallback,
                      }));
                    }}
                  />
                )}

                {isPrimary && (
                  <span className="services__tile-heading">
                    <span className="services__tile-title">{service.name}</span>
                  </span>
                )}

                {!isPrimary && (
                  <span className="services__tile-label">
                    {service.imageLabel || service.name}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
