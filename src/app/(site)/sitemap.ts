import type { MetadataRoute } from 'next'
import { getGlobal, getPosts, type SiteSettingsData } from '@/lib/cms-server'
import { siteUrlOf } from '@/lib/seo'

/**
 * XML sitemap — served at /sitemap.xml.
 *
 * Utility routes (/thank-you, /api/*) are intentionally excluded:
 * they carry no indexable content. Journal articles are added
 * dynamically from the Posts collection.
 */
const ROUTES: ReadonlyArray<{
  path: string
  changeFrequency: 'weekly' | 'monthly' | 'yearly'
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/work', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact-form', changeFrequency: 'yearly', priority: 0.7 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, posts] = await Promise.all([
    getGlobal<SiteSettingsData>('site-settings'),
    getPosts(),
  ])
  const base = siteUrlOf(site)
  const lastModified = new Date()

  const staticRoutes = ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.publishedAt
        ? new Date(post.publishedAt)
        : lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [...staticRoutes, ...postRoutes]
}
