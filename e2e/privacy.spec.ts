import { expect, test } from '@playwright/test'

test('no request leaves the page, and the CSP forbids it', async ({ page, baseURL }) => {
  const urls: string[] = []
  page.on('request', (r) => urls.push(r.url()))

  await page.goto('/sheetdeck/')
  await page.getByTestId('file-input').setInputFiles('test/fixtures/sales.csv')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByTestId('summary')).toBeVisible()
  await expect(page.getByTestId('row-count')).toHaveText('10')
  await expect(page.getByTestId('col-count')).toHaveText('4')

  expect(urls.length).toBeGreaterThan(0)
  for (const u of urls) expect(u.startsWith(`${baseURL}/sheetdeck/`), u).toBe(true)

  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')
  expect(csp).toContain("connect-src 'none'")

  // the CSP is live: a fetch from the page is refused
  const blocked = await page.evaluate(() => fetch('https://example.com').then(() => false, () => true))
  expect(blocked).toBe(true)
})
