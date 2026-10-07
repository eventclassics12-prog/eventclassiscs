"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((module) => module.LiquidMetal),
  { ssr: false },
);
import "./LiquidMetalBg.css";

const MOBILE_BREAKPOINT = "(max-width: 768px)";

// Tuned per breakpoint. Mobile gets a smaller backing buffer, lower DPR,
// slower animation, and less shader detail — enough headroom that the
// compositor and ScrollTrigger tweens still have GPU bandwidth.
const SHADER_PARAMS = {
  desktop: {
    speed: 1,
    repetition: 2,
    maxPixelCount: 1_500_000,
    minPixelRatio: 1,
  },
  mobile: {
    speed: 0.4,
    repetition: 1,
    maxPixelCount: 600_000,
    minPixelRatio: 0.6,
  },
} as const;

export function LiquidMetalBg() {
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const start = () => { timer = setTimeout(() => setReady(true), 300); };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => { clearTimeout(timer); window.removeEventListener("load", start); };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const params = isMobile ? SHADER_PARAMS.mobile : SHADER_PARAMS.desktop;

  return (
    <div aria-hidden="true" className="liquid-metal-bg">
      {ready && <LiquidMetal
        width="100%"
        height="100%"
        colorBack="#ffffff"
        colorTint="#ffffff"
        shape="metaballs"
        repetition={params.repetition}
        softness={0.1}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.07}
        contour={0.4}
        angle={70}
        speed={params.speed}
        scale={1.36}
        offsetY={-0.42}
        fit="cover"
        minPixelRatio={params.minPixelRatio}
        maxPixelCount={params.maxPixelCount}
      />}
    </div>
  );
}

export default LiquidMetalBg;