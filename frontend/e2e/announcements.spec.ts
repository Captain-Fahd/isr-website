import { expect, test } from '@playwright/test'

test.describe('Announcements', () => {
  test('lists seeded announcements with pinned first', async ({ page }) => {
    await page.goto('/announcements/')

    await expect(page.getByRole('heading', { level: 1, name: 'Announcements' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Welcome to ISR!' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText('Pinned')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Friday Prayer Location Update' }),
    ).toBeVisible()

    const titles = page.locator('article h3')
    await expect(titles.nth(0)).toHaveText('Welcome to ISR!')
    await expect(titles.nth(1)).toHaveText('Friday Prayer Location Update')
  })

  test('shows an empty state when there are no announcements', async ({ page }) => {
    await page.route('**/api/announcements**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/announcements/')
    await expect(page.getByText('No announcements yet')).toBeVisible()
  })

  test('shows an error state when the announcements API fails', async ({ page }) => {
    await page.route('**/api/announcements**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch announcements' }),
      })
    })

    await page.goto('/announcements/')
    await expect(page.getByText('Unable to load announcements right now.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})
