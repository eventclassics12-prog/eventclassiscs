"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pad2 } from "@/lib/utils";
import { resolveCaseStudy } from "@/lib/case-studies";
import type { WorkProject } from "@/lib/work";
import "./WorkCaseStudy.css";

gsap.registerPlugin(ScrollTrigger);

const IDEA_ID = "case-idea";
const EXECUTION_ID = "case-execution";
const CHALLENGES_ID = "case-challenges";
const IMPACT_ID = "case-impact";

interface WorkCaseStudyProps {
  project: WorkProject;
  includesLabel: string;
}

export function WorkCaseStudy({ project, includesLabel }: WorkCaseStudyProps) {
  const caseStudy = useMemo(() => resolveCaseStudy(project), [project]);
  const rootRef = useRef<HTMLElement | null>(null);

  const hasExecution =
    caseStudy.steps.length > 0 || project.includes.length > 0;
  const hasChallenges = caseStudy.challenges.length > 0;
  const hasImpact =
    caseStudy.impacts.length > 0 || caseStudy.closing.length > 0;

  const chapters = useMemo(() => {
    const list = [{ id: IDEA_ID, label: "The idea" }];
    if (hasExecution) list.push({ id: EXECUTION_ID, label: "Execution" });
    if (hasChallenges) list.push({ id: CHALLENGES_ID, label: "Challenges" });
    if (hasImpact) list.push({ id: IMPACT_ID, label: "Impact" });
    return list;
  }, [hasExecution, hasChallenges, hasImpact]);

  const number = (id: string) =>
    pad2(chapters.findIndex((chapter) => chapter.id === id) + 1);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const tweens = new Map<Element, gsap.core.Tween>();

      // IntersectionObserver rather than ScrollTrigger: a chapter reached by a
      // hash link or a restored scroll position is already in view, and an
      // observer reports that immediately instead of waiting for a scroll
      // event that may never come.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            tweens.get(entry.target)?.play();
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0, rootMargin: "0px 0px -2% 0px" },
      );

      const chapters =
        gsap.utils.toArray<HTMLElement>("[data-chapter]", root);

      chapters.forEach((chapter) => {
        const targets = chapter.querySelectorAll<HTMLElement>("[data-reveal]");
        if (targets.length === 0) return;

        const reveal = gsap.from(targets, {
          y: 26,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          paused: true,
        });
        tweens.set(chapter, reveal);

        // Above the fold on first paint: play right away rather than waiting
        // for an intersection that has already happened.
        if (chapter.getBoundingClientRect().top < window.innerHeight) {
          reveal.play();
        } else {
          observer.observe(chapter);
        }
      });

      return () => observer.disconnect();
    });

    return () => media.revert();
  }, []);

  return (
    <section className="wcs" ref={rootRef} aria-labelledby="wcs-heading">
      <div className="wcs__inner">
        <header className="wcs__head">
          <h2 className="wcs__tag" id="wcs-heading">
            Case study
          </h2>
        </header>



        <article id={IDEA_ID} className="wcs__chapter" data-chapter>
          <header className="wcs__chapter-head">
            <span className="wcs__index" aria-hidden="true">
              {number(IDEA_ID)}
            </span>
            <h3 className="wcs__chapter-title">The idea</h3>
          </header>

          <div className="wcs__chapter-body">
            <div className="wcs__split">
              <p className="wcs__statement" data-reveal>
                {caseStudy.idea}
              </p>
              {caseStudy.ideaBody && (
                <p className="wcs__text" data-reveal>
                  {caseStudy.ideaBody}
                </p>
              )}
            </div>
          </div>
        </article>

        {hasExecution && (
          <article id={EXECUTION_ID} className="wcs__chapter" data-chapter>
            <header className="wcs__chapter-head">
              <span className="wcs__index" aria-hidden="true">
                {number(EXECUTION_ID)}
              </span>
              <h3 className="wcs__chapter-title">Execution</h3>
            </header>

            <div className="wcs__chapter-body">
              {caseStudy.executionIntro && (
                <p className="wcs__lede" data-reveal>
                  {caseStudy.executionIntro}
                </p>
              )}

              {caseStudy.steps.length > 0 && (
                <ol className="wcs__steps">
                  {caseStudy.steps.map((step, index) => (
                    <li
                      className="wcs__step"
                      key={`${step.title}-${index}`}
                      data-reveal
                    >
                      <span className="wcs__step-index" aria-hidden="true">
                        {pad2(index + 1)}
                      </span>
                      <h4
                        className={`wcs__step-title${
                          step.body ? "" : " wcs__step-title--solo"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {step.body && (
                        <p className="wcs__step-body">{step.body}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {project.includes.length > 0 && (
                <div className="wcs__scope" data-reveal>
                  <p className="wcs__scope-label">{includesLabel}</p>
                  <ul className="wcs__scope-list">
                    {project.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        )}

        {hasChallenges && (
          <article id={CHALLENGES_ID} className="wcs__chapter" data-chapter>
            <header className="wcs__chapter-head">
              <span className="wcs__index" aria-hidden="true">
                {number(CHALLENGES_ID)}
              </span>
              <div className="wcs__chapter-heading">
                <h3 className="wcs__chapter-title">Challenges</h3>
                <p className="wcs__chapter-note">
                  What we faced, and how we solved it.
                </p>
              </div>
            </header>

            <div className="wcs__chapter-body">
              <div className="wcs__challenge-head" aria-hidden="true">
                <span />
                <span>The challenge</span>
                <span>How we solved it</span>
              </div>

              <ol className="wcs__challenge-list">
                {caseStudy.challenges.map((item, index) => (
                  <li
                    className="wcs__challenge"
                    key={`${item.challenge}-${index}`}
                    data-reveal
                  >
                    <span className="wcs__challenge-index" aria-hidden="true">
                      {pad2(index + 1)}
                    </span>
                    <p className="wcs__challenge-q">{item.challenge}</p>
                    <p className="wcs__challenge-a">
                      <span className="wcs__challenge-arrow" aria-hidden="true">
                        &rarr;
                      </span>
                      {item.solution}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        )}
      </div>

      {hasImpact && (
        <div className="wcs__impact">
          <div className="wcs__inner">
            <article id={IMPACT_ID} className="wcs__chapter">
              <header className="wcs__chapter-head">
                <span className="wcs__index" aria-hidden="true">
                  {number(IMPACT_ID)}
                </span>
                <h3 className="wcs__chapter-title">Impact</h3>
              </header>

              <div className="wcs__chapter-body">
                {caseStudy.closing && (
                  <p className="wcs__result-summary">{caseStudy.closing}</p>
                )}
                {caseStudy.impacts.length > 0 && (
                  <ol className="wcs__stats">
                    {caseStudy.impacts.map((stat, index) => (
                      <li
                        className="wcs__stat"
                        key={`${stat.value}-${index}`}
                      >
                        <span className="wcs__stat-value">{stat.value}</span>
                        <span className="wcs__stat-label">{stat.label}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {caseStudy.impactNote && (
                  <p className="wcs__impact-note">
                    {caseStudy.impactNote}
                  </p>
                )}


              </div>
            </article>
          </div>
        </div>
      )}
    </section>
  );
}

export default WorkCaseStudy;
