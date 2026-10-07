// Regression guard for the hero wordmark animation: both the entrance
// staircase AND the slow-scroll vibration.
//
// The staircase/jitter bug on high-refresh mobile had no test, and the repo
// was found in a half-finished state where the entrance had been silently
// deleted (opacity: 1; transform: none), which looks like "no animation"
// rather than an error. These assertions pin the invariants that caused it,
// plus the scroll-smoothing invariants behind the vibration.
//
// Static source checks only — no dev server or browser required.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CSS_PATH = 'src/components/MonologHero.css';
const TS_PATH = 'src/components/HeroWordmark.tsx';
const SCROLL_PATH = 'src/components/SmoothScroll.tsx';

/**
 * Strip comments before asserting.
 *
 * Several invariants are negative ("syncTouch must not be true", "scrub must
 * not be plain true") and this codebase documents exactly those failed
 * attempts in prose. Matching raw source therefore trips over the comments
 * explaining the guard itself, so comments must go before any assertion runs.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => {
      // Leave protocol-relative and URL slashes alone.
      const at = line.search(/(^|[^:])\/\//);
      return at === -1 ? line : line.slice(0, at);
    })
    .join('\n');
}

const css = stripComments(readFileSync(CSS_PATH, 'utf8'));
const ts = stripComments(readFileSync(TS_PATH, 'utf8'));
const scroll = stripComments(readFileSync(SCROLL_PATH, 'utf8'));

/** Body of the FIRST rule matching `selector`. */
function ruleBody(source, selector) {
  const re = new RegExp(`(^|[,}\\s])\\${selector}\\s*\\{([^}]*)\\}`, 'm');
  const match = source.match(re);
  return match ? match[2] : null;
}

/** Body of the FIRST at-rule whose prelude contains `prelude`. */
function atRuleBody(source, prelude) {
  const start = source.indexOf(prelude);
  if (start === -1) return null;
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return null;
}

const checks = [];
const check = (name, fn) => {
  try {
    fn();
    checks.push(`PASS ${name}`);
  } catch (error) {
    checks.push(`FAIL ${name}: ${error.message}`);
    process.exitCode = 1;
  }
};

// 1. The entrance must still HAVE a from-state. This is the exact regression
//    that sat uncommitted in the working tree.
check('letter entrance has an opacity:0 from-state', () => {
  const body = ruleBody(css, '.m-hero__wordmark-letter');
  assert.ok(body, `${CSS_PATH}: .m-hero__wordmark-letter rule not found`);
  assert.match(
    body,
    /opacity:\s*0\s*;/,
    'from-state opacity must be 0 — if this is 1 the entrance animation is dead',
  );
});


