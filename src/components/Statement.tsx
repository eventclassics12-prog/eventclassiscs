"use client";

import { TextReveal, TOKEN_SEPARATOR } from "@/components/TextReveal";
import type { HomeStatementData } from "@/lib/cms";
import "./Statement.css";

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

/**
 * Regroups the flat reveal stream into paragraphs, keeping each word's global
 * index so the single scroll pass lights every paragraph in reading order.
 */
function groupTokensByParagraph(tokens: string[]): RevealToken[][] {
  const groups: RevealToken[][] = [[]];
  let index = 0;

  for (const token of tokens) {
    if (token === TOKEN_SEPARATOR) {
      if (groups[groups.length - 1].length > 0) groups.push([]);
      continue;
    }
    groups[groups.length - 1].push({ text: token, index });
    index += 1;
  }

  return groups.filter((group) => group.length > 0);
}

export function Statement({
  data,
  stat = "10+",
  statCaption = "From disruptive creative businesses to consumer-first companies.",
  paragraphs = DEFAULT_PARAGRAPHS,
  bylineName = "Pamal Mondal",
  bylineRole = "Strategic Brand-Building Firm",
  bylineInitials = "P",
}: StatementProps) {
  const resolvedStat = data?.stat ?? stat;
  const resolvedStatCaption = data?.statCaption ?? statCaption;
  const resolvedParagraphs =
    data?.paragraphs && data.paragraphs.length > 0
      ? data.paragraphs.map((p) => p.text ?? "")
      : paragraphs;
  const resolvedBylineName = data?.bylineName ?? bylineName;
  const resolvedBylineRole = data?.bylineRole ?? bylineRole;
  const resolvedBylineInitials = data?.bylineInitials ?? bylineInitials;

  const revealBody = resolvedParagraphs.join("\n\n");

  return (
    <section className="statement" id="about">
      <div className="statement__inner">
        <TextReveal body={revealBody} className="statement__reveal">
          {(tokens) => (
            <div className="statement__stage">
              <div className="statement__left-column">
                <div className="statement__stat">{resolvedStat}</div>
                <p className="statement__caption">{resolvedStatCaption}</p>
              </div>

              <div className="statement__right">
                {groupTokensByParagraph(tokens).map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    className="statement__copy"
                    aria-label={paragraph.map((t) => t.text).join("").trim()}
                  >
                    {paragraph.map(({ text, index }) => (
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
                ))}
              </div>

              <div className="statement__byline">
                <div className="statement__avatar" aria-hidden="true">
                  {resolvedBylineInitials}
                </div>
                <div className="statement__byline-text">
                  <div className="statement__byline-name">{resolvedBylineName}</div>
                  <div className="statement__byline-role">{resolvedBylineRole}</div>
                </div>
              </div>
            </div>
          )}
        </TextReveal>
      </div>
    </section>
  );
}

export default Statement;
