/**
 * Hero entrance timing, as one ordered sequence shared by the hero and the nav
 * button so the two cannot drift apart.
 *
 * This lives in its own module rather than in `MonologHero.tsx` because the nav
 * component imports it, and `MonologHero` already imports the nav: putting it in
 * either file would make the pair circular.
 *
 * These were previously per-element delays on `motion` elements paired with
 * `initial={false}`, which told motion to skip the from-state and render
 * straight at the `animate` value — so the delays were inert and every element
 * appeared fully opaque on first paint. The Menu button, which had no motion
 * entrance at all, was covered by a CSS keyframe and was the only element
 * genuinely fading in, which is why it landed out of order.
 */
export const ENTRANCE = {
  para: { delay: 0.15, duration: 0.7 },
  link: { delay: 0.35, stagger: 0.07, duration: 0.5 },
  cta: { delay: 0.75, duration: 0.6 },
  /**
   * Must exceed `cta.delay + cta.duration` so the two never overlap, otherwise
   * the fixed nav button and the CTA are both mid-fade at the same moment.
   */
  menu: { delay: 1.4, duration: 0.5 },
  /** Shared from-state. Motion needs an explicit `initial` to animate from. */
  hidden: { opacity: 0, y: 12 },
} as const;