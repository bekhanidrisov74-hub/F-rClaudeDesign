import { test, expect } from './test'

test('Hero-Foto und die fünf Motive der Leistungen laden im responsiven Layout', async ({ page }) => {
  await page.goto('/')
  const foto = page.locator('.hd-foto img')
  await expect(foto).toBeVisible()
  await expect.poll(() => foto.evaluate((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)).toBe(true)
  expect((await page.locator('.hd-foto').boundingBox())?.height).toBeGreaterThanOrEqual(280)
  // Ab 1280 px das Original-JPG (pixelgleich mit dem Entwurf), darunter die kleineren AVIF/WebP-Fassungen
  expect(await foto.evaluate((img) => (img as HTMLImageElement).currentSrc)).toMatch(
    page.viewportSize()!.width >= 1280 ? /\/images\/hero-wien\.jpg$/ : /\/images\/hero-wien(?:-\d+)?\.(avif|webp)$/,
  )
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
  await page.locator('#start').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `test-results/bilder-${test.info().project.name}.png`, fullPage: true })
})
