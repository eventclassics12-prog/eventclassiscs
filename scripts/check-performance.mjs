import assert from 'node:assert/strict';

const origin = process.env.PERFORMANCE_URL || 'http://127.0.0.1:3100';
for (const path of ['/', '/about', '/services', '/work', '/blog', '/contact-form', '/thank-you']) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `${path} must render`);
  assert.match(response.headers.get('cache-control') || '', /s-maxage=300/, `${path} must be cacheable`);
  const html = await response.text();
  assert.doesNotMatch(html, /<link\b[^>]*as="font"/, `${path} must not preload all font variants`);
  assert.doesNotMatch(html, /<video\b[^>]*\bposter=/, `${path} must not download duplicate raw posters`);
  assert.doesNotMatch(html, /background-image:url\(/, `${path} must not load unoptimized CSS images`);
  const footerVideo = html.match(/<video\b[^>]*class="footer__logo-video"[^>]*>/)?.[0];
  assert.ok(footerVideo, `${path} must retain the footer video`);
  assert.doesNotMatch(footerVideo, /\bsrc=|\bautoPlay=/, `${path} footer must wait until visible`);
  if (path === '/') {
    assert.match(html, /<p class="m-hero__para" style="opacity:1;transform:none">/, 'Hero must be visible before JavaScript');
  }
  console.log(`PASS ${path}: rendered, cacheable, no font preloads or duplicate video posters`);
}
// Requests after the first render must use the full-page cache.
const repeat = await fetch(origin);
assert.equal(repeat.headers.get('x-nextjs-cache'), 'HIT', 'Homepage should be served from cache');
console.log('PASS homepage cache HIT');