// 2. The rise must come from the JS-measured whole-pixel custom property.
//    A fractional offset (0.5em) is what made glyphs re-rasterize mid-flight.
check('letter rise uses the whole-pixel --letter-rise variable', () => {
  const body = ruleBody(css, '.m-hero__wordmark-letter');
  assert.ok(body, `${CSS_PATH}: .m-hero__wordmark-letter rule not found`);
  assert.match(
    body,
    /transform:\s*translateY\(var\(--letter-rise/,
    'rise must read var(--letter-rise), not a hardcoded fractional em value',
  );
  assert.doesNotMatch(
    body,
    /transform:\s*translateY\([^v][^)]*em\)/,
    'a fractional em rise reintroduces sub-pixel glyph rasterization',
  );
});

// 3. JS must round the rise to whole pixels.
check('JS rounds --letter-rise to integer pixels', () => {
  assert.match(
    ts,
    /--letter-rise[\s\S]{0,120}Math\.round\(/,
    `${TS_PATH}: --letter-rise must be set from Math.round(...)`,
  );
});

// 4. The stagger must stay a single constant feeding BOTH transitionDelay and
//    settleMs. When these were independent literals they drifted, and
//    --settled then cut letters off mid-rise as a visible snap.
check('stagger and settle share one constant', () => {
  assert.match(
    ts,
    /const LETTER_STAGGER_MS\s*=\s*\d+/,
    'LETTER_STAGGER_MS constant must exist',
  );
  assert.match(
    ts,
    /Math\.max\(0,\s*resolvedText\.length\s*-\s*1\)\s*\*\s*LETTER_STAGGER_MS/,
    'the last letter delay must derive from LETTER_STAGGER_MS',
  );
  assert.match(
    ts,
    /transitionDelay[\s\S]{0,160}LETTER_STAGGER_MS/,
    'transitionDelay must derive from LETTER_STAGGER_MS',
  );
  assert.doesNotMatch(
    ts,
    /index\s*\*\s*\d+/,
    'a bare numeric per-letter stagger has re-split from the constant',
  );
});

// 4b. settleMs must be the exact end of the sequence (last letter's delay +
//     duration), not length*stagger + buffer — the latter over-counts by one
//     stagger and under-counts the duration, so it lands mid-rise.
check('settleMs equals the last letter finish time', () => {
  assert.match(
    ts,
    /lastDelay[\s\S]{0,200}LETTER_DURATION_MS/,
    'settleMs must add LETTER_DURATION_MS to the last letter delay',
  );
  assert.doesNotMatch(
    ts,
    /resolvedText\.length\s*\*\s*LETTER_STAGGER_MS\s*\+/,
    'the old length*stagger+buffer form skips the final duration',
  );
});

// 4c. THE STAIRCASE FIX. Letters only read as a travelling ramp when many are
//     mid-flight at once, which requires duration to be a large multiple of
//     the stagger. Measured on the live page: at 110/10 the profile was
//     "795 795 795.0 795.0 795.1 ..." (letters parked in discrete steps); at
//     240/14 it is a monotonic gradient across all letters.
check('duration/stagger ratio keeps letters overlapping', () => {
  const dur = Number(ts.match(/LETTER_DURATION_MS\s*=\s*(\d+)/)?.[1]);
  const stag = Number(ts.match(/LETTER_STAGGER_MS\s*=\s*(\d+)/)?.[1]);
  assert.ok(dur && stag, 'both timing constants must be readable integers');
  const ratio = dur / stag;
  assert.ok(
    ratio >= 12,
    `duration/stagger is ${dur}/${stag} = ${ratio.toFixed(1)}; below 12 the letters step instead of ramping`,
  );
});

// 4d. The letters must NOT use the site-wide --ease-out. That curve
//     (cubic-bezier(0.16, 1, 0.3, 1)) completes ~80% of the travel in the first
//     ~15% of the duration, so each letter snaps home in ~2 frames and the
//     settled letters read as a staircase. Measured maxStep was 15.9px of a
//     24px rise; with --letter-ease it is 4.4px.
check('letters use their own gentle ease, not the site --ease-out', () => {
  const body = ruleBody(css, '.m-hero__wordmark-letter');
  assert.ok(body, `${CSS_PATH}: .m-hero__wordmark-letter rule not found`);
  assert.match(
    body,
    /var\(\s*--letter-ease/,
    'the letter transition must read --letter-ease',
  );
  assert.doesNotMatch(
    body,
    /var\(--ease-out/,
    'the front-loaded --ease-out is what made the rise snap into a staircase',
  );
});

// 4e. The blend box must be TIGHT during the entrance, not the journey union.
//     The union of the wordmark's start (screen bottom) and end (header) is
//     ~390x830 on a phone, so applying it during the entrance re-composites
//     10.9x more area for no reason. Measured 384x825 (entrance) is now
//     378x77, and it expands to the journey box only once settled.
check('entrance uses a tight blend box, journey only after settle', () => {
  assert.match(
    ts,
    /mode:\s*"entrance"\s*\|\s*"journey"/,
    'applyBlendBox must take an explicit entrance|journey mode',
  );
  const earlyEffect = ts.slice(0, ts.indexOf('setIsActive(true)'));
  assert.match(
    earlyEffect,
    /applyBlendBox\(metrics,\s*"entrance"\)/,
    'the pre-entrance effect must apply the tight entrance box',
  );
  assert.match(
    ts,
    /if\s*\(!settled\)\s*return;[\s\S]{0,240}applyBlendBox\(metrics,\s*"journey"\)/,
    'the journey box must be applied on settle, not on mount',
  );
  assert.match(
    ts,
    /settledRef\.current\s*\?\s*"journey"\s*:\s*"entrance"/,
    'setupAnimation must pick the box mode from settledRef so fonts.ready ' +
      'cannot expand the box out from under the running entrance',
  );
});

// 5. The blend box must be sized before the entrance starts, not only after
//    fonts resolve. `.m-hero__wordmark-blend` defaults to inset:0, so a
//    fonts-gated-only sizing leaves a full-viewport difference-blend running
//    through the whole animation.
check('blend box is sized synchronously, not only after fonts', () => {
  assert.match(
    ts,
    /measureTargets/,
    'measureTargets must exist so sizing can be reused',
  );
  const earlyEffect = ts.slice(0, ts.indexOf('setIsActive(true)'));
  assert.match(
    earlyEffect,
    /applyBlendBox\(metrics,\s*"entrance"\)/,
    'applyBlendBox must be called in entrance mode before the entrance rAF',
  );
  assert.match(
    earlyEffect,
    /^\s*apply\(\);/m,
    'the pre-entrance sizing must run synchronously, not only after fonts load',
  );
});

// 6. Mobile must not restore the expensive nav blur. A 12px backdrop-filter on
//    a fixed bar competes with the blend layer for the same fill rate.
check('mobile disables nav backdrop-filter', () => {
  const mobile = atRuleBody(css, '@media (max-width: 768px)');
  assert.ok(mobile, `${CSS_PATH}: @media (max-width: 768px) block not found`);
  const navRules = mobile.match(/\.m-hero__nav\s*\{([^}]*)\}/g) ?? [];
  const combined = navRules.join('\n');
  assert.ok(combined, 'mobile block must target .m-hero__nav');
  assert.match(
    combined,
    /backdrop-filter:\s*none/,
    'mobile .m-hero__nav must set backdrop-filter: none',
  );
});

// 7. m-hero-rainbow animates background-position (a paint property). It must be
//    frozen on mobile; the transform/opacity-only dot pulse may keep running.
check('mobile freezes the paint-based rainbow animation', () => {
  const mobile = atRuleBody(css, '@media (max-width: 768px)');
  assert.ok(mobile, `${CSS_PATH}: @media (max-width: 768px) block not found`);
  assert.match(
    mobile,
    /\.m-hero__bookcta[\s\S]{0,200}animation:\s*none/,
    'm-hero-rainbow must be disabled on mobile',
  );
  assert.doesNotMatch(
    mobile,
    /\.m-hero__cta-dot[\s\S]{0,120}animation:\s*none/,
    'm-hero-cta-pulse is transform/opacity only and should keep running',
  );
});

// 8. Guard the visual: the difference blend is the whole look of the wordmark.
check('wordmark difference blend is preserved', () => {
  const body = ruleBody(css, '.m-hero__wordmark-blend');
  assert.ok(body, `${CSS_PATH}: .m-hero__wordmark-blend rule not found`);
  assert.match(
    body,
    /mix-blend-mode:\s*difference/,
    'the difference blend must not be dropped as a "fix"',
  );
});

// 9. Lenis must NOT hijack touch. syncTouch: true was tried so Lenis would
//    interpolate touch input (with syncTouch off it bails out of the gesture and
//    native scroll runs unsmoothed). In practice it made Lenis preventDefault
//    every touchmove, which broke the scroll-driven animations on real phones
//    and left scrolling feeling laggy. Native touch scrolling stays.
check('Lenis does not hijack touch scrolling', () => {
  assert.doesNotMatch(
    scroll,
    /syncTouch:\s*true/,
    'syncTouch: true makes Lenis preventDefault every touchmove — it broke ' +
      'the mobile scroll animations and made scrolling laggy. Keep it off and ' +
      'absorb the sub-pixel noise at the tween instead.',
  );
});

// 10. The scrub tween must keep a numeric (low-pass) scrub on mobile. Lenis
//     does not interpolate touch scrolling, so raw fractional scrollY reaches
//     the tween; this filter is the only thing damping it. scrub: true was
//     tried and made slow scrolling jitter badly.
check('mobile keeps a low-pass scrub', () => {
  const match = ts.match(/scrub:\s*([^,\n]+)/);
  assert.ok(match, 'the wordmark tween must set scrub');
  assert.match(
    match[1],
    /isMobile\s*\?\s*0?\.\d+\s*:\s*true/,
    'mobile scrub must be a numeric value (a low-pass filter), not `true`',
  );
});

// 11. The scrub tween must not carry hand-rolled x/y modifiers. Doing so
//     silently killed the tween — the wordmark froze at its start transform and
//     never travelled to the header at any scroll position. This is the single
//     most expensive regression found in this file, so it is pinned hard.
//     (roundProps: "x,y" was also tried and measured a no-op, so it is not
//     required either.)
check('scrub tween has no hand-rolled x/y modifiers', () => {
  const block = ts.match(/modifiers:\s*\{([\s\S]*?)\n\s*\},/);
  if (!block) return; // no modifiers block at all is also correct
  const body = block[1];
  assert.doesNotMatch(
    body,
    /(^|[\s,{])x\s*:/m,
    'modifiers: { x: ... } silently kills the scrub tween — the wordmark ' +
      'never travels to the header. Do not round x/y here.',
  );
  assert.doesNotMatch(
    body,
    /(^|[\s,{])y\s*:/m,
    'modifiers: { y: ... } silently kills the scrub tween — the wordmark ' +
      'never travels to the header. Do not round y/x here.',
  );
  assert.doesNotMatch(
    body,
    /(^|[\s,{])scale\s*:/m,
    'a 0.001 scale snap was in place for a while and is gone: it changed no ' +
      'measurable frame cost and only added a staircase to the motion. ' +
      'Sub-pixel scaling is handled at the layer (will-change: transform).',
  );
});

// 12. THE TRAVEL-COLLAPSE BUG. The tween's start position used to be read with
//     `wordmark.getBoundingClientRect()` — but the wordmark already carries the
//     inline transform GSAP wrote to it, so any re-run of setupAnimation (it
//     re-runs on every innerWidth change, i.e. orientation change) measured
//     GSAP's own output and installed it as the FROM. Measured on the live
//     site: travel collapsed from 772px to -0.1px and the wordmark stopped
//     travelling to the header entirely.
//
//     The fix is to strip the inline transform before measuring, so the CSS
//     start position is what gets read. This assertion pins that.
check('tween start is measured with the inline transform stripped', () => {
  assert.match(
    ts,
    /measureStartPosition/,
    `${TS_PATH}: a measureStartPosition helper must exist so the start ` +
      'rect is never read from an element GSAP has already transformed',
  );
  const helper = ts.slice(
    ts.indexOf('measureStartPosition'),
    ts.indexOf('measureStartPosition') + 1400,
  );
  assert.match(
    helper,
    /style\.transform\s*=\s*["']["']/,
    'measureStartPosition must clear the inline transform before measuring',
  );
  assert.match(
    helper,
    /offsetHeight/,
    'measureStartPosition must force a reflow after clearing the transform, ' +
      'otherwise getBoundingClientRect can return the pre-clear geometry',
  );
  assert.match(
    helper,
    /style\.transform\s*=\s*previous/,
    'measureStartPosition must restore the previous inline transform',
  );
  assert.doesNotMatch(
    ts,
    /const startRect = wm\.getBoundingClientRect\(\)/,
    'reading startRect straight off the transformed wordmark is the bug itself',
  );
});

// 13. The wordmark is scaled 354px -> nav size by the scrub tween, so Chromium
//     re-rasterizes the whole weight-800 glyph run at every new scale. That is
//     the mobile churn. `will-change: transform` tells it to rasterize once
//     and GPU-scale instead. Without `transform` in the list there is no layer
//     hint at all and the churn comes back; with `scale` in the list it opts
//     straight back into re-rasterization.
check('wordmark is layer-promoted so scaling does not re-raster text', () => {
  const body = ruleBody(css, '.m-hero__wordmark-display');
  assert.ok(body, `${CSS_PATH}: .m-hero__wordmark-display rule not found`);
  const decl = body.match(/will-change:\s*([^;]+);/);
  assert.ok(
    decl,
    '.m-hero__wordmark-display must set will-change — scaling live text ' +
      'otherwise re-rasterizes the glyph run every frame',
  );
  assert.match(
    decl[1],
    /(^|\s)transform(\s|$)/,
    'will-change must list `transform`',
  );
  assert.doesNotMatch(
    decl[1],
    /(^|\s)scale(\s|$)/,
    '`will-change: scale` defeats the purpose — it asks for re-rasterization ' +
      'at each new scale, which is the thing being fixed',
  );
});

for (const line of checks) console.log(line);
console.log(
  `\n${checks.filter((c) => c.startsWith('PASS')).length}/${checks.length} wordmark animation invariants hold`,
);
