import { expect, test } from '@playwright/test'

test.describe('Resilience & Graceful Failure (UAT-18, FR-014, NFR-05)', () => {
  test('UAT-18: Content projection failure shows error state while PTK/QDI/WA CTAs remain 100% functional', async ({
    page,
  }) => {
    await page.route('**/content/sample.json', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upstream failure' }),
      }),
    )

    await page.goto('/informasi?site=melonguane')
    await expect(page.getByTestId('content-error-state')).toBeVisible()

    // Primary service CTAs on landing page must remain intact and clickable
    await page.goto('/?site=melonguane')
    const ptkCta = page.getByTestId('cta-hero-ptk')
    await expect(ptkCta).toBeVisible()
    await expect(ptkCta).toHaveAttribute(
      'href',
      'https://ptk.karantinaindonesia.go.id/',
    )

    const qdiCta = page.getByTestId('cta-hero-qdi')
    await expect(qdiCta).toBeVisible()

    const waCta = page.getByTestId('cta-hero-wa')
    await expect(waCta).toBeVisible()
  })
})

