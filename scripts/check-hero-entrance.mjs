/**
 * Static regression guard for the hero entrance sequence.
 *
 * The bug this pins: `initial={false}` on motion elements tells motion to skip
 * the from-state and render at the `animate` value, so the per-element `delay`
 * values were inert and every element appeared fully opaque on first paint.
 * The Menu button had no motion entrance at all and was covered by a CSS
 * keyframe, making it the only element genuinely fading in — which is why it
 * landed out of order relative to the rest.
 *
 * Static source checks only — no dev server or browser required.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/components/MonologHero.css', 'utf8');
const hero = readFileSync('src/components/MonologHero.tsx', 'utf8');
const nav = readFileSync(
  'src/components/ui/sterling-gate-kinetic-navigation.tsx',
  'utf8'
);
const entrance = readFileSync('src/components/hero-entrance.ts', 'utf8');

// The competing CSS keyframe must stay gone: two animation systems on one
// element is what put the Menu button out of order in the first place.
assert.doesNotMatch(
  css,
  /m-hero-menu-reveal/,
  'the m-hero-menu-reveal keyframe should be deleted; the entrance is motion-only'
);

// `motion` needs an explicit from-state to animate. `initial={false}` is what
// silently disabled every delay.
const fromState = /initial=\{reduce \? false : ENTRANCE\.hidden\}/g;
// para, nav links, CTA — one occurrence per motion element in the hero.
assert.equal(
  (hero.match(fromState) || []).length,
  3,
  'para, nav links, and CTA must each set a real from-state'
);
assert.match(
  nav,
  fromState,
  'the Menu button must set a real from-state too'
);

// Every entrance element must be gated on reduced motion, otherwise the
// animation runs for users who asked for none.
assert.equal(
  (hero.match(/initial=\{reduce \? false/g) || []).length,
  3,
  'every hero motion element must gate `initial` on reduced motion'
);
assert.match(nav, /initial=\{reduce \? false : ENTRANCE\.hidden\}/, 'menu must gate on reduced motion');

// The CSS baseline that hides the copy until motion fades it up.
assert.match(
  css,
  /\.m-hero__para,\s*\.m-hero__links li,\s*\.m-hero__bookcta\s*\{\s*opacity: 0;/,
  'the opacity: 0 baseline must remain, or the copy flashes before animating'
);

// Reduced motion must restore full opacity for all of it. The file has several
// `prefers-reduced-motion` blocks, so this concatenates them all rather than
// asserting against whichever one happens to come first.
const reducedBlocks = [
  ...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g),
].map((m) => m[0]);
assert.ok(reducedBlocks.length > 0, 'a reduced-motion media query must exist');
const reduced = reducedBlocks.join('\n');
for (const selector of [
  /\.m-hero__para\b/,
  /\.m-hero__links li\b/,
  /\.m-hero__bookcta\b/,
  /\.nav-close-btn\s*\{\s*opacity: 1/,
]) {
  assert.match(reduced, selector, `reduced-motion must cover ${selector}`);
}

// The Menu button must arrive strictly after the CTA finishes, or the fixed
// nav button and the CTA are both mid-fade at the same moment.
const num = (re) => {
  const m = entrance.match(re);
  assert.ok(m, `expected ${re} in hero-entrance.ts`);
  return Number(m[1]);
};
const ctaEnd = num(/cta: \{ delay: ([\d.]+)/) + num(/cta: \{[^}]*duration: ([\d.]+)/);
const menuDelay = num(/menu: \{ delay: ([\d.]+)/);
assert.ok(
  menuDelay > ctaEnd,
  `menu delay ${menuDelay}s must exceed the CTA finishing at ${ctaEnd}s`
);

console.log('hero entrance: sequence, from-state, and reduced-motion guards OK');