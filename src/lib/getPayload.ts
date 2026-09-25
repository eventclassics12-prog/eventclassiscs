import 'server-only'

import { getPayload } from 'payload'
import { cache } from 'react'
import config from '@payload-config'

/**
 * Cached Payload client for server components. Safe to call from any
 * number of pages in one request — the instance is created once.
 */
export const getPayloadClient = cache(() => getPayload({ config }))
