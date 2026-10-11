import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { getPayload } from 'payload'
import config from '../payload.config'
import { initializeTrustedBy } from './trusted-by-initialization'

async function main() {
  if (process.env.NODE_ENV !== 'production') throw new Error('Run with NODE_ENV=production to avoid automatic schema changes.')
  const payload = await getPayload({ config })
  const current = await payload.findGlobal({ slug: 'home-brands', depth: 0, overrideAccess: true })
  if (process.argv.includes('--dry-run')) {
    console.log(current.id != null ? 'Trusted By already exists; no changes needed.' : 'Trusted By is missing. Will register the four built-in public logos and create their CMS rows. Existing Media records will be preserved.')
  } else if (current.id != null) {
    console.log('Trusted By already exists; existing content was preserved.')
  } else {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) throw new Error('Connect Vercel Blob and set BLOB_READ_WRITE_TOKEN before initializing Trusted By.')
    const require = createRequire(import.meta.resolve('@payloadcms/storage-vercel-blob'))
    const { list } = require('@vercel/blob') as { list: (options: { token: string; limit: number }) => Promise<unknown> }
    // Verify the store before creating any Media records or uploading files.
    await list({ token, limit: 1 })
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
    const origin = process.env.NEXT_PUBLIC_SERVER_URL
    const verifyImage = async (url: string) => {
      const publicUrl = new URL(url, origin)
      const response = await fetch(publicUrl, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`Logo is not publicly available (${response.status}); the CMS section was not created.`)
      await response.body?.cancel()
      if (origin) {
        const optimized = new URL('/_next/image', origin)
        optimized.searchParams.set('url', publicUrl.href)
        optimized.searchParams.set('w', '640')
        optimized.searchParams.set('q', '75')
        const imageResponse = await fetch(optimized, { signal: AbortSignal.timeout(15000) })
        if (!imageResponse.ok) throw new Error(`The deployed image optimizer cannot serve this logo (${imageResponse.status}); deploy the image configuration before initializing Trusted By.`)
        await imageResponse.body?.cancel()
      }
    }
    console.log(JSON.stringify(await initializeTrustedBy(payload, root, verifyImage)))
  }
}

main().then(() => process.exit(0)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
