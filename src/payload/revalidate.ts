import { after } from 'next/server'
import { revalidateTag } from 'next/cache'

export function invalidateCms() {
  try {
    // Wait for the CMS request/transaction to finish before expiring content.
    after(() => revalidateTag('cms', { expire: 0 }))
  } catch {
    // CLI imports/seeds have no Next request. The five-minute TTL still applies.
    console.warn('[cms-cache] No Next request context; cache will refresh within five minutes.')
  }
}
