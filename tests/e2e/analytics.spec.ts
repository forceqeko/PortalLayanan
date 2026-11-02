import { expect, test } from '@playwright/test'

test.describe('Lightweight Analytics & Zero PII (UAT-14, UAT-15)', () => {
  test('UAT-14 & UAT-15: Emits baseline events without any PII fields', async ({
    page,
  }) => {
    await page.goto('/?site=siau')
    await page.getByTestId('site-switch-tahuna').click()

    const events = await page.evaluate(() => window.__PORTAL_EVENTS__ || [])
    expect(events.length).toBeGreaterThanOrEqual(2)

    const eventNames = events.map((e) => e.event_name)
    expect(eventNames).toContain('portal_view')
    expect(eventNames).toContain('site_switch')

    const forbiddenPiiFields = [
      'name',
      'nik',
      'phone',
      'email',
      'mac',
      'lat',
      'lng',
      'latitude',
      'longitude',
    ]

    for (const evt of events) {
      expect(evt).toHaveProperty('event_name')
      expect(evt).toHaveProperty('timestamp')
      expect(evt).toHaveProperty('session_id')
      expect(evt).toHaveProperty('site_context')
      expect(evt).toHaveProperty('entry_source')
      expect(evt).toHaveProperty('target')
      expect(evt).toHaveProperty('device_class')
      expect(evt).toHaveProperty('release_version')

      for (const pii of forbiddenPiiFields) {
        expect(evt).not.toHaveProperty(pii)
      }
    }
  })
})

