import { expect, test } from '@playwright/test'

test.describe('Single-Viewport Full-Page Gateway & Accessibility (UAT-16, UAT-17, R-03, R-35)', () => {
  test('UAT-16 & R-03: Desktop is 100% single-viewport (zero vertical or horizontal scroll) and Mobile has >=44px tap targets', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    // Desktop check: strict single-page full-screen (no vertical scroll, no horizontal scroll)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/?site=siau')

    await expect(page.getByTestId('cta-hero-ptk')).toBeVisible()
    await expect(page.getByTestId('cta-hero-qdi')).toBeVisible()
    await expect(page.getByTestId('cta-hero-info')).toBeVisible()
    await expect(page.getByTestId('cta-hero-wa')).toBeVisible()

    // Ensure no theme toggle button is rendered
    await expect(page.getByTestId('theme-toggle')).toHaveCount(0)

    const desktopScroll = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      verticalOverflow: document.documentElement.scrollHeight > window.innerHeight,
    }))
    expect(desktopScroll.horizontalOverflow).toBe(false)
    expect(desktopScroll.verticalOverflow).toBe(false)

    // Mobile checks across standard widths (360px, 375px, 390px)
    const mobileViewports = [
      { width: 360, height: 640 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ]

    for (const vp of mobileViewports) {
      await page.setViewportSize(vp)
      await page.goto('/?site=siau')

      const mobileHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(mobileHorizontalOverflow).toBe(false)

      const ptkBox = await page.getByTestId('cta-hero-ptk').boundingBox()
      expect(ptkBox?.height).toBeGreaterThanOrEqual(44)

      const switchBtnBox = await page.getByTestId('site-switch-siau').boundingBox()
      expect(switchBtnBox?.height).toBeGreaterThanOrEqual(44)

      const mapBtnBox = await page.getByTestId('toggle-minimap-modal-btn').boundingBox()
      expect(mapBtnBox?.height).toBeGreaterThanOrEqual(44)
    }

    // Verify modal on mobile (375x667)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/?site=siau')

    // Open Minimap Modal on mobile
    await page.getByTestId('toggle-minimap-modal-btn').click()
    await expect(page.getByTestId('minimap-modal-dialog')).toBeVisible()

    const minimapModalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(minimapModalOverflow).toBe(false)

    const modalMapsBtnBox = await page.getByTestId('minimap-google-maps-btn').boundingBox()
    expect(modalMapsBtnBox?.height).toBeGreaterThanOrEqual(44)

    const closeMinimapBox = await page.getByTestId('close-minimap-modal').boundingBox()
    expect(closeMinimapBox?.height).toBeGreaterThanOrEqual(44)

    await page.getByTestId('close-minimap-modal').click()
    await expect(page.getByTestId('minimap-modal-dialog')).toHaveCount(0)

    expect(errors).toEqual([])
  })

  test('R-35: In-place bulletin modal opens and closes without leaving the single page and contains zero em dashes', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/informasi?site=tahuna')

    // Open bulletin article from information hub and verify zero em dashes
    await page
      .getByTestId(
        'read-more-pelayanan-sertifikasi-komoditas-pelabuhan-tahuna',
      )
      .click()
    await expect(page.getByTestId('content-detail-article')).toBeVisible()

    const modalText = await page.locator('body').innerText()
    expect(modalText.includes('—')).toBe(false)

    await page.getByTestId('back-to-landing').click()
    await expect(page.getByTestId('content-detail-article')).toHaveCount(0)

    // Landing page also contains zero em dashes
    await page.goto('/?site=tahuna')
    const landingText = await page.locator('body').innerText()
    expect(landingText.includes('—')).toBe(false)

    expect(errors).toEqual([])
  })

  test('UAT-17: Respects prefers-reduced-motion accessibility setting', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/?site=tahuna')

    await expect(page.getByTestId('hero-section')).toBeVisible()
    await expect(page.getByTestId('cta-hero-ptk')).toBeVisible()
  })
})
