import { expect, test } from '@playwright/test'

test.describe('About', () => {
  test('renders about content and pillars', async ({ page }) => {
    await page.goto('/about/')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Serving the Muslims on campus since 1993',
      }),
    ).toBeVisible()
    await expect(page.getByText('Prayer & Worship')).toBeVisible()
    await expect(page.getByText('Community & Connection')).toBeVisible()
    await expect(page.getByText('Education & Events')).toBeVisible()
    await expect(page.getByText('Advocacy & Support')).toBeVisible()
  })
})
