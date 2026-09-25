/**
 * Blog helpers — client-safe (pure functions only).
 *
 * Date formatting, reading-time estimates and plain-text extraction for
 * journal posts. The Lexical walkers below only depend on the shape of
 * serialized editor state, never on Payload itself.
 */

import type { PostData } from './cms'

const BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'listitem',
  'quote',
  'list',
])

/** Collect plain text from a serialized Lexical editor state. */
export function postPlainText(content: unknown): string {
  const parts: string[] = []
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (!node || typeof node !== 'object') return
    const n = node as {
      type?: unknown
      text?: unknown
      children?: unknown
    }
    if (typeof n.text === 'string') {
      parts.push(n.text)
      return
    }
    if (Array.isArray(n.children)) {
      n.children.forEach(visit)
      if (typeof n.type === 'string' && BLOCK_TYPES.has(n.type)) {
        parts.push(' ')
      }
    } else if (n.children) {
      visit(n.children)
    }
  }
  const root = (content as { root?: unknown } | null)?.root ?? content
  visit(root)
  return parts.join('').replace(/\s+/g, ' ').trim()
}

/** Meta/share description: explicit SEO text → excerpt → content fallback. */
export function postDescription(post: PostData): string {
  const explicit = post.seoDescription?.trim() || post.excerpt?.trim()
  if (explicit) return explicit
  const text = postPlainText(post.content)
  if (text.length <= 160) return text
  return text.slice(0, 157).trimEnd() + '…'
}

/** Rough reading time from the article body. */
export function readingTimeOf(content: unknown): string {
  const words = postPlainText(content).split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

/** “9 September 2026” style date for the journal index and articles. */
export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
