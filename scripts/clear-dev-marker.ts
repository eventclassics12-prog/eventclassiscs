import { getPayload } from 'payload'
import config from '../payload.config'

async function main(): Promise<void> {
  const payload = await getPayload({ config })
  try {
    const res = await payload.delete({
      collection: 'payload-migrations',
      where: { batch: { equals: -1 } },
      overrideAccess: true,
    })
    const cleared = res.docs?.length ?? 0
    console.log(
      cleared > 0
        ? `Cleared ${cleared} stale dev-push migration marker(s); "payload migrate" will run without prompting.`
        : 'No dev-push migration markers found; "payload migrate" will run without prompting.',
    )
  } catch {
    console.log('Skipping dev-push marker cleanup (migrations table not present yet).')
  }
  const db = payload.db as unknown as { destroy?: () => Promise<void> }
  if (typeof db.destroy === 'function') {
    await db.destroy()
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
