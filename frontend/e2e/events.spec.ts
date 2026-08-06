import { expect, test } from '@playwright/test'

test.describe('Events', () => {
  test('lists seeded events and supports filters', async ({ page }) => {
    await page.goto('/events/')

    await expect(page.getByRole('heading', { level: 1, name: 'Events' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Welcome BBQ' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('heading', { name: 'Eid Dinner' })).toBeVisible()

    await page.getByRole('button', { name: 'Upcoming' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome BBQ' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Eid Dinner' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Past' }).click()
    await expect(page.getByRole('heading', { name: 'Eid Dinner' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Welcome BBQ' })).toHaveCount(0)

    await page.getByRole('button', { name: 'All' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome BBQ' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Eid Dinner' })).toBeVisible()
  })

  test('navigates to an event detail page', async ({ page }) => {
    await page.goto('/events/')

    await expect(page.getByRole('heading', { name: 'Welcome BBQ' })).toBeVisible({
      timeout: 15_000,
    })
    await page.getByRole('link', { name: 'View Details' }).first().click()

    await expect(page).toHaveURL(/\/events\/\d+\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome BBQ' })).toBeVisible()
    await expect(
      page.getByText('Kick off the semester with food and community.'),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to Events' })).toBeVisible()
  })

  test('shows an empty state when the filtered list has no events', async ({ page }) => {
    await page.route(
      (url) => url.pathname.endsWith('/api/events') && url.searchParams.get('filter') === 'upcoming',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        })
      },
    )

    await page.goto('/events/')
    await page.getByRole('button', { name: 'Upcoming' }).click()
    await expect(page.getByText('No events yet')).toBeVisible()
    await expect(
      page.getByText('Check back soon for upcoming ISR events and activities.'),
    ).toBeVisible()
  })

  test('shows an error state when the events API fails', async ({ page }) => {
    await page.route('**/api/events**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch events' }),
      })
    })

    await page.goto('/events/')
    await expect(page.getByText('Unable to load events right now.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })

  test('a slow response for the previous filter does not overwrite the selected one', async ({
    page,
  }) => {
    // The initial `all` request resolves slowly and returns an event...
    await page.route(
      (url) => url.pathname.endsWith('/api/events') && !url.searchParams.get('filter'),
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 99,
                name: 'Stale All Event',
                description: 'Belongs to the previously selected filter.',
                date: '2099-03-15T06:00:00.000Z',
                location: 'Nowhere',
                imageUrl: null,
                ticketUrl: null,
              },
            ],
          }),
        })
      },
    )

    // ...while `upcoming` resolves immediately and is empty.
    await page.route(
      (url) => url.pathname.endsWith('/api/events') && url.searchParams.get('filter') === 'upcoming',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        })
      },
    )

    await page.goto('/events/')
    await page.getByRole('button', { name: 'Upcoming' }).click()
    await expect(
      page.getByText('Check back soon for upcoming ISR events and activities.'),
    ).toBeVisible()

    // Wait past the slow response's arrival; it must not clobber the empty state.
    await page.waitForTimeout(2000)
    await expect(page.getByText('Stale All Event')).toHaveCount(0)
    await expect(
      page.getByText('Check back soon for upcoming ISR events and activities.'),
    ).toBeVisible()
  })
})
