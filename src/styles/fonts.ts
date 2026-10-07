import localFont from "next/font/local";

export const helveticaNeue = localFont({
  variable: "--font-helvetica-neue",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: [
    { path: "../fonts/helvetica-neue/HelveticaNeueRoman.woff2", weight: "400", style: "normal" },
    { path: "../fonts/helvetica-neue/HelveticaNeueMedium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/helvetica-neue/HelveticaNeueBold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/helvetica-neue/HelveticaNeueHeavy.woff2", weight: "800", style: "normal" },
    { path: "../fonts/helvetica-neue/HelveticaNeueItalic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/helvetica-neue/HelveticaNeueMediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/helvetica-neue/HelveticaNeueBoldItalic.woff2", weight: "700", style: "italic" },
  ],
});
