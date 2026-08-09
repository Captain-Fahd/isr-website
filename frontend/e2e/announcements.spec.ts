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

  test('server-renders announcement titles in the initial HTML', async ({ page }) => {
    const response = await page.goto('/announcements/')
    expect(response?.ok()).toBeTruthy()
    const html = await page.content()
    expect(html).toContain('Welcome to ISR!')
    expect(html).not.toContain('animate-pulse')
  })
})
