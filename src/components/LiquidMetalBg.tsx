"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import "./LiquidMetalBg.css";

const MIN_PIXEL_RATIO = 1;
const MAX_PIXEL_COUNT = 1_500_000;

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
        speed={1}
        scale={1.36}
        offsetY={-0.42}
        fit="cover"
        minPixelRatio={MIN_PIXEL_RATIO}
        maxPixelCount={MAX_PIXEL_COUNT}
      />
    </div>
  );
}

export default LiquidMetalBg;
