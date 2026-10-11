import { unstable_cache } from 'next/cache'
import type { Access, Payload } from 'payload'

const globalSlugs = [
  'site-settings', 'home-hero', 'home-brands', 'home-statement', 'home-gap',
  'home-keep-scrolling', 'home-success-stories', 'home-services', 'home-faq',
  'page-about', 'page-services', 'page-work', 'page-contact', 'page-thank-you', 'page-blog',
] as const
const uploadFields = new Set([
  'logo', 'image', 'video', 'heroVideo', 'circularLogo', 'founderAvatar',
  'finalCtaImage', 'marqueeVideo', 'footerLogoVideo', 'ogImage', 'coverImage',
])

function referencedMediaIds(documents: unknown[]): number[] {
  const ids = new Set<number>()
  const add = (value: unknown) => {
    const id = typeof value === 'object' && value ? (value as { id?: unknown }).id : value
    if (typeof id === 'number') ids.add(id)
  }
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(visit); return }
    if (!value || typeof value !== 'object') return
    const object = value as Record<string, unknown>
    if (object.type === 'upload' && object.relationTo === 'media') add(object.value)
    for (const [key, child] of Object.entries(object)) {
      if (uploadFields.has(key)) add(child)
      else visit(child)
    }
  }
  documents.forEach(visit)
  return [...ids]
}

function publicMediaIds(payload: Payload) {
  return unstable_cache(async () => {
    const globals = await Promise.all(globalSlugs.map(slug => payload.findGlobal({ slug, depth: 0, overrideAccess: true })))
    const posts = await payload.find({
      collection: 'posts',
      where: { publishedAt: { less_than_equal: new Date().toISOString() } },
      depth: 0,
      pagination: false,
      limit: 0,
      select: { coverImage: true, content: true },
      overrideAccess: true,
    })
    return referencedMediaIds([...globals, ...posts.docs])
  }, ['public-media-references'], { tags: ['cms'], revalidate: 300 })()
}

// Only media already used by public content is readable without a CMS login.
export const readPublicMedia: Access = async ({ req }) => {
  if (req.user) return true
  return { id: { in: await publicMediaIds(req.payload) } }
}
