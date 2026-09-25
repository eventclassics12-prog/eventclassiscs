"use client";

import { Fragment, useState } from "react";
import { pad2 } from "@/lib/utils";
import { SERVICES } from "./Services";
import {
  mediaUrl,
  type HomeServicesData,
  type PageServicesData,
} from "@/lib/cms";
import "./ServicesPage.css";

/**
 * Hallmark · /services page body.
 *
 * Laurenti-style numbered service blocks: a mono eyebrow + editorial
 * hero, then one row per service (number, title, kicker, description,
 * mono sub-items) separated by hairline dividers. Each row carries its
 * service image, revealed/kept full-bleed on the active row.
 *
 * CMS-driven: hero copy comes from the `page-services` global and the
 * service list from the shared `home-services` global, both via optional
 * props. Everything falls back to the built-in copy (SERVICES export)
 * so this surface stays in sync with the homepage Services section.
 */

const HERO_VIDEO = "/videos/chrome-services-loop.mp4";
const HERO_TITLE = "Four disciplines.\nOne brand system.";
const HERO_LEDE =
  "Strategy, identity, distribution and content \u2014 built as one connected system, not four disconnected vendors.";

interface SvcRow {
  name: string;
  kicker: string;
  description: string;
  subItems: string[];
  image: string;
  imageLabel: string;
}

interface ServicesPageProps {
  /** CMS `page-services` global (hero copy); falls back to built-in copy. */
  data?: PageServicesData | null;
  /**
   * CMS `home-services` global (shared service list); falls back to the
   * built-in SERVICES export when absent or empty.
   */
  servicesData?: HomeServicesData | null;
}

function normalizeCmsServices(
  rows: NonNullable<HomeServicesData["services"]>,
): SvcRow[] {
  return rows.map((s) => ({
    name: s.name ?? "",
    kicker: s.kicker ?? "",
    description: s.description ?? "",
    subItems: (s.subItems ?? []).map((it) => it.value ?? ""),
    image: mediaUrl(s.image) ?? "",
    imageLabel: s.imageLabel ?? "",
  }));
}

export function ServicesPage({ data, servicesData }: ServicesPageProps) {
  const [selected, setSelected] = useState(0);

  const heroVideo = mediaUrl(data?.heroVideo) ?? HERO_VIDEO;
  const titleLines = (data?.heroTitle ?? HERO_TITLE).split("\n");
  const heroLede = data?.heroLede ?? HERO_LEDE;

  const cmsRows = servicesData?.services;
  const services: SvcRow[] =
    cmsRows && cmsRows.length > 0
      ? normalizeCmsServices(cmsRows)
      : SERVICES.map((s) => ({
          name: s.name,
          kicker: s.kicker,
          description: s.description,
          subItems: [...s.subItems],
          image: s.image,
          imageLabel: s.imageLabel,
        }));

  return (
    <main className="svc">
      {/* ───── Hero ───── */}
      <header className="svc__hero">
        <div className="svc__hero-grid">
          <div className="svc__hero-figure" aria-hidden="true">
            <video
              className="svc__hero-figure-video"
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          <div className="svc__hero-text">
            <h1 className="svc__title">
              {titleLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h1>
            <p className="svc__lede">{heroLede}</p>
          </div>
        </div>
      </header>

      {/* ───── Numbered service rows ───── */}
      <section className="svc__list">
        {services.map((service, i) => {
          const active = selected === i;
          return (
            <article
              key={service.name}
              className={`svc__row ${active ? "svc__row--active" : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-labelledby={`svc-${i}-title`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected(i);
                }
              }}
            >
              <span className="svc__number" aria-hidden="true">
                {pad2(i + 1)}
              </span>

              <div className="svc__copy">
                <h2 className="svc__name" id={`svc-${i}-title`}>
                  {service.name}
                </h2>
                <p className="svc__kicker">{service.kicker}</p>
                <p className="svc__description">{service.description}</p>
                <p className="svc__subitems">{service.subItems.join(" · ")}</p>
              </div>

              <div className="svc__image-wrap">
                <div
                  className="svc__image"
                  style={
                    {
                      backgroundImage: `url(${service.image})`,
                        }
                      }
                  aria-hidden="true"
                >
                  <span className="svc__image-label">{service.imageLabel}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default ServicesPage;
