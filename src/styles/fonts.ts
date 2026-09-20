import localFont from "next/font/local";
import { Bricolage_Grotesque } from "next/font/google";

/**
 * Font definitions — single source of truth for every text face used in the
 * app. Consumed by `src/app/layout.tsx` which attaches the generated CSS
 * variable className to <html>; downstream CSS reads `--font-helvetica-neue`,
 * `--font-bricolage`, etc. through the tokens in `src/app/globals.css`.
 *
 * We keep this file separate from layout.tsx (the Next.js docs call this the
 * "font definitions file" pattern) so the long `src` arrays don't bloat the
 * layout module and any new face can be added in one place without touching
 * the layout.
 *
 * Weight/style mapping for Helvetica Neue follows Linotype's standard ladder.
 * Helvetica Neue does not ship 550 / 600 — CSS rules that request 560 will
 * resolve to 500, 600 to 700, via the browser's nearest-weight fallback.
 */

/* Primary type — Helvetica Neue, all 8 weights × 2 styles (Roman + Italic).
 *
 * `display: swap` keeps the text visible while the .otf files decode —
 * prevents a flash of invisible text on first paint.
 *
 * `adjustFontFallback: false` skips Next.js's automatic size-adjust fallback
 * computation — Helvetica Neue is the real font, we don't want Next.js to
 * measure against a substitute. The visual fallback chain in globals.css
 * (`var(--font-helvetica-neue), system-ui, sans-serif`) handles the rare
 * missing-glyph case at the CSS layer instead. */
const helveticaNeue = localFont({
  variable: "--font-helvetica-neue",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  src: [
    { path: "./../fonts/helvetica-neue/HelveticaNeueUltraLight.otf",       weight: "100", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueUltraLightItalic.otf", weight: "100", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueThin.otf",             weight: "200", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueThinItalic.otf",       weight: "200", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueLight.otf",            weight: "300", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueLightItalic.otf",      weight: "300", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueRoman.otf",            weight: "400", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueItalic.ttf",           weight: "400", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueMedium.otf",           weight: "500", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueMediumItalic.otf",     weight: "500", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueBold.otf",             weight: "700", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueBoldItalic.otf",       weight: "700", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueHeavy.otf",            weight: "800", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueHeavyItalic.otf",      weight: "800", style: "italic" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueBlack.otf",            weight: "900", style: "normal" },
    { path: "./../fonts/helvetica-neue/HelveticaNeueBlackItalic.otf",      weight: "900", style: "italic" },
  ],
});

/* Wordmark display face — "eventclassics" reads in Bricolage Grotesque
 * at 800 (hero wordmark + sticky header state share the same element).
 *
 * Kept on `next/font/google` so it stays self-hosted by Next.js with no
 * binary files in the repo. Helvetica Neue handles every other text face
 * — the wordmark is the only display face in the system. */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: "variable",
  axes: ["opsz", "wdth"],
  subsets: ["latin"],
});

export { helveticaNeue, bricolage };
