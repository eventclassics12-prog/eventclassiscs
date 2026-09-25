import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import CircularText from "./lightswind-pro/circular-text";
import { mediaAlt, mediaUrl, type PageAboutData } from "@/lib/cms";
import "./AboutPage.css";

const FALLBACK_PRINCIPLES = [
  {
    title: "Embedded, no outsourced",
    body:
      "We plug straight into your sprints, your standups, your launches. It feels like we're extended team, without the commitment of new staff. We don't slow you down when you need to iterate fast and move goalposts.",
  },
  {
    title: "Progress over process",
    body:
      "We're here to move the product forward, not add layers for the sake of it. No bloated workshops. No six-week marches. We zero in on what needs to be done to move you forwards and focus on getting there.",
  },
  {
    title: "Quality first",
    body:
      "Just because we're output-oriented, we never cut corners on quality. We save our time and resources for impactful, creative, and unique brand thinking. You're getting the core quality, lean and stripped of unnecessary ceremony.",
  },
  {
    title: "We aim to be recommended",
    body:
      "Every project is treated like the start of a long-term relationship. We care about doing work that founders genuinely want to recommend. Every client relationship is a partnership built on trust, communication, and shared outcomes.",
  },
] as const;

const FALLBACK_PARAGRAPHS: string[] = [
  "This doesn’t mean we’re a ‘cheap choice’. It means we cut the fat around the service and get straight to the output: the assets you need to fuel growth and turn ideas into investable propositions. We are your direct line into world-class design, understandings of your results, without the red tape of account managers or the delays of opening a ticket.",
  "The system works. Since our first launch, we’ve built the brand systems that helped our clients raise over ₹100Mn in funding, the kind of investment that opens them to long-term success. If you’re thinking of hiring an agency, this is your solution — embedded design that rolls with your momentum.",
];

const HERO_VIDEO = "/videos/chrome-about-loop.mp4";
const HERO_TITLE =
  "We’re a strategic brand-building partner for founders with momentum";
const HERO_LEDE =
  "Get a senior brand team embedded directly into your project. When you don’t have time to waste, we strip it back to what matters: fast-moving, reactive work that gets your product noticed.";
const STORY_TITLE =
  "We set you on a path to go from idea to impact with a partner that just gets the ins and outs of brand life.";
const QUOTE_LEAD =
  "\u201cI started Event Classics after seeing how founders, seed rounds and small teams couldn\u2019t get access to top-tier brand work because of the costs and delays associated with agency bloat.\u201d";
const FOUNDER_AVATAR = "/about-founder-avatar.jpg";
const FOUNDER_NAME = "Pamal Mondal";
const FOUNDER_ROLE = "Founder & Lead Brand Designer";
const MANIFESTO_TITLE = "Execution over ego.\nWe\u2019re lean by design.";
const MANIFESTO_CTA_LABEL = "Find out what we offer";
const MANIFESTO_CTA_HREF = "/services";

interface AboutPageProps {
  data?: PageAboutData | null;
}

export function AboutPage({ data }: AboutPageProps) {
  const heroVideo = mediaUrl(data?.heroVideo) ?? HERO_VIDEO;
  const storyParagraphs =
    data?.storyParagraphs?.map((p) => p.text ?? "") ?? FALLBACK_PARAGRAPHS;
  const principles = data?.principles ?? FALLBACK_PRINCIPLES;
  const stanceLines = (data?.manifestoTitle ?? MANIFESTO_TITLE).split("\n");

  return (
    <main className="about">
      <section className="about__hero">
        <div className="about__hero-grid">
          <div className="about__hero-figure" aria-hidden="true">
            <video
              className="about__hero-figure-video"
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          <div className="about__hero-text">
            <h1 className="about__title">{data?.heroTitle ?? HERO_TITLE}</h1>
            <p className="about__lede">{data?.heroLede ?? HERO_LEDE}</p>
          </div>
        </div>
      </section>

      <CircularText
        innerSentence={data?.circularInner ?? undefined}
        outerSentence={data?.circularOuter ?? undefined}
      />

      <section className="about__story">
        <div className="about__story-inner">
          <h2 className="about__story-title">
            {data?.storyTitle ?? STORY_TITLE}
          </h2>

          <div className="about__story-copy">
            <blockquote className="about__quote">
              <p className="about__quote-lead">
                {data?.quoteLead ?? QUOTE_LEAD}
              </p>

              {storyParagraphs.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </blockquote>

            <footer className="about__founder">
              <Image
                src={mediaUrl(data?.founderAvatar) ?? FOUNDER_AVATAR}
                alt={mediaAlt(data?.founderAvatar)}
                width={48}
                height={48}
                className="about__founder-avatar"
              />
              <div>
                <span className="about__founder-name">
                  {data?.founderName ?? FOUNDER_NAME}
                </span>
                <span className="about__founder-role">
                  {data?.founderRole ?? FOUNDER_ROLE}
                </span>
              </div>
            </footer>
          </div>
        </div>
      </section>

      <section className="about__manifesto">
        <div className="about__manifesto-inner">
          <div className="about__stance">
            <h2 className="about__stance-title">
              {stanceLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h2>

            <Link
              className="about__stance-cta"
              href={data?.manifestoCtaHref ?? MANIFESTO_CTA_HREF}
            >
              <span className="about__stance-cta-label">
                {data?.manifestoCtaLabel ?? MANIFESTO_CTA_LABEL}
              </span>
              <span className="about__stance-cta-arrow" aria-hidden="true">
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
            </Link>
          </div>

          <div className="about__principles">
            {principles.map((principle) => (
              <article key={principle.title ?? ""} className="about__principle">
                <h3 className="about__principle-title">{principle.title}</h3>
                <p className="about__principle-body">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
