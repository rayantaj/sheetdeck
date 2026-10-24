import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

test('export a PDF and a PNG, save the deck file and reopen it, read the policy', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/sheetdeck/')
  await page.getByTestId('file-input').setInputFiles('test/fixtures/sales.csv')
  await page.getByRole('button', { name: 'Continue' }).click()
  const slides = await page.getByRole('list', { name: 'Slides' }).getByRole('listitem').count()

  await page.getByRole('button', { name: 'Export' }).click()
  const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'PDF, all slides' }).click()])
  const bytes = readFileSync(await pdf.path()!)
  expect(bytes.subarray(0, 4).toString()).toBe('%PDF')
  expect(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(slides)

  const [png] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'PNG, this slide' }).click()])
  expect(readFileSync(await png.path()!).subarray(1, 4).toString()).toBe('PNG')

  await page.getByTestId('slide').first().waitFor({ state: 'attached' })
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Deck file' }).click()])
  expect(file.suggestedFilename()).toMatch(/\.sheetdeck\.json$/)
  const saved = JSON.parse(readFileSync(await file.path()!, 'utf8'))
  saved.deck.slides[0].title = 'Edited title'
  const edited = Buffer.from(JSON.stringify(saved))

  await page.getByRole('button', { name: 'Close' }).click()
  await page.getByRole('button', { name: 'Choose another file' }).click()
  await page.getByTestId('file-input').setInputFiles({ name: 'x.sheetdeck.json', mimeType: 'application/json', buffer: edited })
  await expect(page.getByTestId('deck')).toBeVisible()
  await expect(page.getByTestId('slide').first()).toContainText('Edited title')

  await page.getByRole('button', { name: 'Choose another file' }).click()
  await page.getByRole('button', { name: 'Nothing leaves this device' }).click()
  await expect(page.getByRole('dialog')).toContainText("connect-src 'none'")
  expect(errors).toEqual([])
})

test('a .txt file is refused plainly', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/sheetdeck/')
  await page.getByTestId('file-input').setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') })
  await expect(page.getByRole('alert')).toHaveText('That file could not be read.')
  expect(errors).toEqual([])
})

test('works offline after a first visit, with the server stopped', async ({ page }) => {
  const server = spawn('npx', ['vite', 'preview', '--port', '4175', '--strictPort'], { stdio: 'ignore' })
  const url = 'http://localhost:4175/sheetdeck/'
  await expect.poll(() => fetch(url).then((r) => r.ok, () => false), { timeout: 20000 }).toBe(true)
  await page.goto(url)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForTimeout(2000) // the worker is caching the bundle
  server.kill()
  await expect.poll(() => fetch(url).then(() => true, () => false), { timeout: 10000 }).toBe(false)
  await page.reload()
  await page.getByTestId('file-input').setInputFiles('test/fixtures/sales.csv')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByTestId('deck')).toBeVisible()
})
