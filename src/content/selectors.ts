import type { SiteKey } from '../config/sites'
import type { PublishedContentItem } from './contract'

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

// Universal content selector: returns all publicly visible items sorted by sortOrder and updatedAt.
export function selectUniversalContent(
  items: PublishedContentItem[],
): PublishedContentItem[] {
  const visible = items.filter((item) => isPubliclyVisible(item))

  return visible.sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 50) - (b.sortOrder ?? 50)
    if (orderDiff !== 0) return orderDiff

    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  })
}

export function selectContentForSite(
  items: PublishedContentItem[],
  _site?: SiteKey,
): PublishedContentItem[] {
  void _site
  return selectUniversalContent(items)
}
