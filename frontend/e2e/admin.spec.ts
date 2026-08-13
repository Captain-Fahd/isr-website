import { expect, test, type Page } from '@playwright/test'

const TOKEN_KEY = 'admin_token'
const FAKE_TOKEN = 'e2e-fake-access-token'

/**
 * The admin panel authenticates against Supabase, which the e2e stack does not
 * run. These specs cover the client-side guard and the login flow by stubbing
 * /api/auth/signin, so no Supabase instance is required.
 */

async function seedToken(page: Page, token = FAKE_TOKEN) {
  // addInitScript runs before app code, so the layout's token check sees it.
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [TOKEN_KEY, token] as const,
  )
}

async function stubSignIn(page: Page, status: number, body: unknown) {
  await page.route('**/api/auth/signin', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
}

async function stubEmptyAdminLists(page: Page) {
  await page.route('**/api/events', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })
  await page.route('**/api/announcements', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })
}

async function fillLogin(page: Page, email: string, password: string) {
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
}

test.describe('Admin route guard', () => {
  test('redirects the admin index to the login page when signed out', async ({ page }) => {
    await page.goto('/admin/')

    await expect(page).toHaveURL(/\/admin\/login\/?$/)
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible()
  })

  test('redirects the events page to login when signed out', async ({ page }) => {
    await page.goto('/admin/events/')

    await expect(page).toHaveURL(/\/admin\/login\/?$/)
  })

  test('redirects the announcements page to login when signed out', async ({ page }) => {
    await page.goto('/admin/announcements/')

    await expect(page).toHaveURL(/\/admin\/login\/?$/)
  })

  test('never renders admin content before the token check resolves', async ({ page }) => {
    await page.goto('/admin/events/')

    await expect(page).toHaveURL(/\/admin\/login\/?$/)
    await expect(page.getByText('ISR Admin')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Log out' })).toHaveCount(0)
  })

  test('keeps the admin panel out of search results', async ({ page }) => {
    await page.goto('/admin/login/')

    const robots = page.locator('meta[name="robots"]')
    await expect(robots).toHaveAttribute('content', /noindex/)
  })
})

test.describe('Admin login', () => {
  test('renders the sign-in form', async ({ page }) => {
    await page.goto('/admin/login/')

    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible()
    await expect(page.getByText('Sign in to manage content')).toBeVisible()
    await expect(page.locator('#email')).toHaveAttribute('type', 'email')
    await expect(page.locator('#password')).toHaveAttribute('type', 'password')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('surfaces the API error message on bad credentials', async ({ page }) => {
    await stubSignIn(page, 400, { error: 'Invalid login credentials' })

    await page.goto('/admin/login/')
    await fillLogin(page, 'admin@isr.org', 'wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid login credentials')).toBeVisible()
    // A failed sign-in must not leave the user on a protected route.
    await expect(page).toHaveURL(/\/admin\/login\/?$/)
  })

  test('does not store a token when sign-in fails', async ({ page }) => {
    await stubSignIn(page, 400, { error: 'Invalid login credentials' })

    await page.goto('/admin/login/')
    await fillLogin(page, 'admin@isr.org', 'wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Invalid login credentials')).toBeVisible()

    const stored = await page.evaluate((key) => window.localStorage.getItem(key), TOKEN_KEY)
    expect(stored).toBeNull()
  })

  test('falls back to a generic message when the API sends no error text', async ({ page }) => {
    await stubSignIn(page, 500, {})

    await page.goto('/admin/login/')
    await fillLogin(page, 'admin@isr.org', 'whatever')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Sign in failed')).toBeVisible()
  })

  test('stores the access token and lands on events after a successful sign-in', async ({
    page,
  }) => {
    await stubSignIn(page, 200, { data: { session: { access_token: FAKE_TOKEN } } })
    await stubEmptyAdminLists(page)

    await page.goto('/admin/login/')
    await fillLogin(page, 'admin@isr.org', 'correct-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin\/events\/?$/)
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), TOKEN_KEY)
    expect(stored).toBe(FAKE_TOKEN)
  })

  test('keeps the user on the form when browser validation blocks an empty submit', async ({
    page,
  }) => {
    await page.goto('/admin/login/')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin\/login\/?$/)
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible()
  })

  test('sends an already-signed-in admin straight to events', async ({ page }) => {
    await seedToken(page)
    await stubEmptyAdminLists(page)

    await page.goto('/admin/login/')

    await expect(page).toHaveURL(/\/admin\/events\/?$/)
  })
})

test.describe('Admin shell', () => {
  test.beforeEach(async ({ page }) => {
    await seedToken(page)
    await stubEmptyAdminLists(page)
  })

  test('renders the admin nav for a signed-in admin', async ({ page }) => {
    await page.goto('/admin/events/')

    await expect(page.getByText('ISR Admin')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Events' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Announcements' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
  })

  test('moves between the events and announcements screens', async ({ page }) => {
    await page.goto('/admin/events/')

    await page.getByRole('link', { name: 'Announcements' }).click()
    await expect(page).toHaveURL(/\/admin\/announcements\/?$/)

    await page.getByRole('link', { name: 'Events' }).click()
    await expect(page).toHaveURL(/\/admin\/events\/?$/)
  })

  test('logging out clears the token and returns to the login page', async ({ page }) => {
    await page.goto('/admin/events/')
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()

    await page.getByRole('button', { name: 'Log out' }).click()

    await expect(page).toHaveURL(/\/admin\/login\/?$/)
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), TOKEN_KEY)
    expect(stored).toBeNull()
  })

  test('surfaces a load failure on the events screen', async ({ page }) => {
    await page.route('**/api/events', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch events' }),
      })
    })

    await page.goto('/admin/events/')

    await expect(page.getByText('Failed to load events')).toBeVisible()
  })
})

test.describe('Admin session lifecycle', () => {
  test('a protected route is unreachable again after logging out', async ({ page }) => {
    // Signs in through the real form rather than pre-seeding storage, so the
    // token is genuinely gone once the session ends.
    await stubSignIn(page, 200, { data: { session: { access_token: FAKE_TOKEN } } })
    await stubEmptyAdminLists(page)

    await page.goto('/admin/login/')
    await fillLogin(page, 'admin@isr.org', 'correct-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/admin\/events\/?$/)

    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/admin\/login\/?$/)

    await page.goto('/admin/events/')
    await expect(page).toHaveURL(/\/admin\/login\/?$/)
  })
})
