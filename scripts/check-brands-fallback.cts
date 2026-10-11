/* eslint-disable @typescript-eslint/no-require-imports -- CJS lets this server-render test ignore CSS imports without a test framework. */
import assert = require('node:assert/strict')
import fs = require('node:fs')
import path = require('node:path')
import React = require('react')
import ReactDOMServer = require('react-dom/server')

// Styles do not affect these server-rendered content checks.
require.extensions['.css'] = () => undefined
const { Brands } = require('../src/components/Brands') as {
  Brands: React.ComponentType<{ data?: import('../src/lib/cms').HomeBrandsData | null }>
}
const render = (data?: import('../src/lib/cms').HomeBrandsData | null) =>
  ReactDOMServer.renderToStaticMarkup(React.createElement(Brands, { data }))
const countImages = (html: string) => (html.match(/<img\b/g) ?? []).length

assert.equal(countImages(render()), 4, 'Missing data must retain the bundled logos')
assert.equal(countImages(render(null)), 4)
assert.equal(countImages(render({ brands: [] })), 4, 'An unsaved empty global must retain the bundled logos')
assert.equal(countImages(render({ id: 1, brands: [] })), 0, 'An intentionally cleared CMS list must stay empty')
const configured = render({ id: 1, brands: [{ name: 'Custom client', logo: { id: 10, url: '/media/custom-logo.png', width: 200, height: 80 } }] })
assert.equal(countImages(configured), 1)
assert.ok(configured.includes('custom-logo.png'), 'A configured logo must replace the defaults')
assert.ok(!configured.includes('IQVIA'), 'Configured CMS rows must not restore demo clients')
assert.equal(countImages(render({ id: 1, brands: [{ name: 'New client', logo: null }] })), 0, 'An incomplete row must not show an unrelated client logo')
for (const filename of ['brand1.png', 'brand2.png', 'brand3.png', 'brand4.png']) {
  assert.ok(fs.statSync(path.join(process.cwd(), 'public/brands', filename)).size > 0)
}
const scripts = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts
assert.ok(!scripts.build.includes('init:trusted-by') && !scripts.build.includes('initialize-trusted-by'), 'Logo import must not run during the production build')
console.log('PASS default logos, unsaved global, deliberate clearing, custom logo replacement, assets, and manual-only import')
