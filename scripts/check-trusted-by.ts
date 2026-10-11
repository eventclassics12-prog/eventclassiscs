import assert from 'node:assert/strict'
import { initializeTrustedBy } from './trusted-by-initialization'
import type { Payload } from 'payload'

let global: Record<string, unknown> = {}
const media: { id: number; filename: string; url: string }[] = []
let saves = 0
const mock = {
  findGlobal: async () => global,
  find: async ({ where }: { where: { filename: { equals: string } } }) => ({ docs: media.filter(item => item.filename === where.filename.equals) }),
  create: async ({ file }: { file: { name: string } }) => {
    const item = { id: media.length + 1, filename: file.name, url: `https://example.test/${file.name}` }
    media.push(item)
    return item
  },
  updateGlobal: async ({ data }: { data: Record<string, unknown> }) => { saves++; global = { id: 1, ...data }; return global },
} as unknown as Pick<Payload, 'findGlobal' | 'find' | 'create' | 'updateGlobal'>
const root = process.cwd()
assert.deepEqual(await initializeTrustedBy(mock, root), { created: true, count: 4 })
assert.equal(media.length, 4)
assert.equal((global.brands as unknown[]).length, 4)
assert.equal(saves, 1)
assert.equal((await initializeTrustedBy(mock, root)).created, false)
assert.equal(media.length, 4, 'Repeat runs must not duplicate logos')
global = { id: 1, brands: [] }
assert.equal((await initializeTrustedBy(mock, root)).created, false, 'An explicitly cleared list must stay empty')
global = { id: 1, brands: [{ name: 'Custom client', logo: 100 }] }
assert.equal((await initializeTrustedBy(mock, root)).created, false, 'Existing custom logos must not be replaced')
assert.deepEqual(global.brands, [{ name: 'Custom client', logo: 100 }])
assert.equal(saves, 1)
console.log('PASS missing Trusted By initialization, repeat runs, empty lists, and custom logos')
