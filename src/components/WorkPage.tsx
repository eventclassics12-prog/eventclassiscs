"use client";

import { ViewportVideo } from "./ViewportVideo";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { WorkMasonry } from "./WorkMasonry";
import { mediaUrl, type PageWorkData, type TextPart } from "@/lib/cms";
import { resolveProjects } from "@/lib/work";
import "./WorkPage.css";

const DEFAULT_HERO_LEDE =
  "Our clients are founders and leaders in healthcare, enterprise technology, wellness, and real estate. We are routinely entrusted by them to build brand systems and digital experiences where clarity and performance play a key role.";

const DEFAULT_HERO_TITLE = "Selected Work";
const DEFAULT_PROJECTS_LABEL = "Selected Projects";

function MarqueeLine2({ parts }: { parts?: TextPart[] }) {
  if (parts == null) {
    return (
      <>
        We listen. We think. <span className="wk__accent">We ship.</span>{" "}
        That&rsquo;s our work in motion.
      </>
    );
  }
  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <span key={i} className="wk__accent">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function WorkPage({ data }: { data?: PageWorkData | null }) {
  // The board re-measures its tiles whenever this list changes identity, so
  // it is resolved once per set of CMS data rather than once per render.
  const projects = useMemo(() => resolveProjects(data), [data]);

  const heroLede = data?.heroLede?.trim() || DEFAULT_HERO_LEDE;
  const heroTitle = data?.heroTitle?.trim() || DEFAULT_HERO_TITLE;
  const projectsLabel = data?.projectsLabel?.trim() || DEFAULT_PROJECTS_LABEL;

  const marqueeLine1 = data?.marqueeLine1 ?? "We build. We refine.";
  const marqueeVideoSrc =
    mediaUrl(data?.marqueeVideo) ?? "/videos/success-stories-mammoth.webm";

  const marquee: ReactNode = (
    <>
      {[0, 1].map((copy) => (
        <div className="wk__marquee-group" key={copy} aria-hidden={copy === 1}>
          <p className="wk__marquee-text">{marqueeLine1}</p>
          <span className="wk__marquee-figure" aria-hidden="true">
            <ViewportVideo src={marqueeVideoSrc} />
          </span>
          <p className="wk__marquee-text">
            <MarqueeLine2 parts={data?.marqueeLine2 ?? undefined} />
          </p>
        </div>
      ))}
    </>
  );

  return (
    <main className="wk">
      <section className="wk__intro" aria-label="Work overview">
        <div className="wk__intro-rule" aria-hidden="true" />
        <p className="wk__lede">
          <span className="wk__pill">WORK</span>
          <span className="wk__lede-copy">{heroLede}</span>
        </p>
      </section>

      <section className="wk__cases" id="work-masonry" aria-label="Case studies">
        <div className="wk__cases-header">
          <div className="wk__cases-rule" aria-hidden="true" />
          <div className="wk__cases-meta">
            <span className="wk__pill">{projectsLabel}</span>
          </div>
          <h1 className="wk__title">{heroTitle}</h1>
        </div>

        {projects.length > 0 && <WorkMasonry projects={projects} />}
      </section>

      <section className="wk__marquee" aria-label="Studio work in motion">
        {marquee}
      </section>
    </main>
  );
}
