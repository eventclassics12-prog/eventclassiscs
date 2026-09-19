"use client";

import Image from "next/image";
import { useState } from "react";
import { SERVICES } from "./Services";
import "./ServicesPage.css";

/**
 * Hallmark · /services page body.
 *
 * Laurenti-style numbered service blocks: a mono eyebrow + editorial
 * hero, then one row per service (number, title, kicker, description,
 * mono sub-items) separated by hairline dividers. Each row carries its
 * service image, revealed/kept full-bleed on the active row.
 *
 * Copy, images and data are reused verbatim from the homepage Services
 * section (SERVICES export) so both surfaces stay in sync.
 */

export function ServicesPage() {
  const [selected, setSelected] = useState(0);

  return (
    <main className="svc">
      {/* ───── Hero ───── */}
      <header className="svc__hero">
        <div className="svc__hero-grid">
          <div className="svc__hero-figure" aria-hidden="true">
            <video
              className="svc__hero-figure-video"
              src="/videos/chrome-services-loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          <div className="svc__hero-text">
            <h1 className="svc__title">
              Four disciplines.
              <br />
              One brand system.
            </h1>
            <p className="svc__lede">
              Strategy, identity, distribution and content — built as one
              connected system, not four disconnected vendors.
            </p>
          </div>
        </div>
      </header>

      {/* ───── Numbered service rows ───── */}
      <section className="svc__list">
        {SERVICES.map((service, i) => {
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
                {String(i + 1).padStart(2, "0")}
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
