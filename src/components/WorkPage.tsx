"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { pad2 } from "@/lib/utils";
import { ScrollCards } from "@/components/lightswind/scroll-cards";
import ImageSlider3D from "@/components/lightswind/3d-image-slider";
import "./WorkPage.css";

/**
 * Hallmark · /work — "Our Work".
 *
 * Reference-style editorial layout (white canvas, blue accent):
 *   1. strip    · mono "Our Work" label between hairlines + blue dot
 *   2. intro    · statement panel ("Great work is built on evidence…")
 *   3. marquee  · looping "That's our work in motion" band with an
 *                 inline looping video figure
 *   4. cases    · "Projects" strip + GSAP ScrollCards stack — each
 *                 project is a 60vh card (text left, image right) that
 *                 slides up from the bottom over the previous card
 *   5. cta      · pill bar ("Great work works best when we connect." +
 *                 blue "Book a call")
 *   6. socials  · "Latest on socials" image-card marquee
 */

interface WorkProject {
  title: string;
  kicker: Array<[string, string?]>; // [text, tone] · tone "blue" highlights
  intro: string;
  body: string;
  includes: ReadonlyArray<string>;
  caption: string;
  image: string;
  alt: string;
}

const PROJECTS: ReadonlyArray<WorkProject> = [
  {
    title: "IQVIA",
    kicker: [
      ["Systems that "],
      ["work around the business.", "blue"],
    ],
    intro:
      "IQVIA didn't need another efficiency promise. It needed systems built around the business — not bolted onto it.",
    body: "We engineered the platform around real workflows: custom CRM and ERP integrations, supported by a clear strategic and technology-led framework designed to remove friction across every team that touched it.",
    includes: [
      "Workflow mapping across CRM & ERP teams",
      "Custom systems integration",
      "Technology-led strategic frameworks",
      "Friction-reduction audits",
    ],
    caption: "Making complex workflow better.",
    image: "/services/growth-strategy.png",
    alt: "IQVIA project — crystal growth visual",
  },
  {
    title: "Manipal Hospitals",
    kicker: [["Making "], ["trust", "blue"], [" easier to feel."]],
    intro:
      "Healthcare is full of information, but people don't remember information — they remember how a brand made them feel.",
    body: "We shaped the storytelling, branding campaigns and strategic communication around a clearer idea of care. The result is a health brand that feels human, recognizable and relevant to the people it serves.",
    includes: [
      "Brand storytelling & narrative system",
      "Campaign design & production",
      "Strategic communication",
      "Care-experience messaging",
    ],
    caption: "Making trust easier to feel.",
    image: "/services/content-creation.png",
    alt: "Manipal Hospitals project — film camera visual",
  },
  {
    title: "Redmonk Wellness",
    kicker: [["Content that feels "], ["worth stopping for.", "blue"]],
    intro:
      "Wellness brands don't need more content. They need content that feels worth stopping for.",
    body: "We built a sharper approach around short, crisp and raw communication — designed for the way people actually consume information today: fast feeds, short attention spans, and moments that reward brands that can be understood in a single glance.",
    includes: [
      "Short-form content strategy",
      "Raw, crisp communication",
      "Attention-first formats",
      "Community & channel voice",
    ],
    caption: "Turning attention into action.",
    image: "/services/social-media.png",
    alt: "Redmonk Wellness project — pink network visual",
  },
  {
    title: "Team Taurus",
    kicker: [["Spaces that feel "], ["lived in.", "blue"]],
    intro:
      "Real estate is often reduced to location, price and square feet. People don't buy spaces like spreadsheets — they imagine what it will feel like to live there.",
    body: "We sharpened the brand narrative around the experience behind the spaces, making the communication more distinctive, considered and relevant to the people it was built for.",
    includes: [
      "Brand narrative & positioning",
      "Experience-led campaigns",
      "Distinctive communication design",
      "Considered spatial voice",
    ],
    caption: "Spaces that feel lived in.",
    image: "/services/brand-identity.png",
    alt: "Team Taurus project — clay identity mark",
  },
];

