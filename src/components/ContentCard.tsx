/* eslint-disable react-refresh/only-export-components */
import { Link } from 'react-router-dom'
import type { PublishedContentItem } from '../content/contract'
import { useSiteContext } from '../context/site-context'
import { trackEvent } from '../analytics/track'

const TYPE_LABELS: Record<string, string> = {
  announcement: 'Pengumuman',
  article: 'Artikel Sosialisasi',
  service: 'Panduan Layanan',
  document: 'Dokumen Publik',
  faq: 'Tanya Jawab (FAQ)',
  media: 'Media Publik',
}

export function formatIndonesianDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}

export function ContentCard({
  item,
  featured = false,
}: {
  item: PublishedContentItem
  featured?: boolean
}) {
  const { site, entrySource } = useSiteContext()
  const isLocal = item.siteScope !== 'GLOBAL'
  const formattedDate = formatIndonesianDate(item.updatedAt)

  return (
    <article
      data-testid={`content-card-${item.slug}`}
      data-scope={item.siteScope}
      className={`flex flex-col justify-between rounded border bg-[var(--bg-surface)] p-5 sm:p-6 ${
        featured
          ? 'border-2 border-[#0f2d34]'
          : 'border-[var(--border-strong)]'
      }`}
    >
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                isLocal
                  ? 'bg-[#0f2d34] text-[#f5b841]'
                  : 'bg-[var(--bg-muted)] text-[var(--text-primary)]'
              }`}
            >
              {item.siteScope === 'GLOBAL'
                ? 'CAKUPAN: SULUT UMUM'
                : `LOKAL: ${item.siteScope}`}
            </span>
            <span className="font-semibold text-[var(--text-secondary)]">
              {TYPE_LABELS[item.contentType] || item.category}
            </span>
          </div>
          <time
            dateTime={item.updatedAt}
            className="font-mono text-[11px] text-[var(--text-secondary)]"
          >
            {formattedDate}
          </time>
        </div>

        <h3
          className={`font-extrabold leading-snug text-[var(--text-primary)] ${
            featured ? 'text-lg sm:text-xl' : 'text-base'
          }`}
        >
          <Link
            to={`/konten/${encodeURIComponent(item.slug)}?site=${site}`}
            onClick={() =>
              trackEvent({
                event_name: 'content_view',
                site_context: site,
                entry_source: entrySource,
                target: item.slug,
                content_id: item.id,
              })
            }
            className="hover:underline"
          >
            {item.title}
          </Link>
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {item.summary}
        </p>
      </div>

      <div className="mt-5 pt-2">
        <Link
          to={`/konten/${encodeURIComponent(item.slug)}?site=${site}`}
          data-testid={`content-read-${item.slug}`}
          onClick={() =>
            trackEvent({
              event_name: 'content_view',
              site_context: site,
              entry_source: entrySource,
              target: item.slug,
              content_id: item.id,
            })
          }
          className="inline-flex min-h-[44px] items-center rounded border border-[var(--border-strong)] bg-[var(--bg-muted)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0f2d34] hover:bg-[#0f2d34] hover:text-white"
        >
          Baca Rincian Informasi
        </Link>
      </div>
    </article>
  )
}
