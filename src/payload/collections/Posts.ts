import type { CollectionConfig } from 'payload'

/**
 * Posts — the Journal / blog.
 *
 * Rendered at /blog (index) and /blog/[slug] (article). A post is listed
 * publicly as soon as `publishedAt` is set to a time in the past; leaving
 * it empty keeps the post as a draft that never appears on the site.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt'],
    description:
      'Journal articles. Set “Published at” to list a post on /blog; leave it empty to keep it as a draft.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && typeof data.title === 'string') {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'URL of the article, e.g. “why-your-brand-is-not-your-logo”. Auto-filled from the title when left empty.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description:
          'One or two lines shown on the /blog index and used as the share description when no SEO description is set.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'EventClassics Studio',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Leave empty to keep this post as a draft. Set to a past date/time to publish it on /blog.',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'Optional override for the browser tab / share title.',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      admin: {
        description: 'Optional override for the meta / share description.',
      },
    },
  ],
}
