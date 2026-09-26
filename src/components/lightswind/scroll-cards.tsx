"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardData {
  id: number | string;
  image?: string;
  alt?: string;
  content?: ReactNode;
}

export interface ScrollCardsProps {
  cards: CardData[];
  direction?: "bottom" | "top" | "left" | "right";
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
  heightClass?: string;
  startOffset?: string;
  stackPeekPercent?: number;
  paddingClass?: string;
  cardScale?: number;
  cardRotation?: number;
}

export function ScrollCards({
  cards,
  direction = "bottom",
  className,
  containerClassName,
  imageClassName,
  heightClass = "h-[70vh]",
  startOffset = "top top",
  stackPeekPercent = 100,
  paddingClass = "p-4 lg:p-8",
  cardScale = 0.7,
  cardRotation = 5,
}: ScrollCardsProps) {
  const container = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const imageElements = imageRefs.current.filter(
        (el): el is HTMLElement => Boolean(el),
      );
      const totalCards = imageElements.length;

      if (!imageElements[0]) return;

      gsap.set(imageElements[0], { x: "0%", y: "0%", scale: 1, rotation: 0 });

      const getInitialOffset = () => {
        switch (direction) {
          case "top":
            return { y: `${-stackPeekPercent}%`, x: "0%" };
          case "left":
            return { x: `${-stackPeekPercent}%`, y: "0%" };
          case "right":
            return { x: `${stackPeekPercent}%`, y: "0%" };
          case "bottom":
          default:
            return { y: `${stackPeekPercent}%`, x: "0%" };
        }
      };

      for (let i = 1; i < totalCards; i++) {
        gsap.set(imageElements[i], { ...getInitialOffset(), scale: 1, rotation: 0 });
      }

      // Pin + scrub are desktop-only. On mobile the cards stack in normal flow
      // (their positioning is overridden via responsive classes below), so a
      // 4-viewport pinned scrub would only stall scroll with no visual gain.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        const scrollTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: startOffset,
            end: `+=${window.innerHeight * totalCards}`,
            pin: true,
            scrub: 1,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        for (let i = 0; i < totalCards - 1; i++) {
          const currentImage = imageElements[i];
          const nextImage = imageElements[i + 1];
          const position = i;

          if (!currentImage || !nextImage) continue;

          scrollTimeline.to(
            currentImage,
            {
              scale: cardScale,
              rotation: cardRotation,
              duration: 1,
              ease: "power2.inOut",
            },
            position,
          );

          scrollTimeline.to(
            nextImage,
            {
              x: "0%",
              y: "0%",
              duration: 1,
              ease: "power2.inOut",
            },
            position,
          );
        }

        return () => {
          scrollTimeline.scrollTrigger?.kill();
          scrollTimeline.kill();
        };
      });

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      if (container.current) {
        resizeObserver.observe(container.current);
      }

      return () => {
        mm.revert();
        resizeObserver.disconnect();
      };
    },
    { scope: container, dependencies: [direction, cards.length, cardScale, cardRotation, startOffset, stackPeekPercent] }
  );

  return (
    <div className={cn("relative w-full", heightClass, className)} ref={container}>
      <div
        className={cn(
          "lightswind-scroll-cards-trigger relative flex w-full items-center justify-center overflow-hidden",
          paddingClass,
          heightClass,
        )}
      >
        <div
          className={cn(
            "relative w-[95%] sm:w-[90%] lg:w-[85%] max-w-[1400px] aspect-[4/3] md:aspect-video overflow-hidden rounded-3xl shadow-xl",
            containerClassName,
          )}
        >
          {cards.map((card, i) =>
            card.content ? (
              <article
                key={card.id}
                className="relative w-full h-[60vh] mb-4 will-change-transform md:absolute md:top-0 md:left-0 md:h-full md:w-full md:mb-0"
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
              >
                {card.content}
              </article>
            ) : (
              <img
                key={card.id}
                src={card.image}
                alt={card.alt || `Scroll card gallery image ${i}`}
                className={cn(
                  "relative w-full h-[60vh] mb-4 object-cover rounded-3xl will-change-transform shadow-2xl md:absolute md:top-0 md:left-0 md:h-full md:w-full md:mb-0",
                  imageClassName,
                )}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}