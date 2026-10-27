import Link from "next/link";
import { pad2 } from "@/lib/utils";
import { WorkProjectImage } from "./WorkProjectImage";
import { WorkCaseStudy } from "./WorkCaseStudy";
import type { WorkProject } from "@/lib/work";
import "./WorkProjectPage.css";

interface WorkProjectPageProps {
  project: WorkProject;
  index: number;
  total: number;
  next: WorkProject | undefined;
  includesLabel: string;
  backLabel: string;
  nextLabel: string;
}

function Kicker({ parts }: { parts: Array<[string, string?]> }) {
  return (
    <>
      {parts.map(([text, tone], i) =>
        tone === "blue" ? (
          <strong key={i} className="wkp__accent">
            {text}
          </strong>
        ) : (
          <span key={i} className="wkp__part">
            {text}
          </span>
        ),
      )}
    </>
  );
}

export function WorkProjectPage({
  project,
  index,
  total,
  next,
  includesLabel,
  backLabel,
  nextLabel,
}: WorkProjectPageProps) {
  return (
    <main className="wkp wkp--editorial">
      <section className="wkp__hero">
        <div className="wkp__hero-media">
          <WorkProjectImage
            project={project}
            index={index}
            priority
            sizes="100vw"
          />
          <span className="wkp__counter" aria-hidden="true">
            {pad2(index + 1)} / {pad2(total)}
          </span>
        </div>

        <div className="wkp__hero-copy">
          <Link href="/work" className="wkp__back">
            <span aria-hidden="true">&larr;</span> {backLabel}
          </Link>

          <h1 className="wkp__title">{project.title}</h1>

          <p className="wkp__kicker">
            <Kicker parts={project.kicker} />
          </p>

          <p className="wkp__lede">{project.intro}</p>
        </div>
      </section>

      {(
        <section className="wkp__systems" aria-labelledby="systems-heading">
          <div className="wkp__systems-copy">
            <p className="wkp__eyebrow">The approach</p>
            <h2 id="systems-heading">{project.caption || "A clear direction. Built around the brief."}</h2>
            <p>{project.body}</p>
            <a href="#case-execution">Explore the approach <span aria-hidden="true">↗</span></a>
          </div>
          {project.slug === "iqvia" ? (
            <figure className="wkp__diagram">
              <figcaption>Integration approach · conceptual illustration</figcaption>
              <div className="wkp__nodes"><div>CRM<small>Customer workflows</small></div><div>ERP<small>Business operations</small></div></div>
              <div className="wkp__connector" aria-hidden="true" />
              <div className="wkp__hub"><span aria-hidden="true">✳</span>Connected workflows<small>Built around the business</small></div>
              <div className="wkp__connector" aria-hidden="true" />
              <div className="wkp__nodes"><div>Teams<small>Clearer handoffs</small></div><div>Processes<small>Less friction</small></div></div>
            </figure>
          ) : (
            <figure className="wkp__diagram wkp__service-map">
              <figcaption>A connected approach</figcaption>
              <div className="wkp__hub"><span aria-hidden="true">✳</span>{project.title}<small>Strategy into expression</small></div>
              <div className="wkp__connector" aria-hidden="true" />
              <div className="wkp__nodes">
                {project.includes.map((service, i) => (
                  <div key={service}><small>{pad2(i + 1)}</small>{service}</div>
                ))}
              </div>
            </figure>
          )}
        </section>
      )}

      <WorkCaseStudy project={project} includesLabel={includesLabel} />

      {next && (
        <nav className="wkp__next" aria-label="Next project">
          <Link href={`/work/${next.slug}`} className="wkp__next-link">
            <span className="wkp__next-label">{nextLabel}</span>
            <span className="wkp__next-title">{next.title}</span>
            <span className="wkp__next-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </nav>
      )}
    </main>
  );
}
