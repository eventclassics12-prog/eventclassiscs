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

function toRelativeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url
  try {
    const parsed = new URL(url)
    if (parsed.origin === APP_ORIGIN || (!APP_ORIGIN && ['localhost', '127.0.0.1'].includes(parsed.hostname))) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    return url
  }
  return url
}

export function mediaUrl(media: CmsMediaField): string | undefined {
  if (!media) return undefined
  if (typeof media === 'string') return toRelativeUrl(media)
  if (typeof media === 'number') return undefined
  if (media.url) return toRelativeUrl(media.url)
  if (media.filename) return `/media/${encodeURIComponent(media.filename)}`
  return undefined
}

export function mediaAlt(media: CmsMediaField, fallback: string | null | undefined = ''): string {
  if (media && typeof media === 'object' && typeof media !== 'number') {
    return media.alt ?? fallback ?? ''
  }
  return fallback ?? ''
}

export function asMediaObject(media: CmsMediaField): CmsMedia | undefined {
  return media && typeof media === 'object' ? media : undefined
}

export interface NavLink {
  label: string
  href: string
}

export interface SiteSettingsData {
  brandName?: string | null
  brandTagline?: string | null
  copyright?: string | null
  navLinks?: NavLink[] | null
  menuLabel?: string | null
  menuCloseLabel?: string | null
  menuCtaLabel?: string | null
  menuCtaHref?: string | null
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

  siteUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  ogImage?: CmsMediaField
}

export interface HomeHeroData {
  brand?: string | null
  headline?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

export interface HomeBrandsData {
  id?: number | string
  label?: string | null
  brands?: { logo?: CmsMediaField; name?: string | null }[] | null
}

export interface HomeStatementData {
  stat?: string | null
  statCaption?: string | null
  paragraphs?: { text?: string | null }[] | null
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
    video?: CmsMediaField
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

export interface TextPart {
  text?: string | null
  highlight?: boolean | null
}

export interface PageSeoData {
  seoTitle?: string | null
  seoDescription?: string | null
  ogImage?: CmsMediaField
}

export interface PageAboutData extends PageSeoData {
  heroVideo?: CmsMediaField
  heroTitle?: string | null
  heroLede?: string | null
  circularInner?: string | null
  circularOuter?: string | null
  circularLogo?: CmsMediaField
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

export interface PageServicesData extends PageSeoData {
  heroVideo?: CmsMediaField
  heroTitle?: string | null
  heroLede?: string | null
  finalCtaLines?: { text?: string | null }[] | null
  finalCtaKicker?: string | null
  finalCtaLabel?: string | null
  finalCtaHref?: string | null
  finalCtaImage?: CmsMediaField
}

export interface PageWorkData extends PageSeoData {
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
    idea?: string | null
    executionIntro?: string | null
    executionSteps?: { title?: string | null; body?: string | null }[] | null
    challenges?:
      | { challenge?: string | null; solution?: string | null }[]
      | null
    impactStats?:
      | { value?: string | null; label?: string | null }[]
      | null
    impactNote?: string | null
  }[] | null
  marqueeLine1?: string | null
  marqueeLine2?: TextPart[] | null
  marqueeVideo?: CmsMediaField
  includesLabel?: string | null
  readMoreLabel?: string | null
  readLessLabel?: string | null
}

export interface PageContactData extends PageSeoData {
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
  failureMessage?: string | null
  infoEmailLabel?: string | null
  infoPhoneLabel?: string | null
  infoAddressLabel?: string | null
}

export interface PageThankYouData extends PageSeoData {
  heading?: string | null
  sub?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

export interface PostData {
  id: number | string
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  coverImage?: CmsMediaField
  author?: string | null
  publishedAt?: string | null
  content?: unknown
  seoTitle?: string | null
  seoDescription?: string | null
}

export interface PageBlogData extends PageSeoData {
  label?: string | null
  heroTitle?: string | null
  heroLede?: string | null
  emptyMessage?: string | null
  backLabel?: string | null
}