function Kicker({ parts }: { parts: WorkProject["kicker"] }) {
  return (
    <>
      {parts.map(([text, tone], i) =>
        tone === "blue" ? (
          <strong key={i} className="wk__accent">
            {text}
          </strong>
        ) : (
          <span key={i}>{text}</span>
        ),
      )}
    </>
  );
}

function BlueDot() {
  return <span className="wk__dot" aria-hidden="true" />;
}

function ProjectCard({ project, index }: { project: WorkProject; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = expanded;
  const onToggle = () => setExpanded((v) => !v);

  return (
    <div className="wk-card">
      <span className="wk-card__corner" aria-hidden="true">
        <span className="wk-card__number">
          {pad2(index + 1)}
        </span>
      </span>

      <div className="wk-card__copy">
        <h3 className="wk-card__name">{project.title}</h3>

        <div className="wk-card__lede">
          <p className="wk-card__kicker">
            <Kicker parts={project.kicker} />
          </p>
          <p className="wk-card__para">{project.intro}</p>
          <p className="wk-card__para">{project.body}</p>
          <p className="wk-card__para">{project.caption}</p>

          <div
            className={`wk-card__more${isOpen ? " wk-card__more--open" : ""}`}
            id={`wk-more-${index}`}
          >
            <div className="wk-card__more-inner" aria-hidden={!isOpen}>
              <p className="wk-card__includes-label">Includes:</p>
              <ul className="wk-card__includes">
                {project.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="button"
            className="wk-card__read-more"
            aria-expanded={isOpen}
            aria-controls={`wk-more-${index}`}
            onClick={onToggle}
          >
            {isOpen ? "Read less" : "Read more"}
            <span className="wk-card__plus" aria-hidden="true">
              {isOpen ? "–" : "+"}
            </span>
          </button>
        </div>
      </div>

      <figure className="wk-card__figure" aria-hidden="true">
        <img src={project.image} alt={project.alt} loading="lazy" />
      </figure>
    </div>
  );
}

export function WorkPage() {
  const marquee: ReactNode = (
    <>
      {[0, 1].map((copy) => (
        <div className="wk__marquee-group" key={copy} aria-hidden={copy === 1}>
          <p className="wk__marquee-text">We build. We refine.</p>
          <span className="wk__marquee-figure" aria-hidden="true">
            <video
              src="/videos/success-stories-mammoth.webm"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          </span>
          <p className="wk__marquee-text">
            We listen. We think. <span className="wk__accent">We ship.</span>{" "}
            That&rsquo;s our work in motion.
          </p>
        </div>
      ))}
    </>
  );

  const projectCards = PROJECTS.map((project, i) => ({
    id: project.title,
    content: <ProjectCard project={project} index={i} />,
  }));

  return (
    <main className="wk">
      {/* ───── 1. Hero: 3D carousel + statement ───── */}
      <section className="wk__hero" aria-label="Our work highlights">
        <div className="wk__hero-slider">
          <ImageSlider3D
            images={Array.from({ length: 12 }, (_, i) => PROJECTS[i % PROJECTS.length].image)}
          />
        </div>
        <div className="wk__hero-text">
          <h1 className="wk__title">
            Selected work from teams with momentum
          </h1>
          <p className="wk__lede">
            A senior brand team embedded directly into each project — fast-moving,
            reactive work that gets your product shipped and noticed.
          </p>
        </div>
      </section>

      {/* ───── 2. Project cards (GSAP stacking) ───── */}
      <section className="wk__cases" aria-label="Case studies">
        <div className="wk__strip wk__strip--cases">
          <span className="wk__strip-label">Projects</span>
          <BlueDot />
        </div>

        <ScrollCards
          cards={projectCards}
          direction="bottom"
          heightClass="h-[90vh]"
          startOffset="top 72px"
          stackPeekPercent={94}
          paddingClass="p-0"
          cardScale={0.9}
          cardRotation={2}
          containerClassName="h-full w-full max-w-none aspect-auto rounded-none bg-transparent shadow-none overflow-visible"
        />
      </section>

      {/* ───── 3. Motion marquee ───── */}
      <section className="wk__marquee" aria-label="Studio work in motion">
        {marquee}
      </section>

    </main>
  );
}

export default WorkPage;
