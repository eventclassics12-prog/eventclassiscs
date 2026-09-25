/**
 * SEO helpers — client-safe (pure functions + types only).
 *
 * Central place that turns the `site-settings` CMS global into full
 * Next.js metadata: title, description, keywords, canonical URL,
 * Open Graph, Twitter cards and robots directives. Every public page
 * builds its metadata through `buildMetadata()` so share cards and
 * canonicals stay consistent and editable from the CMS.
 */

import type { Metadata } from 'next'
import { mediaUrl, type SiteSettingsData } from './cms'

export const FALLBACK_SITE_URL = 'https://www.eventclassics.in'
/** Built-in social share image until one is uploaded in Site Settings. */
export const FALLBACK_OG_IMAGE = '/cta-scale.jpg'

/** Canonical production origin, from CMS with a safe fallback. */
export function siteUrlOf(site?: SiteSettingsData | null): string {
  const raw = site?.siteUrl?.trim()
  if (raw) return raw.replace(/\/+$/, '')
  return FALLBACK_SITE_URL
}

export function absoluteUrl(
  site: SiteSettingsData | null | undefined,
  path: string,
): string {
  return new URL(path, siteUrlOf(site)).toString()
}

/** Relative OG image path — Next resolves it against metadataBase. */
export function ogImageOf(site?: SiteSettingsData | null): string {
  return mediaUrl(site?.ogImage) ?? FALLBACK_OG_IMAGE
}

/** `@handle` derived from the CMS socials (X/Twitter URL), if present. */
export function twitterHandleOf(
  site?: SiteSettingsData | null,
): string | undefined {
  const entry = (site?.socials ?? []).find((s) =>
    /(?:twitter\.com|x\.com)/i.test(s.url ?? ''),
  )
  const match = entry?.url?.match(/(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]+)/i)
  return match ? `@${match[1]}` : undefined
}

export interface PageSeo {
  title: string
  description: string
  /** Canonical path, e.g. `/about`. */
  path: string
  /** Page-specific share image (relative path ok); defaults to the site OG image. */
  image?: string
  /** Set for utility pages that must not be indexed (e.g. /thank-you). */
  noIndex?: boolean
}

export function buildMetadata(
  site: SiteSettingsData | null | undefined,
  page: PageSeo,
): Metadata {
  const image = page.image ?? ogImageOf(site)
  const keywords = (site?.seoKeywords ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
  const twitterHandle = twitterHandleOf(site)

  return {
    metadataBase: new URL(siteUrlOf(site)),
    title: page.title,
    description: page.description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical: page.path },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(site, page.path),
      siteName: site?.brandName?.trim() || 'EVENTCLASSICS',
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [image],
      ...(twitterHandle
        ? { site: twitterHandle, creator: twitterHandle }
        : {}),
    },
    robots: page.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  }
}

/** Schema.org Organization graph for the JSON-LD script in the root layout. */
export function organizationJsonLd(
  site: SiteSettingsData | null | undefined,
): Record<string, unknown> {
  const brand = site?.brandName?.trim() || 'EVENTCLASSICS'
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand,
    url: siteUrlOf(site),
    description:
      site?.seoDescription?.trim() ||
      'Strategic brand-building firm. We close the gap between what you\'ve built and what the market thinks you\'ve built.',
    logo: absoluteUrl(site, ogImageOf(site)),
    sameAs: (site?.socials ?? []).map((s) => s.url).filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kolkata',
      addressCountry: 'IN',
    },
  }
}
