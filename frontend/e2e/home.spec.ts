import { expect, test } from '@playwright/test'

test.describe('Home', () => {
  test('shows brand hero and loads prayer times from the API', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Islamic Society of RMIT' }),
    ).toBeVisible()
    await expect(page.getByText('The Home of Muslim Students at RMIT')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Explore Events' })).toBeVisible()

    await expect(page.getByText("Today's Prayer Times")).toBeVisible()
    await expect(page.getByText('Fajr')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('06:02')).toBeVisible()
    await expect(page.getByText('Dhuhr')).toBeVisible()
  })

  test('desktop nav links reach public pages', async ({ page }) => {
    await page.goto('/')

    const nav = page.locator('nav')
    await nav.getByRole('link', { name: 'Events' }).click()
    await expect(page).toHaveURL(/\/events\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Events' })).toBeVisible()

    await nav.getByRole('link', { name: 'Announcements' }).click()
    await expect(page).toHaveURL(/\/announcements\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Announcements' })).toBeVisible()

    await nav.getByRole('link', { name: 'About' }).click()
    await expect(page).toHaveURL(/\/about\/?$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Serving the Muslims on campus since 1993',
      }),
    ).toBeVisible()

    await nav.getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/\/contact\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Get In Touch' })).toBeVisible()
  })

  test('shows an error state when prayer times fail', async ({ page }) => {
    await page.route('**/api/prayer-times**', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch prayer times' }),
      })
    })

    await page.goto('/')
    await expect(page.getByText('Unable to load prayer times right now.')).toBeVisible()
  })
})
