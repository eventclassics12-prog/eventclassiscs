import 'server-only'

import { getPayloadClient } from './getPayload'

export type * from './cms'
import type { PostData } from './cms'

/**
 * Fetch one Payload global, typed by the caller. Returns null on failure.
 *
 * Server-only: never import this module (or `@/lib/getPayload`) from a
 * client component — `payload` pulls in Node built-ins (`child_process`,
 * …) that don't exist in the browser bundle.
 */
export async function getGlobal<T>(slug: string): Promise<T | null> {
  try {
    const payload = await getPayloadClient()
    // findGlobal types `slug` as the union of globals registered in
    // payload.config.ts; an unknown slug throws here and we return null.
    const data = await payload.findGlobal({ slug: slug as 'site-settings' })
    return data as T
  } catch {
    return null
  }
}

/**
 * All published journal posts, newest first. A post counts as published
 * when `publishedAt` is set to a time in the past — drafts (empty
 * `publishedAt`) never appear here.
 */
export async function getPosts(): Promise<PostData[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'posts',
      where: {
        publishedAt: { less_than_equal: new Date().toISOString() },
      },
      sort: '-publishedAt',
      limit: 100,
      depth: 1,
    })
    return res.docs as PostData[]
  } catch {
    return []
  }
}

/** Fetch a single published post by its slug. Returns null when missing. */
export async function getPostBySlug(slug: string): Promise<PostData | null> {
  try {
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
  } catch {
    return null
  }
}
