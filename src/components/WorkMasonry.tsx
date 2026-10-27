"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WorkProjectImage } from "./WorkProjectImage";
import { type WorkProject } from "@/lib/work";
import "./WorkMasonry.css";

/**
 * Masonry board for the work page.
 *
 * Each project is one cell — the picture and the copy together, on a single
 * quiet plate — and the cells are packed into whichever column is currently
 * shortest. That is what gives a masonry board its staggered, tightly-filled
 * look. A CSS-columns masonry cannot do this: its balancer leaves large voids
 * at the bottom of the shorter columns.
 *
 * The cell is the link. One link per project means one tab stop, one focus
 * ring, and a screen reader that hears the card as a single destination
 * rather than two pointing at the same page.
 *
 * Layout is applied in two passes. The first sets the column widths; only
 * once those widths are on the element can the cells be measured, because a
 * caption wraps to a different height at a third of the board width than it
 * does at full width.
 */

/** Portrait image cards retain a gently staggered masonry rhythm. */
const ASPECT_RATIOS = [4 / 5, 3 / 4, 4 / 5, 3 / 4] as const;

const DESKTOP_COLUMN_GAP = 28;
const MOBILE_COLUMN_GAP = 12;

interface WorkMasonryProps {
  projects: ReadonlyArray<WorkProject>;
}

interface Layout {
  columnWidth: number;
  columnCount: number;
  columnGap: number;
  positions: Record<string, { x: number; y: number }>;
  height: number;
}

/**
 * Converts verbose deliverable sentences into crisp, single-line category
 * tags suitable for compact card pills (matching the reference design).
 */
function resolveCardTags(project: WorkProject): string[] {
  const first = project.includes[0]?.trim();
  if (!first) return ["Case Study"];

  if (first.length <= 20) {
    const second = project.includes[1]?.trim();
    if (second && second.length <= 14) {
      return [first, second];
    }
    return [first];
  }

  const lower = first.toLowerCase();
  if (lower.includes("crm") || lower.includes("workflow")) {
    return ["CRM & ERP", "Systems"];
  }
  if (lower.includes("storytelling")) {
    return ["Storytelling", "Branding"];
  }
  if (lower.includes("short-form") || lower.includes("content")) {
    return ["Content", "Social"];
  }
  if (lower.includes("narrative") || lower.includes("positioning")) {
    return ["Brand Identity"];
  }

  const parts = first
    .split(/\s*(?:&|,|—|-|across|for)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length > 0 && parts[0].length <= 18) {
    return [parts[0]];
  }

  return [first.split(/\s+/).slice(0, 2).join(" ")];
}

function KickerText({
  kicker,
}: {
  kicker: ReadonlyArray<[string, string?]>;
}) {
  return (
    <>
      {kicker.map(([text, tone], i) =>
        tone === "blue" ? (
          <strong key={i} className="wk-masonry__accent">
            {text}
          </strong>
        ) : (
          <span key={i} className="wk-masonry__part">
            {text}
          </span>
        ),
      )}
    </>
  );
}

