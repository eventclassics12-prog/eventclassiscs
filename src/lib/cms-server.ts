import 'server-only'

import { getPayloadClient } from './getPayload'

export type * from './cms'
import type { PostData } from './cms'

export async function getGlobal<T>(slug: string): Promise<T | null> {
  try {
    const payload = await getPayloadClient()
    const data = await payload.findGlobal({ slug: slug as 'site-settings' })
    return data as T
  } catch {
    return null
  }
}

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
