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
const MOBILE_ZOOM_FINAL = 2.75;

const PILL_W = 100;
const PILL_H = 200;
const PILL_R = 50;
const COL_STEP = 150;
const ROW_STEP = 250;
const HALF_PERIOD = ROW_STEP / 2;
const COL_COUNT = 10;
const CENTER_COL = 4;
const DRIFT = ROW_STEP;

/**
 * The grid is cropped far tighter on a phone: with `slice` fitting a 1200x800
 * viewBox to a 390px-wide portrait viewport, the visible x-range is only about
 * 370 units wide, so the two columns flanking the centre stadium are the only
 * ones ever on screen. Drifting just those two gives mobile the same parallax
 * read as desktop without paying for nine simultaneous scrubbed tweens. They
 * are thrown in opposite directions on purpose — both columns are odd, so the
 * desktop parity rule would move them together and the counter-motion the
 * effect exists for would not be visible at all.
 */
const MOBILE_DRIFT = 140;
const MOBILE_DRIFT_COLUMNS: Record<number, number> = {
  [CENTER_COL - 1]: -MOBILE_DRIFT,
  [CENTER_COL + 1]: MOBILE_DRIFT,
};

/**
 * How far the march phase must travel before glyphs are repositioned.
 *
 * At 22s per circuit the phase moves ~0.39 units per frame at 60fps, so a 1
 * unit threshold redrew only ~23 times a second — every letter jumped 1.25 CSS
 * px in discrete steps and the ring visibly staircased. 0.2 redraws on every
 * frame instead. A redraw is ~51 attribute writes, measured at ~2.5ms including
 * the forced layout even under 4x CPU throttle, so per-frame is affordable.
 */
const REDRAW_STEP = 0.2;

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
    const perimeter = path.getTotalLength();
    const unitsPerSecond = perimeter / MARCH_CIRCUIT_SECONDS;
    let glyphCentres: number[] = [];

    // The phase is a distance travelled along the path, kept unwrapped and
    // monotonic, and measured against wall-clock time rather than by summing
    // frame deltas. Accumulating deltas behind a `Math.min(dt, 0.05)` clamp
    // meant every frame longer than 50ms permanently cost the march part of its
    // circuit: the text silently fell into slow motion and never caught up,
    // which is the lag people were seeing. Elapsed time is now absolute, so a
    // dropped frame costs one correct larger step instead of permanent drift.
    let phase = 0;
    let segmentStart = 0;
    let running = false;
    let lastDrawnPhase = -1;
    let tickerHandle: (() => void) | null = null;
    let isInView = false;
    let layoutReady = false;
    let disposed = false;

    // The march covers ~23.4 units per second, which is ~0.39 units per frame
    // at 60fps. The lookup table has to resolve finer than that or consecutive
    // frames land in the same bucket and the ring freezes in visible steps: at
    // 1024 samples over a 514-unit path each bucket is 0.50 units wide, so
    // roughly a fifth of all frames produced no movement at all. 8192 puts each
    // bucket at 0.06 units, comfortably below the per-frame step.
    const LUT_SIZE = 8192;
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

      const distance = phase % perimeter;
      const wrapGuard = phase < lastDrawnPhase ? perimeter : 0;

      glyphRefs.current.forEach((glyph, index) => {
        if (!glyph) return;

        const travelled = (glyphCentres[index] + distance + wrapGuard) % perimeter;
        const sample =
          lut[Math.round((travelled / perimeter) * LUT_SIZE) % LUT_SIZE];

        glyph.setAttribute(
          "transform",
          `translate(${sample.x.toFixed(3)} ${sample.y.toFixed(3)}) rotate(${sample.angle.toFixed(3)}) translate(0 -15)`,
        );
      });
    };

    /** Opacity is constant for the life of the glyph, so it is set once here
     *  rather than rewritten for all ~54 glyphs on every redraw. */
    const revealGlyphs = () => {
      glyphRefs.current.forEach((glyph) => {
        glyph?.setAttribute("opacity", "1");
      });
    };

    /**
     * Advances the phase by the time elapsed since the last call and rebases
     * the clock. Rebasing is what keeps this correct: reading elapsed time
     * since the start of the run and adding it to an already-advanced phase
     * double-counts the same interval on every frame, which makes the march
     * accelerate without bound instead of moving at a constant speed.
     */
    const advance = () => {
      if (!running) return phase;
      const now = performance.now();
      phase += ((now - segmentStart) / 1000) * unitsPerSecond;
      segmentStart = now;
      return phase;
    };

    const stopMarch = () => {
      if (!running) return;
      advance();
      running = false;
      if (tickerHandle) gsap.ticker.remove(tickerHandle);
      tickerHandle = null;
    };

    const tick = () => {
      if (disposed || reducedMotion || !isInView || !layoutReady) return;

      const next = advance();
      // Phase only ever moves forward, so a plain subtraction is wrap-safe.
      if (Math.abs(next - lastDrawnPhase) >= REDRAW_STEP) {
        lastDrawnPhase = next;
        positionGlyphs();
      }
    };

    const startMarch = () => {
      if (running || !layoutReady || !isInView || reducedMotion) return;
      segmentStart = performance.now();
      running = true;
      // Driven from GSAP's ticker rather than a private requestAnimationFrame
      // so the march lands in the same frame as the ScrollTrigger-driven zoom
      // and Lenis. On a private rAF the two can land in adjacent frames, which
      // shows up as the text trailing the stadium by a frame.
      tickerHandle = tick;
      gsap.ticker.add(tick);
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
      revealGlyphs();
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
          );

        // Smoke handoff: desktop only. On mobile, the CSS already disables
        // backdrop-filter and paints a transparent background on .keep-scrolling__smoke,
        // so animating its autoAlpha writes nothing visible while still costing
        // a few style mutations per frame.
        if (!isMobile) {
          tl
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
        }

        // Column drift. Desktop animates all nine off-centre columns; mobile
        // animates only the two flanking the centre stadium (see
        // MOBILE_DRIFT_COLUMNS) over a shorter throw, which keeps the parallax
        // read without the scrub cost of nine simultaneous tweens.
        const drift = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: driftEnd,
            scrub: isMobile ? 0.25 : true,
          },
        });

        section.querySelectorAll<SVGGElement>("[data-ks-col]").forEach((colEl) => {
          const col = Number(colEl.dataset.ksCol);
          if (col === CENTER_COL) return;

          if (isMobile) {
            const throwDistance = MOBILE_DRIFT_COLUMNS[col];
            if (throwDistance === undefined) return;
            drift.to(colEl, { y: throwDistance }, 0);
            return;
          }

          drift.to(colEl, { y: col % 2 === 0 ? -DRIFT : DRIFT }, 0);
        });
      };

      mm.add("(max-width: 768px)", () => {
        // Pinned timeline on mobile, tuned for a shorter scroll: less pin
        // distance than desktop and a smaller zoom target. The smoke handoff is
        // skipped inside buildStage via the isMobile guard — a backdrop-filter
        // blur forces a full-viewport recomposite every frame, which is the one
        // effect genuinely not worth paying for on a phone.
        buildStage({
          pinEnd: "+=180%",
          zoomStart: 0.4,
          zoomScale: MOBILE_ZOOM_FINAL,
          whiteoutStart: 0.85,
          whiteoutDuration: 0.16,
          handoffDuration: 0.22,
          driftEnd: "+=220%",
        });
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
      // Run before stopMarch so the final phase is committed into the DOM
      // rather than discarded with the ticker handle.
      positionGlyphs();
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
