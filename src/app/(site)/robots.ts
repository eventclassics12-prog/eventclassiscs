import type { MetadataRoute } from 'next'
import { getGlobal, type SiteSettingsData } from '@/lib/cms-server'
import { siteUrlOf } from '@/lib/seo'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getGlobal<SiteSettingsData>('site-settings')
  const base = siteUrlOf(site)
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/thank-you', '/api/', '/admin', '/payload-api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
