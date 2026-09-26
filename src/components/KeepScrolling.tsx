"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeKeepScrollingData } from "@/lib/cms";
import "./KeepScrolling.css";

const DEFAULT_LABEL = "KEEP SCROLLING";
const TEXT_REPETITIONS = 3;
const MARCH_CIRCUIT_SECONDS = 22;

const STADIUM_PATH =
  "M 550,350 A 50,50 0 0 1 650,350 L 650,450 A 50,50 0 0 1 550,450 Z";
const STADIUM_CX = 600;
const STADIUM_CY = 400;

const STADIUM_BOUNDS = {
  x: 550,
  y: 300,
  w: 100,
  h: 200,
};

const DESKTOP_ZOOM_FINAL = 7;

const PILL_W = 100;
const PILL_H = 200;
const PILL_R = 50;
const COL_STEP = 150;
const ROW_STEP = 250;
const HALF_PERIOD = ROW_STEP / 2;
const COL_COUNT = 10;
const CENTER_COL = 4;
const DRIFT = ROW_STEP;

interface GridColumn {
  col: number;
  pills: { x: number; y: number }[];
}

const GRID_COLS: GridColumn[] = [];
for (let col = 0; col < COL_COUNT; col++) {
  const x = -50 + col * COL_STEP;
  const y0 = col % 2 === 0 ? -200 : -200 + HALF_PERIOD;
  const pills: { x: number; y: number }[] = [];
  for (let row = -2; row <= 5; row++) {
    const py = y0 + row * ROW_STEP;

    const overlaps =
      x < STADIUM_BOUNDS.x + STADIUM_BOUNDS.w &&
      x + PILL_W > STADIUM_BOUNDS.x &&
      py < STADIUM_BOUNDS.y + STADIUM_BOUNDS.h &&
      py + PILL_H > STADIUM_BOUNDS.y;
    if (overlaps) continue;

    pills.push({ x, y: py });
  }
  GRID_COLS.push({ col, pills });
}

interface KeepScrollingProps {
  data?: HomeKeepScrollingData | null;
}

