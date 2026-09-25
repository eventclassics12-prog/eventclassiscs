import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./payload.db',
    },
  }),
  routes: {
    admin: '/admin',
    api: '/payload-api',
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
