import { expect, test } from '@playwright/test'

test.describe('Content Projection, Site Scope & Draft Protection (UAT-11, UAT-12, FR-008)', () => {
  test('UAT-11 / FR-012: Non-published (DRAFT) items are never visible in public portal', async ({
    page,
  }) => {
    await page.goto('/informasi')
    await expect(page.getByTestId('information-cards-grid')).toBeVisible()

    // Draft item in sample.json must never render on public information hub
    await expect(
      page.getByTestId('info-card-draft-internal-belum-dipublikasikan'),
    ).toHaveCount(0)

    // Navigating directly to the draft slug must show not-found/unreleased alert
    await page.goto('/konten/draft-internal-belum-dipublikasikan')
    await expect(page.getByTestId('content-detail-not-found')).toBeVisible()
  })

  test('UAT-12 / FR-007 & FR-008: Site-scoped content prioritizes local items and includes GLOBAL fallback', async ({
    page,
  }) => {
    await page.goto('/informasi?site=siau')
    await expect(page.getByTestId('information-cards-grid')).toBeVisible()

    // Local Siau item is visible
    await expect(
      page.getByTestId('info-card-jadwal-layanan-pelabuhan-ulow-ondong-siau'),
    ).toBeVisible()

    // Global item is also visible as fallback/general info
    await expect(
      page.getByTestId('info-card-penguatan-akses-digital-kepulauan-sulut'),
    ).toBeVisible()

    // Tahuna-only item is NOT shown when site=siau
    await expect(
      page.getByTestId(
        'info-card-pelayanan-sertifikasi-komoditas-pelabuhan-tahuna',
      ),
    ).toHaveCount(0)
  })

  test('Phase 4A: Card 3 opens Full Page Information & Multimedia Hub with video, photo, category filters, and detail article', async ({
    page,
  }) => {
    await page.goto('/?site=siau')

    // 1. Open Full Page Information from Card 3
    await page.getByTestId('cta-hero-info').click()
    await expect(page.getByTestId('information-page')).toBeVisible()

    // 2. Draft item is NEVER visible on information page
    await expect(
      page.getByTestId('info-card-draft-internal-belum-dipublikasikan'),
    ).toHaveCount(0)

    // 3. Local Siau announcement item is visible
    await expect(
      page.getByTestId('info-card-jadwal-layanan-pelabuhan-ulow-ondong-siau'),
    ).toBeVisible()

    // 4. Service guide item is directly visible in the unified feed
    await expect(
      page.getByTestId('info-card-panduan-permohonan-ptk-online'),
    ).toBeVisible()

    // 5. Click read more opens ContentDetail page with rich media
    await page
      .getByTestId('read-more-panduan-permohonan-ptk-online')
      .click()
    await expect(page.getByTestId('content-detail-article')).toBeVisible()
    await expect(page.getByTestId('content-detail-article')).toContainText(
      'Panduan Permohonan Tindakan Karantina',
    )

    // 6. Back button returns to landing
    await page.getByTestId('back-to-landing').click()
    await expect(page.getByTestId('hero-section')).toBeVisible()
  })

  test('Phase 4B (Sanity CMS Adapter): Transforms Sanity response, blocks drafts.*, and renders video + PDF attachment', async ({
    page,
  }) => {
    await page.route('**/content/sample.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: [
            {
              _id: 'sanity-doc-sulut-01',
              _type: 'karantinaContent',
              _updatedAt: '2026-10-20T08:30:00Z',
              title: 'Rilis Resmi Sanity CMS BKHIT Sulawesi Utara',
              slug: { current: 'rilis-resmi-sanity-cms-bkhit' },
              summary: 'Pengumuman resmi dengan lampiran video MP4 dan dokumen PDF.',
              body: 'Paragraf pertama rincian informasi.\n\nParagraf kedua rincian informasi.',
              category: 'announcement',
              siteScope: 'GLOBAL',
              status: 'PUBLISHED',
              mediaImage: {
                asset: { url: '/hero/sulut.jpg' },
              },
              videoFile: {
                asset: { url: '/media/sample-video.mp4' },
              },
              documentFile: {
                asset: { url: '/media/panduan-ptk-online.pdf' },
              },
            },
            {
              _id: 'drafts.sanity-doc-rahasia-99',
              _type: 'karantinaContent',
              _updatedAt: '2026-10-21T08:30:00Z',
              title: 'DRAF INTERNAL SANITY',
              slug: { current: 'draf-internal-sanity' },
              summary: 'Tidak boleh tampil di publik.',
              category: 'announcement',
              siteScope: 'GLOBAL',
              status: 'PUBLISHED',
            },
          ],
        }),
      })
    })

    await page.goto('/informasi?site=sulut')
    await expect(
      page.getByTestId('info-card-rilis-resmi-sanity-cms-bkhit'),
    ).toBeVisible()
    await expect(
      page.getByTestId('info-card-draf-internal-sanity'),
    ).toHaveCount(0)

    await page
      .getByTestId('read-more-rilis-resmi-sanity-cms-bkhit')
      .click()
    await expect(page.getByTestId('content-detail-article')).toBeVisible()
    await expect(page.getByTestId('content-detail-document')).toBeVisible()
  })
})

