"use client";

import { ViewportVideo } from "./ViewportVideo";
import Image from "next/image";
import { Fragment, useState } from "react";
import { pad2 } from "@/lib/utils";
import { SERVICES } from "./Services";
import {
  mediaUrl,
  type HomeServicesData,
  type PageServicesData,
} from "@/lib/cms";
import "./ServicesPage.css";

const HERO_VIDEO = "/videos/chrome-services-loop.mp4";
const HERO_TITLE = "Four disciplines.\nOne brand system.";
const HERO_LEDE =
  "Strategy, identity, distribution and content \u2014 built as one connected system, not four disconnected vendors.";
const FALLBACK_LABEL = "What we can help with";
const FALLBACK_INTRO =
  "We don\u2019t sell services. We connect the pieces that make a brand work.";

interface SvcRow {
  name: string;
  kicker: string;
  description: string;
  subItems: string[];
  image: string;
  imageLabel: string;
}

interface ServicesPageProps {
  data?: PageServicesData | null;
  servicesData?: HomeServicesData | null;
}

function normalizeCmsServices(
  rows: NonNullable<HomeServicesData["services"]>,
): SvcRow[] {
  return rows.map((s, i) => {
    const fallback = SERVICES[i];
    return {
      name: s.name?.trim() || fallback?.name || "",
      kicker: s.kicker?.trim() || fallback?.kicker || "",
      description: s.description?.trim() || fallback?.description || "",
      subItems:
        s.subItems && s.subItems.length > 0
          ? s.subItems.map((it) => it.value ?? "").filter(Boolean)
          : fallback
            ? [...fallback.subItems]
            : [],
      image: mediaUrl(s.image) || fallback?.image || "",
      imageLabel: s.imageLabel?.trim() || fallback?.imageLabel || "",
    };
  });
}

export function ServicesPage({ data, servicesData }: ServicesPageProps) {
  const [imageFallbacks, setImageFallbacks] = useState<Record<string, string>>(
    {},
  );

  const heroVideo = mediaUrl(data?.heroVideo) ?? HERO_VIDEO;
  const titleLines = (data?.heroTitle ?? HERO_TITLE).split("\n");
  const heroLede = data?.heroLede ?? HERO_LEDE;
  const eyebrowLabel = servicesData?.label?.trim() || FALLBACK_LABEL;
  const listIntro = (servicesData?.intro ?? FALLBACK_INTRO)
    .replace(/\s*\n\s*/g, " ")
    .trim();

  const cmsRows = servicesData?.services;
  const services: SvcRow[] =
    cmsRows != null && cmsRows.length > 0
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
      <header className="svc__hero">
        <div className="svc__hero-grid">
          <div className="svc__hero-figure" aria-hidden="true">
            <ViewportVideo src={heroVideo} className="svc__hero-figure-video" />
          </div>

          <div className="svc__hero-text">
            <div className="svc__eyebrow">
              <span className="svc__dot" aria-hidden="true" />
              <span className="svc__eyebrow-text">{eyebrowLabel}</span>
            </div>

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

      <section className="svc__list" aria-label="Core disciplines">
        <div className="svc__list-bar">
          <span className="svc__list-label">
            Disciplines ({pad2(services.length)})
          </span>
          <p className="svc__list-intro">{listIntro}</p>
        </div>

        <div className="svc__rows">
          {services.map((service, i) => {
            const imgSrc = imageFallbacks[service.name] ?? service.image;

            return (
              <article
                key={service.name}
                className="svc__row"
                aria-labelledby={`svc-${i}-title`}
              >
                <div className="svc__head">
                  <div className="svc__meta">
                    <span className="svc__number">{pad2(i + 1)}</span>
                    {service.imageLabel && (
                      <>
                        <span className="svc__meta-sep" aria-hidden="true" />
                        <span className="svc__category">
                          {service.imageLabel}
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="svc__name" id={`svc-${i}-title`}>
                    {service.name}
                  </h2>

                  {service.kicker && (
                    <p className="svc__kicker">{service.kicker}</p>
                  )}
                </div>

                <div className="svc__body">
                  <p className="svc__description">{service.description}</p>

                  {service.subItems.length > 0 && (
                    <div className="svc__deliverables">
                      <span className="svc__deliverables-label">
                        Deliverables
                      </span>
                      <ul className="svc__subitems" aria-label="Deliverables">
                        {service.subItems.map((item) => (
                          <li key={item} className="svc__subitem">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="svc__media" aria-hidden="true">
                  <div className="svc__image-wrap">
                    {imgSrc && (
                      <Image
                        src={imgSrc}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 28vw, 220px"
                        className="svc__image-img"
                        onError={() => {
                          const fallback = SERVICES[i]?.image;
                          if (!fallback || fallback === imgSrc) return;
                          setImageFallbacks((prev) => ({
                            ...prev,
                            [service.name]: fallback,
                          }));
                        }}
                      />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
