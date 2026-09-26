import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'
import { Posts } from './src/payload/collections/Posts'
import { SiteSettings } from './src/payload/globals/site'
import {
  HomeHero,
  HomeBrands,
  HomeStatement,
  HomeGap,
  HomeKeepScrolling,
  HomeSuccessStories,
  HomeServices,
  HomeFaq,
} from './src/payload/globals/home'
import {
  PageAbout,
  PageServices,
  PageWork,
  PageContact,
  PageThankYou,
} from './src/payload/globals/pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— EventClassics CMS',
    },
  },
  collections: [Users, Media, Posts],
  globals: [
    SiteSettings,
    HomeHero,
    HomeBrands,
    HomeStatement,
    HomeGap,
    HomeKeepScrolling,
    HomeSuccessStories,
    HomeServices,
    HomeFaq,
    PageAbout,
    PageServices,
    PageWork,
    PageContact,
    PageThankYou,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'insecure-dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'src/migrations'),
  }),
  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
  routes: {
    admin: '/admin',
    api: '/payload-api',
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
