import Link from "next/link";
import { WorkProjectImage } from "./WorkProjectImage";
import { WorkCaseStudy } from "./WorkCaseStudy";
import { WorkflowDiagram } from "./WorkflowDiagram";
import type { WorkLabels, WorkProject } from "@/lib/work";
import "./WorkProjectPage.css";

interface WorkProjectPageProps {
  project: WorkProject;
  index: number;
  next: WorkProject | undefined;
  labels: WorkLabels;
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
  next,
  labels,
}: WorkProjectPageProps) {
  const diagram = project.diagram;
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
        </div>

        <div className="wkp__hero-copy">
          <Link href="/work" className="wkp__back">
            <span aria-hidden="true">&larr;</span> {labels.backLabel}
          </Link>

          <h1 className="wkp__title">{project.title}</h1>

          <p className="wkp__kicker">
            <Kicker parts={project.kicker} />
          </p>

          <p className="wkp__lede">{project.intro}</p>
        </div>
      </section>

      <section className="wkp__systems" aria-labelledby="systems-heading">
        <div className="wkp__systems-copy">
          <p className="wkp__eyebrow">{labels.approachEyebrow}</p>
          <h2 id="systems-heading">
            {project.caption || "A clear direction. Built around the brief."}
          </h2>
          <p>{project.body}</p>
          <a href="#case-execution">
            {labels.approachLinkLabel} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <WorkflowDiagram
          caption={diagram.hideCaption ? undefined : labels.diagramCaption}
          triggerLabel={diagram.triggerLabel || labels.diagramTriggerLabel}
          rootEyebrow={diagram.eyebrow || labels.diagramRootEyebrow}
          rootTitle={diagram.title || project.title}
          rootNote={diagram.note || labels.diagramRootNote}
          itemsLabel={diagram.itemsLabel || labels.diagramItemsLabel}
          items={
            diagram.items.length > 0
              ? diagram.items
              : project.includes.map((service) => ({ title: service }))
          }
        />
      </section>

      <WorkCaseStudy project={project} labels={labels} />

      {next && (
        <nav className="wkp__next" aria-label="Next project">
          <Link href={`/work/${next.slug}`} className="wkp__next-link">
            <span className="wkp__next-label">{labels.nextLabel}</span>
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
