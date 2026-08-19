const { test, expect } = require('@playwright/test');

test('Collection product frames never crop the product image', async ({ page }) => {
  await page.goto('/shop.html');
  await expect(page.locator('link[href*="premium-media.css?v=1"]')).toHaveCount(1);
  const results = await page.locator('.catalog-card > img').evaluateAll(images => images.map(img => ({
    fit: getComputedStyle(img).objectFit,
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    padding: parseFloat(getComputedStyle(img).paddingTop)
  })));
  expect(results.length).toBeGreaterThan(0);
  for (const image of results) {
    expect(image.fit).toBe('contain');
    expect(image.complete).toBeTruthy();
    expect(image.naturalWidth).toBeGreaterThan(0);
    expect(image.naturalHeight).toBeGreaterThan(0);
    expect(image.padding).toBeGreaterThan(0);
  }
});

test('Gallery keeps every photograph at its native composition with no cover crop', async ({ page }) => {
  await page.goto('/gallery.html');
  await expect(page.locator('link[href*="premium-media.css?v=1"]')).toHaveCount(1);
  const results = await page.locator('.masonry-gallery img').evaluateAll(images => images.map(img => {
    const box = img.getBoundingClientRect();
    return {
      fit: getComputedStyle(img).objectFit,
      naturalRatio: img.naturalWidth / img.naturalHeight,
      renderedRatio: box.width / box.height,
      loaded: img.complete && img.naturalWidth > 0
    };
  }));
  expect(results.length).toBeGreaterThan(20);
  for (const image of results) {
    expect(image.fit).toBe('contain');
    expect(image.loaded).toBeTruthy();
    expect(Math.abs(image.renderedRatio - image.naturalRatio)).toBeLessThan(0.03);
  }
});

test('Gallery lightbox is a zero-crop inspection surface', async ({ page }) => {
  await page.goto('/gallery.html');
  await page.locator('.masonry-gallery img').first().click();
  const image = page.locator('.lightbox img');
  await expect(image).toBeVisible();
  expect(await image.evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
});

test('Inner-page product photography uses contain rather than cover', async ({ page }) => {
  for (const path of ['/about.html', '/occasions.html', '/custom-orders.html']) {
    await page.goto(path);
    await expect(page.locator('link[href*="premium-media.css?v=1"]')).toHaveCount(1);
    const images = page.locator('.page-hero > img, .occasion-detail article > img, .editorial-band > img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      expect(await images.nth(i).evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
    }
  }
});
