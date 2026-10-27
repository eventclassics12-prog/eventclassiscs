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
  bylineName?: string;
  bylineRole?: string;
  bylineInitials?: string;
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
                    <span className="statement__progress-label">
                      01 / MANIFESTO
                    </span>
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

                  <div
                    className="statement__infographic"
                    aria-label="Signal alignment infographic: bridging built product value and market perception"
                  >
                    <div className="statement__infographic-head">
                      <span className="statement__infographic-title">
                        SIGNAL ALIGNMENT
                      </span>
                      <span className="statement__infographic-badge">
                        LIVE TELEMETRY
                      </span>
                    </div>

                    <div className="statement__infographic-canvas" aria-hidden="true">
                      <svg
                        viewBox="0 0 280 156"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="statement__infographic-svg"
                      >
                        <defs>
                          <linearGradient
                            id="stmt-wave-grad"
                            x1="0"
                            y1="0"
                            x2="280"
                            y2="0"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                          </linearGradient>
                          <radialGradient
                            id="stmt-node-glow"
                            cx="50%"
                            cy="50%"
                            r="50%"
                          >
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Subtle coordinate grid */}
                        <line
                          x1="16"
                          y1="34"
                          x2="264"
                          y2="34"
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeDasharray="2 4"
                        />
                        <line
                          x1="16"
                          y1="78"
                          x2="264"
                          y2="78"
                          stroke="currentColor"
                          strokeOpacity="0.14"
                        />
                        <line
                          x1="16"
                          y1="122"
                          x2="264"
                          y2="122"
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeDasharray="2 4"
                        />

                        {/* Orbiting rings around center convergence node */}
                        <circle
                          cx="140"
                          cy="78"
                          r="44"
                          stroke="currentColor"
                          strokeOpacity="0.14"
                          strokeDasharray="4 6"
                          className="statement__orbit statement__orbit--outer"
                        />
                        <circle
                          cx="140"
                          cy="78"
                          r="28"
                          stroke="currentColor"
                          strokeOpacity="0.24"
                          strokeDasharray="18 8"
                          className="statement__orbit statement__orbit--inner"
                        />
                        <circle
                          cx="140"
                          cy="78"
                          r="36"
                          fill="url(#stmt-node-glow)"
                          className="statement__pulse-glow"
                        />

                        {/* Divergent perception curve (dashed) */}
                        <path
                          d="M16 112 C 62 118, 92 42, 140 78 C 188 114, 218 44, 264 48"
                          stroke="currentColor"
                          strokeOpacity="0.32"
                          strokeWidth="1.25"
                          strokeDasharray="3 4"
                          className="statement__curve-secondary"
                        />

                        {/* Primary brand-signal alignment wave */}
                        <path
                          d="M16 96 C 58 28, 98 128, 140 78 C 182 28, 222 118, 264 56"
                          stroke="url(#stmt-wave-grad)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          className="statement__curve-primary"
                        />

                        {/* Keyframe nodes */}
                        <circle
                          cx="58"
                          cy="63"
                          r="3"
                          fill="#ffffff"
                          fillOpacity="0.55"
                        />
                        <circle
                          cx="140"
                          cy="78"
                          r="5"
                          fill="#ffffff"
                          className="statement__node-center"
                        />
                        <circle
                          cx="222"
                          cy="86"
                          r="3"
                          fill="#ffffff"
                          fillOpacity="0.55"
                        />
                      </svg>
                    </div>

                    <div className="statement__infographic-metrics">
                      <div className="statement__infographic-metric">
                        <span className="statement__infographic-key">
                          REALITY
                        </span>
                        <span className="statement__infographic-val">
                          PRODUCT PROOF
                        </span>
                      </div>
                      <span
                        className="statement__infographic-arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>
                      <div className="statement__infographic-metric statement__infographic-metric--end">
                        <span className="statement__infographic-key">
                          PERCEPTION
                        </span>
                        <span className="statement__infographic-val">
                          MARKET CLARITY
                        </span>
                      </div>
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
                        <span
                          className="statement__row-index"
                          aria-hidden="true"
                        >
                          {String(paragraphIndex + 1).padStart(2, "0")}
                        </span>

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
