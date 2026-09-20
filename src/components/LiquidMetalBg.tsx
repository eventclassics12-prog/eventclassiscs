"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import "./LiquidMetalBg.css";

/**
 * Hallmark · hero background using @paper-design/shaders-react's
 * LiquidMetal shader.
 *
 * Component contract:
 *   • Wraps the third-party <LiquidMetal> in a div sized to the hero
 *     section. The shader's own width/height props are inline CSS
 *     dimensions — we pass "100%" / "100%" so the canvas always fills
 *     the wrapper, and the shader manages the device-pixel-ratio
 *     internally.
 *   • Pointer events disabled so the shader never blocks hero clicks.
 *   • All shader prop values mirror the user's reference snippet
 *     verbatim — `shape="metaballs"`, the `repetition` / `softness` /
 *     dispersion / distortion / contour / angle / scale / offsetY`
 *     dials, and the white-on-white colour pair. No `image` prop is
 *     passed: the shader treats `image` as a mask that overrides
 *     `shape` when both are set, so leaving `image` out is what
 *     actually causes the metaballs preset to render.
 *
 * Performance design:
 *
 * The hero runs a continuously-rendering WebGL shader AND a scroll-
 * driven wordmark transform (HeroWordmark.tsx, force3D: true). Both
 * want GPU time every frame. The shader's fragment cost is roughly
 * proportional to the render-target pixel count, so the right lever
 * is the shader's resolution.
 *
 *   • `minPixelRatio={1}` — paper-design defaults to 2, which forces
 *     the shader to render at 2× the CSS pixels even on standard-DPI
 *     displays. Capping to 1 makes the canvas pixel-dim equal to its
 *     CSS size; the metaballs effect is soft / non-text, so the
 *     resolution loss is invisible.
 *
 *   • `maxPixelCount` — paper-design's default cap is
 *     1920 × 1080 × 4 ≈ 8.3 M pixels. We pin a CONSTANT 500 K pixel
 *     budget (~700 × 700 backing buffer) permanently — no scroll
 *     listener, no state, no toggling.
 *
 *     Earlier versions switched 1.5 M (idle) ↔ 500 K (scrolling) via
 *     React state driven by a scroll listener. Every scroll event
 *     re-rendered the component, and each flip of `maxPixelCount`
 *     made the shader reallocate its WebGL backing buffer (frequently
 *     mid-scroll) — more main-thread/GPU churn than the scroll itself,
 *     defeating the point of the cap. A constant cap removes the
 *     re-render path AND the framebuffer realloc path entirely, while
 *     keeping fragment work at the cheap per-frame level the GPU
 *     needs alongside the wordmark's force3D transform.
 *
 *   • `speed={1}` — ALWAYS 1. The animation must never pause
 *     (pausing reads as dead, per the user). The metaballs keep
 *     moving the whole time at the original speed.
 *
 * Trade-off vs the old idle cap: the metaballs render at ~700 px
 * square backing instead of ~1300 px at rest. On a soft, organic
 * noise pattern the visible delta is "slightly softer edges" — the
 * user's attention is on the wordmark and the pitch, not the
 * background.
 *
 * Why no `will-change` on the canvas: HeroWordmark's own code
 * documents why this hurts — "can force excessive layer creation
 * and eat up memory/GPU bandwidth." See LiquidMetalBg.css.
 */

const MIN_PIXEL_RATIO = 1;

/** Render-target cap, pinned constant — fragment-work budget that
 *  leaves GPU headroom for the scroll-driven wordmark. 500 K pixels
 *  ≈ 700 × 700 backing buffer. */
const MAX_PIXEL_COUNT = 500_000;

export function LiquidMetalBg() {
  return (
    <div aria-hidden="true" className="liquid-metal-bg">
      <LiquidMetal
        width="100%"
        height="100%"
        colorBack="#ffffff"
        colorTint="#ffffff"
        shape="metaballs"
        repetition={2}
        softness={0.1}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.07}
        contour={0.4}
        angle={70}
        // Always 1 — the metaballs keep moving at full speed. The
        // render target is a fixed 500 K-pixel budget (see
        // maxPixelCount doc above); the simulation clock and
        // animation never pause.
        speed={1}
        scale={1.36}
        offsetY={-0.42}
        fit="contain"
        minPixelRatio={MIN_PIXEL_RATIO}
        maxPixelCount={MAX_PIXEL_COUNT}
      />
    </div>
  );
}

export default LiquidMetalBg;
