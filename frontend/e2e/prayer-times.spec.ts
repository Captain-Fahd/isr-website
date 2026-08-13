import { expect, test } from '@playwright/test'

// Fixture values come from the e2e API mock (backend/lib/mockPayloads.ts).
const FIXTURE_TIMINGS: Record<string, string> = {
  Fajr: '06:02',
  Dhuhr: '12:22',
  Asr: '14:51',
  Maghrib: '17:09',
  Isha: '18:38',
}

test.describe('Prayer times', () => {
  test('renders the page heading and intro', async ({ page }) => {
    await page.goto('/prayer-times/')

    await expect(
      page.getByRole('heading', { level: 1, name: /Prayer Times & Jumu'ah at RMIT/ }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Daily prayer times' })).toBeVisible()
  })

  test('loads the five daily prayers with the mocked timings', async ({ page }) => {
    await page.goto('/prayer-times/')

    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 15_000 })

    for (const [prayer, time] of Object.entries(FIXTURE_TIMINGS)) {
      const row = table.locator('tr', { hasText: prayer })
      await expect(row).toContainText(time)
    }

    // Sunrise/Sunset are returned by the API but must not appear as prayers.
    await expect(table).not.toContainText('Sunrise')
    await expect(table).not.toContainText('Imsak')
  })

  test('marks exactly one prayer as next', async ({ page }) => {
    await page.goto('/prayer-times/')

    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 15_000 })
    await expect(table.getByText('Next', { exact: true })).toHaveCount(1)
  })

  test('shows the readable date, hijri date and Melbourne timezone', async ({ page }) => {
    await page.goto('/prayer-times/')

    await expect(page.getByRole('heading', { name: '06 Aug 2026' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText('12 Ṣafar 1448 AH')).toBeVisible()
    await expect(page.getByText('Melbourne · Australia/Melbourne')).toBeVisible()
  })

  test('shows the current Melbourne weather alongside the timings', async ({ page }) => {
    await page.goto('/prayer-times/')

    // 14.2°C from the WeatherAPI mock, rounded for display.
    await expect(page.getByText('14°C')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByAltText('Partly cloudy')).toBeVisible()
  })

  test("renders the Jumu'ah section with the flyer and contact routes", async ({ page }) => {
    await page.goto('/prayer-times/')

    await expect(page.getByRole('heading', { name: "Jumu'ah at RMIT", exact: true })).toBeVisible()
    await expect(
      page.getByText("Jumu'ah (Friday prayer) is held every Friday at RMIT City and RMIT Bundoora"),
    ).toBeVisible()
    await expect(
      page.getByAltText(/ISR Jumu'ah prayers flyer showing RMIT City Building 47/),
    ).toBeVisible()
    await expect(
      page.getByText('Bundoora start times can shift with daylight saving'),
    ).toBeVisible()

    await expect(page.getByRole('link', { name: 'Message ISR on WhatsApp' })).toHaveAttribute(
      'href',
      'https://api.whatsapp.com/send?phone=61418835013',
    )
    await expect(
      page.getByRole('link', { name: 'isr@rmit.edu.au' }).first(),
    ).toHaveAttribute('href', 'mailto:isr@rmit.edu.au')
  })

  test('lists every campus prayer space with its building and rooms', async ({ page }) => {
    await page.goto('/prayer-times/')

    await expect(page.getByRole('heading', { name: 'Campus prayer spaces' })).toBeVisible()

    const spaces = [
      { name: 'City Campus', building: 'Building 47, Levels 1–3' },
      { name: 'Brunswick Campus', building: 'Building 514, Level 2' },
      { name: 'Bundoora East', building: 'Building 254, Level 1' },
      { name: 'Bundoora West', building: 'Building 202' },
    ]

    for (const space of spaces) {
      const card = page.locator('article', { hasText: space.name }).first()
      await expect(card.getByRole('heading', { name: space.name })).toBeVisible()
      await expect(card).toContainText(space.building)
      await expect(card).toContainText('Brothers')
      await expect(card).toContainText('Sisters')
    }
  })

  test('notes that City campus requires student ID for musallah access', async ({ page }) => {
    await page.goto('/prayer-times/')

    const cityCard = page.locator('article', { hasText: 'City Campus' }).first()
    await expect(cityCard).toContainText('Student ID is required for musallah access')
  })

  test('links onward to the events calendar', async ({ page }) => {
    await page.goto('/prayer-times/')

    await page.getByRole('link', { name: 'See the ISR events calendar' }).click()
    await expect(page).toHaveURL(/\/events\/?$/)
  })

  test('embeds WebPage JSON-LD describing both Jumu\'ah locations', async ({ page }) => {
    await page.goto('/prayer-times/')

    // The layout also emits Organization JSON-LD, so select by @type.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const jsonLd = blocks
      .map((block) => JSON.parse(block))
      .find((block) => block['@type'] === 'WebPage')

    expect(jsonLd).toBeDefined()
    expect(jsonLd.about).toHaveLength(2)
    expect(jsonLd.about[0].address.postalCode).toBe('3053')
    expect(jsonLd.about[1].address.postalCode).toBe('3082')
  })

  test('shows an error state and recovers via Try again', async ({ page }) => {
    let shouldFail = true
    await page.route('**/api/prayer-times**', async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 502,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to fetch prayer times' }),
        })
        return
      }
      await route.fallback()
    })

    await page.goto('/prayer-times/')
    await expect(page.getByText('Unable to load prayer times right now.')).toBeVisible()

    shouldFail = false
    await page.getByRole('button', { name: 'Try again' }).click()

    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('table')).toContainText('06:02')
    await expect(page.getByText('Unable to load prayer times right now.')).toHaveCount(0)
  })

  test('still renders the timings when the weather request fails', async ({ page }) => {
    await page.route('**/api/weather**', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch weather data' }),
      })
    })

    await page.goto('/prayer-times/')

    await expect(page.locator('table')).toContainText('06:02', { timeout: 15_000 })
    await expect(page.getByText('°C')).toHaveCount(0)
  })
})

test.describe('Legacy /jumah route', () => {
  test('redirects to the Jumu\'ah section of the prayer times page', async ({ page }) => {
    await page.goto('/jumah/')

    await expect(page).toHaveURL(/\/prayer-times\/#jumah$/)
    await expect(page.getByRole('heading', { name: "Jumu'ah at RMIT", exact: true })).toBeVisible()
  })
})
