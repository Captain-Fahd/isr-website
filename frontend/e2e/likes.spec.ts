import { expect, test, type Locator, type Page } from '@playwright/test'

/**
 * Each test gets a fresh browser context, so the clientId in localStorage is new
 * every time and the visitor starts out having liked nothing. Counts are asserted
 * relative to what is already stored, since the e2e database is not reset between
 * tests.
 */

const EVENT = 'Welcome BBQ'

/**
 * Matches the button whether or not it is currently liked. A locator keyed on
 * "Like …" alone would slide onto the next card as soon as the label flips.
 */
function likeButton(page: Page, eventName = EVENT): Locator {
  return page.getByRole('button', { name: new RegExp(`^(Like|Unlike) ${eventName}$`) })
}

/**
 * The button holds two pieces of text: the visible number and a screen-reader
 * "N likes". Reading the whole button would run them together ("6" + "6 likes"),
 * so only the first span — the visible count — is read.
 */
function countOf(button: Locator): Promise<number> {
  return button
    .locator('span')
    .first()
    .textContent()
    .then((text) => Number((text ?? '').trim()))
}

async function readCount(button: Locator): Promise<number> {
  await expect(button).toBeVisible({ timeout: 15_000 })
  const count = await countOf(button)
  expect(Number.isNaN(count)).toBe(false)
  return count
}

/**
 * Opens the events page and waits for the client-side like refresh to land.
 * Server-rendered counts are cached for a minute, so reading one before the
 * refresh arrives would compare against a number that is already out of date.
 */
async function openEventsPage(page: Page) {
  const refreshed = page.waitForResponse(
    (response) => /\/api\/events\?.*clientId=/.test(response.url()) && response.ok(),
    { timeout: 15_000 },
  )
  await page.goto('/events/')
  await refreshed
}

test.describe('Event likes', () => {
  test('liking an event from the timeline increments the count', async ({ page }) => {
    await openEventsPage(page)

    const button = likeButton(page)
    const before = await readCount(button)
    await expect(button).toHaveAttribute('aria-pressed', 'false')

    await button.click()

    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(button).toHaveAccessibleName(`Unlike ${EVENT}`)
    await expect.poll(async () => countOf(button)).toBe(before + 1)
  })

  test('unliking puts the count back', async ({ page }) => {
    await openEventsPage(page)

    const button = likeButton(page)
    const before = await readCount(button)

    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(async () => countOf(button)).toBe(before + 1)

    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(async () => countOf(button)).toBe(before)
  })

  test('a like survives a reload, because the clientId is remembered', async ({ page }) => {
    await openEventsPage(page)

    const button = likeButton(page)
    const before = await readCount(button)
    await button.click()
    await expect.poll(async () => countOf(button)).toBe(before + 1)

    const refreshed = page.waitForResponse(
      (response) => /\/api\/events\?.*clientId=/.test(response.url()) && response.ok(),
      { timeout: 15_000 },
    )
    await page.reload()
    await refreshed

    const afterReload = likeButton(page)
    await expect(afterReload).toHaveAttribute('aria-pressed', 'true', { timeout: 15_000 })
    await expect.poll(async () => countOf(afterReload)).toBe(before + 1)
  })

  test('liking, unliking and liking again counts once', async ({ page }) => {
    await openEventsPage(page)

    const button = likeButton(page)
    const before = await readCount(button)

    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(async () => countOf(button)).toBe(before + 1)

    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(async () => countOf(button)).toBe(before)

    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(async () => countOf(button)).toBe(before + 1)
  })

  test('the detail page shows the like made on the timeline', async ({ page }) => {
    await openEventsPage(page)

    const button = likeButton(page)
    const before = await readCount(button)
    await button.click()
    await expect.poll(async () => countOf(button)).toBe(before + 1)

    await page.getByRole('link', { name: EVENT }).first().click()
    await expect(page).toHaveURL(/\/events\/\d+\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: EVENT })).toBeVisible()

    const detailButton = likeButton(page)
    await expect(detailButton).toHaveAttribute('aria-pressed', 'true', { timeout: 15_000 })
    await expect.poll(async () => countOf(detailButton)).toBe(before + 1)
  })

  test('a different visitor sees the count but not the liked state', async ({ browser }) => {
    const liker = await browser.newContext()
    const likerPage = await liker.newPage()
    await openEventsPage(likerPage)
    const likerButton = likeButton(likerPage)
    const before = await readCount(likerButton)
    await likerButton.click()
    await expect.poll(async () => countOf(likerButton)).toBe(before + 1)

    // A separate context means separate localStorage, i.e. a different visitor.
    const other = await browser.newContext()
    const otherPage = await other.newPage()
    await openEventsPage(otherPage)
    const otherButton = likeButton(otherPage)

    await expect.poll(async () => countOf(otherButton)).toBe(before + 1)
    await expect(otherButton).toHaveAttribute('aria-pressed', 'false')

    await liker.close()
    await other.close()
  })
})