export function KeepScrolling({ data }: KeepScrollingProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const probeRef = useRef<SVGTextElement>(null);
  const glyphRefs = useRef<(SVGTextElement | null)[]>([]);

  const label = (data?.label ?? DEFAULT_LABEL).trim() || DEFAULT_LABEL;
  const scrollText = `${label}\u00A0•\u00A0`.repeat(TEXT_REPETITIONS);
  const scrollGlyphs = useMemo(() => Array.from(scrollText), [scrollText]);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    const probe = probeRef.current;
    if (!section || !path || !probe) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;
    const perimeter = path.getTotalLength();
    let glyphCentres: number[] = [];
    let phase = 0;
    let lastDrawnPhase = -1;
    let frameId: number | null = null;
    let previousTime = 0;
    let isInView = false;
    let layoutReady = false;
    let disposed = false;

    const LUT_SIZE = 1024;
    const lutPoints = Array.from({ length: LUT_SIZE }, (_, i) =>
      path.getPointAtLength((i / LUT_SIZE) * perimeter),
    );
    const lut = lutPoints.map((p, i) => {
      const before = lutPoints[(i - 1 + LUT_SIZE) % LUT_SIZE];
      const after = lutPoints[(i + 1) % LUT_SIZE];
      return {
        x: p.x,
        y: p.y,
        angle:
          Math.atan2(after.y - before.y, after.x - before.x) * (180 / Math.PI),
      };
    });

    const positionGlyphs = () => {
      if (!layoutReady) return;

      glyphRefs.current.forEach((glyph, index) => {
        if (!glyph) return;

        const distance = (glyphCentres[index] + phase) % perimeter;
        const sample =
          lut[Math.round((distance / perimeter) * LUT_SIZE) % LUT_SIZE];

        glyph.setAttribute(
          "transform",
          `translate(${sample.x.toFixed(3)} ${sample.y.toFixed(3)}) rotate(${sample.angle.toFixed(3)}) translate(0 -15)`,
        );
        glyph.setAttribute("opacity", "1");
      });
    };

    const stopMarch = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      previousTime = 0;
    };

    const tick = (time: number) => {
      frameId = null;
      if (disposed || reducedMotion || !isInView || !layoutReady) return;

      if (previousTime > 0) {
        const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
        phase = (phase + (perimeter * deltaSeconds) / MARCH_CIRCUIT_SECONDS) % perimeter;
        // Skip the per-glyph SVG attribute writes when the phase has moved less than
        // one pixel — every write forces a layout pass on the SVG text nodes.
        if (Math.abs(phase - lastDrawnPhase) >= 1) {
          lastDrawnPhase = phase;
          positionGlyphs();
        }
      }
      previousTime = time;
      frameId = requestAnimationFrame(tick);
    };

    const startMarch = () => {
      if (frameId !== null || !layoutReady || !isInView || reducedMotion) return;
      // On mobile, glyphs are positioned once and held — no perpetual rAF loop,
      // no setAttribute writes per frame. The pinned zoom/handoff that gave the
      // march its visual purpose is also disabled in the mobile matchMedia branch.
      if (isMobileDevice) return;
      previousTime = 0;
      frameId = requestAnimationFrame(tick);
    };

    const measureGlyphs = () => {
      if (disposed) return;

      const cumulative = [0];
      try {
        for (let index = 1; index <= scrollGlyphs.length; index += 1) {
          cumulative.push(probe.getSubStringLength(0, index));
        }
      } catch {
        cumulative.length = 1;
        for (let index = 1; index <= scrollGlyphs.length; index += 1) {
          cumulative.push(index);
        }
      }

      const naturalLength = cumulative.at(-1) ?? 0;
      if (!(naturalLength > 0)) return;

      const scale = perimeter / naturalLength;
      glyphCentres = scrollGlyphs.map(
        (_, index) => ((cumulative[index] + cumulative[index + 1]) * 0.5) * scale,
      );
      layoutReady = true;
      positionGlyphs();
      startMarch();
    };

    const fontsReady = document.fonts?.ready;
    if (fontsReady) {
      fontsReady.then(measureGlyphs, measureGlyphs);
    } else {
      measureGlyphs();
    }

    if (reducedMotion) {
      return () => {
        disposed = true;
        stopMarch();
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    const io = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView) startMarch();
        else stopMarch();
      },
      { rootMargin: "150px 0px" },
    );
    io.observe(section);

    const grid = section.querySelector("[data-ks-grid]");
    const fill = section.querySelector("[data-ks-fill]");
    const stroke = section.querySelector("[data-ks-stroke]");
    const text = section.querySelector("[data-ks-text]");
    const zoom = section.querySelector("[data-ks-zoom]");
    const whiteout = section.querySelector("[data-ks-whiteout]");
    const stage = section.querySelector("[data-ks-stage]");
    const smoke = section.querySelector("[data-ks-smoke]");

    let mm: gsap.MatchMedia | null = null;

    const ctx = gsap.context(() => {
      mm = gsap.matchMedia(section);

      const buildStage = ({
        pinEnd,
        zoomStart,
        zoomScale,
        whiteoutStart,
        whiteoutDuration,
        handoffDuration,
        driftEnd,
      }: {
        pinEnd: string;
        zoomStart: number;
        zoomScale: number;
        whiteoutStart: number;
        whiteoutDuration: number;
        handoffDuration: number;
        driftEnd: string;
      }) => {
        const setStageLayer = (raised: boolean) => {
          if (raised) section.style.setProperty("z-index", "1");
          else section.style.removeProperty("z-index");
        };

        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        const tl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: pinEnd,
            pin: true,
            pinSpacing: true,
            scrub: isMobile ? 0.2 : true,
            anticipatePin: 1,
            onEnter: () => setStageLayer(true),
            onEnterBack: () => setStageLayer(true),
            onLeave: () => setStageLayer(false),
            onLeaveBack: () => setStageLayer(false),
            onRefresh: (self) => setStageLayer(self.isActive),
          },
        });

        tl
          .to(grid, { opacity: 0, duration: 0.18, force3D: true }, 0.05)
          .to(fill, { fillOpacity: 1, duration: 0.15, force3D: true }, 0.07)
          .to(stroke, { opacity: 0, duration: 0.12, force3D: true }, 0.09)
          .to(text, { fill: "#8a8a8a", duration: 0.15, force3D: false }, 0.07)
          .to(
            zoom,
            {
              scale: zoomScale,
              svgOrigin: `${STADIUM_CX} ${STADIUM_CY}`,
              duration: 0.4,
              ease: "power2.inOut",
              force3D: true,
            },
            zoomStart,
          )
          .to(whiteout, { opacity: 1, duration: whiteoutDuration, force3D: true }, whiteoutStart)
          .to(
            stage,
            {
              yPercent: -100,
              duration: handoffDuration,
              ease: "power2.inOut",
              force3D: true,
            },
            1,
          )
          .set(smoke, { autoAlpha: 1, yPercent: 0 }, 1)
          .to(
            smoke,
            {
              autoAlpha: 0,
              yPercent: -20,
              duration: handoffDuration * 0.45,
              ease: "sine.inOut",
              force3D: true,
            },
            1 + handoffDuration * 0.55,
          );

        const drift = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: driftEnd,
            scrub: isMobile ? 0.2 : true,
          },
        });

        section.querySelectorAll<SVGGElement>("[data-ks-col]").forEach((colEl) => {
          const col = Number(colEl.dataset.ksCol);
          if (col === CENTER_COL) return;
          drift.to(colEl, { y: col % 2 === 0 ? -DRIFT : DRIFT }, 0);
        });
      };

      mm.add("(max-width: 768px)", () => {
        // No pin, no scrub, no column drift on mobile — the section just reveals
        // once when it scrolls into view, then sits. Glyphs are positioned statically
        // (the rAF march is gated by isMobileDevice in startMarch above).
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        });
        tl.from(grid, { opacity: 0, duration: 0.4, force3D: true }, 0)
          .from(
            zoom,
            {
              scale: 0.9,
              svgOrigin: `${STADIUM_CX} ${STADIUM_CY}`,
              duration: 0.6,
              ease: "power2.out",
              force3D: true,
            },
            0,
          );
      });

      mm.add("(min-width: 769px)", () => {
        buildStage({
          pinEnd: "+=348%",
          zoomStart: 0.32,
          zoomScale: DESKTOP_ZOOM_FINAL,
          whiteoutStart: 0.8,
          whiteoutDuration: 0.2,
          handoffDuration: 0.16,
          driftEnd: "+=400%",
        });
      });
    }, section);

    return () => {
      disposed = true;
      stopMarch();
      io.disconnect();
      mm?.revert();
      ctx.revert();
      section.style.removeProperty("z-index");
    };
  }, [scrollGlyphs]);

  return (
    <section ref={sectionRef} className="keep-scrolling" aria-label="Keep scrolling">
      <div className="keep-scrolling__stage" data-ks-stage>
        <svg
          className="keep-scrolling__art"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
        <g
          className="keep-scrolling__grid"
          data-ks-grid
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {GRID_COLS.map(({ col, pills }) => (
            <g key={col} data-ks-col={col}>
              {pills.map((p, i) => (
                <rect
                  key={i}
                  x={p.x}
                  y={p.y}
                  width={PILL_W}
                  height={PILL_H}
                  rx={PILL_R}
                  ry={PILL_R}
                />
              ))}
            </g>
          ))}
        </g>

        <defs>
          <path ref={pathRef} id="keep-scrolling-stadium" d={STADIUM_PATH} />
        </defs>

        <g className="keep-scrolling__zoom" data-ks-zoom>
          <use
            href="#keep-scrolling-stadium"
            className="keep-scrolling__stadium-fill"
            data-ks-fill
            stroke="none"
          />
          <use
            href="#keep-scrolling-stadium"
            className="keep-scrolling__stadium-stroke"
            data-ks-stroke
            fill="none"
          />

          <g className="keep-scrolling__text" data-ks-text>
            {scrollGlyphs.map((glyph, index) => (
              <text
                key={`${glyph}-${index}`}
                ref={(node) => {
                  glyphRefs.current[index] = node;
                }}
                className="keep-scrolling__glyph"
                textAnchor="middle"
                opacity="0"
              >
                {glyph}
              </text>
            ))}
          </g>
        </g>

        <text
          ref={probeRef}
          className="keep-scrolling__text keep-scrolling__probe"
          x="-10000"
          y="-10000"
          aria-hidden="true"
        >
          {scrollText}
        </text>
        </svg>

        <div className="keep-scrolling__whiteout" data-ks-whiteout aria-hidden="true" />
      </div>

      <div className="keep-scrolling__smoke" data-ks-smoke aria-hidden="true" />
    </section>
  );
}

export default KeepScrolling;
