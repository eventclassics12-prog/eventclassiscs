"use client";

import { useRef, useState } from "react";

import {
  Lottie,
  LottieInteractions,
  lottieInView,
  type LottieHandle,
} from "lottie-react";
import "./StatementArt.css";

/** The frame the illustration holds when motion is reduced. */
const RESTING_FRAME = 120;

/**
 * The social media illustration that sits above the stat.
 *
 * The animation is nine seconds long and loops cleanly, so it plays on a
 * timer rather than being scrubbed by the scroll: it is an illustration, not a
 * diagram of the page, and tying it to the scroll would make it stop and
 * start while the reader is only trying to read the caption.
 *
 * It is decorative, so it is hidden from assistive technology, it pauses
 * whenever it leaves the viewport, and it holds a single still frame when the
 * reader has asked for less motion.
 */
export function StatementArt() {
  const lottieRef = useRef<LottieHandle>(null);

  // The component is loaded on the client only, so the media query can be
  // read while rendering rather than from an effect.
  const [isReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Set once the engine has drawn the artwork, so the print fades up rather
  // than snapping into place over the stat.
  const [isReady, setIsReady] = useState(false);

  return (
    <div
      className={`statement__art ${isReady ? "statement__art--ready" : ""}`}
      aria-hidden="true"
    >
      <LottieInteractions
        interactions={isReduced ? [] : [lottieInView()]}
      >
        <Lottie
          src="/lottie/social-media-marketing.json"
          // Center the visible print, whose canvas has extra space on the right.
          rendererSettings={{ viewBoxSize: "-104.117 5.494 768 906" }}
          lottieRef={lottieRef}
          className="statement__art__animation"
          autoplay={false}
          loop
          subscriptions={{
            ready: () => {
              if (isReduced) lottieRef.current?.scrubTo(RESTING_FRAME);
              setIsReady(true);
            },
          }}
        />
      </LottieInteractions>
    </div>
  );
}

export default StatementArt;
