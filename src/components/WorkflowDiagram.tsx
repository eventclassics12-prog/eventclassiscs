"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import { pad2 } from "@/lib/utils";
import "./WorkflowDiagram.css";

interface WorkflowDiagramItem {
  title: string;
  note?: string;
}

interface WorkflowDiagramProps {
  caption?: string;
  rootEyebrow: string;
  rootTitle: string;
  rootNote?: string;
  triggerLabel?: string;
  itemsLabel: string;
  items: ReadonlyArray<WorkflowDiagramItem>;
}

interface Wire {
  index: number;
  d: string;
}

type Focus = number | "all" | null;

/* A four-point spark, drawn rather than lettered so it stays crisp at 13px. */
function SparkGlyph() {
  return (
    <svg
      viewBox="0 0 15 14"
      width="13"
      height="13"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.5 1 8.66 5.62l4.34 1.2-4.34 1.2L7.5 13 6.34 8.02l-4.34-1.2 4.34-1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* The tiny node mark every discipline card carries. */
function NodeGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="11"
      height="11"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3h6v6H3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.38"
      />
      <circle cx="3" cy="3" r="1.35" fill="currentColor" />
      <circle cx="9" cy="3" r="1.35" fill="currentColor" />
      <circle cx="3" cy="9" r="1.35" fill="currentColor" />
      <circle cx="9" cy="9" r="1.35" fill="currentColor" />
    </svg>
  );
}

/**
 * The project's "connected approach" figure.
 *
 * Nodes are plain HTML so their type stays sharp and responsive; the wires are
 * measured off the laid-out port positions and drawn into an SVG overlay, so
 * they meet each dot exactly at every breakpoint.
 */
export function WorkflowDiagram({
  caption,
  rootEyebrow,
  rootTitle,
  rootNote,
  triggerLabel = "Brief",
  itemsLabel,
  items,
}: WorkflowDiagramProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLSpanElement>(null);
  const handleRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [wires, setWires] = useState<Wire[]>([]);
  const [focus, setFocus] = useState<Focus>(null);

  const count = items.length;

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const output = outputRef.current;
    if (!stage || !output) return;

    const stageRect = stage.getBoundingClientRect();
    const outputRect = output.getBoundingClientRect();
    const originX = outputRect.left - stageRect.left + outputRect.width / 2;
    const originY = outputRect.top - stageRect.top + outputRect.height / 2;

    const next: Wire[] = [];

    handleRefs.current.slice(0, count).forEach((handle, index) => {
      if (!handle) return;
      const rect = handle.getBoundingClientRect();
      const targetX = rect.left - stageRect.left + rect.width / 2;
      const targetY = rect.top - stageRect.top + rect.height / 2;

      const deltaX = targetX - originX;
      const deltaY = targetY - originY;
      if (deltaY <= 0) return;

      const direction = deltaX < 0 ? -1 : 1;
      /* Start each wire a touch off-centre inside the port, so the four
         lines read as a fan rather than one thick stem. */
      const rank = Math.floor(index / 2);
      const startX = originX + direction * (rank === 0 ? 3.2 : 1);

      next.push({
        index,
        d: `M${startX},${originY} L${targetX},${targetY}`,
      });
    });

    setWires(next);
  }, [count]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const run = () => measure();
    run();

    const observer = new ResizeObserver(run);
    observer.observe(stage);
    if (rootRef.current) observer.observe(rootRef.current);
    const grid = stage.querySelector(".wfd__grid");
    if (grid) observer.observe(grid);

    const frame = requestAnimationFrame(run);
    let live = true;
    document.fonts?.ready
      .then(() => {
        if (live) run();
      })
      .catch(() => {});

    return () => {
      live = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  return (
    <figure className="wfd">
      {caption ? (
        <figcaption className="wfd__bar">
          <span className="wfd__caption">{caption}</span>
        </figcaption>
      ) : null}

      <div className="wfd__stage" ref={stageRef}>
        <svg className="wfd__wires" aria-hidden="true" focusable="false">
          {wires.map((wire) => (
            <path
              key={wire.index}
              className="wfd__wire"
              d={wire.d}
              data-lit={
                focus === "all" || focus === wire.index ? "true" : undefined
              }
            />
          ))}
        </svg>

        <div className="wfd__trigger">
          <span className="wfd__trigger-icon" aria-hidden="true">
            <PenLine size={12} strokeWidth={1.7} />
          </span>
          <span className="wfd__trigger-label">{triggerLabel}</span>
          <span className="wfd__trigger-tag" aria-hidden="true">
            Trigger
          </span>
        </div>

        <div className="wfd__stem" aria-hidden="true" />

        <div
          className="wfd__root"
          ref={rootRef}
          data-lit={focus === "all" ? "true" : undefined}
          onMouseEnter={() => setFocus("all")}
          onMouseLeave={() => setFocus(null)}
        >
          <div className="wfd__root-head">
            <span className="wfd__root-icon" aria-hidden="true">
              <SparkGlyph />
            </span>
            <span className="wfd__root-eyebrow">
              <span className="wfd__root-dot" aria-hidden="true" />
              {rootEyebrow}
            </span>
          </div>
          <p className="wfd__root-title">{rootTitle}</p>
          {rootNote ? <p className="wfd__root-note">{rootNote}</p> : null}
          <span
            className="wfd__port wfd__port--top"
            aria-hidden="true"
          />
          <span
            className="wfd__port wfd__port--bottom"
            ref={outputRef}
            aria-hidden="true"
          />
        </div>

        <ul
          className="wfd__grid"
          aria-label={itemsLabel}
          onMouseLeave={() => setFocus(null)}
        >
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="wfd__card"
              data-lit={focus === index ? "true" : undefined}
              onMouseEnter={() => setFocus(index)}
            >
              <div className="wfd__card-head">
                <span className="wfd__card-icon" aria-hidden="true">
                  <NodeGlyph />
                </span>
                <span className="wfd__card-index" aria-hidden="true">
                  {pad2(index + 1)}
                </span>
              </div>
              <p className="wfd__card-title">{item.title}</p>
              {item.note ? <p className="wfd__card-note">{item.note}</p> : null}
              <span
                className={`wfd__port wfd__port--${
                  index % 2 === 0 ? "right" : "left"
                }`}
                ref={(node) => {
                  handleRefs.current[index] = node;
                }}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
