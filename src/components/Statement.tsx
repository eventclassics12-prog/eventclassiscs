"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { TextReveal, TOKEN_SEPARATOR } from "@/components/TextReveal";
import type { HomeStatementData } from "@/lib/cms";
import "./Statement.css";

const StatementArt = dynamic(() => import("./StatementArt"), { ssr: false });

interface StatementProps {
  data?: HomeStatementData | null;
  stat?: string;
  statCaption?: string;
  paragraphs?: ReadonlyArray<string>;
}

const DEFAULT_PARAGRAPHS: ReadonlyArray<string> = [
  "Great founders don't usually have an ambition problem.",
  "They have the product. They have the people. They have the proof.",
  "But somewhere between what they've built and what the market sees, something gets lost.",
  "The story gets lost. The positioning gets crowded. The brand starts looking smaller than the business behind it.",
  "Most agencies fix the surface.",
  "Between what you've built and what the market thinks you've built.",
];

interface RevealToken {
  text: string;
  index: number;
}

interface ParagraphGroup {
  tokens: RevealToken[];
  startIndex: number;
  endIndex: number;
}

/**
 * Regroups the flat reveal stream into paragraphs, keeping each word's global
 * index and paragraph bounds so the single scroll pass lights both words and
 * paragraph markers in reading order.
 */
function groupTokensByParagraph(tokens: string[]): ParagraphGroup[] {
  const rawGroups: RevealToken[][] = [[]];
  let index = 0;

  for (const token of tokens) {
    if (token === TOKEN_SEPARATOR) {
      if (rawGroups[rawGroups.length - 1].length > 0) rawGroups.push([]);
      continue;
    }
    rawGroups[rawGroups.length - 1].push({ text: token, index });
    index += 1;
  }

  return rawGroups
    .filter((group) => group.length > 0)
    .map((group) => ({
      tokens: group,
      startIndex: group[0].index,
      endIndex: group[group.length - 1].index,
    }));
}

export function Statement({
  data,
  stat = "10+",
  statCaption = "From disruptive creative businesses to consumer-first companies.",
  paragraphs = DEFAULT_PARAGRAPHS,
}: StatementProps) {
  const resolvedStat = data?.stat ?? stat;
  const resolvedStatCaption = data?.statCaption ?? statCaption;
  const resolvedParagraphs =
    data?.paragraphs != null
      ? data.paragraphs.map((p) => p.text ?? "")
      : paragraphs;

  const revealBody = resolvedParagraphs.join("\n\n");

  return (
    <section className="statement" id="about">
      <div className="statement__ambient" aria-hidden="true" />

      <div className="statement__inner">
        <TextReveal body={revealBody} className="statement__reveal">
          {(tokens) => {
            const groups = groupTokensByParagraph(tokens);
            const totalGroups = groups.length;

            return (
              <div className="statement__stage">
                <header className="statement__topbar">
                  <div className="statement__eyebrow">
                    <span className="statement__dot" aria-hidden="true" />
                    <span className="statement__eyebrow-text">
                      The Diagnosis
                    </span>
                  </div>

                  <div className="statement__progress-wrap" aria-hidden="true">
                    <div className="statement__progress-track">
                      <div className="statement__progress-fill" />
                    </div>
                  </div>
                </header>

                <aside className="statement__left-column">
                  <div className="statement__stat-card">
                    <div className="statement__art-slot">
                      <StatementArt />
                    </div>
                    <div className="statement__stat-copy">
                      <span className="statement__stat-tag">PROVEN IMPACT</span>
                      <div className="statement__stat">{resolvedStat}</div>
                      <p className="statement__caption">{resolvedStatCaption}</p>
                    </div>
                  </div>

                </aside>

                <div className="statement__right">
                  {groups.map((group, paragraphIndex) => {
                    const isClimax =
                      totalGroups >= 2 && paragraphIndex >= totalGroups - 2;
                    const isFinal = paragraphIndex === totalGroups - 1;
                    const midIndex =
                      (group.startIndex + group.endIndex) / 2;

                    return (
                      <div
                        key={paragraphIndex}
                        className={`statement__row ${
                          isClimax ? "statement__row--climax" : ""
                        } ${isFinal ? "statement__row--final" : ""}`}
                        style={
                          {
                            "--row-mid": midIndex,
                            "--row-start": group.startIndex,
                          } as CSSProperties
                        }
                      >

                        <p
                          className={`statement__copy ${
                            isClimax ? "statement__copy--climax" : ""
                          } ${isFinal ? "statement__copy--final" : ""}`}
                          aria-label={group.tokens
                            .map((t) => t.text)
                            .join("")
                            .trim()}
                        >
                          {group.tokens.map(({ text, index }) => (
                            <TextReveal.Token
                              key={index}
                              index={index}
                              className="statement__token"
                              aria-hidden="true"
                            >
                              {text}
                            </TextReveal.Token>
                          ))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }}
        </TextReveal>
      </div>
    </section>
  );
}

export default Statement;
