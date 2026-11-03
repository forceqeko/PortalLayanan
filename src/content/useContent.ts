import { useQuery } from '@tanstack/react-query'
import { ENV } from '../config/env'
import { parsePublishedProjection, type PublishedProjection } from './contract'
import {
  buildSanityCdnQueryUrl,
  isSanityConfigured,
  transformSanityResponseToProjection,
} from './sanityAdapter'

export function usePublishedContent() {
  const sanityActive = isSanityConfigured(ENV.SANITY_PROJECT_ID)
  const sourceKey = sanityActive
    ? `sanity:${ENV.SANITY_PROJECT_ID}:${ENV.SANITY_DATASET}`
    : ENV.CONTENT_PROJECTION_URL

  return useQuery<PublishedProjection>({
    queryKey: ['published-content', sourceKey],
    queryFn: async () => {
      if (sanityActive) {
        const sanityUrl = buildSanityCdnQueryUrl({
          projectId: ENV.SANITY_PROJECT_ID,
          dataset: ENV.SANITY_DATASET,
          apiVersion: ENV.SANITY_API_VERSION,
        })
        const response = await fetch(sanityUrl, {
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) {
          throw new Error(`Gagal memuat konten Sanity CDN (${response.status})`)
        }
        const json: unknown = await response.json()
        return transformSanityResponseToProjection(json)
      }

      const response = await fetch(ENV.CONTENT_PROJECTION_URL, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`Gagal memuat konten (${response.status})`)
      }
      const json: unknown = await response.json()
      // Mendukung format PublishedProjection standar maupun respons Sanity mentah
      if (
        json &&
        typeof json === 'object' &&
        Array.isArray((json as Record<string, unknown>).result)
      ) {
        return transformSanityResponseToProjection(json)
      }
      return parsePublishedProjection(json)
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
