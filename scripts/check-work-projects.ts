import assert from 'node:assert/strict'
import { PROJECTS, resolveProjects } from '../src/lib/work'

assert.equal(resolveProjects(null), PROJECTS, 'Missing CMS data keeps bundled projects')
assert.equal(resolveProjects({}), PROJECTS, 'An absent project list keeps bundled projects')
assert.deepEqual(resolveProjects({ projects: [] }), [], 'A deliberately cleared list stays empty')
const projects = resolveProjects({ projects: [
  { title: 'First project', slug: 'custom-url', flagship: true, cardTags: [{ value: 'Branding' }] },
  { title: 'Second project', slug: 'custom-url', flagship: false },
] })
assert.deepEqual(projects.map(project => project.slug), ['custom-url', 'custom-url-2'])
assert.equal(projects[0].flagship, true)
assert.equal(projects[1].flagship, false)
assert.deepEqual(projects[0].cardTags, ['Branding'])
console.log('PASS project fallbacks, deliberate empty list, unique CMS slugs, flagship and tags')
