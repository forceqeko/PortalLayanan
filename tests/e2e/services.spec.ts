import { expect, test } from '@playwright/test'

test.describe('Service Integration & Allowlist Security (UAT-08, UAT-09, UAT-13, FR-015)', () => {
  test('UAT-08, UAT-09, UAT-13: All 4 main gateway menus point to trusted external redirect URLs', async ({
    page,
  }) => {
    await page.goto('/?site=tahuna')

    const ptkHref = await page.getByTestId('cta-hero-ptk').getAttribute('href')
    expect(ptkHref).toBe('https://ptk.karantinaindonesia.go.id/')

    const qdiHref = await page.getByTestId('cta-hero-qdi').getAttribute('href')
    expect(qdiHref).toContain('https://qdi.karantinaindonesia.go.id/')

    // Card 3 opens Full Page Information & Multimedia Hub
    await page.getByTestId('cta-hero-info').click()
    await expect(page.getByTestId('information-page')).toBeVisible()
    await page.getByTestId('back-to-landing').click()
    await expect(page.getByTestId('hero-section')).toBeVisible()

    const waHref = await page.getByTestId('cta-hero-wa').getAttribute('href')
    expect(waHref).toContain('https://wa.me/6282190899090')
  })

  test('FR-015: Arbitrary redirect query parameters never alter service CTA targets', async ({
    page,
  }) => {
    await page.goto(
      '/?site=https://evil.example.com&redirect=https://evil.example.com&ptk=https://evil.example.com',
    )

    await expect(page.getByTestId('active-site-label')).toHaveText('Sulawesi Utara')
    const ptkHref = await page.getByTestId('cta-hero-ptk').getAttribute('href')
    expect(ptkHref).toBe('https://ptk.karantinaindonesia.go.id/')
  })
})
