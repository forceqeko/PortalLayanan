import { expect, test } from '@playwright/test'

test.describe('Site Context Engine & Geo-Aware Landing (UAT-02..07, UAT-19)', () => {
  test('UAT-02: Captive redirect ?site=siau renders Siau context', async ({ page }) => {
    await page.goto('/?site=siau')
    await expect(page.getByTestId('active-site-label')).toHaveText(
      'Siau, Kepulauan Sitaro',
    )
    await expect(page.getByTestId('hero-section')).toHaveAttribute('data-site', 'siau')
    await expect(page.getByTestId('hero-region-badge')).toContainText('Siau')
  })

  test('UAT-03: Captive redirect ?site=tahuna renders Tahuna context', async ({ page }) => {
    await page.goto('/?site=tahuna')
    await expect(page.getByTestId('active-site-label')).toHaveText(
      'Tahuna, Kepulauan Sangihe',
    )
    await expect(page.getByTestId('hero-section')).toHaveAttribute('data-site', 'tahuna')
  })

  test('UAT-04: Captive redirect ?site=melonguane renders Melonguane context', async ({
    page,
  }) => {
    await page.goto('/?site=melonguane')
    await expect(page.getByTestId('active-site-label')).toHaveText(
      'Melonguane, Kepulauan Talaud',
    )
    await expect(page.getByTestId('hero-section')).toHaveAttribute(
      'data-site',
      'melonguane',
    )
  })

  test('UAT-05: Direct access without site param defaults to Sulawesi Utara', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('active-site-label')).toHaveText('Sulawesi Utara')
    await expect(page.getByTestId('hero-section')).toHaveAttribute('data-site', 'sulut')
  })

  test('UAT-06 & UAT-07: Manual location switch updates regional hero & context without error', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByTestId('site-switch-siau').click()
    await expect(page.getByTestId('active-site-label')).toHaveText(
      'Siau, Kepulauan Sitaro',
    )

    await page.getByTestId('site-switch-tahuna').click()
    await expect(page.getByTestId('active-site-label')).toHaveText(
      'Tahuna, Kepulauan Sangihe',
    )

    await page.getByTestId('site-switch-melonguane').click()
    await expect(page.getByTestId('active-site-label')).toHaveText(
      'Melonguane, Kepulauan Talaud',
    )
  })

  test('UAT-19: Invalid site parameter falls back safely to Sulawesi Utara', async ({
    page,
  }) => {
    await page.goto('/?site=unknown-island')
    await expect(page.getByTestId('active-site-label')).toHaveText('Sulawesi Utara')
    await expect(page.getByTestId('invalid-site-banner')).toBeVisible()
  })

  test('Phase 3: Regional Service Point Info, Real Standard Map & Dynamic WhatsApp', async ({
    page,
  }) => {
    await page.goto('/?site=siau')

    // 1. Regional service context label
    await expect(page.getByTestId('active-site-label')).toContainText('Siau')
    await expect(page.getByTestId('hero-region-badge')).toContainText('Pos Pelayanan Karantina Siau')

    // 2. Dynamic WhatsApp message includes site context and verified official WA Center number
    const waHref = await page.getByTestId('cta-hero-wa').getAttribute('href')
    expect(waHref).toContain('6282190899090')
    const decodedWa = decodeURIComponent(waHref || '').replace(/\+/g, ' ')
    expect(decodedWa).toContain('Pos Pelayanan Siau')

    // 3. Open Minimap modal from bottom bar
    await page.getByTestId('toggle-minimap-modal-btn').click()
    await expect(page.getByTestId('minimap-modal-dialog')).toBeVisible()
    await expect(page.getByTestId('archipelago-minimap')).toBeVisible()

    // 4. Verify Google Maps only (no OSM) and regional port coordinates
    await expect(page.getByTestId('gmaps-badge')).toBeVisible()
    await expect(page.getByText('OpenStreetMap')).toHaveCount(0)
    await expect(page.getByTestId('archipelago-minimap')).toContainText('Pelabuhan Ulu Siau')
    await expect(page.getByTestId('archipelago-minimap')).toContainText('Pelabuhan Ondong')
    await expect(page.getByTestId('minimap-google-maps-btn')).toHaveAttribute(
      'href',
      /google\.com\/maps\/search\/\?api=1&query=2\.728/,
    )

    // 5. Close minimap modal
    await page.getByTestId('close-minimap-modal').click()
    await expect(page.getByTestId('minimap-modal-dialog')).toHaveCount(0)
  })
})