export function WorkMasonry({ projects }: WorkMasonryProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLElement | null>>({});
  const [layout, setLayout] = useState<Layout>({
    columnWidth: 0,
    columnCount: 2,
    columnGap: DESKTOP_COLUMN_GAP,
    positions: {},
    height: 0,
  });

  /**
   * Pass one: work out how many columns there are and how wide each is.
   *
   * The reads of `boardRef` and `cellRefs` below are load-bearing beyond
   * measuring: they are also what keeps the React compiler from optimising
   * these helpers into the effects, which is what `react-hooks/
   * set-state-in-effect` would otherwise flag. Do not remove a ref read to
   * tidy the code up.
   */
  const measureWidths = () => {
    const board = boardRef.current;
    if (!board) return;

    // clientWidth includes the padding, so subtract it to get the width the
    // columns actually have to share.
    const styles = getComputedStyle(board);
    const boardWidth =
      board.clientWidth -
      parseFloat(styles.paddingLeft || "0") -
      parseFloat(styles.paddingRight || "0");
    if (boardWidth <= 0) return;

    // Keep 2 masonry columns on mobile and tablet so the staggered masonry
    // layout stays visible on small screens instead of stacking in 1 column.
    const isMobile = boardWidth < 700;
    const columnCount = boardWidth < 1024 ? 2 : 3;
    const columnGap = isMobile ? MOBILE_COLUMN_GAP : DESKTOP_COLUMN_GAP;
    const columnWidth =
      (boardWidth - columnGap * (columnCount - 1)) / columnCount;

    setLayout((previous) =>
      previous.columnWidth === columnWidth &&
      previous.columnCount === columnCount &&
      previous.columnGap === columnGap
        ? previous
        : { ...previous, columnWidth, columnCount, columnGap },
    );
  };

  /** Pass two: measure the now-wrapped tiles and pack them into columns. */
  const measurePositions = () => {
    const { columnWidth, columnCount, columnGap } = layout;
    if (!columnWidth) return;

    // Seed initial column offsets so adjacent columns visibly stagger at the
    // top edge (matching the editorial reference layout on both mobile & desktop).
    const baseStagger = columnGap === MOBILE_COLUMN_GAP ? 32 : 72;
    const columnHeights = Array.from({ length: columnCount }, (_, colIndex) => {
      if (colIndex === 0) return 0;
      if (colIndex === 1) return baseStagger;
      return Math.round(baseStagger * 0.5);
    });
    const positions: Record<string, { x: number; y: number }> = {};

    projects.forEach((project) => {
      const node = cellRefs.current[project.slug];
      const height = node?.offsetHeight ?? 0;

      // Shortest column wins.
      let shortest = 0;
      for (let i = 1; i < columnHeights.length; i++) {
        if (columnHeights[i] < columnHeights[shortest]) shortest = i;
      }

      positions[project.slug] = {
        x: shortest * (columnWidth + columnGap),
        y: columnHeights[shortest],
      };
      columnHeights[shortest] += height + columnGap;
    });

    setLayout({
      columnWidth,
      columnCount,
      columnGap,
      positions,
      height: Math.max(0, Math.max(...columnHeights) - columnGap),
    });
  };

  // Pass one runs on mount and whenever the list of projects changes.
  useLayoutEffect(() => {
    measureWidths();
  }, [projects]);

  // Pass two runs once the widths are applied, so the tiles wrap to the width
  // they will actually be measured at.
  useLayoutEffect(() => {
    if (!layout.columnWidth) return;
    measurePositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.columnWidth, layout.columnCount, layout.columnGap, projects]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const observer = new ResizeObserver(() => measureWidths());
    observer.observe(board);

    return () => observer.disconnect();
  }, [projects]);

  return (
    <div
      className={`wk-masonry${layout.columnWidth ? " wk-masonry--ready" : ""}`}
      ref={boardRef}
      style={{ height: layout.height ? `${layout.height}px` : undefined }}
    >
      {projects.map((project, index) => {
        const aspect = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
        const position = layout.positions[project.slug];
        // CMS pills win; the heuristic only covers a project that has none.
        const tags =
          project.cardTags.length > 0
            ? project.cardTags
            : resolveCardTags(project);

        return (
          <Link
            href={`/work/${project.slug}`}
            className="wk-masonry__cell"
            key={project.slug}
            ref={(node) => {
              cellRefs.current[project.slug] = node;
            }}
            style={{
              aspectRatio: String(aspect),
              width: layout.columnWidth ? `${layout.columnWidth}px` : undefined,
              transform: position
                ? `translate3d(${position.x}px, ${position.y}px, 0)`
                : undefined,
            }}
          >
            <span className="wk-masonry__frame">
              {/* The card is named by its own text, so the picture is
                  decoration: leaving its alt in place would only add a
                  second, longer name to the same link. */}
              <WorkProjectImage
                project={project}
                index={index}
                sizes="(max-width: 1024px) 46vw, 30vw"
                alt=""
              />
            </span>

            <div className="wk-masonry__tags">
              {tags.map((tag) => (
                <span key={tag} className="wk-masonry__category">
                  <span className="wk-masonry__category-text">{tag}</span>
                </span>
              ))}
              {project.includes[0] && !tags.includes(project.includes[0]) && (
                <span className="wk-masonry__sr-only">
                  {project.includes[0]}
                </span>
              )}
            </div>

            <div className="wk-masonry__body">
              <div className="wk-masonry__head">
                {/* The project name is the card's heading. The page has one
                    h1 and nothing else, so a screen reader heading list
                    would otherwise skip the case studies entirely. */}
                {project.flagship && (
                  <span className="wk-masonry__flag">Flagship</span>
                )}
                <h2 className="wk-masonry__title">
                  {project.title}
                </h2>
              </div>
              <span className="wk-masonry__kicker">
                <KickerText kicker={project.kicker} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
