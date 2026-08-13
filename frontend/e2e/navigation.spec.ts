import { expect, test } from '@playwright/test'

const MEMBERSHIP_URL = 'https://campus.hellorubric.com/?s=10733'

test.describe('Mobile navbar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('starts collapsed', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Open menu' })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('opens the drawer and exposes every nav link', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Open menu' }).click()

    const toggle = page.getByRole('button', { name: 'Close menu' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const drawer = page.locator('nav')
    for (const label of ['Home', 'Events', 'Announcements', 'Prayer', 'About', 'Contact']) {
      await expect(drawer.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })

  test('closes again when the toggle is pressed twice', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('navigates and collapses the drawer when a link is tapped', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.locator('nav').getByRole('link', { name: 'Events', exact: true }).click()

    await expect(page).toHaveURL(/\/events\/?$/)
    // The drawer resets to closed so it is not left open over the new page.
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('offers the membership link in the drawer', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Open menu' }).click()

    const membership = page.locator('nav').getByRole('link', { name: 'Become a Member' })
    await expect(membership).toHaveAttribute('href', MEMBERSHIP_URL)
    await expect(membership).toHaveAttribute('target', '_blank')
    await expect(membership).toHaveAttribute('rel', /noopener/)
  })

  test('reaches the prayer times page from the drawer', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.locator('nav').getByRole('link', { name: 'Prayer', exact: true }).click()

    await expect(page).toHaveURL(/\/prayer-times\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: /Prayer Times/ })).toBeVisible()
  })
})

test.describe('Footer', () => {
  test('links to the quick-link pages', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    const links: Array<[string, string]> = [
      ['Home', '/'],
      ['Prayer Times', '/prayer-times/'],
      ['Events', '/events/'],
      ['About', '/about/'],
      ['Contact', '/contact/'],
      ['Privacy Policy', '/privacy/'],
      ['Sitemap', '/sitemap.xml'],
    ]

    for (const [label, href] of links) {
      await expect(footer.getByRole('link', { name: label, exact: true })).toHaveAttribute(
        'href',
        href,
      )
    }
  })

  test('links to the external membership page', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.locator('footer').getByRole('link', { name: 'Membership', exact: true }),
    ).toHaveAttribute('href', MEMBERSHIP_URL)
  })

  test('lists every social channel', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    const socials: Array<[string, string]> = [
      ['Instagram', 'https://www.instagram.com/islamicsocietyofrmit/'],
      ['Facebook', 'https://www.facebook.com/RMITIS/'],
      ['LinkedIn', 'https://au.linkedin.com/company/islamic-society-rmit-isr'],
      ['WhatsApp', 'https://api.whatsapp.com/send?phone=61418835013'],
      ['Email', 'mailto:isr@rmit.edu.au'],
    ]

    for (const [label, href] of socials) {
      // Exact, because the newsletter input is also labelled "Email address…".
      await expect(footer.getByRole('link', { name: label, exact: true })).toHaveAttribute(
        'href',
        href,
      )
    }
  })

  test('shows the current year and RUSU affiliation', async ({ page }) => {
    await page.goto('/')

    const year = new Date().getFullYear()
    await expect(page.locator('footer')).toContainText(
      `© ${year} Islamic Society of RMIT. All rights reserved.`,
    )
    await expect(page.locator('footer')).toContainText('Affiliated with RUSU')
  })

  test('navigates to the privacy policy', async ({ page }) => {
    await page.goto('/')

    await page.locator('footer').getByRole('link', { name: 'Privacy Policy' }).click()

    await expect(page).toHaveURL(/\/privacy\/?$/)
  })
})

test.describe('Newsletter signup', () => {
  test('shows a validation message on an empty footer submit', async ({ page }) => {
    await page.goto('/')

    const form = page.locator('footer form')
    await form.getByRole('button', { name: 'Subscribe' }).click()

    await expect(page.getByText('Please enter your email address.')).toBeVisible()
  })

  test('clears the validation message once typing resumes', async ({ page }) => {
    await page.goto('/')

    const form = page.locator('footer form')
    await form.getByRole('button', { name: 'Subscribe' }).click()
    await expect(page.getByText('Please enter your email address.')).toBeVisible()

    await form.getByLabel('Email address for newsletter').fill('student@rmit.edu.au')

    await expect(page.getByText('Please enter your email address.')).toHaveCount(0)
  })

  test('confirms the subscription from the footer', async ({ page }) => {
    await page.goto('/')

    const form = page.locator('footer form')
    await form.getByLabel('Email address for newsletter').fill('student@rmit.edu.au')
    await form.getByRole('button', { name: 'Subscribe' }).click()

    await expect(page.locator('footer').getByText("You're subscribed!")).toBeVisible()
  })

  test('confirms the subscription from the card variant and can reset', async ({ page }) => {
    await page.goto('/about/')

    // The about page renders the card variant in <main> and the footer variant
    // below it, so scope to main.
    const card = page.locator('main form')
    await card.getByLabel('Email address for newsletter').fill('student@rmit.edu.au')
    await card.getByRole('button', { name: 'Subscribe' }).click()

    await expect(page.locator('main').getByText("You're subscribed!")).toBeVisible()

    await page.getByRole('button', { name: 'Subscribe another email' }).click()

    await expect(page.locator('main').getByLabel('Email address for newsletter')).toHaveValue('')
  })

  test('rejects a whitespace-only email', async ({ page }) => {
    await page.goto('/')

    const form = page.locator('footer form')
    await form.getByLabel('Email address for newsletter').fill('   ')
    await form.getByRole('button', { name: 'Subscribe' }).click()

    await expect(page.getByText('Please enter your email address.')).toBeVisible()
  })
})
