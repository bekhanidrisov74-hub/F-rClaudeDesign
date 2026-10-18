import { test, expect } from './test'

test('Motive 2–6 laden im responsiven Layout (Bild 1 ist noch eine freie Stelle)', async ({ page }) => {
  await page.goto('/')
  for (let n = 2; n <= 6; n++) {
    const frame = page.locator(`[data-bild="${n}"]`)
    await frame.scrollIntoViewIfNeeded()
    const image = frame.locator('img')
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)).toBe(true)
    expect(await image.evaluate(img => (img as HTMLImageElement).currentSrc)).toMatch(new RegExp(`/images/bild-${n}(?:-\\d+)?\\.(avif|webp)$`))
    const box = await frame.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(200)
    expect(box?.width).toBeGreaterThan(0)
  }
  await page.locator('[data-bild="1"]').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `test-results/bilder-${test.info().project.name}.png`, fullPage: true })
})
