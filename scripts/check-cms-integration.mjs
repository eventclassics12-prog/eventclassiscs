/** Run only against an isolated local CMS: CMS_TEST_URL=http://127.0.0.1:3101 node scripts/check-cms-integration.mjs */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = process.env.CMS_TEST_URL;
assert.ok(origin, 'Set CMS_TEST_URL to the isolated local production server');
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'This check writes test content and only accepts localhost');
const email = 'cms-integration@example.test';
const password = 'Local-CMS-integration-check-2026!';
await fetch(`${origin}/payload-api/users/first-register`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
});
const login = await fetch(`${origin}/payload-api/users/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
});
assert.equal(login.status, 200, 'Local test user must log in');
const { token } = await login.json();
const headers = { 'Content-Type': 'application/json', Authorization: `JWT ${token}` };
async function save(slug, data) {
  const res = await fetch(`${origin}/payload-api/globals/${slug}`, { method: 'POST', headers, body: JSON.stringify(data) });
  assert.equal(res.status, 200, `${slug}: ${await res.text()}`);
}
async function page(path) {
  const res = await fetch(`${origin}${path}`, { cache: 'no-store' });
  return { status: res.status, html: (await res.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '') };
}
async function expectPage(path, markers, absent = []) {
  let result;
  for (let i = 0; i < 30; i++) {
    result = await page(path);
    if (result.status === 200 && markers.every(m => result.html.includes(m)) && absent.every(m => !result.html.includes(m))) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(result.status, 200, `${path} must render`);
  for (const marker of markers) assert.ok(result.html.includes(marker), `${path} missing rendered CMS value: ${marker}`);
  for (const marker of absent) assert.ok(!result.html.includes(marker), `${path} restored unwanted fallback: ${marker}`);
  console.log(`PASS ${path}: ${markers.join(', ') || 'empty lists remain empty'}`);
  return result.html;
}
async function upload(filename, type, bytes) {
  const form = new FormData();
  form.set('file', new Blob([bytes], { type }), filename);
  form.set('_payload', JSON.stringify({ alt: 'CMSUploadedMedia' }));
  const res = await fetch(`${origin}/payload-api/media`, { method: 'POST', headers: { Authorization: `JWT ${token}` }, body: form });
  const result = await res.json();
  assert.equal(res.status, 201, JSON.stringify(result));
  return result.doc;
}

// Warm the full-page caches before making changes: updates must invalidate them.
for (const path of ['/', '/about', '/services', '/work', '/blog', '/contact-form', '/thank-you']) await page(path);
await save('site-settings', {
  brandName: 'CMSBrand', brandTagline: 'CMSTagline', copyright: 'CMSCopyright',
  navLinks: [{ label: 'CMSNavigation', href: '/about' }], socials: [],
  menuLabel: 'CMSMenu', menuCloseLabel: 'CMSClose', menuCtaLabel: 'CMSMenuCTA', menuCtaHref: '/work',
  footerTalkLabel: 'CMSFooterTalk', footerContactButtonLabel: 'CMSFooterCTA', footerContactHref: '/contact-form',
  email: 'editor@example.test', locationLine1: 'CMSLocation1', locationLine2: 'CMSLocation2',
});
await save('home-hero', { brand: '', headline: 'CMSHeadline', ctaLabel: 'CMSHeroCTA', ctaHref: '/about' });
await expectPage('/', ['CMSBrand', 'CMSHeadline', 'CMSHeroCTA', 'CMSNavigation', 'CMSMenuCTA', 'CMSFooterCTA', 'CMSCopyright'], ['Facebook']);
await save('home-hero', { ctaLabel: 'CMSUpdatedCTA', ctaHref: '/services' });
const home = await expectPage('/', ['CMSUpdatedCTA'], ['CMSHeroCTA']);
assert.match(home, /class="m-hero__cta m-hero__bookcta" href="\/services"/, 'Homepage CTA destination must come from CMS');

const image = await upload('cms-integration-check.png', 'image/png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64'));
const video = await upload('cms-integration-check.mp4', 'video/mp4', await readFile(new URL('../public/videos/chrome-about-loop.mp4', import.meta.url)));
assert.match(image.url, /\/payload-api\/media\/file\//);
assert.equal((await fetch(new URL(image.url, origin))).status, 403, 'Unattached upload must remain private');
await save('home-brands', { label: 'CMSBrands', brands: [{ name: 'CMSClient', logo: image.id }] });
await save('home-statement', { stat: 'CMSStat', statCaption: 'CMSCaption', paragraphs: [{ text: 'CMSParagraph' }] });
await save('home-gap', { phraseLeft: 'CMSLeft', phraseRight: 'CMSRight', copy: 'CMSGapCopy', image: image.id });
await save('home-keep-scrolling', { label: 'CMSScroll' });
await save('home-services', { intro: 'CMSServiceIntro', label: 'CMSServiceLabel', services: [{ name: 'CMSService', kicker: 'CMSKicker', description: 'CMSServiceDescription', subItems: [{ value: 'CMSSubItem' }], image: image.id, imageLabel: 'CMSImageLabel' }] });
await save('home-faq', { label: 'CMSFAQ', headline: 'CMSFAQHeadline', ctaHeading: 'CMSFAQCTA', ctaButtonLabel: 'CMSFAQButton', ctaHref: '/work', faqs: [{ question: 'CMSQuestion', answer: 'CMSAnswer' }] });
const populatedHome = await expectPage('/', ['CMSClient', 'CMSStat', 'CMSParagraph', 'CMSLeft', 'CMSService', 'CMSQuestion', 'CMSAnswer']);
assert.ok(populatedHome.includes(encodeURIComponent(new URL(image.url).pathname)), 'Image must use the actual CMS upload route');
assert.ok(populatedHome.includes(`<source src="${new URL(video.url, origin).pathname}"/>`), 'MP4 must use its CMS URL without being mislabeled WebM');
const mediaResponse = await fetch(new URL(image.url, origin));
assert.equal(mediaResponse.status, 200, 'CMS upload must be served through its URL');
await expectPage('/services', ['CMSService', 'CMSSubItem', 'CMSImageLabel']);
await save('page-services', { heroTitle: 'CMSServiceHero', heroLede: 'CMSServiceLede', finalCtaLines: [{ text: 'CMSFinalLine' }], finalCtaKicker: 'CMSFinalKicker', finalCtaLabel: 'CMSFinalCTA', finalCtaHref: '/work', finalCtaImage: image.id, seoTitle: 'CMSServiceSEO', seoDescription: 'CMSServiceSEODescription' });
await expectPage('/services', ['CMSServiceHero', 'CMSFinalLine', 'CMSFinalCTA', '<title>CMSServiceSEO</title>']);
await save('page-about', { heroTitle: 'CMSAboutHero', heroLede: 'CMSAboutLede', circularInner: 'CMSInner', circularOuter: 'CMSOuter', circularLogo: image.id, storyTitle: 'CMSStory', quoteLead: 'CMSQuote', storyParagraphs: [{ text: 'CMSStoryParagraph' }], founderName: 'CMSFounder', founderRole: 'CMSFounderRole', founderAvatar: image.id, manifestoTitle: 'CMSManifesto', manifestoCtaLabel: 'CMSManifestoCTA', manifestoCtaHref: '/work', principles: [{ title: 'CMSPrinciple', body: 'CMSPrincipleBody' }] });
const about = await expectPage('/about', ['CMSAboutHero', 'CMSStoryParagraph', 'CMSFounder', 'CMSPrinciple']);
assert.ok(about.includes(image.url.replace(origin, '')), 'Circular logo must use CMS media');
await save('page-work', { heroTitle: 'CMSWorkHero', heroLede: 'CMSWorkLede', projectsLabel: 'CMSWorkProjects', projects: [{ title: 'CMSWorkProject', kickerParts: [{ text: 'CMSWorkKicker', highlight: true }], intro: 'CMSWorkIntro', body: 'CMSWorkBody', includes: [{ value: 'CMSWorkIncludes' }], caption: 'CMSWorkCaption', image: image.id }], marqueeLine1: 'CMSMarquee', marqueeLine2: [{ text: 'CMSMarqueePart', highlight: true }], includesLabel: 'CMSIncludesLabel', readMoreLabel: 'CMSMore', readLessLabel: 'CMSLess' });
await expectPage('/work', ['CMSWorkHero', 'CMSWorkProject', 'CMSWorkIncludes', 'CMSMarqueePart'], ['IQVIA']);
await expectPage('/work/cmsworkproject', ['CMSWorkProject', 'CMSWorkIntro', 'CMSWorkIncludes']);
await save('page-contact', { introHeading: 'CMSContactHero', introLede: 'Write to info@eventclassics.in.', introEmail: 'custom@example.test', cardTitle: 'CMSContactCard', email: 'custom@example.test', infoEmailLabel: 'CMSMailLabel', infoPhoneLabel: 'CMSPhoneLabel', infoAddressLabel: 'CMSAddressLabel', labelName: 'CMSName', submitLabel: 'CMSSend', errorMessage: 'CMSValidationError', failureMessage: 'CMSDeliveryError' });
const contact = await expectPage('/contact-form', ['CMSContactHero', 'CMSContactCard', 'CMSMailLabel', 'CMSPhoneLabel', 'CMSAddressLabel', 'CMSName']);
const introduction = contact.match(/<p class="contact-page-intro__lede">([\s\S]*?)<\/p>/)?.[1];
assert.equal((introduction.match(/>custom@example.test<\/a>/g) || []).length, 1, 'Contact introduction must link the email once');
await save('page-thank-you', { heading: 'CMSThankYou', sub: 'CMSConfirmation', ctaLabel: 'CMSReturn', ctaHref: '/work' });
await expectPage('/thank-you', ['CMSThankYou', 'CMSConfirmation', 'CMSReturn']);
await save('page-blog', { label: 'CMSJournalLabel', heroTitle: 'CMSJournalHero', heroLede: 'CMSJournalLede', emptyMessage: 'CMSJournalEmpty', backLabel: 'CMSBack', seoTitle: 'CMSJournalSEO' });
await expectPage('/blog', ['CMSJournalHero', 'CMSJournalLede', 'CMSJournalEmpty', '<title>CMSJournalSEO</title>']);
const created = await fetch(`${origin}/payload-api/posts`, { method: 'POST', headers, body: JSON.stringify({ title: 'CMSArticle', slug: 'cms-integration-article', publishedAt: '2020-01-01T00:00:00.000Z', excerpt: 'CMSArticleExcerpt' }) });
assert.equal(created.status, 201);
const { doc: post } = await created.json();
await expectPage('/blog', ['CMSArticle']);
await expectPage('/blog/cms-integration-article', ['CMSArticle', 'CMSBack']);
const removed = await fetch(`${origin}/payload-api/posts/${post.id}`, { method: 'DELETE', headers });
assert.equal(removed.status, 200);
await expectPage('/blog', ['CMSJournalEmpty'], ['CMSArticle']);
for (let i = 0; i < 30; i++) {
  if ((await page('/blog/cms-integration-article')).status === 404) break;
  await new Promise(resolve => setTimeout(resolve, 100));
}
assert.equal((await page('/blog/cms-integration-article')).status, 404, 'Deleted post must not remain in the page cache');

await save('home-brands', { brands: [] });
await save('home-statement', { paragraphs: [] });
await save('home-services', { services: [] });
await save('home-faq', { faqs: [] });
await save('page-work', { projects: [], marqueeLine2: [] });
await expectPage('/', ['CMSBrands', 'CMSServiceLabel'], ['CMSClient', 'CMSParagraph', 'CMSServiceDescription', 'CMSQuestion', 'IQVIA']);
await expectPage('/work', ['CMSWorkHero'], ['CMSWorkProject', 'IQVIA', 'We listen.']);
await expectPage('/services', ['CMSServiceHero'], ['CMSServiceDescription', 'Brand Identity &amp; Positioning']);
await save('site-settings', { navLinks: [] });
await expectPage('/about', ['CMSAboutHero'], ['CMSNavigation']);
console.log('PASS CMS saves refresh cached public pages; uploads, shared services, Journal, article deletion and empty lists work');
