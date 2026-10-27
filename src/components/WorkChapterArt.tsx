"use client";

import { useRef, useState } from "react";
import {
  Lottie,
  LottieInteractions,
  lottieInView,
  type LottieHandle,
} from "lottie-react";
import { pad2 } from "@/lib/utils";

// Frame the visible artwork rather than the differently padded source canvases.
// Square view boxes retain each animation's proportions and leave motion room.
const ART_VIEW_BOX: Record<string, string> = {
  idea: "346 44 390 390",
  execution: "41 62 500 500",
  challenges: "-116 -243 2180 2180",
  impact: "0 0 400 400",
};

interface WorkChapterArtProps {
  name: string;
  index: number;
}

export default function WorkChapterArt({ name, index }: WorkChapterArtProps) {
  const animation = useRef<LottieHandle>(null);
  const [reduced] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // A still from these build-up animations can land mid-draw, so readers who
  // asked for less motion get a chapter number instead, never an empty frame.
  if (reduced) {
    return (
      <span className="wcs__chapter-art" aria-hidden="true">
        <span className="wcs__chapter-fallback">{pad2(index + 1)}</span>
      </span>
    );
  }

  return (
    <span className="wcs__chapter-art" aria-hidden="true">
      <LottieInteractions interactions={[lottieInView()]}>
        <Lottie
          src={`/lottie/case-studies/${name}.json`}
          lottieRef={animation}
          rendererSettings={{ viewBoxSize: ART_VIEW_BOX[name] }}
          autoplay={false}
          loop
          className="wcs__chapter-animation"
        />
      </LottieInteractions>
    </span>
  );
}
