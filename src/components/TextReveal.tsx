"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Marks a paragraph break in the token stream produced by `splitRevealTokens`. */
export const TOKEN_SEPARATOR = "\n";

/**
 * Scroll progress is exposed as a CSS custom property rather than React state.
 *
 * A React-driven version has to publish a discrete "is this token lit" flag,
 * which can only ever step one word at a time, and the per-token CSS transition
 * then restarts on every step — the visible result is words popping in with a
 * lagging stagger. Writing one continuous `--reveal-progress` value per frame
 * instead lets each token derive its own opacity from its position in the
 * stream, so the light moves as a continuous front with no per-word state and
 * no transitions to restart.
 */
const REVEAL_EASING = 0.18;
const REVEAL_EPSILON = 0.0005;

/**
 * Width of the soft edge of the light front, as a fraction of the passage.
 * Published to CSS as `--reveal-feather` so the JS that positions the front and
 * the stylesheet that draws the ramp cannot drift apart.
 */
const REVEAL_FEATHER = 0.12;

/**
 * Splits copy into reveal tokens: whitespace-delimited words, each carrying its
 * trailing space so the spans render with natural spacing. Paragraph breaks are
 * emitted as a `TOKEN_SEPARATOR` token so a single scroll pass can walk through
 * multi-paragraph copy in reading order.
 */
export function splitRevealTokens(body: string): string[] {
  const tokens: string[] = [];

  body.split(/\n{2,}/).forEach((block, blockIndex) => {
    if (blockIndex > 0 && tokens.length > 0) tokens.push(TOKEN_SEPARATOR);

    const words = block
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(Boolean);

    words.forEach((word, wordIndex) => {
      tokens.push(wordIndex < words.length - 1 ? `${word} ` : word);
    });
  });

  return tokens;
}

export interface TextRevealProps {
  body: string;
  className?: string;
  children: (tokens: string[]) => ReactNode;
}

function TextRevealRoot({ body, className, children }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => splitRevealTokens(body), [body]);

  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Only word tokens render, so the front is mapped against the word count.
    // Counting the separators too would stretch the mapping and leave the tail
    // of the passage lagging behind the scroll position.
    const total = tokens.filter((token) => token !== TOKEN_SEPARATOR).length;

    // Opacity is driven entirely by these custom properties, set here before
    // first paint so the passage is never rendered in a transitional state.
    element.style.setProperty("--reveal-total", String(total));
    element.style.setProperty("--reveal-feather", String(REVEAL_FEATHER));

    // Each token ramps up over a window centred on its position in the stream,
    // so a token sitting at either extreme of the passage can only ever reach
    // half its ramp by the time the front arrives. Shifting the front half a
    // feather past both ends of the scroll range lets the first and last words
    // complete their fade instead of stalling at the edges.
    const toFront = (progress: number) =>
      progress * (1 + REVEAL_FEATHER) - REVEAL_FEATHER / 2;

    const publish = (front: number) =>
      element.style.setProperty("--reveal-front", front.toFixed(4));

    publish(toFront(0));
    element.dataset.reveal = "active";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      publish(toFront(1));
      return;
    }

    let target = 0;
    let current = 0;
    let frame = 0;

    const setProgress = (next: number) => {
      target = next;
      if (frame) return;

      const tick = () => {
        current += (target - current) * REVEAL_EASING;

        if (Math.abs(target - current) < REVEAL_EPSILON) {
          current = target;
          publish(toFront(current));
          frame = 0;
          return;
        }

        publish(toFront(current));
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    };

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        onRefreshInit: (self) => setProgress(self.progress),
        onUpdate: (self) => setProgress(self.progress),
        onLeaveBack: () => setProgress(0),
      });
    }, element);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      delete element.dataset.reveal;
      context.revert();
    };
  }, [tokens.length]);

  return (
    <div ref={containerRef} className={className}>
      {children(tokens)}
    </div>
  );
}

export interface TextRevealTokenProps
  extends Omit<CSSProperties, "opacity" | "transition"> {
  index: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Publishes this token's position in the stream as `--i`. Opacity is left to
 * CSS so the whole passage animates from a single style write per frame.
 */
export function TextRevealToken({
  index,
  className,
  style,
  children,
}: TextRevealTokenProps) {
  return (
    <span className={className} style={{ ...style, "--i": index } as CSSProperties}>
      {children}
    </span>
  );
}

export const TextReveal = Object.assign(TextRevealRoot, {
  Token: TextRevealToken,
});

export default TextReveal;
