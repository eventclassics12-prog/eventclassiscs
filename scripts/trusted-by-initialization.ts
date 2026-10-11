import path from 'node:path'
import { readFile } from 'node:fs/promises'
import type { Payload } from 'payload'

const defaultLogos = [
  { name: 'IQVIA', source: 'brand1.png', filename: 'trusted-by-iqvia.png' },
  { name: 'Manipal Hospitals', source: 'brand2.png', filename: 'trusted-by-manipal-hospitals.png' },
  { name: 'Redmonk Wellness', source: 'brand3.png', filename: 'trusted-by-redmonk-wellness.png' },
  { name: 'Team Taurus', source: 'brand4.png', filename: 'trusted-by-team-taurus.png' },
] as const

export async function initializeTrustedBy(payload: Pick<Payload, 'findGlobal' | 'find' | 'create' | 'updateGlobal'>, root: string, verifyImage?: (url: string) => Promise<void>) {
  const current = await payload.findGlobal({ slug: 'home-brands', depth: 0, overrideAccess: true })
  // An existing empty list may have been deliberately cleared by an editor.
  if (current.id != null) return { created: false, reason: 'Trusted By is already configured; existing content was preserved.' }

  const brands = []
  for (const logo of defaultLogos) {
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: logo.filename } }, limit: 1, depth: 0, overrideAccess: true })
    let media = existing.docs[0]
    if (!media) {
      const bytes = await readFile(path.join(root, 'public/brands', logo.source))
      media = await payload.create({
        collection: 'media', data: { alt: logo.name }, overrideAccess: true,
        file: { data: bytes, name: logo.filename, mimetype: 'image/png', size: bytes.length },
      })
    }
    if (verifyImage) {
      if (!media.url) throw new Error(`No public URL returned for ${logo.name}`)
      await verifyImage(media.url)
    }
    brands.push({ name: logo.name, logo: media.id })
  }
  // Recheck after uploads to avoid replacing edits made while this ran.
  const latest = await payload.findGlobal({ slug: 'home-brands', depth: 0, overrideAccess: true })
  if (latest.id != null) return { created: false, reason: 'Trusted By was configured during initialization; existing content was preserved.' }
  await payload.updateGlobal({ slug: 'home-brands', data: { label: 'Trusted by', brands }, overrideAccess: true })
  return { created: true, count: brands.length }
}
