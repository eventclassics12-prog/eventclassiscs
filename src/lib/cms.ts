/**
 * CMS data layer — client-safe half.
 *
 * Types and pure helpers (mediaUrl, mediaAlt, asMediaObject) that section
 * components — including client components — may import freely.
 *
 * Server-side fetching lives in `./cms-server` (which wraps Payload's
 * Node-only client). Never import `payload` — directly or transitively —
 * from this file, or the browser bundle breaks (`child_process`, …).
 */

export interface CmsMedia {
  id: number | string
  url?: string | null
  width?: number | null
  height?: number | null
  alt?: string | null
  filename?: string | null
}

export type CmsMediaField = CmsMedia | number | string | null | undefined

const APP_ORIGIN = (() => {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL
  if (!raw) return undefined
  try {
    return new URL(raw).origin
  } catch {
    return undefined
  }
})()

/**
 * Payload stores upload URLs as absolute (serverURL + path). `next/image`
 * only accepts relative src values (or configured remote hosts), so
 * same-origin URLs are returned as relative paths. Genuinely external
 * URLs are left untouched.
 */
function toRelativeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url
  if (APP_ORIGIN && url.startsWith(APP_ORIGIN)) {
    return url.slice(APP_ORIGIN.length) || '/'
  }
  // Dev fallback: Payload defaults serverURL to http://localhost:3000
  // when NEXT_PUBLIC_SERVER_URL is unset.
  if (!APP_ORIGIN) {
    try {
      const parsed = new URL(url)
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return parsed.pathname + parsed.search + parsed.hash
      }
    } catch {
      /* not a parseable URL — return as-is */
    }
  }
  return url
}

/**
 * Uploads managed by the Media collection are written into Next.js
 * `public/media` (see its `staticDir`), so Next serves them as plain static
 * files. A same-origin Payload API file URL (`/payload-api/media/file/…`)
 * is therefore rewritten to `/media/<filename>`: it skips a needless
 * round-trip through the API and — critically — `next/image` cannot
 * reliably optimize the API-served bytes, which is why every CMS-driven
 * image rendered broken while plain static assets worked. Remote storage
 * URLs (S3, …) are left untouched.
 */
