import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    description:
      'Every image and video on the site lives here. Upload a new file, then pick it from the relevant section (Home → Success Stories, Pages → About, etc.).',
  },
  upload: {
    // Files land inside Next.js `public/` so they are served as-is.
    staticDir: path.resolve(dirname, '../../../public/media'),
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Short description used for accessibility.',
      },
    },
  ],
}
