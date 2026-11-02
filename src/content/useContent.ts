import { useQuery } from '@tanstack/react-query'
import { ENV } from '../config/env'
import { parsePublishedProjection, type PublishedProjection } from './contract'

export function usePublishedContent() {
  return useQuery<PublishedProjection>({
    queryKey: ['published-content', ENV.CONTENT_PROJECTION_URL],
    queryFn: async () => {
      const response = await fetch(ENV.CONTENT_PROJECTION_URL, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`Gagal memuat konten (${response.status})`)
      }
      const json: unknown = await response.json()
      return parsePublishedProjection(json)
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

