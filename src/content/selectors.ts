import type { SiteKey } from '../config/sites'
import type { ContentSiteScope, PublishedContentItem } from './contract'

const SITE_TO_SCOPE: Record<SiteKey, ContentSiteScope> = {
  sulut: 'GLOBAL',
  siau: 'SIAU',
  tahuna: 'TAHUNA',
  melonguane: 'MELONGUANE',
}

// Rejects non-PUBLISHED or expired items on the client as defense-in-depth (FR-012).
export function isPubliclyVisible(
  item: PublishedContentItem,
  now: Date = new Date(),
): boolean {
  if (item.status !== 'PUBLISHED') {
    return false
  }

  if (item.publishAt) {
    const pubTime = Date.parse(item.publishAt)
    if (!Number.isNaN(pubTime) && pubTime > now.getTime()) {
      return false
    }
  }

  if (item.expireAt) {
    const expTime = Date.parse(item.expireAt)
    if (!Number.isNaN(expTime) && expTime <= now.getTime()) {
      return false
    }
  }

  return true
}

export function selectContentForSite(
  items: PublishedContentItem[],
  site: SiteKey,
): PublishedContentItem[] {
  const targetScope = SITE_TO_SCOPE[site]
  const visible = items.filter((item) => isPubliclyVisible(item))

  const scoped = visible.filter((item) => {
    if (site === 'sulut') {
      return true
    }
    return item.siteScope === targetScope || item.siteScope === 'GLOBAL'
  })

  return scoped.sort((a, b) => {
    const aIsLocal = site !== 'sulut' && a.siteScope === targetScope ? 0 : 1
    const bIsLocal = site !== 'sulut' && b.siteScope === targetScope ? 0 : 1
    if (aIsLocal !== bIsLocal) return aIsLocal - bIsLocal

    const orderDiff = (a.sortOrder ?? 50) - (b.sortOrder ?? 50)
    if (orderDiff !== 0) return orderDiff

    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  })
}

export function splitContentSections(items: PublishedContentItem[]) {
  const updates = items.filter(
    (item) =>
      item.contentType === 'announcement' ||
      item.contentType === 'article' ||
      item.category === 'announcement' ||
      item.category === 'article',
  )

  const guides = items.filter(
    (item) =>
      item.contentType === 'service' ||
      item.contentType === 'document' ||
      item.contentType === 'faq' ||
      item.category === 'service' ||
      item.category === 'faq' ||
      item.category === 'document',
  )

  return { updates, guides }
}
