import config from '@payload-config'
import '@payloadcms/next/css'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Next 16 types `searchParams` values as possibly `undefined`; Payload's
 * admin views still expect the older `{ [key: string]: string | string[] }`
 * shape. Real query params are never undefined, so the boundary is
 * adapted once here instead of touching Payload's views.
 */
const toLegacySearchParams = (
  searchParams: Args['searchParams'],
): Promise<{ [key: string]: string | string[] }> =>
  searchParams.then((params) =>
    Object.fromEntries(
      Object.entries(params).filter(
        (entry): entry is [string, string | string[]] =>
          entry[1] !== undefined,
      ),
    ),
  )

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({
    config,
    params,
    searchParams: toLegacySearchParams(searchParams),
  })

const Page = ({ params, searchParams }: Args) => (
  <RootPage
    config={config}
    importMap={importMap}
    params={params}
    searchParams={toLegacySearchParams(searchParams)}
  />
)

export default Page
