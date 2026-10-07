import 'server-only'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from './getPayload'

export type * from './cms'
import type { PostData } from './cms'

const cacheOptions = { tags: ['cms'], revalidate: 300 }

const readGlobal = cache(unstable_cache(async (slug: string) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: slug as 'site-settings', depth: 1 })
}, ['cms-global'], cacheOptions))

export async function getGlobal<T>(slug: string): Promise<T | null> {
  return await readGlobal(slug) as T
}

export const getPosts = cache(unstable_cache(async (): Promise<PostData[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    where: { publishedAt: { less_than_equal: new Date().toISOString() } },
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })
  return res.docs as PostData[]
}, ['cms-posts'], cacheOptions))

export const getPostBySlug = cache(unstable_cache(async (slug: string): Promise<PostData | null> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      publishedAt: { less_than_equal: new Date().toISOString() },
    },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as PostData | undefined) ?? null
}, ['cms-post'], cacheOptions))
