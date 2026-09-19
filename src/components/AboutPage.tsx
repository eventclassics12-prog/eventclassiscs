import Image from "next/image";
import Link from "next/link";
import CircularText from "./lightswind-pro/circular-text";
import "./AboutPage.css";

/**
 * Hallmark · /about page.
 *
 * Structure mirrors the founder-story reference:
 *   1. editorial hero — display headline + short lede
 *   2. full-bleed three-image band (desk / hands / portrait)
 *   3. founder story — offset column, quote + two body paragraphs,
 *      avatar + name + role footer
 *   4. dark manifesto — big two-line stance + pill CTA on the left,
 *      four hairline-divided principle entries on the right
 *
 * Copy is rewritten in the eventclassics brand voice ("Idea to Impact");
 * photos are generated monochrome imagery served from /public/about-*.
 */

const PRINCIPLES = [
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

export function AboutPage() {
  return (
    <main className="about">
      {/* ───── 1. Editorial hero ───── */}
      <section className="about__hero">
        <div className="about__hero-grid">
          <div className="about__hero-figure" aria-hidden="true">
            <video
              className="about__hero-figure-video"
              src="/videos/chrome-about-loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>

          <div className="about__hero-text">
            <h1 className="about__title">
              We&rsquo;re a strategic brand-building partner for founders
              with momentum
            </h1>
            <p className="about__lede">
              Get a senior brand team embedded directly into your project.
              When you don&rsquo;t have time to waste, we strip it back to
              what matters: fast-moving, reactive work that gets your
              product noticed.
            </p>
          </div>
        </div>
      </section>

      {/* ───── 2. Radial letter assembly ───── */}
      <CircularText />

      {/* ───── 3. Founder story ───── */}
      <section className="about__story">
        <div className="about__story-inner">
          <h2 className="about__story-title">
            We set you on a path to go from idea to impact with a partner
            that just gets the ins and outs of brand life.
          </h2>

          <div className="about__story-copy">
            <blockquote className="about__quote">
              <p className="about__quote-lead">
                &quot;I started Event Classics after seeing how founders, seed
                rounds and small teams couldn&apos;t get access to top-tier
                brand work because of the costs and delays associated with
                agency bloat.&quot;
              </p>

              <p>
                This doesn&apos;t mean we&apos;re a &apos;cheap choice&apos;.
                It means we cut the fat around the service and get straight
                to the output: the assets you need to fuel growth and turn
                ideas into investable propositions. We are your direct line
                into world-class design, understandings of your results,
                without the red tape of account managers or the delays of
                opening a ticket.
              </p>

              <p>
                The system works. Since our first launch, we&apos;ve built
                the brand systems that helped our clients raise over ₹100Mn
                in funding, the kind of investment that opens them to
                long-term success. If you&rsquo;re thinking of hiring an
                agency, this is your solution — embedded design that rolls
                with your momentum.
              </p>
            </blockquote>

            <footer className="about__founder">
              <Image
                src="/about-founder-avatar.jpg"
                alt=""
                width={48}
                height={48}
                className="about__founder-avatar"
              />
              <div>
                <span className="about__founder-name">
                  Pamal Mondal
                </span>
                <span className="about__founder-role">
                  Founder &amp; Lead Brand Designer
                </span>
              </div>
            </footer>
          </div>
        </div>
      </section>

      {/* ───── 4. Dark manifesto ───── */}
      <section className="about__manifesto">
        <div className="about__manifesto-inner">
          <div className="about__stance">
            <h2 className="about__stance-title">
              Execution over ego.
              <br />
              We&rsquo;re lean by design.
            </h2>

            <Link className="about__stance-cta" href="/services">
              <span className="about__stance-cta-label">
                Find out what we offer
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
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.title}
                className="about__principle"
              >
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
