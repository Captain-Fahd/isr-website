import { expect, test } from '@playwright/test'

test.describe('Contact', () => {
  test('submits the contact form successfully against the API', async ({ page }) => {
    await page.goto('/contact/')

    await expect(page.getByRole('heading', { level: 1, name: 'Get In Touch' })).toBeVisible()

    await page.getByLabel(/^Name/).fill('Omar')
    await page.getByLabel(/^Email/).fill('omar@example.com')
    await page.getByLabel(/^Subject/).fill('E2E hello')
    await page.getByLabel(/^Message/).fill('Assalamu alaikum from Playwright.')
    await page.getByRole('button', { name: 'Send Message' }).click()

    await expect(page.getByRole('heading', { name: 'Message Sent!' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(
      page.getByText("Jazakallah khayran for reaching out. We'll get back to you soon"),
    ).toBeVisible()
  })

  test('shows an API error message when contact submission fails', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to send email' }),
      })
    })

    await page.goto('/contact/')
    await page.getByLabel(/^Name/).fill('Omar')
    await page.getByLabel(/^Email/).fill('omar@example.com')
    await page.getByLabel(/^Subject/).fill('E2E fail')
    await page.getByLabel(/^Message/).fill('This should surface the API error.')
    await page.getByRole('button', { name: 'Send Message' }).click()

    await expect(page.getByText('Failed to send email')).toBeVisible()
  })

  test('keeps the user on the form when browser validation blocks empty submit', async ({
    page,
  }) => {
    await page.goto('/contact/')
    await page.getByRole('button', { name: 'Send Message' }).click()

    await expect(page.getByRole('heading', { name: 'Send us a message' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Message Sent!' })).toHaveCount(0)
  })
})