function isLocalUpload(url: string | null | undefined): boolean {
  if (!url) return true // only a filename to go on — assume a local upload
  if (!url.startsWith('http://') && !url.startsWith('https://')) return true
  if (APP_ORIGIN && url.startsWith(APP_ORIGIN)) return true
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

/** Resolve an upload field (populated doc, id, or raw path) to a URL. */
export function mediaUrl(media: CmsMediaField): string | undefined {
  if (!media) return undefined
  if (typeof media === 'string') return toRelativeUrl(media)
  if (typeof media === 'number') return undefined
  if (media.filename && isLocalUpload(media.url)) {
    return `/media/${media.filename}`
  }
  return media.url ? toRelativeUrl(media.url) : undefined
}

export function mediaAlt(media: CmsMediaField, fallback = ''): string {
  if (media && typeof media === 'object' && typeof media !== 'number') {
    return media.alt ?? fallback
  }
  return fallback
}

/** Return the populated media object, or undefined when the field holds only an id/path. */
export function asMediaObject(media: CmsMediaField): CmsMedia | undefined {
  return media && typeof media === 'object' ? media : undefined
}

export interface NavLink {
  label: string
  href: string
}

/* ------------------------------ site ------------------------------ */

export interface SiteSettingsData {
  brandName?: string | null
  brandTagline?: string | null
  copyright?: string | null
  navLinks?: NavLink[] | null
  footerTalkLabel?: string | null
  footerContactButtonLabel?: string | null
  footerContactHref?: string | null
  footerLogoVideo?: CmsMediaField
  studioDetailsLabel?: string | null
  email?: string | null
  locationLine1?: string | null
  locationLine2?: string | null
  socialsLabel?: string | null
  socials?: { label: string; url: string }[] | null
  /* SEO */
  siteUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  ogImage?: CmsMediaField
}

/* ------------------------------ home ------------------------------ */

export interface HomeHeroData {
  brand?: string | null
  headline?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

export interface HomeBrandsData {
  label?: string | null
  brands?: { logo?: CmsMediaField; name?: string | null }[] | null
}

export interface HomeStatementData {
  stat?: string | null
  statCaption?: string | null
  paragraphs?: { text?: string | null }[] | null
  bylineName?: string | null
  bylineRole?: string | null
  bylineInitials?: string | null
}

export interface HomeGapData {
  phraseLeft?: string | null
  phraseRight?: string | null
  image?: CmsMediaField
  copy?: string | null
}

export interface HomeKeepScrollingData {
  label?: string | null
}

export interface HomeSuccessStoriesData {
  label?: string | null
  pagerTag?: string | null
  video?: CmsMediaField
  projects?: {
    title?: string | null
    description?: string | null
    stat?: string | null
    statCaption?: string | null
    image?: CmsMediaField
  }[] | null
}

export interface HomeServicesData {
  intro?: string | null
  label?: string | null
  services?: {
    name?: string | null
    kicker?: string | null
    description?: string | null
    subItems?: { value?: string | null }[] | null
    image?: CmsMediaField
    imageLabel?: string | null
  }[] | null
}

export interface HomeFaqData {
  label?: string | null
  ctaHeading?: string | null
  ctaButtonLabel?: string | null
  ctaHref?: string | null
  headline?: string | null
  faqs?: { question?: string | null; answer?: string | null }[] | null
}

/* ------------------------------ pages ----------------------------- */

export interface TextPart {
  text?: string | null
  highlight?: boolean | null
}

export interface PageAboutData {
  heroVideo?: CmsMediaField
  heroTitle?: string | null
  heroLede?: string | null
  circularInner?: string | null
  circularOuter?: string | null
  storyTitle?: string | null
  quoteLead?: string | null
  storyParagraphs?: { text?: string | null }[] | null
  founderAvatar?: CmsMediaField
  founderName?: string | null
  founderRole?: string | null
  manifestoTitle?: string | null
  manifestoCtaLabel?: string | null
  manifestoCtaHref?: string | null
  principles?: { title?: string | null; body?: string | null }[] | null
}

export interface PageServicesData {
  heroVideo?: CmsMediaField
  heroTitle?: string | null
  heroLede?: string | null
  finalCtaLines?: { text?: string | null }[] | null
  finalCtaKicker?: string | null
  finalCtaLabel?: string | null
  finalCtaHref?: string | null
  finalCtaImage?: CmsMediaField
}

export interface PageWorkData {
  heroTitle?: string | null
  heroLede?: string | null
  projectsLabel?: string | null
  projects?: {
    title?: string | null
    kickerParts?: TextPart[] | null
    intro?: string | null
    body?: string | null
    includes?: { value?: string | null }[] | null
    caption?: string | null
    image?: CmsMediaField
    alt?: string | null
  }[] | null
  marqueeLine1?: string | null
  marqueeLine2?: TextPart[] | null
  marqueeVideo?: CmsMediaField
  includesLabel?: string | null
  readMoreLabel?: string | null
  readLessLabel?: string | null
}

export interface PageContactData {
  introHeading?: string | null
  introLede?: string | null
  introEmail?: string | null
  cardTitle?: string | null
  cardDescription?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  labelName?: string | null
  labelEmail?: string | null
  labelPhone?: string | null
  labelMessage?: string | null
  submitLabel?: string | null
  submittingLabel?: string | null
  errorMessage?: string | null
}

export interface PageThankYouData {
  heading?: string | null
  sub?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

/* ------------------------------ blog ------------------------------ */

export interface PostData {
  id: number | string
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  coverImage?: CmsMediaField
  author?: string | null
  /** ISO date string. Null/empty means the post is a draft (never listed). */
  publishedAt?: string | null
  /** Serialized Lexical editor state from the Payload richText field. */
  content?: unknown
  seoTitle?: string | null
  seoDescription?: string | null
}
