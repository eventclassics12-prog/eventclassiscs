"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
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
  "We don\u2019t sell services.\nWe connect the pieces that make a brand work.";
const FALLBACK_LABEL = "What we can help with";

export function Services({ data }: ServicesProps) {
  const introLines = (data?.intro ?? FALLBACK_INTRO).split("\n");
  const label = data?.label ?? FALLBACK_LABEL;

  const services: Service[] =
    data?.services && data.services.length > 0
      ? data.services.map((s, i) => {
          const fallback = SERVICES[i % SERVICES.length];
          return {
            name: s.name ?? fallback.name,
            kicker: s.kicker ?? fallback.kicker,
            description: s.description ?? fallback.description,
            subItems:
              s.subItems && s.subItems.length > 0
                ? s.subItems.map((item) => item.value ?? "")
                : [...fallback.subItems],
            image: mediaUrl(s.image) ?? fallback.image,
            imageLabel: s.imageLabel ?? fallback.imageLabel,
          };
        })
      : SERVICES.map((s) => ({ ...s, subItems: [...s.subItems] }));

  const [selectedService, setSelectedService] = useState(0);

  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const descriptionColRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const descriptionCol = descriptionColRef.current;
    const imageCol = imageColRef.current;
    if (!descriptionCol || !imageCol) return;

    const alignActiveContent = () => {
      const item = itemRefs.current[selectedService];
      if (!item) return;

      const itemCenter = item.offsetTop + item.offsetHeight / 2;
      const centerOnItem = (element: HTMLElement, property: string) => {
        const y = itemCenter - element.offsetTop - element.offsetHeight / 2;
        element.style.setProperty(property, `${y}px`);
      };

      centerOnItem(descriptionCol, "--services-description-y");
      centerOnItem(imageCol, "--services-image-y");
    };

    alignActiveContent();

    const observer = new ResizeObserver(alignActiveContent);
    observer.observe(descriptionCol);
    observer.observe(imageCol);
    const item = itemRefs.current[selectedService];
    if (item) observer.observe(item);

    return () => observer.disconnect();
  }, [selectedService]);

  return (
    <section className="services" id="services">
      <div className="services__inner">
        <div ref={descriptionColRef} className="services__left">
          <p className="services__intro">
            {introLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>

          <p className="services__description" aria-live="polite">
            <strong>{services[selectedService].name}.</strong>
            <em className="services__kicker">
              {services[selectedService].kicker}
            </em>
            <span className="services__description-body">
              {services[selectedService].description}
            </span>
            <span className="services__subitems">
              {services[selectedService].subItems.join(" · ")}
            </span>
          </p>
        </div>

        <div className="services__right">
          <header className="services__label-row">
            <span className="services__dot" aria-hidden="true" />
            <span className="services__label-text">{label}</span>
          </header>

          <ul className="services__list">
            {services.map((s, i) => (
              <li
                key={s.name}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`services__item ${
                  selectedService === i ? "services__item--active" : ""
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={selectedService === i}
                onMouseEnter={() => setSelectedService(i)}
                onClick={() => setSelectedService(i)}
                onFocus={() => setSelectedService(i)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedService(i);
                  }
                }}
              >
                {s.name}
              </li>
            ))}
          </ul>
        </div>

        <div ref={imageColRef} className="services__image-col" aria-hidden="true">
          {services.map((service, i) => (
            <div
              key={service.name}
              className={`services__hover-image ${
                selectedService === i ? "services__hover-image--active" : ""
              }`}
              style={{
                backgroundImage: `url(${service.image})`,
              }}
            >
              <span className="services__hover-image-label">
                {service.imageLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
